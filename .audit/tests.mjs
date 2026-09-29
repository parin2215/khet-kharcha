// Clean, self-contained regression suite (no npm install required).
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const babelCore = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/core");
const cjsPlugin = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/plugin-transform-modules-commonjs");
const babelParser = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/parser");

const ROOT = "C:/Users/patel/OneDrive/Desktop/khet kharcha";

function loadModule(file) {
  const src = fs.readFileSync(file, "utf8");
  const isJSX = file.endsWith(".jsx");
  const ast = babelParser.parse(src, { sourceType: "unambiguous", plugins: isJSX ? ["jsx"] : [] });
  const out = babelCore.transformFromAstSync(ast, src, {
    babelrc: false, configFile: false, plugins: [cjsPlugin],
    parserOpts: { sourceType: "unambiguous", plugins: isJSX ? ["jsx"] : [] },
  });
  const m = { exports: {} };
  const req = (spec) => {
    if (spec.startsWith(".")) {
      let p = path.resolve(path.dirname(file), spec);
      if (!path.extname(p)) p += ".js";
      if (!fs.existsSync(p) && fs.existsSync(p + ".js")) p += ".js";
      if (!fs.existsSync(p) && fs.existsSync(path.join(p, "index.js"))) p = path.join(p, "index.js");
      return loadModule(p);
    }
    return require(spec);
  };
  new Function("exports", "require", "module", "__filename", "__dirname", out.code)(m.exports, req, m, file, path.dirname(file));
  return m.exports;
}

let passed = 0, failed = 0;
const failures = [];
let suite = "";
const queue = [];

globalThis.describe = (n, f) => { const p = suite; suite = p ? `${p} > ${n}` : n; f(); suite = p; };
globalThis.it = globalThis.test = (n, f) => queue.push({ name: suite ? `${suite} > ${n}` : n, fn: f });
const show = (v) => { try { return JSON.stringify(v); } catch { return String(v); } };
const fail = (m) => { const e = new Error(m); e.__assert = true; throw e; };
globalThis.expect = (a) => ({
  toBe: (e) => { if (!Object.is(a, e)) fail(`expected ${show(e)}, got ${show(a)}`); },
  toEqual: (e) => { if (JSON.stringify(a) !== JSON.stringify(e)) fail(`expected ${show(e)}, got ${show(a)}`); },
  toBeTruthy: () => { if (!a) fail(`expected truthy, got ${show(a)}`); },
  toBeFalsy: () => { if (a) fail(`expected falsy, got ${show(a)}`); },
  toBeUndefined: () => { if (a !== undefined) fail(`expected undefined, got ${show(a)}`); },
});

// ---- Run the project's own suite first ----
const ownQueue = [];
const realQueue = queue;
queue.length = 0;
await loadModule(path.join(ROOT, "shared/financial/__tests__/FinancialEngine.test.js"));
for (const t of queue) {
  try { await t.fn(); passed++; }
  catch (e) { failed++; failures.push({ name: `[project] ${t.name}`, err: e.__assert ? e.message : (e.stack || String(e)).split("\n")[0] }); }
}
queue.push(...ownQueue);

// ---- Load modules under test ----
const { FinancialEngine } = loadModule(path.join(ROOT, "shared/financial/FinancialEngine.js"));
const helpers = loadModule(path.join(ROOT, "shared/utils/helpers.js"));
const seasons = loadModule(path.join(ROOT, "shared/constants/seasons.js"));
const cats = loadModule(path.join(ROOT, "shared/constants/categories.js"));
const voice = loadModule(path.join(ROOT, "shared/utils/voiceExpense.js"));
const mandi = loadModule(path.join(ROOT, "shared/utils/mandiRates.js"));
const receipt = loadModule(path.join(ROOT, "shared/utils/receiptParser.js"));
const khata = loadModule(path.join(ROOT, "shared/utils/partnerKhata.js"));

