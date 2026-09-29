import fs from "fs";
const file = "C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/src/screens/partners/PartnerSettlementScreen.jsx";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

const returnIdx = lines.findIndex((l, i) => l.trim() === "return (" && (lines[i + 1] || "").includes("styles.container"));
if (returnIdx === -1) { console.log("main return not found"); process.exit(1); }

const live = [
  "  // Live running statement (khata) for the selected partner.",
  "  const khata = buildPartnerStatement({",
  "    transactions: expenses,",
  "    partner: selectedPartner,",
  "    partnerId: selectedPartner?.id,",
  "    crop: selectedFarm?.currentCrop,",
  "  });",
  "",
];
if (!lines.some((l) => l.includes("const khata = buildPartnerStatement"))) {
  lines.splice(returnIdx, 0, ...live);
}
fs.writeFileSync(file, lines.join("\r\n"), "utf8");
console.log("live khata statement inserted before main return at", returnIdx + 1);
