import fs from "fs";
const p = "C:/Users/patel/OneDrive/Desktop/khet kharcha/.audit/tests.mjs";
const lines = fs.readFileSync(p, "utf8").split("\n");

// Remove the stray "}" that followed the first (now orphaned) runner loop.
const stray = lines.findIndex((l, i) => l.trim() === "}" && lines[i - 1] && lines[i - 1].includes("failures.push"));
if (stray !== -1) { lines.splice(stray, 1); console.log("removed stray brace at line", stray + 1); }

// Remove the first (duplicate) runner loop that now sits before the module loads.
const firstRunner = lines.findIndex((l) => l.startsWith("for (const t of queue)"));
if (firstRunner !== -1) {
  // It spans 3 lines: for / try / } ... plus the closing "}" of the async arrow if orphaned.
  let end = firstRunner;
  while (end < lines.length && !/^\s*\}\s*$/.test(lines[end])) end++;
  lines.splice(firstRunner, end - firstRunner + 1);
  console.log("removed duplicate runner at line", firstRunner + 1);
}
fs.writeFileSync(p, lines.join("\n"), "utf8");
