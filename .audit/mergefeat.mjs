import fs from "fs";
const p = "C:/Users/patel/OneDrive/Desktop/khet kharcha/.audit/tests.mjs";
let s = fs.readFileSync(p, "utf8");

const anchor = 'const voice = await loadModule'.replace("await ", "");
s = s.replace(
  'const voice = loadModule(path.join(ROOT, "shared/utils/voiceExpense.js"));',
  'const voice = loadModule(path.join(ROOT, "shared/utils/voiceExpense.js"));\nconst mandi = loadModule(path.join(ROOT, "shared/utils/mandiRates.js"));\nconst khata = loadModule(path.join(ROOT, "shared/utils/partnerKhata.js"));'
);

const marker = "// ---- Execute ----";
if (!s.includes("mandi advisory")) {
  s = s.replace(marker, `
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
  const kg = mandi.analyzeSale({ crop: "wheat", quantity: 1000, unit: "kg", amount: 227500 });
  eq(kg.realizedRate, 2275, "1000kg at 22.75/kg = 2275/quintal");
  const ton = mandi.analyzeSale({ crop: "wheat", quantity: 1, unit: "ton", amount: 227500 });
  eq(ton.realizedRate, 22750, "1 ton -> per quintal");
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

` + marker);
}
fs.writeFileSync(p, s, "utf8");
console.log("feature tests merged");
