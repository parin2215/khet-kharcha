import fs from "fs";
const ROOT = "C:/Users/patel/OneDrive/Desktop/khet kharcha/shared/i18n/";
const flat = (o, p = "") => {
  const out = [];
  for (const k of Object.keys(o || {})) {
    const v = o[k], key = p ? `${p}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) out.push(...flat(v, key));
    else out.push(key);
  }
  return out;
};
const langs = ["en", "hi", "gu", "mr"];
const data = {};
for (const l of langs) data[l] = JSON.parse(fs.readFileSync(ROOT + l + ".json", "utf8"));
const keys = {}; for (const l of langs) keys[l] = new Set(flat(data[l]));
const base = keys.en;
console.log("Key counts:", langs.map((l) => `${l}=${keys[l].size}`).join("  "));
console.log("");
for (const l of langs) {
  if (l === "en") continue;
  const missing = [...base].filter((k) => !keys[l].has(k));
  const extra = [...keys[l]].filter((k) => !base.has(k));
  console.log(`${l.toUpperCase()}: ${missing.length} missing, ${extra.length} extra`);
  if (missing.length) console.log("   MISSING: " + missing.slice(0, 40).join(", ") + (missing.length > 40 ? " ..." : ""));
  if (extra.length) console.log("   EXTRA:   " + extra.slice(0, 25).join(", ") + (extra.length > 25 ? " ..." : ""));
}
// Untranslated (identical to English) count
console.log("");
for (const l of langs) {
  if (l === "en") continue;
  let same = 0, total = 0;
  const walk = (o, p = "") => { for (const k of Object.keys(o || {})) { const v = o[k], key = p ? `${p}.${k}` : k;
    if (v && typeof v === "object") walk(v, key); else { total++; const en = key.split(".").reduce((a, s) => (a == null ? a : a[s]), data.en); if (v === en) same++; } } };
  walk(data[l]);
  console.log(`${l}: ${same}/${total} values identical to English (untranslated)`);
}