const T = (n, f) => queue.push({ name: n, fn: f });
const ok = (c, m) => { if (!c) throw new Error(m); };
const eq = (a, b, m) => { if (!Object.is(a, b)) throw new Error(`${m}: expected ${b}, got ${a}`); };
const near = (a, b, m, tol = 0.011) => { if (Math.abs(a - b) > tol) throw new Error(`${m}: expected ~${b}, got ${a}`); };

/* ---------------- helpers ---------------- */
T("formatRelativeDate: future dates never say 'ago'", () => {
  const out = helpers.formatRelativeDate(new Date(Date.now() + 3 * 86400000));
  ok(!/ago/.test(out), `got "${out}"`);
  eq(helpers.formatRelativeDate(new Date(Date.now() + 86400000)), "Tomorrow", "tomorrow");
  eq(helpers.formatRelativeDate(new Date(Date.now() + 5 * 86400000)), "In 5 days", "in 5 days");
});
T("formatRelativeDate: past dates", () => {
  eq(helpers.formatRelativeDate(new Date()), "Today", "today");
  eq(helpers.formatRelativeDate(new Date(Date.now() - 86400000)), "Yesterday", "yesterday");
  eq(helpers.formatRelativeDate(new Date(Date.now() - 3 * 86400000)), "3 days ago", "3 days");
});
T("formatDaysRemaining: overdue/today/tomorrow", () => {
  eq(helpers.formatDaysRemaining(new Date(Date.now() - 86400000)).status, "overdue", "overdue");
  eq(helpers.formatDaysRemaining(new Date()).status, "today", "today");
  eq(helpers.formatDaysRemaining(new Date(Date.now() + 86400000)).text, "Due tomorrow", "tomorrow");
});
T("formatINR: Indian grouping and edge values", () => {
  eq(helpers.formatINR(125000), "₹1,25,000", "lakh grouping");
  eq(helpers.formatINR(0), "₹0", "zero");
  eq(helpers.formatINR(null), "₹0", "null");
  eq(helpers.formatINR(NaN), "₹0", "NaN");
});
T("isValidIndianPhone: accepts plain, +91, and leading 0", () => {
  ok(helpers.isValidIndianPhone("9876543210"), "plain");
  ok(helpers.isValidIndianPhone("+91 98765 43210"), "+91 with spaces");
  ok(helpers.isValidIndianPhone("09876543210"), "leading 0");
  ok(!helpers.isValidIndianPhone("1234567890"), "starts with 1");
  ok(!helpers.isValidIndianPhone("5876543210"), "starts with 5");
  ok(!helpers.isValidIndianPhone("98765"), "too short");
  ok(!helpers.isValidIndianPhone(""), "empty");
});
T("convertArea: keeps 4-decimal precision", () => {
  near(helpers.convertArea(1, "bigha", "hectare"), 0.1012, "1 bigha in ha", 0.0001);
  near(helpers.convertArea(1, "acre", "hectare"), 0.4047, "1 acre in ha", 0.0001);
  near(helpers.convertArea(1, "hectare", "acre"), 2.4711, "1 ha in acres", 0.001);
  eq(helpers.convertArea(5, "acre", "acre"), 5, "identity");
  near(helpers.convertArea(helpers.convertArea(3, "bigha", "acre"), "acre", "bigha"), 3, "round trip", 0.001);
});
T("truncate", () => {
  eq(helpers.truncate("short", 30), "short", "under");
  eq(helpers.truncate("abcdefghij", 5), "abcde...", "over");
  eq(helpers.truncate("", 5), "", "empty");
});
T("toBillMonth zero-pads", () => {
  eq(helpers.toBillMonth(new Date(2025, 0, 15)), "2025-01", "Jan");
  eq(helpers.toBillMonth(new Date(2025, 11, 31)), "2025-12", "Dec");
});
T("toLocalDateString returns local YYYY-MM-DD", () => {
  ok(/^\d{4}-\d{2}-\d{2}$/.test(helpers.toLocalDateString()), "today");
  eq(helpers.toLocalDateString("not-a-date"), "", "invalid");
  ok(/^\d{4}-\d{2}-\d{2}$/.test(helpers.toLocalDateString(new Date(2026, 8, 28))), "local date");
});
T("parseLocalDateString builds local midnight (no UTC shift)", () => {
  const d = helpers.parseLocalDateString("2026-09-28");
  eq(d.getFullYear(), 2026, "year");
  eq(d.getMonth(), 8, "month");
  eq(d.getDate(), 28, "day");
  eq(d.getHours(), 0, "midnight");
  ok(d.getTime() !== new Date("2026-09-28").getTime(), "differs from UTC parse");
  eq(helpers.parseLocalDateString(""), null, "empty");
  eq(helpers.parseLocalDateString(null), null, "null");
});
T("local date round trip is stable", () => {
  for (const s of ["2026-01-01", "2026-09-28", "2026-12-31"]) {
    eq(helpers.toLocalDateString(helpers.parseLocalDateString(s)), s, s);
  }
});

