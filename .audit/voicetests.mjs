import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const babelCore = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/core");
const cjsPlugin = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/plugin-transform-modules-commonjs");
const babelParser = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/parser");

function loadModule(file) {
  const src = require("fs").readFileSync(file, "utf8");
  const ast = babelParser.parse(src, { sourceType: "unambiguous", plugins: [] });
  const out = babelCore.transformFromAstSync(ast, src, { babelrc: false, configFile: false, plugins: [cjsPlugin], parserOpts: { sourceType: "unambiguous" } });
  const m = { exports: {} };
  const fn = new Function("exports", "require", "module", "__filename", "__dirname", out.code);
  fn(m.exports, require, m, file, path.dirname(file));
  return m.exports;
}

const V = loadModule("C:/Users/patel/OneDrive/Desktop/khet kharcha/shared/utils/voiceExpense.js");
let pass = 0, fail = 0;
const eq = (a, b, m) => { if (!Object.is(a, b)) { fail++; console.log(`  FAIL ${m}: expected ${b}, got ${a}`); } else pass++; };
const T = (name, fn) => { try { fn(); } catch (e) { fail++; console.log(`  FAIL ${name}: ${e.message}`); } };

console.log("--- parseAmount ---");
eq(V.parseAmount("diesel do hazaar rupaye"), 2000, "do hazaar");
eq(V.parseAmount("khet ka khad 1500"), 1500, "plain digits");
eq(V.parseAmount("1500 rupaye khet ka khad"), 1500, "digits first");
eq(V.parseAmount("₹12,500 diye"), 12500, "formatted with comma");
eq(V.parseAmount("teen sau"), 300, "teen sau = 300");
eq(V.parseAmount("ek hazaar paanch sau"), 1500, "ek hazaar paanch sau = 1500");
eq(V.parseAmount("do lakh"), 200000, "do lakh");
eq(V.parseAmount("pachaas rupaye"), 50, "pachaas = 50");
eq(V.parseAmount("majdoori 500 per din"), 500, "digits win over words");
eq(V.parseAmount("no amount here"), null, "no number -> null");
eq(V.parseAmount(""), null, "empty -> null");
eq(V.parseAmount(null), null, "null -> null");

console.log("--- parseCategory ---");
eq(V.parseCategory("diesel do hazaar"), "diesel", "diesel");
eq(V.parseCategory("khet ka khad"), "fertilizer", "khad -> fertilizer");
eq(V.parseCategory("beej khareedne ke liye"), "seeds", "beej -> seeds");
eq(V.parseCategory("majdoori di"), "labour", "majdoori -> labour");
eq(V.parseCategory("bijli ka bill"), "electricity", "bijli -> electricity");
eq(V.parseCategory("tractor ka diesel"), "diesel", "longest match wins over tractor? diesel");
eq(V.parseCategory("mandi ka kharcha"), "market", "mandi -> market");
eq(V.parseCategory("kuchh anjaan"), null, "unknown -> null");

console.log("--- parseExpenseType ---");
eq(V.parseExpenseType("partner ka kharcha"), "partner", "partner hint");
eq(V.parseExpenseType("apna kharcha"), "own", "own hint");
eq(V.parseExpenseType("diesel"), null, "no hint -> null");

console.log("--- parseVoiceExpense end to end ---");
const r1 = V.parseVoiceExpense("diesel do hazaar rupaye");
eq(r1.amount, 2000, "e2e amount");
eq(r1.category, "diesel", "e2e category");
eq(r1.isValid, true, "e2e valid");
ok1(r1.confidence >= 0.85, "e2e confidence high");
function ok1(c, m) { if (!c) { fail++; console.log(`  FAIL ${m}`); } else pass++; }

const r2 = V.parseVoiceExpense("kuchh anjaan baat");
eq(r2.amount, null, "e2e no amount");
eq(r2.isValid, false, "e2e invalid when incomplete");

const r3 = V.parseVoiceExpense("majdoori 500 partner ka", { defaultCategory: "labour" });
eq(r3.expenseType, "partner", "e2e expenseType");
eq(r3.category, "labour", "e2e defaultCategory fallback");

console.log(`\nPASSED: ${pass}  FAILED: ${fail}`);
process.exit(fail ? 1 : 0);
