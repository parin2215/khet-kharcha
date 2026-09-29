import fs from "fs";
const p = "C:/Users/patel/OneDrive/Desktop/khet kharcha/.audit/tests.mjs";
let s = fs.readFileSync(p, "utf8");
const old = `T("mandi: unit normalisation (kg and ton)", () => {
  const kg = mandi.analyzeSale({ crop: "wheat", quantity: 1000, unit: "kg", amount: 227500 });
  eq(kg.realizedRate, 2275, "1000kg at 22.75/kg = 2275/quintal");
  const ton = mandi.analyzeSale({ crop: "wheat", quantity: 1, unit: "ton", amount: 227500 });
  eq(ton.realizedRate, 22750, "1 ton -> per quintal");
});`;
const fixed = `T("mandi: unit normalisation (kg and ton)", () => {
  // 1000 kg = 10 quintals. Rs 22,750 total => Rs 2,275 per quintal.
  const kg = mandi.analyzeSale({ crop: "wheat", quantity: 1000, unit: "kg", amount: 22750 });
  eq(kg.realizedRate, 2275, "1000kg for Rs22,750 = Rs2,275/quintal");
  eq(kg.verdict, "fair", "kg sale at MSP is fair");
  // 1 ton = 10 quintals. Rs 22,750 total => Rs 2,275 per quintal.
  const ton = mandi.analyzeSale({ crop: "wheat", quantity: 1, unit: "ton", amount: 22750 });
  eq(ton.realizedRate, 2275, "1 ton for Rs22,750 = Rs2,275/quintal");
  // Same crop, same money, different unit must agree.
  eq(kg.realizedRate, ton.realizedRate, "kg and ton agree");
});`;
if (!s.includes(old)) { console.log("unit test block NOT FOUND"); process.exit(1); }
s = s.replace(old, fixed);
fs.writeFileSync(p, s, "utf8");
console.log("unit test corrected");