/* ---------------- calculateSettlement ---------------- */
T("calculateSettlement: due, paid, balance", () => {
  const r = helpers.calculateSettlement(10000, 40, 1500);
  eq(r.due, 4000, "due");
  eq(r.paid, 1500, "paid");
  eq(r.balance, 2500, "balance");
});
T("calculateSettlement: clamping and defaults", () => {
  eq(helpers.calculateSettlement(10000, 0, 0).due, 0, "0%");
  eq(helpers.calculateSettlement(10000, 50, 9000).balance, -4000, "overpaid");
  eq(helpers.calculateSettlement(10000, 150, 0).due, 10000, ">100 clamps");
  eq(helpers.calculateSettlement(10000, -5, 0).due, 0, "negative clamps");
  eq(helpers.calculateSettlement(10000, 40).balance, 4000, "totalPaid default");
  eq(helpers.calculateSettlement(null, null, null).due, 0, "null-safe");
});

/* ---------------- calculateTermsSettlement ---------------- */
T("calculateTermsSettlement: crop vs expense share", () => {
  const s = helpers.calculateTermsSettlement([{ amount: 1000 }, { amount: 2000 }], { sharePercent: 50 }, { totalYield: 10, mandiRate: 2000, totalSaleAmount: 20000 });
  eq(s.cropSharePercent, 50, "percent");
  eq(s.totalFarmExpense, 3000, "expense");
  eq(s.partnerCropDue, 10000, "crop due");
  eq(s.partnerBalance, 1500, "expense due");
  eq(s.netSettlement, 8500, "net");
});
T("calculateTermsSettlement: sale amount preferred, else yield x rate", () => {
  eq(helpers.calculateTermsSettlement([], { sharePercent: 50 }, { totalYield: 10, mandiRate: 2000, totalSaleAmount: 0 }).partnerCropDue, 10000, "rate");
  eq(helpers.calculateTermsSettlement([], { sharePercent: 50 }, { totalYield: 10, mandiRate: 2000, totalSaleAmount: 30000 }).partnerCropDue, 15000, "sale wins");
});
T("calculateTermsSettlement: terms override, loans excluded, paid nets", () => {
  eq(helpers.calculateTermsSettlement([], { sharePercent: 30, terms: { cropSharePercent: 60 } }, { totalSaleAmount: 1000 }).cropSharePercent, 60, "terms wins");
  eq(helpers.calculateTermsSettlement([{ amount: 500 }, { amount: 500, loanDirection: "owner_to_partner" }], { sharePercent: 50 }, { totalSaleAmount: 0 }).totalFarmExpense, 500, "loans excluded");
  eq(helpers.calculateTermsSettlement([], { sharePercent: 50, totalPaid: 2000 }, { totalSaleAmount: 10000 }).netSettlement, 3000, "paid nets");
});
T("calculateTermsSettlement: null-safe", () => {
  const s = helpers.calculateTermsSettlement(null, null, {});
  eq(s.totalFarmExpense, 0, "expense 0");
  eq(s.netSettlement, 0, "net 0");
});

