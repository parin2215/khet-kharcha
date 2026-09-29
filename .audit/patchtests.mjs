import fs from "fs";
const p = "C:/Users/patel/OneDrive/Desktop/khet kharcha/.audit/tests.mjs";
let s = fs.readFileSync(p, "utf8");
const subs = [
  ['  ok(!helpers.isValidIndianPhone("+91 98765 43210"), "13-digit with country code is rejected (documented gap)");',
   '  ok(helpers.isValidIndianPhone("+91 98765 43210"), "+91 with spaces now validates");\n  ok(helpers.isValidIndianPhone("09876543210"), "leading 0 tolerated");\n  ok(!helpers.isValidIndianPhone("9198765432100"), "12-digit with 91 prefix validates, 13-digit does not");'],
  ['  near(helpers.convertArea(1, "acre", "hectare"), 0.4047, "1 acre in ha", 0.005); // rounded to 2dp by design',
   '  near(helpers.convertArea(1, "acre", "hectare"), 0.4047, "1 acre in ha", 0.0001);'],
  ['  near(helpers.convertArea(1, "bigha", "hectare"), 0.1, "1 bigha in ha (rounds to 0.1 - precision loss)", 0.001);',
   '  near(helpers.convertArea(1, "bigha", "hectare"), 0.1012, "1 bigha in ha (full precision kept)", 0.0001);'],
  ['  near(rt, 3, "round trip bigha->acre->bigha", 0.02);',
   '  near(rt, 3, "round trip bigha->acre->bigha", 0.001);'],
  ['T("BUG: FinancialEngine.calculate(null) throws instead of returning zeros", () => {\n  let threw = null;\n  try { FinancialEngine.calculate(null); } catch (e) { threw = e; }\n  ok(threw !== null, "expected calculate(null) to be defensive; it currently throws: " + (threw && threw.message));\n});',
   'T("FinancialEngine.calculate(null) returns zeros instead of throwing", () => {\n  const r = FinancialEngine.calculate(null);\n  eq(r.totalExpenses, 0, "null -> 0");\n  eq(r.netProfit, 0, "null -> netProfit 0");\n  ok(Array.isArray(r.trendData) && r.trendData.length === 12, "still produces trend buckets");\n});'],
];
let applied = 0;
for (const [from, to] of subs) {
  if (s.includes(from)) { s = s.replace(from, to); applied++; }
  else console.log("NOT FOUND:", from.slice(0, 60));
}
// Replace the seasons metadata test wholesale.
const start = s.indexOf('T("seasons: SEASONS endMonth metadata disagrees');
if (start !== -1) {
  const endMarker = '\n});\n';
  const end = s.indexOf(endMarker, start);
  const replacement = `T("seasons: SEASONS metadata agrees with getCurrentSeason()", () => {
  const kharif = seasons.getSeasonById("kharif");
  const rabi = seasons.getSeasonById("rabi");
  const zaid = seasons.getSeasonById("zaid");
  eq(kharif.startMonth, 6, "kharif.startMonth = June");
  eq(kharif.endMonth, 10, "kharif.endMonth = October (matches detector)");
  eq(rabi.startMonth, 11, "rabi.startMonth = November");
  eq(rabi.endMonth, 3, "rabi.endMonth = March (wraps into next year)");
  eq(zaid.startMonth, 4, "zaid.startMonth = April");
  eq(zaid.endMonth, 5, "zaid.endMonth = May");

  for (let m = 0; m < 12; m++) {
    const id = seasons.getCurrentSeason(new Date(2025, m, 15));
    ok(seasons.SEASONS.some((s) => s.id === id), "month " + m + " -> " + id + " must exist in SEASONS");
  }
  const r1 = seasons.getSeasonDateRange("kharif", 2025);
  ok(r1.start.getMonth() === 5 && r1.end.getMonth() === 9, "kharif range ends in October");
  const r2 = seasons.getSeasonDateRange("rabi", 2025);
  ok(r2.start.getMonth() === 10 && r2.end.getFullYear() === 2026, "rabi range wraps into next year");
});`;
  s = s.slice(0, start) + replacement + s.slice(end + endMarker.length);
  applied++;
}
fs.writeFileSync(p, s, "utf8");
console.log("applied", applied, "substitutions");
