import fs from "fs";
const file = "C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/src/screens/farms/HarvestEntryScreen.jsx";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

// Remove the trailing comma that follows the color ternary in the Ionicons prop.
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === ": COLORS.accent," && (lines[i + 1] || "").trim() === "}") {
    lines[i] = lines[i].replace(/,$/, "");
  }
  // Same pattern in the borderLeftColor prop.
  if (lines[i].trim() === ": COLORS.accent," && (lines[i + 1] || "").trim() === "}]}") {
    lines[i] = lines[i].replace(/,$/, "");
  }
}
fs.writeFileSync(file, lines.join("\r\n"), "utf8");
console.log("trailing commas fixed");