/* ---------------- FinancialEngine ---------------- */
T("FinancialEngine: empty and null input", () => {
  for (const input of [[], null, undefined]) {
    const r = FinancialEngine.calculate(input);
    eq(r.totalExpenses, 0, `totalExpenses for ${JSON.stringify(input)}`);
    eq(r.netProfit, 0, "netProfit");
    ok(Number.isFinite(r.roi) && Number.isFinite(r.profitMargin), "KPIs finite");
  }
});
T("FinancialEngine: string amounts coerced", () => {
  near(FinancialEngine.calculate([{ type: "expense", amount: "1500.50" }]).totalExpenses, 1500.5, "string amount");
});
T("FinancialEngine: trend bucket counts", () => {
  eq(FinancialEngine.calculate([], { periodType: "year" }).trendData.length, 12, "year -> 12");
  eq(FinancialEngine.calculate([], { periodType: "month" }).trendData.length, 5, "month -> 5");
});
T("FinancialEngine: prior-year expense excluded from trend but counted in totals", () => {
  const last = new Date(); last.setFullYear(last.getFullYear() - 1);
  const r = FinancialEngine.calculate([{ type: "expense", amount: 999, date: last.toISOString() }], { periodType: "year", targetDate: new Date() });
  eq(r.trendData.reduce((s, m) => s + m.expense, 0), 0, "not in trend");
  eq(r.totalExpenses, 999, "counted in totals");
});
T("FinancialEngine: week clamping for day 29-31", () => {
  const now = new Date();
  const r = FinancialEngine.calculate([{ type: "expense", amount: 100, date: new Date(now.getFullYear(), now.getMonth(), 30).toISOString() }], { periodType: "month", targetDate: now });
  eq(r.trendData[4].expense, 100, "day 30 -> Week 5");
});
T("FinancialEngine: settlement nets to profit", () => {
  const r = FinancialEngine.calculate([
    { type: "expense", amount: 1000, ownerShare: 500, partnerShare: 500 },
    { type: "crop_sale", amount: 5000 },
  ], { partnerProfitSharePercent: 50 });
  near(r.ownerSettlement + r.partnerSettlement, r.netProfit, "settlements sum to net profit", 0.02);
});
T("FinancialEngine: investments excluded from expenses", () => {
  const r = FinancialEngine.calculate([{ type: "investment", amount: 7000 }]);
  eq(r.investments, 7000, "tracked");
  eq(r.totalExpenses, 0, "not an expense");
});
T("FinancialEngine: parseDate handles ISO, epoch, {seconds}", () => {
  eq(FinancialEngine.parseDate("2025-03-15").getFullYear(), 2025, "ISO");
  eq(FinancialEngine.parseDate(1741996800000).getFullYear(), 2025, "epoch ms");
  eq(FinancialEngine.parseDate({ seconds: 1741996800 }).getFullYear(), 2025, "seconds");
  eq(FinancialEngine.parseDate(null), null, "null");
});

/* ---------------- seasons ---------------- */
T("seasons: metadata agrees with getCurrentSeason", () => {
  const k = seasons.getSeasonById("kharif"), r = seasons.getSeasonById("rabi"), z = seasons.getSeasonById("zaid");
  eq(k.startMonth, 6, "kharif start"); eq(k.endMonth, 10, "kharif end");
  eq(r.startMonth, 11, "rabi start"); eq(r.endMonth, 3, "rabi end");
  eq(z.startMonth, 4, "zaid start"); eq(z.endMonth, 5, "zaid end");
  for (let m = 0; m < 12; m++) ok(seasons.SEASONS.some((s) => s.id === seasons.getCurrentSeason(new Date(2025, m, 15))), `month ${m}`);
});
T("seasons: month boundaries", () => {
  eq(seasons.getCurrentSeason(new Date(2025, 5, 15)), "kharif", "Jun");
  eq(seasons.getCurrentSeason(new Date(2025, 9, 15)), "kharif", "Oct");
  eq(seasons.getCurrentSeason(new Date(2025, 10, 15)), "rabi", "Nov");
  eq(seasons.getCurrentSeason(new Date(2025, 0, 15)), "rabi", "Jan");
  eq(seasons.getCurrentSeason(new Date(2025, 3, 15)), "zaid", "Apr");
  eq(seasons.getCurrentSeason(new Date(2025, 4, 15)), "zaid", "May");
});
T("seasons: date ranges match metadata", () => {
  const k = seasons.getSeasonDateRange("kharif", 2025);
  eq(k.start.getMonth(), 5, "kharif starts June");
  eq(k.end.getMonth(), 9, "kharif ends October");
  const r = seasons.getSeasonDateRange("rabi", 2025);
  eq(r.start.getMonth(), 10, "rabi starts Nov");
  eq(r.end.getFullYear(), 2026, "rabi wraps into next year");
});

