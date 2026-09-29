import fs from "fs";
const p = "C:/Users/patel/OneDrive/Desktop/khet kharcha/.audit/tests.mjs";
let s = fs.readFileSync(p, "utf8");

// Extract the misplaced voice block and re-insert it just before the runner loop.
const startMarker = '\nT("voice: parseAmount digits, comma-grouped, and currency-prefixed"';
const start = s.indexOf(startMarker);
const endMarker = '\nfor (const t of queue) {';
const end = s.indexOf(endMarker, start);

if (start === -1 || end === -1) { console.log("markers not found", start, end); process.exit(1); }

const block = s.slice(start, end);
s = s.slice(0, start) + s.slice(end);
// Re-insert immediately before the execution loop.
s = s.replace(endMarker, block + endMarker);
fs.writeFileSync(p, s, "utf8");
console.log("voice block relocated");
