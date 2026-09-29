// Server-renders every web page with real React to catch render-time crashes
// (undefined component refs, missing store fields, bad hooks) that a module
// evaluation alone cannot detect.
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const WEBPKG = "C:/Users/patel/OneDrive/Desktop/khet kharcha/web/node_modules/";
const babelCore = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/core");
const cjsPlugin = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/plugin-transform-modules-commonjs");
const jsxPlugin = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/plugin-transform-react-jsx").default;
const babelParser = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/parser");

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = globalThis;
globalThis.document = {
  getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
  createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }),
  addEventListener: () => {}, body: { appendChild() {}, style: {} },
  documentElement: { style: {}, classList: { add() {}, remove() {} } },
};
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });

const React = require(WEBPKG + "react");
const ReactDOMServer = require(WEBPKG + "react-dom/server");
const { MemoryRouter, Routes, Route } = require(WEBPKG + "react-router-dom");

const ROOT = "C:/Users/patel/OneDrive/Desktop/khet kharcha";
const WEB = path.join(ROOT, "web/src");

const PAGES = {
  LandingPage: { route: {}, auth: false },
  LoginPage: { route: {}, auth: false },
  DashboardPage: { route: {}, auth: true },
  FarmsPage: { route: {}, auth: true },
  AddFarmPage: { route: {}, auth: true },
  FarmDetailPage: { route: { farmId: "f1" }, auth: true },
  AddExpensePage: { route: {}, auth: true },
  HarvestEntryPage: { route: { farmId: "f1" }, auth: true },
  PartnersPage: { route: { farmId: "f1" }, auth: true },
  PartnerSettlementPage: { route: { farmId: "f1" }, auth: true },
  PartnershipTermsBuilderPage: { route: { farmId: "f1", partnerId: "p1" }, auth: true },
  BillsPage: { route: { farmId: "f1" }, auth: true },
  AdvancesPage: { route: { farmId: "f1" }, auth: true },
  RemindersPage: { route: {}, auth: true },
  ReportsPage: { route: {}, auth: true },
  SettingsPage: { route: {}, auth: true },
};

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/Page\.jsx$/.test(e.name)) pages.push(p);
  }
})(WEB);

function loadModule(file) {
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
    if (spec === "react" || spec === "react-dom" || spec === "react/jsx-runtime") return React;
    if (spec.startsWith(".")) {
      let p = path.resolve(path.dirname(file), spec);
      if (!path.extname(p)) p += ".js";
      if (!fs.existsSync(p) && fs.existsSync(p + ".js")) p += ".js";
      if (!fs.existsSync(p) && fs.existsSync(path.join(p, "index.js"))) p = path.join(p, "index.js");
      return loadModule(p);
    }
    try { return require(WEBPKG + spec); } catch { return {}; }
  };
  new Function("exports", "require", "module", "__filename", "__dirname", out.code)(m.exports, req, m, file, path.dirname(file));
  return m.exports;
}

let ok = 0, bad = 0;
const consoleErrors = [];
for (const p of pages) {
  const name = path.basename(p).replace(".jsx", "");
  const rel = path.relative(ROOT, p);
  const cfg = PAGES[name] || { route: {}, auth: true };
  try {
    const Page = loadModule(p).default;
    const props = {
      route: { params: cfg.route, key: "k", name: name },
      navigation: { navigate() {}, goBack() {}, setOptions() {}, addListener: () => () => {} },
    };
    // Wrap in a real Router + Route so useNavigate/useParams work as in the app.
    const el = React.createElement(
      MemoryRouter,
      { initialEntries: ["/"] },
      React.createElement(Routes, null,
        React.createElement(Route, { path: "*", element: React.createElement(Page, props) })
      )
    );
    const html = ReactDOMServer.renderToStaticMarkup(el);
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    ok++;
    console.log(`  OK    ${rel}  (${html.length} bytes, "${text.slice(0, 60)}")`);
  } catch (e) {
    bad++;
    const msg = (e.stack || e.message).split("\n").slice(0, 3).join(" | ");
    console.log(`  FAIL  ${rel}\n        ${msg}`);
  }
}
console.log(`\npages rendered: ${ok}   failed: ${bad}`);