/* ---------------- categories ---------------- */
T("categories: all ids resolve with colors", () => {
  for (const c of cats.EXPENSE_CATEGORIES) {
    ok(cats.getCategoryById(c.id), `missing ${c.id}`);
    ok(typeof cats.getCategoryColor(c.id) === "string", `no color ${c.id}`);
  }
  eq(cats.getCategoryById("does_not_exist"), undefined, "unknown");
});

/* ---------------- voice parser ---------------- */
T("voice parseAmount: digits and currency", () => {
  eq(voice.parseAmount("diesel 2000"), 2000, "plain");
  eq(voice.parseAmount("₹12,500 diye"), 12500, "comma-grouped");
  // Regression: normalizeText used to strip the decimal point, so "2000.50" -> 2000.
  eq(voice.parseAmount("₹2000.50"), 2000.5, "decimal preserved");
  eq(voice.parseAmount("amount 9650.50"), 9650.5, "decimal after label");
  // Regression: Indian grouping (1,20,000) used to match only the "20,000" tail.
  eq(voice.parseAmount("Rs 1,20,000"), 120000, "indian lakh grouping");
  eq(voice.parseAmount("₹1,20,500.75"), 120500.75, "indian grouping with decimal");
  eq(voice.parseAmount("₹12,00,000"), 1200000, "indian 12 lakh");
  eq(voice.parseAmount("1500 rupaye"), 1500, "digits before");
  eq(voice.parseAmount("no amount"), null, "none");
  eq(voice.parseAmount(""), null, "empty");
  eq(voice.parseAmount(null), null, "null");
});
T("voice parseAmount: Hindi words", () => {
  eq(voice.parseAmount("do hazaar rupaye"), 2000, "do hazaar");
  eq(voice.parseAmount("teen sau"), 300, "teen sau");
  eq(voice.parseAmount("pachaas rupaye"), 50, "pachaas");
  eq(voice.parseAmount("ek hazaar paanch sau"), 1500, "composed");
  eq(voice.parseAmount("das hazaar"), 10000, "das hazaar");
});
T("voice parseAmount: English words", () => {
  eq(voice.parseAmount("two thousand"), 2000, "two thousand");
  eq(voice.parseAmount("one thousand five hundred"), 1500, "composed english");
});
T("voice parseCategory: across languages", () => {
  eq(voice.parseCategory("diesel do hazaar"), "diesel", "diesel");
  eq(voice.parseCategory("khet ka khad"), "fertilizer", "khad");
  eq(voice.parseCategory("beej khareedne ke liye"), "seeds", "beej");
  eq(voice.parseCategory("majdoori di"), "labour", "majdoori");
  eq(voice.parseCategory("bijli ka bill"), "electricity", "bijli");
  eq(voice.parseCategory("mandi ka kharcha"), "market", "mandi");
  eq(voice.parseCategory("kuchh anjaan baat"), null, "unknown");
});
T("voice parseCategory: latest mention wins", () => {
  eq(voice.parseCategory("tractor ka diesel"), "diesel", "diesel after tractor");
  eq(voice.parseCategory("khet ka khad aur diesel"), "diesel", "last of two");
});
T("voice parseExpenseType", () => {
  eq(voice.parseExpenseType("partner ka kharcha"), "partner", "partner");
  eq(voice.parseExpenseType("apna kharcha"), "own", "own");
  eq(voice.parseExpenseType("diesel"), null, "none");
});
T("voice parseVoiceExpense: end to end", () => {
  const r = voice.parseVoiceExpense("diesel do hazaar rupaye");
  eq(r.amount, 2000, "amount"); eq(r.category, "diesel", "category");
  eq(r.isValid, true, "valid"); ok(r.confidence >= 0.85, "confidence " + r.confidence);
  eq(voice.parseVoiceExpense("kuchh anjaan baat").isValid, false, "invalid when incomplete");
  const t = voice.parseVoiceExpense("majdoori 500 partner ka", { defaultCategory: "labour" });
  eq(t.expenseType, "partner", "expenseType"); eq(t.category, "labour", "fallback");
});
T("voice normalizeText", () => {
  eq(voice.normalizeText("₹12,500 diye"), "₹12,500 diye", "comma and rupee sign kept");
  eq(voice.normalizeText("  Diesel,  DO   Hazaar! "), "diesel do hazaar", "collapsed");
});


