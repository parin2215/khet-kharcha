// Scope-aware static analyzer (no deps beyond @babel/parser).
// Detects: unresolvable imports, imported names not exported by target,
// and identifier references with no binding in any enclosing scope.
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const babel = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/parser");

const ROOT = "C:/Users/patel/OneDrive/Desktop/khet kharcha";
const EXTS = [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".json"];
const SELF = path.relative(ROOT, new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")).replace(/\\/g, "/");

const GLOBALS = new Set([
  "console","window","document","globalThis","global","process","localStorage","sessionStorage",
  "navigator","location","history","alert","prompt","confirm","fetch","setTimeout","clearTimeout",
  "setInterval","clearInterval","requestAnimationFrame","cancelAnimationFrame","queueMicrotask",
  "Promise","Math","JSON","Object","Array","String","Number","Boolean","Date","RegExp","Error",
  "TypeError","RangeError","SyntaxError","ReferenceError","Map","Set","WeakMap","WeakSet","Symbol",
  "Proxy","Reflect","Intl","BigInt","parseInt","parseFloat","isNaN","isFinite","encodeURIComponent",
  "decodeURIComponent","encodeURI","decodeURI","URL","URLSearchParams","Blob","File","FileReader",
  "FormData","Headers","Request","Response","AbortController","structuredClone","crypto","performance",
  "ResizeObserver","IntersectionObserver","MutationObserver","CustomEvent","Event","EventTarget",
  "HTMLElement","Image","Audio","WeakRef","FinalizationRegistry","undefined","NaN","Infinity","arguments",
  "require","module","exports","__dirname","__filename","Buffer","exports",
]);

function walkDir(dir, out = []) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    const rel = path.relative(ROOT, p).replace(/\\/g, "/");
    if (e.isDirectory()) {
      if (/(^|\/)(node_modules|\.firebase|\.expo|\.cxx|\.gradle|build|dist|\.git|audit)(\/|$)/.test(rel)) continue;
      walkDir(p, out);
    } else if (/\.(js|jsx|mjs|cjs)$/.test(e.name) && !/^\d.*\.mjs$/.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}

const files = walkDir(ROOT).filter((f) => !path.relative(ROOT, f).replace(/\\/g, "/").startsWith(".audit/"));

function parseFile(file) {
  const src = fs.readFileSync(file, "utf8");
  const isJSX = file.endsWith(".jsx") || /<[A-Za-z/>]/.test(src);
  const p = babel.parse(src, {
    sourceType: "unambiguous",
    plugins: isJSX ? ["jsx"] : [],
    errorRecovery: true,
  });
  return { src, ast: p.program || p };
}

function resolveImport(spec, fromFile) {
  if (spec.startsWith(".")) {
    const base = path.resolve(path.dirname(fromFile), spec);
    const cands = [];
    for (const e of EXTS) cands.push(base + e);
    cands.push(base);
    for (const e of EXTS) cands.push(path.join(base, "index" + e));
    for (const c of cands) { try { if (fs.statSync(c).isFile()) return { kind: "local", file: c }; } catch {} }
    return { kind: "missing", spec };
  }
  try { require.resolve(spec, { paths: [path.dirname(fromFile)] }); return { kind: "pkg", spec }; }
  catch { return { kind: "pkg-missing", spec }; }
}

function bindPattern(node, set, declare = true) {
  if (!node) return;
  const add = (n) => { if (declare) { if (set instanceof Map) set.set(n, "var"); else set.add(n); } };
  switch (node.type) {
    case "Identifier": add(node.name); break;
    case "ObjectPattern":
      for (const p of node.properties || []) {
        if (p.type === "RestElement") bindPattern(p.argument, set, declare);
        else bindPattern(p.value, set, declare);
      }
      break;
    case "ArrayPattern": for (const el of node.elements || []) bindPattern(el, set, declare); break;
    case "AssignmentPattern": bindPattern(node.left, set, declare); break;
    case "RestElement": bindPattern(node.argument, set, declare); break;
  }
}

const issues = [];
const add = (level, file, line, msg) => issues.push({ level, file, line, msg });

// ---- Scope engine ----
function analyzeScope(ast, report) {
  function Scope(parent) { this.vars = new Map(); this.parent = parent; }
  Scope.prototype.declare = function (name, kind) {
    if (!this.vars.has(name)) this.vars.set(name, kind || "var");
  };
  Scope.prototype.has = function (name) {
    let s = this;
    while (s) { if (s.vars.has(name)) return true; s = s.parent; }
    return false;
  };

  // Hoist declarations for a scope body.
  function hoist(body, scope) {
    for (const st of body) {
      if (!st) continue;
      switch (st.type) {
        case "VariableDeclaration":
          for (const d of st.declarations) bindPattern(d.id, scope.vars instanceof Map ? new Map() : scope.vars);
          break;
        case "FunctionDeclaration": if (st.id) scope.declare(st.id.name, "func"); break;
        case "ClassDeclaration": if (st.id) scope.declare(st.id.name, "class"); break;
        case "ExportNamedDeclaration":
        case "ExportDefaultDeclaration":
          if (st.declaration) hoist([st.declaration], scope);
          break;
        case "IfStatement": case "WhileStatement": case "DoWhileStatement":
        case "ForStatement": case "ForInStatement": case "ForOfStatement":
        case "LabeledStatement": case "BlockStatement":
          // nested, handle below
          break;
      }
    }
  }

  const globalScope = new Scope(null);
  const moduleRefs = [];

  // Pass 1: hoist module-level function/class declarations into the file scope.
  function hoistFile() {
    // Only hoist TOP-LEVEL bindings (module scope), not nested ones.
    for (const st of ast.body || []) {
      const target = st.type === "ExportNamedDeclaration" || st.type === "ExportDefaultDeclaration" ? st.declaration : st;
      if (!target) continue;
      if (target.type === "FunctionDeclaration" && target.id) globalScope.declare(target.id.name, "func");
      if (target.type === "ClassDeclaration" && target.id) globalScope.declare(target.id.name, "class");
      if (target.type === "VariableDeclaration") for (const d of target.declarations) bindPattern(d.id, globalScope.vars);
    }
  }
  hoistFile();

  // Pass 2: main traversal with proper scope chain.
  function visit(node, scope) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach((n) => visit(n, scope)); return; }

    switch (node.type) {
      case "Identifier": {
        if (!scope.has(node.name) && !GLOBALS.has(node.name)) {
          report({ name: node.name, line: node.loc?.start?.line, kind: "ref" });
        }
        return;
      }
      case "JSXIdentifier": {
        if (/^[A-Z]/.test(node.name) && !scope.has(node.name) && !GLOBALS.has(node.name)) {
          report({ name: node.name, line: node.loc?.start?.line, kind: "jsx" });
        }
        return;
      }
      case "MemberExpression": visit(node.object, scope); if (node.computed) visit(node.property, scope); return;
      case "OptionalMemberExpression": visit(node.object, scope); if (node.computed) visit(node.property, scope); return;
      case "ObjectProperty": case "Property": {
        if (node.computed) visit(node.key, scope);
        visit(node.value, scope);
        return;
      }
      case "ObjectMethod": case "ClassMethod": case "ClassPrivateProperty": case "PropertyDefinition": {
        if (node.computed && node.key) visit(node.key, scope);
        if (node.value) visit(node.value, scope);
        return;
      }
      case "ImportDeclaration": {
        for (const s of node.specifiers || []) scope.declare(s.local.name, "import");
        return;
      }
      case "VariableDeclaration": {
        for (const d of node.declarations) {
          // Evaluate init before binding (TDZ) but function params already declared
          if (d.init) visit(d.init, scope);
          bindPattern(d.id, scope.vars);
        }
        return;
      }
      case "FunctionDeclaration": {
        const s2 = new Scope(scope);
        if (node.id) s2.declare(node.id.name, "func");
        if (node.generator) s2.declare("yield", "kw");
        for (const p of node.params || []) bindPattern(p, s2.vars);
        s2.declare("arguments", "builtin");
        if (node.body) visit(node.body, s2);
        return;
      }
      case "FunctionExpression": case "ArrowFunctionExpression": {
        const s2 = new Scope(scope);
        if (node.generator) s2.declare("yield", "kw");
        if (node.async) {}
        for (const p of node.params || []) bindPattern(p, s2.vars);
        if (node.body) {
          if (node.body.type === "BlockStatement") {
            hoistBlock(node.body.body, s2);
            for (const st of node.body.body) visit(st, s2);
          } else visit(node.body, s2);
        }
        return;
      }
      case "ClassDeclaration": case "ClassExpression": {
        const s2 = new Scope(scope);
        if (node.id) s2.declare(node.id.name, "class");
        if (node.superClass) visit(node.superClass, scope);
        s2.declare("this", "kw");
        for (const m of node.body?.body || []) visit(m, s2);
        return;
      }
      case "BlockStatement": {
        const s2 = new Scope(scope);
        hoistBlock(node.body, s2);
        for (const st of node.body) visit(st, s2);
        return;
      }
      case "CatchClause": {
        const s2 = new Scope(scope);
        if (node.param) bindPattern(node.param, s2.vars);
        if (node.body) visit(node.body, s2);
        return;
      }
      case "ForStatement": case "ForInStatement": case "ForOfStatement": {
        const s2 = new Scope(scope);
        if (node.init) visit(node.init, s2);
        if (node.left && node.left.type !== "VariableDeclaration") visit(node.left, s2);
        if (node.left && node.left.type === "VariableDeclaration") {
          for (const d of node.left.declarations) {
            if (d.init) visit(d.init, s2);
            bindPattern(d.id, s2.vars);
          }
        }
        if (node.right) visit(node.right, s2);
        if (node.test) visit(node.test, s2);
        if (node.update) visit(node.update, s2);
        if (node.body) visit(node.body, s2);
        return;
      }
      case "LabeledStatement": {
        if (node.body) visit(node.body, scope);
        return;
      }
      case "TemplateLiteral": {
        for (const q of node.quasis || []) {}
        for (const e of node.expressions || []) visit(e, scope);
        return;
      }
      case "ExportDefaultDeclaration": visit(node.declaration, scope); return;
      case "ExportNamedDeclaration": visit(node.declaration, scope); for (const s of node.specifiers || []) {} return;
      case "JSXElement": {
        visit(node.openingElement, scope);
        for (const c of node.children || []) visit(c, scope);
        if (node.closingElement) visit(node.closingElement.name, scope);
        return;
      }
      case "JSXOpeningElement": {
        const n = node.name;
        if (n.type === "JSXMemberExpression") visit(n.object, scope);
        else if (n.type === "JSXIdentifier" && /^[A-Z]/.test(n.name) && !scope.has(n.name) && !GLOBALS.has(n.name)) {
          report({ name: n.name, line: n.loc?.start?.line, kind: "jsx" });
        }
        for (const a of node.attributes || []) visit(a, scope);
        return;
      }
      case "JSXClosingElement": return;
      case "JSXAttribute": {
        if (node.name) {}
        if (node.value) visit(node.value, scope);
        return;
      }
      case "JSXSpreadAttribute": visit(node.argument, scope); return;
      case "JSXSpreadChild": visit(node.expression, scope); return;
      case "JSXExpressionContainer": visit(node.expression, scope); return;
      case "JSXText": return;
      case "JSXEmptyExpression": return;
      case "JSXFragment": { for (const c of node.children || []) visit(c, scope); return; }
      case "MetaProperty": return;
      case "PrivateName": visit(node.id, scope); return;
      case "RestElement": visit(node.argument, scope); return;
      case "SpreadElement": visit(node.argument, scope); return;
      case "AssignmentPattern": visit(node.right, scope); return;
      case "ObjectPattern": case "ArrayPattern": {
        for (const p of node.properties || []) visit(p, scope);
        for (const el of node.elements || []) visit(el, scope);
        return;
      }
      case "OptionalCallExpression": {
        if (node.callee) visit(node.callee, scope);
        for (const a of node.arguments || []) visit(a, scope);
        return;
      }
      default: {
        for (const k of Object.keys(node)) {
          if (["loc","range","leadingComments","trailingComments","comments","extra"].includes(k)) continue;
          visit(node[k], scope);
        }
      }
    }
  }

  function hoistBlock(body, scope) {
    const collect = (n) => {
      if (!n || typeof n !== "object") return;
      if (Array.isArray(n)) { n.forEach(collect); return; }
      if (n.type === "FunctionDeclaration" && n.id) scope.declare(n.id.name, "func");
      if (n.type === "ClassDeclaration" && n.id) scope.declare(n.id.name, "class");
      if (n.type === "VariableDeclaration") for (const d of n.declarations) bindPattern(d.id, scope.vars);
    };
    for (const st of body) collect(st);
  }

  visit(ast, globalScope);
}

