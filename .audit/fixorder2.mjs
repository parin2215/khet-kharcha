import fs from "fs";
const p = "C:/Users/patel/OneDrive/Desktop/khet kharcha/.audit/tests.mjs";
const lines = fs.readFileSync(p, "utf8").split("\n");

// Voice block: line 88 (index 87) up to but excluding the stray runner at 158 (index 157).
const blockStart = lines.findIndex((l) => l.includes('T("voice: parseAmount digits'));
// Find the LAST runner loop; voice tests must be registered just before it.
let lastRunner = -1;
for (let i = lines.length - 1; i >= 0; i--) if (lines[i].startsWith("for (const t of queue)")) { lastRunner = i; break; }
// End of the voice block = last line before lastRunner that closes it.
let blockEnd = lastRunner;
while (blockEnd > blockStart && lines[blockEnd].trim() === "") blockEnd--;

const block = lines.slice(blockStart, blockEnd + 1);
const rest = [...lines.slice(0, blockStart), ...lines.slice(blockEnd + 1)];
// Find the new lastRunner index in `rest`.
let newRunner = -1;
for (let i = rest.length - 1; i >= 0; i--) if (rest[i].startsWith("for (const t of queue)")) { newRunner = i; break; }
const out = [...rest.slice(0, newRunner), "", ...block, ...rest.slice(newRunner)];
fs.writeFileSync(p, out.join("\n"), "utf8");
console.log("moved voice block from", blockStart + 1, "to before line", newRunner + 1);