/* ---------------- mandi advisory ---------------- */
T("mandi: getMandiRate resolves aliases", () => {
  eq(mandi.getMandiRate("wheat").id, "wheat", "wheat");
  eq(mandi.getMandiRate("Gehun").id, "wheat", "Gehun alias");
  eq(mandi.getMandiRate("  PADDY ").id, "rice", "paddy alias");
  eq(mandi.getMandiRate("cotton").id, "cotton", "cotton");
  eq(mandi.getMandiRate("dragonfruit"), null, "unknown");
  eq(mandi.getMandiRate(""), null, "empty");
});
T("mandi: sale above benchmark reads as good", () => {
  const r = mandi.analyzeSale({ crop: "wheat", quantity: 100, unit: "quintal", amount: 250000 });
  eq(r.realizedRate, 2500, "realized");
  eq(r.benchmarkRate, 2275, "MSP benchmark");
  eq(r.verdict, "good", "good");
  ok(r.differencePercent > 0, "positive pct");
});
T("mandi: sale below benchmark quantifies the shortfall", () => {
  const r = mandi.analyzeSale({ crop: "wheat", quantity: 100, unit: "quintal", amount: 200000 });
  eq(r.realizedRate, 2000, "realized");
  eq(r.difference, -275, "shortfall per quintal");
  eq(r.verdict, "low", "low");
  ok(/below/.test(r.message), "message explains");
});
T("mandi: fair band within +/-5%", () => {
  const r = mandi.analyzeSale({ crop: "wheat", quantity: 100, amount: 225000 });
  eq(r.verdict, "fair", "fair");
});
T("mandi: unit normalisation (kg and ton)", () => {
  // 1000 kg = 10 quintals. Rs 22,750 total => Rs 2,275 per quintal.
  const kg = mandi.analyzeSale({ crop: "wheat", quantity: 1000, unit: "kg", amount: 22750 });
  eq(kg.realizedRate, 2275, "1000kg for Rs22,750 = Rs2,275/quintal");
  eq(kg.verdict, "fair", "kg sale at MSP is fair");
  // 1 ton = 10 quintals. Rs 22,750 total => Rs 2,275 per quintal.
  const ton = mandi.analyzeSale({ crop: "wheat", quantity: 1, unit: "ton", amount: 22750 });
  eq(ton.realizedRate, 2275, "1 ton for Rs22,750 = Rs2,275/quintal");
  // Same crop, same money, different unit must agree.
  eq(kg.realizedRate, ton.realizedRate, "kg and ton agree");
});
T("mandi: missing inputs degrade to unknown", () => {
  eq(mandi.analyzeSale({ crop: "wheat" }).verdict, "unknown", "no quantity");
  eq(mandi.analyzeSale({ crop: "zzz", quantity: 1, amount: 1 }).verdict, "unknown", "no reference");
  eq(mandi.analyzeSale({}).verdict, "unknown", "empty");
});

