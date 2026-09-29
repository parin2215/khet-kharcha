import fs from "fs";
const file = "C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/src/screens/partners/PartnerSettlementScreen.jsx";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

// 1) Import
const impIdx = lines.findIndex((l) => l.includes("shared/utils/helpers.js"));
if (impIdx === -1) { console.log("helpers import not found"); process.exit(1); }
if (!lines.some((l) => l.includes("partnerKhata.js"))) {
  lines.splice(impIdx + 1, 0, "import { buildPartnerStatement, formatStatement } from '../../../../shared/utils/partnerKhata.js';");
}

// 2) Share handler after handleRecordLend closes.
const lendClose = lines.findIndex((l, i) => l.includes("setLending(false)") && (lines[i + 2] || "").trim() === "};");
if (lendClose === -1) { console.log("lend close not found"); process.exit(1); }
if (!lines.some((l) => l.includes("handleShareKhata"))) {
  const handler = [
    "",
    "  // Share the full running statement (khata) with the partner over SMS/WhatsApp.",
    "  const handleShareKhata = () => {",
    "    if (!selectedPartner) return;",
    "    const text = formatStatement(khata, { farmName: selectedFarm?.name });",
    "    const url = `sms:${selectedPartner.phone}?body=${encodeURIComponent(text)}`;",
    "    Linking.openURL(url).catch((err) => console.error('Failed to open SMS client', err));",
    "  };",
  ];
  lines.splice(lendClose + 3, 0, ...handler);
}

fs.writeFileSync(file, lines.join("\r\n"), "utf8");
console.log("import + handler added");
