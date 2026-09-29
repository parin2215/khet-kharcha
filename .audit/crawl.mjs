// Crawls the running server the same way the browser would, following every
// import from index.html, and reports anything that fails to load (404/500) or
// that fails to parse. This is the closest proxy to "the app boots" available
// without a real browser.
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const babelParser = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/parser");

const BASE = "http://127.0.0.1:5180";
const WEB = "C:/Users/patel/OneDrive/Desktop/khet kharcha/web";

const seen = new Set();
const queue = ["/src/main.jsx"];
const missing = [];
const parseErrors = [];
let fetched = 0;

function extractImports(code, isJsx) {
  let ast;
  try {
    ast = babelParser.parse(code, { sourceType: "unambiguous", plugins: isJsx ? ["jsx"] : [] });
  } catch (e) {
    parseErrors.push({ url: currentUrl, err: e.message });
    return [];
  }
  const specs = [];
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (node.type === "ImportDeclaration" || node.type === "ExportNamedDeclaration" || node.type === "ExportAllDeclaration") {
      const s = node.source && node.source.value;
      if (s) specs.push(s);
    }
    for (const k of Object.keys(node)) {
      if (k === "loc" || k === "start" || k === "end") continue;
      visit(node[k]);
    }
  };
  visit(ast.program || ast);
  return specs;
}

function toUrl(spec, fromUrl) {
  if (spec.startsWith(".")) {
    const base = path.posix.dirname(fromUrl);
    return path.posix.normalize(path.posix.join(base, spec));
  }
  // bare package: only follow ones with a local alias/stub
  if (spec.startsWith("firebase/")) return "/" + spec;
  if (spec.startsWith("@react-native-async-storage")) return "/" + spec;
  return null;
}

let currentUrl = "/src/main.jsx";
while (queue.length) {
  currentUrl = queue.shift();
  if (seen.has(currentUrl)) continue;
  seen.add(currentUrl);

  let res;
  try { res = await fetch(BASE + currentUrl); }
  catch (e) { missing.push({ url: currentUrl, err: e.message }); continue; }

  if (!res.ok) { missing.push({ url: currentUrl, status: res.status }); continue; }
  fetched++;

  const isJsx = currentUrl.endsWith(".jsx");
  if (/\.(css|json|png|jpg|jpeg|svg|ico|woff2?|ttf|map)$/i.test(currentUrl)) continue;
  const code = await res.text();
  for (const spec of extractImports(code, isJsx)) {
    const u = toUrl(spec, currentUrl);
    if (u && !seen.has(u)) queue.push(u);
  }
}

console.log("modules fetched OK :", fetched);
console.log("failed to load     :", missing.length);
console.log("parse errors       :", parseErrors.length);
for (const m of missing.slice(0, 25)) console.log("  MISSING", m.url, m.status || m.err || "");
for (const p of parseErrors.slice(0, 25)) console.log("  PARSE-FAIL", p.url, "::", p.err);
