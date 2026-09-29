import fs from "fs";
const p = "C:/Users/patel/OneDrive/Desktop/khet kharcha/.audit/tests.mjs";
let s = fs.readFileSync(p, "utf8");

// Load the voice parser alongside the other shared modules.
const anchor = 'const cats = await loadModule(path.join(ROOT, "shared/constants/categories.js"));';
if (!s.includes("voiceExpense.js")) {
  s = s.replace(anchor, anchor + '\nconst voice = await loadModule(path.join(ROOT, "shared/utils/voiceExpense.js"));');
}

const marker = 'for (const t of queue) {';
if (!s.includes("--- voice expense parser ---")) {
  const block = `
T("voice: parseAmount digits, comma-grouped, and currency-prefixed", () => {
  eq(voice.parseAmount("diesel 2000"), 2000, "plain digits");
  eq(voice.parseAmount("\\u20b912,500 diye"), 12500, "rupee sign + comma grouping");
  eq(voice.parseAmount("khet ka khad 1500"), 1500, "digits after words");
  eq(voice.parseAmount("1500 rupaye"), 1500, "digits before words");
  eq(voice.parseAmount("rs 2500"), 2500, "rs prefix");
  eq(voice.parseAmount("no amount"), null, "no number -> null");
  eq(voice.parseAmount(""), null, "empty -> null");
  eq(voice.parseAmount(null), null, "null -> null");
});

T("voice: parseAmount Hindi number words", () => {
  eq(voice.parseAmount("do hazaar rupaye"), 2000, "do hazaar");
  eq(voice.parseAmount("teen sau"), 300, "teen sau");
  eq(voice.parseAmount("char hazaar"), 4000, "char hazaar");
  eq(voice.parseAmount("pachaas rupaye"), 50, "pachaas");
  eq(voice.parseAmount("sau rupaye"), 100, "sau");
  eq(voice.parseAmount("ek hazaar paanch sau"), 1500, "composed 1500");
  eq(voice.parseAmount("das hazaar"), 10000, "das hazaar");
});

T("voice: parseAmount English words", () => {
  eq(voice.parseAmount("two thousand"), 2000, "two thousand");
  eq(voice.parseAmount("five hundred"), 500, "five hundred");
  eq(voice.parseAmount("one thousand five hundred"), 1500, "one thousand five hundred");
});

T("voice: parseCategory across languages", () => {
  eq(voice.parseCategory("diesel do hazaar"), "diesel", "english diesel");
  eq(voice.parseCategory("khet ka khad"), "fertilizer", "khad -> fertilizer");
  eq(voice.parseCategory("beej khareedne ke liye"), "seeds", "beej -> seeds");
  eq(voice.parseCategory("majdoori di"), "labour", "majdoori -> labour");
  eq(voice.parseCategory("bijli ka bill"), "electricity", "bijli -> electricity");
  eq(voice.parseCategory("mandi ka kharcha"), "market", "mandi -> market");
  eq(voice.parseCategory("kuchh anjaan baat"), null, "unknown -> null");
});

T("voice: most specific (latest) category mention wins", () => {
  eq(voice.parseCategory("tractor ka diesel"), "diesel", "diesel beats tractor");
  eq(voice.parseCategory("diesel tractor"), "tractor", "tractor mentioned last wins");
  eq(voice.parseCategory("khet ka khad aur diesel"), "diesel", "last of two categories");
});

T("voice: parseExpenseType hints", () => {
  eq(voice.parseExpenseType("partner ka kharcha"), "partner", "partner");
  eq(voice.parseExpenseType("apna kharcha"), "own", "own");
  eq(voice.parseExpenseType("diesel"), null, "no hint");
});

T("voice: end-to-end parseVoiceExpense", () => {
  const r = voice.parseVoiceExpense("diesel do hazaar rupaye");
  eq(r.amount, 2000, "amount");
  eq(r.category, "diesel", "category");
  eq(r.isValid, true, "valid");
  ok(r.confidence >= 0.85, "high confidence, got " + r.confidence);

  const bad = voice.parseVoiceExpense("kuchh anjaan baat");
  eq(bad.amount, null, "no amount");
  eq(bad.isValid, false, "invalid");

  const withType = voice.parseVoiceExpense("majdoori 500 partner ka", { defaultCategory: "labour" });
  eq(withType.expenseType, "partner", "expenseType");
  eq(withType.category, "labour", "defaultCategory fallback");
});

T("voice: normalizeText keeps digit grouping and drops matras", () => {
  eq(voice.normalizeText("\\u20b912,500 diye"), "12,500 diye", "comma preserved");
  eq(voice.normalizeText("  Diesel,  DO   Hazaar! "), "diesel do hazaar", "collapsed + lowercased");
});

`;
  s = s.replace(marker, block + marker);
}
fs.writeFileSync(p, s, "utf8");
console.log("voice tests merged into main suite");
