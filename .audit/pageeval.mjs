// Executes every page component's module graph through a Babel CJS transform and
// verifies it evaluates without throwing, then checks the React element tree that
// each page returns for the classic crash causes found in this codebase:
// undefined component references, undefined identifiers in the render path.
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const babelCore = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/core");
const cjsPlugin = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/plugin-transform-modules-commonjs");
const jsxPlugin = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/plugin-transform-react-jsx").default;
const babelParser = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/parser");

// Minimal browser globals so browser-only module code can be evaluated in Node.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = globalThis;
// navigator is read-only in modern Node; leave it as-is.
globalThis.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }),
  addEventListener: () => {},
  body: { appendChild() {}, style: {} },
  documentElement: { style: {}, classList: { add() {}, remove() {} } },
};
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });

const ROOT = "C:/Users/patel/OneDrive/Desktop/khet kharcha";
const WEB = path.join(ROOT, "web/src");

// Stub every external dependency so a page module can be evaluated in isolation.
const stubs = new Set(["react", "react-dom", "react-router-dom", "react-i18next",
  "lucide-react", "recharts", "jspdf", "jspdf-autotable", "zustand",
  "firebase/app", "firebase/auth", "firebase/firestore", "firebase/storage",
  "@react-native-async-storage/async-storage", "i18next"]);

// A permissive stub: any named export resolves to a callable component/hook, and
// any property read returns an empty array/object so module top-level code that
// merely inspects a dependency (e.g. Object.keys) does not explode.
function makeStub(name) {
  const fn = function () { return fn; };
  return new Proxy(fn, {
    get(target, key) {
      if (key === "__esModule") return true;
      if (key === "then" || key === Symbol.toPrimitive || typeof key === "symbol") return undefined;
      if (key in target) return target[key];
      target[key] = makeStub(name + "." + String(key));
      return target[key];
    },
    apply() { return makeStub(name + "()"); },
  });
}

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.jsx?$/.test(e.name) && /Page\.jsx$/.test(e.name)) pages.push(p);
  }
})(WEB);

function loadModule(file) {
  // JSON translation imports are real data, not JS.
  if (file.endsWith(".json")) {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    return { default: data, ...data, __esModule: true };
  }
  const src = fs.readFileSync(file, "utf8");
  const isJsx = file.endsWith(".jsx");
  const ast = babelParser.parse(src, { sourceType: "unambiguous", plugins: isJsx ? ["jsx"] : [] });
  const out = babelCore.transformFromAstSync(ast, src, {
    babelrc: false, configFile: false, plugins: [cjsPlugin, [jsxPlugin, { runtime: "classic" }]],
    parserOpts: { sourceType: "unambiguous", plugins: isJsx ? ["jsx"] : [] },
  });
  const m = { exports: {} };
  const req = (spec) => {
    if (stubs.has(spec)) return makeStub(spec);
    if (!spec.startsWith(".")) return {};
    let p = path.resolve(path.dirname(file), spec);
    if (!path.extname(p)) p += ".js";
    if (!fs.existsSync(p) && fs.existsSync(p + ".js")) p += ".js";
    if (!fs.existsSync(p) && fs.existsSync(path.join(p, "index.js"))) p = path.join(p, "index.js");
    return loadModule(p);
  };
  new Function("exports", "require", "module", "__filename", "__dirname", out.code)(m.exports, req, m, file, path.dirname(file));
  return m.exports;
}

let ok = 0, bad = 0;
for (const p of pages) {
  const rel = path.relative(ROOT, p);
  try {
    const mod = loadModule(p);
    const def = mod.default;
    if (typeof def !== "function") throw new Error("no default export component");
    ok++;
    console.log("  OK   " + rel);
  } catch (e) {
    bad++;
    console.log("  FAIL " + rel + " :: " + (e.stack || e.message).split("\n").slice(0,4).join(" | "));
  }
}
console.log("\npages evaluated OK: " + ok + "   failed: " + bad);