/* ---------------- partner khata ---------------- */
T("khata: expense share creates a liability, crop sale credits it", () => {
  const s = khata.buildPartnerStatement({
    partner: { id: "p1", name: "Ramesh", sharePercent: 50, totalPaid: 0 },
    transactions: [
      { type: "expense", amount: 1000, partnerShare: 500, date: "2026-01-01" },
      { type: "crop_sale", amount: 10000, date: "2026-02-01" },
    ],
  });
  eq(s.lines.length, 2, "two lines");
  eq(s.lines[0].amount, 500, "expense line");
  eq(s.lines[1].amount, -5000, "crop credit line");
  eq(s.balance, -4500, "net credit to partner");
  eq(s.direction, "owner_owes_partner", "direction");
});
T("khata: advance then repayment nets to zero", () => {
  const s = khata.buildPartnerStatement({
    partner: { id: "p1", sharePercent: 50 },
    transactions: [
      { type: "loan", amount: 2000, loanDirection: "owner_to_partner", date: "2026-01-01" },
      { type: "repayment", amount: 2000, loanDirection: "owner_to_partner", date: "2026-03-01" },
    ],
  });
  eq(s.balance, 0, "settled");
  eq(s.direction, "settled", "direction");
});
T("khata: opening credit applied from partner.totalPaid", () => {
  const s = khata.buildPartnerStatement({
    partner: { id: "p1", sharePercent: 50, totalPaid: 1000 },
    transactions: [{ type: "expense", amount: 2000, partnerShare: 1000, date: "2026-01-01" }],
  });
  eq(s.lines[0].type, "opening", "opening line first");
  eq(s.balance, 0, "opening offsets the expense");
});
T("khata: running balances are chronological", () => {
  const s = khata.buildPartnerStatement({
    partner: { id: "p1", sharePercent: 50 },
    transactions: [
      { type: "expense", amount: 300, partnerShare: 300, date: "2026-03-01" },
      { type: "expense", amount: 100, partnerShare: 100, date: "2026-01-01" },
      { type: "expense", amount: 200, partnerShare: 200, date: "2026-02-01" },
    ],
  });
  const dates = s.lines.map((l) => l.date);
  eq(dates[0] < dates[1] && dates[1] < dates[2], true, "sorted ascending");
  eq(s.lines[0].balance, 100, "first running balance");
  eq(s.lines[2].balance, 600, "final running balance");
  eq(s.balance, 600, "statement balance");
});
T("khata: own-farm expense uses the share percentage when no partnerShare", () => {
  const s = khata.buildPartnerStatement({
    partner: { id: "p1", sharePercent: 25 },
    transactions: [{ type: "expense", amount: 1000, expenseType: "own", date: "2026-01-01" }],
  });
  eq(s.lines[0].amount, 250, "25% of 1000");
});
T("khata: partnerId filter and null-safety", () => {
  const s = khata.buildPartnerStatement({
    partner: { id: "p1", sharePercent: 50 },
    partnerId: "p1",
    transactions: [
      { type: "expense", amount: 100, partnerId: "p1", date: "2026-01-01" },
      { type: "expense", amount: 999, partnerId: "other", date: "2026-01-02" },
    ],
  });
  eq(s.lines.length, 1, "only matching partner");
  const empty = khata.buildPartnerStatement();
  eq(empty.balance, 0, "no args -> zero balance");
  eq(empty.lines.length, 0, "no lines");
});
T("khata: formatStatement produces readable text", () => {
  const s = khata.buildPartnerStatement({
    partner: { id: "p1", name: "Ramesh", sharePercent: 50 },
    transactions: [{ type: "expense", amount: 1000, partnerShare: 500, date: "2026-01-15" }],
  });
  const txt = khata.formatStatement(s, { farmName: "North Field" });
  ok(txt.includes("PARTNER KHATA"), "header");
  ok(txt.includes("North Field"), "farm name");
  ok(txt.includes("Partner owes Owner"), "direction summary");
});

