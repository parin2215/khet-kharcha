import fs from "fs";
const p = "C:/Users/patel/OneDrive/Desktop/khet kharcha/.audit/tests.mjs";
let s = fs.readFileSync(p, "utf8");
s = s.replace(/for \(const t of queue\) \{\s*$/, `for (const t of queue) {
  try { await t.fn(); passed++; }
  catch (e) { failed++; failures.push({ name: t.name, err: e.__assert ? e.message : (e.stack || String(e)) }); }
}

console.log("=".repeat(70));
console.log(\`PASSED: \${passed}    FAILED: \${failed}\`);
console.log("=".repeat(70));
if (failures.length) {
  console.log("\\nFAILURES:\\n");
  for (const f of failures) console.log(\`  x \${f.name}\\n      \${f.err.split("\\n")[0]}\\n\`);
}
process.exit(failed ? 1 : 0);
`);
fs.writeFileSync(p, s, "utf8");
console.log("runner restored");
