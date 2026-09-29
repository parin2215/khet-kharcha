import fs from "fs";
const file = "C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/src/screens/expenses/AddExpenseScreen.jsx";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

const idx = lines.findIndex((l, i) => l.trim() === "<Portal>" && (lines[i + 1] || "").includes("farmDialogVisible"));
if (idx === -1) { console.log("anchor not found"); process.exit(1); }

const sheet = [
  "      <VoiceExpenseSheet",
  "        visible={voiceSheetVisible}",
  "        onDismiss={() => setVoiceSheetVisible(false)}",
  "        onApply={applyVoiceResult}",
  "        initialCategory={category}",
  "      />",
  "",
];
lines.splice(idx, 0, ...sheet);
fs.writeFileSync(file, lines.join("\r\n"), "utf8");
console.log("inserted at line", idx + 1);
