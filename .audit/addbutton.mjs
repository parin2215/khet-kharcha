import fs from "fs";
const file = "C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/src/screens/partners/PartnerSettlementScreen.jsx";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

// Add a "Share Khata" button after the existing Lend/Settle row.
const rowEnd = lines.findIndex((l, i) => l.trim() === "</View>" && (lines[i + 1] || "").trim() === "</Card.Content>");
if (rowEnd === -1) { console.log("button row end not found"); process.exit(1); }

const button = [
  "",
  "                  <Button",
  "                    mode=\"outlined\"",
  "                    icon=\"file-document-outline\"",
  "                    onPress={() => {",
  "                      setSelectedPartner(partner);",
  "                      setTimeout(handleShareKhata, 0);",
  "                    }}",
  "                    style={[styles.settleBtn, { flex: 1 }]}",
  "                  >",
  "                    {t('expense.khataTitle')}",
  "                  </Button>",
];
if (!lines.some((l) => l.includes("handleShareKhata, 0"))) {
  lines.splice(rowEnd + 1, 0, ...button);
}

fs.writeFileSync(file, lines.join("\r\n"), "utf8");
console.log("Share Khata button added after line", rowEnd + 1);
