import fs from "fs";
const file = "C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/src/screens/partners/PartnerSettlementScreen.jsx";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

// 1) Remove the misplaced button.
const bStart = lines.findIndex((l) => l.includes("icon=\"file-document-outline\""));
if (bStart === -1) { console.log("misplaced button not found"); process.exit(1); }
let bStartFull = bStart;
while (!lines[bStartFull].includes("<Button")) bStartFull--;
let bEnd = bStart;
while (bEnd < lines.length && lines[bEnd].trim() !== "</Button>") bEnd++;
let from = bStartFull, to = bEnd;
if (lines[from - 1]?.trim() === "") from -= 1;
lines.splice(from, to - from + 1);
console.log("removed misplaced button");

// 2) Insert it inside the partner card, after the Lend/Settle row.
const lendBtn = lines.findIndex((l) => l.includes("onPress={() => handleOpenLend(partner)}"));
if (lendBtn === -1) { console.log("lend button not found"); process.exit(1); }
// Find the closing </View> of that button row (the </View> right before </Card.Content>).
let rowEnd = lendBtn;
while (rowEnd < lines.length && !(lines[rowEnd].trim() === "</View>" && (lines[rowEnd + 1] || "").trim() === "</Card.Content>")) rowEnd++;
if (rowEnd === lines.length) { console.log("partner card row end not found"); process.exit(1); }

const button = [
  "",
  "                  <Button",
  "                    mode=\"outlined\"",
  "                    icon=\"file-document-outline\"",
  "                    onPress={() => {",
  "                      setSelectedPartner(partner);",
  "                      setTimeout(() => handleShareKhata(partner), 0);",
  "                    }}",
  "                    style={[styles.settleBtn, { flex: 1 }]}",
  "                  >",
  "                    {t('expense.khataTitle')}",
  "                  </Button>",
];
lines.splice(rowEnd + 1, 0, ...button);

// 3) Make handleShareKhata accept an explicit partner.
const hIdx = lines.findIndex((l) => l.includes("const handleShareKhata = () => {"));
if (hIdx !== -1) {
  lines[hIdx] = "  const handleShareKhata = (partnerOverride) => {";
  lines[hIdx + 1] = "    const target = partnerOverride || selectedPartner;\n    if (!target) return;";
  lines[hIdx + 2] = "    const statement = buildPartnerStatement({";
  lines[hIdx + 3] = "      transactions: expenses,";
  lines[hIdx + 4] = "      partner: target,";
  lines[hIdx + 5] = "      partnerId: target.id,";
  lines[hIdx + 6] = "      crop: selectedFarm?.currentCrop,";
  lines[hIdx + 7] = "    });";
  lines[hIdx + 8] = "    const text = formatStatement(statement, { farmName: selectedFarm?.name });";
  lines[hIdx + 9] = "    const url = `sms:${target.phone}?body=${encodeURIComponent(text)}`;";
}

fs.writeFileSync(file, lines.join("\r\n"), "utf8");
console.log("button moved to partner card");
