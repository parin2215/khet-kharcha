import fs from "fs";
const file = "C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/src/screens/partners/PartnerSettlementScreen.jsx";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

// The handler is truncated: it runs into the JSX without closing. Rebuild it cleanly.
const start = lines.findIndex((l) => l.includes("const handleShareKhata"));
if (start === -1) { console.log("handler not found"); process.exit(1); }
// Find where the JSX header begins (the line that should have followed the handler).
const jsxStart = lines.findIndex((l, i) => i > start && l.includes("<View style={styles.headerArea}>"));
if (jsxStart === -1) { console.log("jsx header not found"); process.exit(1); }

const handler = [
  "  // Share the full running statement (khata) with the partner over SMS/WhatsApp.",
  "  const handleShareKhata = (partnerOverride) => {",
  "    const target = partnerOverride || selectedPartner;",
  "    if (!target) return;",
  "    const statement = buildPartnerStatement({",
  "      transactions: expenses,",
  "      partner: target,",
  "      partnerId: target.id,",
  "      crop: selectedFarm?.currentCrop,",
  "    });",
  "    const text = formatStatement(statement, { farmName: selectedFarm?.name });",
  "    const url = `sms:${target.phone}?body=${encodeURIComponent(text)}`;",
  "    Linking.openURL(url).catch((err) => console.error('Failed to open SMS client', err));",
  "  };",
  "",
];
// Preserve the original leading comment if it sat just above the handler.
let from = start;
if (lines[from - 1]?.includes("Share the full running statement")) from -= 1;
lines.splice(from, jsxStart - from, ...handler);

fs.writeFileSync(file, lines.join("\r\n"), "utf8");
console.log("handler rebuilt; JSX restored at line", jsxStart + 1);