/* ---------------- receipt prefill ---------------- */
T("receipt: amount, date and category from a bijli bill", () => {
  const r = receipt.parseReceiptText("Bijli Bill\nConsumer No 1234\nAmount Rs. 2450.00\nDate 04-11-2025");
  eq(r.amount, 2450, "amount");
  eq(r.date, "2025-11-04", "dd-mm-yyyy -> ISO");
  eq(r.category, "electricity", "category");
  eq(r.isValid, true, "valid");
});
T("receipt: Indian lakh grouping is not truncated", () => {
  const r = receipt.parseReceiptText("Invoice\nGrand Total: Rs 1,20,000");
  eq(r.amount, 120000, "1,20,000 is one lakh twenty thousand");
});
T("receipt: identifier lines are never read as the total", () => {
  // Regression: "Bill No: 4471" used to win over the real "Amount 3500".
  const r = receipt.parseReceiptText("Tractor Repair\nBill No: 4471\nAmount 3500\nDate 2025-03-09");
  eq(r.amount, 3500, "amount, not the bill number");
  eq(r.date, "2025-03-09", "ISO date");
});
T("receipt: purpose beats equipment name", () => {
  eq(receipt.parseReceiptText("HPCL Diesel Pump\nAmount 9650.50").category, "diesel", "diesel pump is fuel");
  eq(receipt.parseReceiptText("Tractor Repair\nAmount 3500").category, "equipment_repair", "tractor repair is a repair job");
  eq(receipt.parseReceiptText("Kisan Khad Bhandar\nTotal 12500").category, "fertilizer", "khad bhandar is fertilizer");
  eq(receipt.parseReceiptText("Sabzi Mandi Receipt\nTotal 860").category, "market", "mandi is market");
});
T("receipt: decimals survive normalisation", () => {
  eq(receipt.parseReceiptText("Amount 9650.50").amount, 9650.5, "decimal kept");
});
T("receipt: merchant is an issuer, not a label or money line", () => {
  eq(receipt.parseReceiptText("Bijli Bill\nAmount 2450").merchant, "Bijli Bill", "bijli bill is the issuer");
  eq(receipt.parseReceiptText("HPCL Diesel Pump\nAmount 9650").merchant, "HPCL Diesel Pump", "hpcl is the issuer");
  eq(receipt.parseReceiptText("Invoice\nGrand Total: Rs 500").merchant, null, "no issuer present");
});
T("receipt: tax lines never win over the real total", () => {
  const r = receipt.parseReceiptText("Kisan Khad Bhandar\nSub Total 12000\nGST 18% 2160\nTotal 14160");
  eq(r.amount, 14160, "grand total over subtotal/gst");
});
T("receipt: empty and junk input is handled safely", () => {
  const empty = receipt.parseReceiptText("");
  eq(empty.isValid, false, "empty invalid");
  eq(empty.amount, null, "no amount");
  eq(receipt.parseReceiptText(null).isValid, false, "null invalid");
  eq(receipt.parseReceiptText(undefined).amount, null, "undefined safe");
  eq(receipt.parseReceiptDate("no date here"), null, "no date");
  eq(receipt.parseReceiptDate("32-13-2025"), null, "impossible date rejected");
});

// ---- Execute ----
for (const t of queue) {
  try { await t.fn(); passed++; }
  catch (e) { failed++; failures.push({ name: t.name, err: e.__assert ? e.message : (e.stack || String(e)).split("\n")[0] }); }
}

console.log("=".repeat(70));
console.log(`PASSED: ${passed}    FAILED: ${failed}`);
console.log("=".repeat(70));
if (failures.length) {
  console.log("\nFAILURES:\n");
  for (const f of failures) console.log(`  x ${f.name}\n      ${f.err}\n`);
}
process.exit(failed ? 1 : 0);
