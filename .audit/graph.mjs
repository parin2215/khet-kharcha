// Resolves the complete module graph from each entry point using Vite/Metro-like
// resolution. Catches exactly the errors that break a real bundle.
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const babelParser = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/parser");

const ROOT = "C:/Users/patel/OneDrive/Desktop/khet kharcha";
const EXTS = [".js", ".jsx", ".mjs", ".cjs", ".json", ".ts", ".tsx"];

const ENTRIES = [
  { name: "web", file: path.join(ROOT, "web/src/main.jsx"), base: path.join(ROOT, "web"), platform: "web" },
  { name: "mobile", file: path.join(ROOT, "mobile/index.js"), base: path.join(ROOT, "mobile"), platform: "mobile" },
];

// web/vite.config.js aliases
const WEB_ALIAS = {
  "firebase/app": "node_modules/firebase/app",
  "firebase/auth": "node_modules/firebase/auth",
  "firebase/firestore": "node_modules/firebase/firestore",
  "firebase/storage": "node_modules/firebase/storage",
  "@react-native-async-storage/async-storage": "src/stubs/async-storage.js",
};

function exists(p) { try { return fs.statSync(p).isFile(); } catch { return false; } }
function isDir(p) { try { return fs.statSync(p).isDirectory(); } catch { return false; } }

function resolveLocal(spec, fromFile) {
  const base = path.resolve(path.dirname(fromFile), spec);
  const cands = [];
  for (const e of EXTS) cands.push(base + e);
  cands.push(base);
  for (const e of EXTS) cands.push(path.join(base, "index" + e));
  for (const c of cands) if (exists(c)) return c;
  return null;
}

function collectImports(file) {
  const src = fs.readFileSync(file, "utf8");
  const isJSX = file.endsWith(".jsx") || /<[A-Za-z][A-Za-z0-9.]*[\s/>]/.test(src) || /return\s*\(\s*</.test(src);
  const ast = babelParser.parse(src, { sourceType: "unambiguous", plugins: isJSX ? ["jsx"] : [], errorRecovery: true });
  const prog = ast.program || ast;
  const out = [];
  for (const n of prog.body || []) {
    if (n.type === "ImportDeclaration") out.push({ spec: n.source.value, line: n.loc?.start?.line });
    else if (n.type === "ExportNamedDeclaration" && n.source) out.push({ spec: n.source.value, line: n.loc?.start?.line });
    else if (n.type === "ExportAllDeclaration" && n.source) out.push({ spec: n.source.value, line: n.loc?.start?.line });
  }
  // dynamic import('...') with literal specifier
  const re = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m;
  while ((m = re.exec(src))) out.push({ spec: m[1], line: src.slice(0, m.index).split("\n").length, dynamic: true });
  return out;
}

const problems = [];
let totalModules = 0;

for (const entry of ENTRIES) {
  const seen = new Set();
  const queue = [entry.file];
  const aliasHits = [];

  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    totalModules++;

    let imports;
    try { imports = collectImports(file); }
    catch (e) { problems.push({ entry: entry.name, file: path.relative(ROOT, file).replace(/\\/g,"/"), msg: "PARSE ERROR: " + e.message.split("\n")[0] }); continue; }

    for (const imp of imports) {
      const { spec } = imp;
      const rel = path.relative(ROOT, file).replace(/\\/g, "/");

      // CSS / assets - not modules
      if (/\.(css|scss|png|jpg|jpeg|svg|webp|gif|ico|json)$/.test(spec)) {
        if (spec.endsWith(".json")) {
          const jp = spec.startsWith(".") ? path.resolve(path.dirname(file), spec) : null;
          if (jp && !exists(jp)) problems.push({ entry: entry.name, file: rel, line: imp.line, msg: `MISSING JSON: ${spec}` });
        } else if (spec.startsWith(".")) {
          const rp = path.resolve(path.dirname(file), spec);
          if (!exists(rp)) problems.push({ entry: entry.name, file: rel, line: imp.line, msg: `MISSING ASSET: ${spec}` });
        }
        continue;
      }

      if (spec.startsWith(".")) {
        const r = resolveLocal(spec, file);
        if (!r) { problems.push({ entry: entry.name, file: rel, line: imp.line, msg: `UNRESOLVED: "${spec}"` }); continue; }
        queue.push(r);
        continue;
      }

      // bare specifier
      if (entry.platform === "web" && WEB_ALIAS[spec]) {
        const target = path.join(ROOT, "web", WEB_ALIAS[spec]);
        aliasHits.push({ spec, target });
        // Vite aliases a package directory; resolution then follows its package.json entry.
        if (isDir(target)) {
          let entryFile = null;
          const pjPath = path.join(target, "package.json");
          if (exists(pjPath)) {
            try {
              const pj = JSON.parse(fs.readFileSync(pjPath, "utf8"));
              for (const f of [pj.browser, pj.module, pj.main]) {
                if (f && exists(path.join(target, f))) { entryFile = path.join(target, f); break; }
              }
            } catch {}
          }
          if (!entryFile) entryFile = path.join(target, "dist/esm/index.esm.js");
          if (exists(entryFile)) { queue.push(entryFile); continue; }
          problems.push({ entry: entry.name, file: rel, line: imp.line, msg: `ALIAS DIR UNRESOLVED: ${spec}` });
          continue;
        }
        if (exists(target)) { queue.push(target); continue; }
        problems.push({ entry: entry.name, file: rel, line: imp.line, msg: `ALIAS TARGET MISSING: ${spec} -> ${WEB_ALIAS[spec]}` });
        continue;
      }

      // bare specifier via node resolution
      let resolved = null;
      try { resolved = require.resolve(spec, { paths: [path.dirname(file), path.join(ROOT, entry.platform)] }); }
      catch {}
      if (!resolved) {
        problems.push({ entry: entry.name, file: rel, line: imp.line, msg: `PACKAGE NOT INSTALLED: "${spec}"` });
      } else {
        if (/\.(js|mjs|cjs|jsx)$/.test(resolved) && !resolved.includes("node_modules\\.bin")) queue.push(resolved);
      }
    }
  }
  console.log(`${entry.name.toUpperCase()}: resolved ${seen.size} modules from ${path.relative(ROOT, entry.file).replace(/\\/g,"/")}`);
  if (entry.name === "web") console.log(`  vite aliases exercised: ${[...new Set(aliasHits.map(a=>a.spec))].join(", ")}`);
}

console.log(`\nTOTAL MODULES WALKED: ${totalModules}`);
console.log(`GRAPH PROBLEMS: ${problems.length}\n`);
const dedup = new Map();
for (const p of problems) { const k = `${p.file}|${p.line}|${p.msg}`; if (!dedup.has(k)) dedup.set(k, p); }
for (const p of dedup.values()) console.log(`[${p.entry}] ${p.file}:${p.line ?? "?"}  ${p.msg}`);

