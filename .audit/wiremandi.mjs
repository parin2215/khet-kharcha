import fs from "fs";
const file = "C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/src/screens/farms/HarvestEntryScreen.jsx";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

// 1) Import the advisory.
const impIdx = lines.findIndex((l) => l.includes("shared/utils/helpers.js"));
if (impIdx === -1) { console.log("import anchor not found"); process.exit(1); }
if (!lines.some((l) => l.includes("mandiRates.js"))) {
  lines.splice(impIdx + 1, 0, "import { analyzeSale } from '../../../../shared/utils/mandiRates.js';");
}

// 2) Compute the advisory next to the existing auto-calc effect.
const calcIdx = lines.findIndex((l) => l.includes("setTotalSaleAmount((qty * rate).toString())"));
if (calcIdx === -1) { console.log("auto-calc anchor not found"); process.exit(1); }
if (!lines.some((l) => l.includes("const mandiAdvice"))) {
  lines.splice(calcIdx + 1, 0,
    "",
    "  // Live mandi-rate comparison so the farmer can see if the price was fair.",
    "  const mandiAdvice = analyzeSale({",
    "    crop: selectedFarm?.currentCrop,",
    "    quantity: totalYield,",
    "    unit: yieldUnit,",
    "    amount: totalSaleAmount,",
    "  });"
  );
}

// 3) Render the advisory card just after the subtitle.
const subIdx = lines.findIndex((l) => l.includes("selectedFarm?.currentCrop ? `("));
if (subIdx === -1) { console.log("subtitle anchor not found"); process.exit(1); }
if (!lines.some((l) => l.includes("mandiAdvice.verdict"))) {
  const card = [
    "",
    "      {mandiAdvice.verdict !== 'unknown' && (",
    "        <Card style={[styles.card, styles.mandiCard, {",
    "          borderLeftWidth: 4,",
    "          borderLeftColor:",
    "            mandiAdvice.verdict === 'good' ? COLORS.success",
    "              : mandiAdvice.verdict === 'low' ? COLORS.danger",
    "                : COLORS.accent,",
    "        }]}>",
    "          <Card.Content>",
    "            <View style={styles.mandiHeader}>",
    "              <Ionicons",
    "                name={mandiAdvice.verdict === 'good' ? 'trending-up' : mandiAdvice.verdict === 'low' ? 'trending-down' : 'remove'}",
    "                size={18}",
    "                color={",
    "                  mandiAdvice.verdict === 'good' ? COLORS.success",
    "                    : mandiAdvice.verdict === 'low' ? COLORS.danger",
    "                      : COLORS.accent,",
    "                }",
    "              />",
    "              <Text style={styles.mandiTitle}>{t('expense.mandiTitle')}</Text>",
    "            </View>",
    "            <Text style={styles.mandiMessage}>{mandiAdvice.message}</Text>",
    "            <Text style={styles.mandiMeta}>",
    "              {`₹${mandiAdvice.realizedRate?.toLocaleString('en-IN') || 0}/quintal`}",
    "              {mandiAdvice.benchmarkRate ? `  •  ref ₹${mandiAdvice.benchmarkRate.toLocaleString('en-IN')}` : ''}",
    "            </Text>",
    "          </Card.Content>",
    "        </Card>",
    "      )}",
  ];
  lines.splice(subIdx + 1, 0, ...card);
}

// 4) Styles.
const styleIdx = lines.findIndex((l) => l.trim() === "const styles = StyleSheet.create({");
if (styleIdx === -1) { console.log("styles anchor not found"); process.exit(1); }
if (!lines.some((l) => l.includes("mandiCard:"))) {
  lines.splice(styleIdx + 1, 0,
    "  mandiCard: { marginTop: 12 },",
    "  mandiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },",
    "  mandiTitle: { fontWeight: '800', fontSize: 13, color: COLORS.textPrimary },",
    "  mandiMessage: { marginTop: 6, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },",
    "  mandiMeta: { marginTop: 4, fontSize: 11, color: COLORS.textTertiary },"
  );
}

fs.writeFileSync(file, lines.join("\r\n"), "utf8");
console.log("mandi advisory added to HarvestEntryScreen");
