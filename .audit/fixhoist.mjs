import fs from "fs";
const file = "C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/src/screens/partners/PartnerSettlementScreen.jsx";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

// Extract the handleShareKhata block (comment + function).
const start = lines.findIndex((l) => l.includes("Share the full running statement"));
let end = start;
while (end < lines.length && lines[end].trim() !== "};") end++;
const block = lines.slice(start, end + 1);

// Remove it (plus an adjacent blank line).
let from = start, to = end;
if (lines[from - 1]?.trim() === "") from -= 1;
if (lines[to + 1]?.trim() === "") to += 1;
lines.splice(from, to - from + 1);

// Re-insert right AFTER the `const khata = buildPartnerStatement({...});` declaration.
const decl = lines.findIndex((l) => l.includes("const khata = buildPartnerStatement"));
if (decl === -1) { console.log("khata decl not found"); process.exit(1); }
let declEnd = decl;
while (declEnd < lines.length && lines[declEnd].trim() !== "});") declEnd++;

lines.splice(declEnd + 1, 0, "", ...block);
fs.writeFileSync(file, lines.join("\r\n"), "utf8");
console.log("handler moved after khata declaration (decl ends line", declEnd + 1, ")");
