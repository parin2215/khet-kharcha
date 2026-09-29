// Renders the data-gated pages with their stores pre-populated, so the populated
// branch of each page is exercised rather than only the empty/loading branch.
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
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k), clear: () => store.clear() };
globalThis.window = globalThis;
globalThis.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), addEventListener: () => {}, body: { appendChild() {}, style: {} }, documentElement: { style: {}, classList: { add() {}, remove() {} } } };
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });

const React = require(WEBPKG + "react");
const ReactDOMServer = require(WEBPKG + "react-dom/server");
const { MemoryRouter, Routes, Route } = require(WEBPKG + "react-router-dom");

const ROOT = "C:/Users/patel/OneDrive/Desktop/khet kharcha";
const WEB = path.join(ROOT, "web/src");

const FARM = { id: "f1", name: "North Field", area: 5, areaUnit: "bigha", currentCrop: "wheat", ownershipType: "partner", soilType: "loamy", irrigation: "borewell" };
const PARTNER = { id: "p1", name: "Ramesh", phone: "9876543210", sharePercent: 50, totalPaid: 1000, status: "active" };
const PARTNER2 = { id: "p2", name: "Suresh", phone: "9123456780", sharePercent: 30, totalPaid: 0, status: "active" };
const TRANSACTIONS = [
  { id: "t1", farmId: "f1", category: "seeds", amount: 2000, ownerShare: 1000, partnerShare: 1000, expenseType: "partner", date: "2026-01-05", notes: "beej" },
  { id: "t2", farmId: "f1", category: "diesel", amount: 1500, ownerShare: 1050, partnerShare: 450, expenseType: "partner", date: "2026-02-11", notes: "diesel" },
  { id: "t3", farmId: "f1", category: "labour", amount: 3000, ownerShare: 1500, partnerShare: 1500, expenseType: "partner", date: "2026-02-20", notes: "majdoori" },
];
const LOANS = [
  { id: "l1", farmId: "f1", partnerId: "p1", amount: 500, direction: "owner_to_partner", status: "outstanding", date: "2026-01-10", note: "advance" },
  { id: "l2", farmId: "f1", partnerId: "p1", amount: 200, direction: "partner_to_owner", status: "settled", date: "2026-02-01", note: "returned" },
];
const SETTLEMENTS = [{ id: "s1", farmId: "f1", partnerId: "p1", amount: 500, settledAt: "2026-02-15", note: "cash" }];

const moduleCache = new Map();
function loadModule(file) {
  if (moduleCache.has(file)) return moduleCache.get(file);
  const mod = buildModule(file);
  moduleCache.set(file, mod);
  return mod;
}
function buildModule(file) {
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

const TARGETS = [
  ["farms/FarmDetailPage.jsx", { farmId: "f1" }],
  ["partners/PartnerSettlementPage.jsx", { farmId: "f1" }],
  ["partners/PartnersPage.jsx", { farmId: "f1" }],
  ["expenses/AddExpensePage.jsx", {}],
  ["farms/HarvestEntryPage.jsx", { farmId: "f1" }],
  ["bills/BillsPage.jsx", { farmId: "f1" }],
  ["advances/AdvancesPage.jsx", { farmId: "f1" }],
  ["partners/PartnershipTermsBuilderPage.jsx", { farmId: "f1", partnerId: "p1" }],
];

let ok = 0, bad = 0;
for (const [rel, params] of TARGETS) {
  const file = path.join(WEB, "pages", rel);
  const mod = loadModule(file);
  const Page = mod.default;
  // Seed every zustand store the page pulls from.
  const seeds = {
    useAuthStore: { profile: { uid: "u1", name: "Test", email: "t@e.com", state: "Gujarat" } },
    useFarmStore: { farms: [FARM], selectedFarm: FARM },
    useTransactionStore: { transactions: TRANSACTIONS, totals: { total: 6500, own: 3550, partner: 2950 } },
    usePartnerStore: { partners: [PARTNER, PARTNER2], settlements: SETTLEMENTS, selectedPartner: PARTNER },
    usePartnerLoanStore: { loans: LOANS },
    useBillStore: { bills: [] },
    useAdvanceStore: { advances: [] },
  };
  const storeMods = {};
  for (const [name, val] of Object.entries(seeds)) {
    try {
      const s = loadModule(path.join(WEB, "store", name + ".js"));
      const hook = s[name] || s.default;
      if (hook && typeof hook.setState === "function") {
        hook.setState({ ...val });
        storeMods[name] = "seeded";
      } else storeMods[name] = "no setState";
    } catch (e) { storeMods[name] = "load-fail"; }
  }
  try {
    const props = { route: { params, key: "k", name: rel }, navigation: { navigate() {}, goBack() {}, setOptions() {}, addListener: () => () => {} } };
    const el = React.createElement(MemoryRouter, { initialEntries: ["/"] },
      React.createElement(Routes, null, React.createElement(Route, { path: "*", element: React.createElement(Page, props) })));
    const html = ReactDOMServer.renderToStaticMarkup(el);
    const text = html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/\s+/g, " ").trim();
    const status = html.length > 500 ? "OK  " : "THIN";
    if (html.length > 500) ok++; else bad++;
    console.log(`  ${status} ${rel} (${html.length}b) stores=${JSON.stringify(storeMods)}`);
    console.log(`        "${text.slice(0, 110)}"`);
  } catch (e) {
    bad++;
    console.log(`  FAIL ${rel}\n        ${(e.stack || e.message).split("\n").slice(0, 3).join(" | ")}`);
  }
}
console.log(`\npopulated renders: ${ok}   thin/failed: ${bad}`);