const parsedCache = new Map();
for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  let info;
  try { info = parseFile(file); parsedCache.set(file, info); }
  catch (e) { add("error", rel, e.loc?.line, "PARSE ERROR: " + String(e.message).split("\n")[0]); continue; }

  // Unresolvable / missing packages
  for (const st of info.ast.body || []) {
    if (st.type !== "ImportDeclaration") continue;
    const res = resolveImport(st.source.value, file);
    if (res.kind === "missing") add("error", rel, st.loc?.start?.line, `UNRESOLVED IMPORT "${st.source.value}"`);
    else if (res.kind === "pkg-missing") add("warn", rel, st.loc?.start?.line, `package not installed: "${st.source.value}"`);
  }

  // Named-import existence check
  for (const st of info.ast.body || []) {
    if (st.type !== "ImportDeclaration" || !st.source.value.startsWith(".")) continue;
    const res = resolveImport(st.source.value, file);
    if (res.kind !== "local" || !/\.(js|jsx|mjs|cjs)$/.test(res.file)) continue;
    const tRel = path.relative(ROOT, res.file).replace(/\\/g, "/");
    let tinfo = parsedCache.get(res.file);
    if (!tinfo) { try { tinfo = parseFile(res.file); parsedCache.set(res.file, tinfo); } catch { continue; } }
    const exp = new Set();
    let star = false;
    for (const n of tinfo.ast.body || []) {
      if (n.type === "ExportNamedDeclaration") {
        if (n.declaration) {
          const d = n.declaration;
          if (d.type === "VariableDeclaration") for (const dec of d.declarations) bindPattern(dec.id, exp);
          else if (d.id) exp.add(d.id.name);
        }
        for (const s of n.specifiers || []) exp.add(s.exported?.name ?? s.exported?.value);
      } else if (n.type === "ExportDefaultDeclaration") exp.add("default");
      else if (n.type === "ExportAllDeclaration") star = true;
    }
    if (star) continue;
    for (const s of st.specifiers || []) {
      if (s.type === "ImportSpecifier") {
        const want = s.imported?.name ?? s.imported?.value;
        if (!exp.has(want)) add("error", rel, st.loc?.start?.line, `imports "${want}" but "${st.source.value}" does not export it`);
      } else if (s.type === "ImportDefaultSpecifier") {
        if (!exp.has("default")) add("warn", rel, st.loc?.start?.line, `imports default from "${st.source.value}" which has no default export`);
      }
    }
  }

  // Undefined identifiers
  const found = new Map();
  analyzeScope(info.ast, (r) => {
    if (r.kind === "ref" || r.kind === "jsx") {
      const key = r.name;
      if (!found.has(key)) found.set(key, r);
    }
  });
  for (const [name, r] of found) {
    if (r.kind === "jsx") add("error", rel, r.line, `UNDEFINED COMPONENT: <${name}>`);
    else add("error", rel, r.line, `UNDEFINED IDENTIFIER: ${name}`);
  }
}

issues.sort((a, b) => a.file.localeCompare(b.file) || (a.line || 0) - (b.line || 0));
const errors = issues.filter((i) => i.level === "error");
const warns = issues.filter((i) => i.level === "warn");
console.log(`FILES: ${files.length}   ERRORS: ${errors.length}   WARNINGS: ${warns.length}\n`);
console.log("===== ERRORS =====");
for (const i of errors) console.log(`${i.file}:${i.line ?? "?"}  ${i.msg}`);
console.log("\n===== WARNINGS =====");
for (const i of warns) console.log(`${i.file}:${i.line ?? "?"}  ${i.msg}`);


