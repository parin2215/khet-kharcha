import fs from "fs";
const file = "C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/src/screens/partners/PartnerSettlementScreen.jsx";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

// The main JSX return is missing its opening "return (".
const jsxLine = lines.findIndex((l) => l.includes("<View style={styles.headerArea}>"));
if (jsxLine === -1) { console.log("header not found"); process.exit(1); }
if (!lines[jsxLine - 1]?.includes("return (")) {
  lines.splice(jsxLine, 0, "  return (");
  console.log("restored 'return (' before line", jsxLine + 1);
}
fs.writeFileSync(file, lines.join("\r\n"), "utf8");
