import fs from "fs";
const file = "C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/src/screens/partners/PartnerSettlementScreen.jsx";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

// 1) Import the khata builder/formatter.
const impIdx = lines.findIndex((l) => l.includes("shared/utils/helpers.js"));
if (impIdx === -1) { console.log("helpers import not found"); process.exit(1); }
if (!lines.some((l) => l.includes("partnerKhata.js"))) {
  lines.splice(impIdx + 1, 0, "import { buildPartnerStatement, formatStatement } from '../../../../shared/utils/partnerKhata.js';");
}

// 2) Add the share handler after handleRecordLend closes.
const lendClose = lines.findIndex((l, i) => l.includes("setLending(false)") && lines[i + 2]?.trim() === "};");
if (lendClose === -1) { console.log("handleRecordLend close not found"); process.exit(1); }
const insertAt = lendClose + 2; // the "};" line

const handler = [
  "",
  "  // Share the full running statement (khata) with the partner over SMS/WhatsApp.",
  "  const handleShareKhata = () => {",
  "    if (!selectedPartner) return;",
  "    const statement = buildPartnerStatement({",
  "      transactions: expenses,",
  "      partner: selectedPartner,",
  "      partnerId: selectedPartner.id,",
  "      crop: selectedFarm?.currentCrop,",
  "    });",
  "    const text = formatStatement(statement, { farmName: selectedFarm?.name });",
  "    const url = `sms:${selectedPartner.phone}?body=${encodeURIComponent(text)}`;",
  "    Linking.openURL(url).catch((err) => console.error('Failed to open SMS client', err));",
  "  };",
];
lines.splice(insertAt + 1, 0, ...handler);

// 3) Live statement for display, before the component return.
const returnIdx = lines.findIndex((l, i) => l.trim() === "return (" && (lines[i + 1] || "").includes("<ScrollView"));
if (returnIdx === -1) { console.log("component return not found"); process.exit(1); }
const live = [
  "  // Live running statement for the selected partner.",
  "  const khata = buildPartnerStatement({",
  "    transactions: expenses,",
  "    partner: selectedPartner,",
  "    partnerId: selectedPartner?.id,",
  "    crop: selectedFarm?.currentCrop,",
  "  });",
  "",
];
lines.splice(returnIdx, 0, ...live);

fs.writeFileSync(file, lines.join("\r\n"), "utf8");
console.log("khata wired: handler at", insertAt + 2, "| live statement at", returnIdx + 1);
