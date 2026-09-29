import fs from "fs";
const file = "C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/src/screens/farms/HarvestEntryScreen.jsx";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

// Remove the orphaned </Text> that now sits after the advisory card.
const orphan = lines.findIndex((l, i) => l.trim() === "</Text>" && (lines[i + 1] || "").trim() === "" && i > 225);
if (orphan === -1) { console.log("orphan not found"); process.exit(1); }
lines.splice(orphan, 1);
// Drop a possible double blank left behind.
if (lines[orphan] && lines[orphan].trim() === "" && lines[orphan + 1] && lines[orphan + 1].trim() === "") {
  lines.splice(orphan, 1);
}
fs.writeFileSync(file, lines.join("\r\n"), "utf8");
console.log("orphan </Text> removed at line", orphan + 1);
