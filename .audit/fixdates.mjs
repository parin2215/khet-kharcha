// Rewrites the buggy UTC-based date pattern to use the new local-date helpers.
import fs from "fs";
import path from "path";

const ROOT = "C:/Users/patel/OneDrive/Desktop/khet kharcha";
const REL_HELPERS = "shared/utils/helpers.js";

const files = [
  "web/src/pages/advances/AdvancesPage.jsx",
  "web/src/pages/expenses/AddExpensePage.jsx",
  "web/src/pages/farms/AddFarmPage.jsx",
  "web/src/pages/farms/FarmDetailPage.jsx",
  "web/src/pages/farms/HarvestEntryPage.jsx",
  "web/src/pages/partners/PartnerSettlementPage.jsx",
  "web/src/pages/partners/PartnersPage.jsx",
  "web/src/pages/partners/PartnershipTermsBuilderPage.jsx",
  "web/src/pages/settings/SettingsPage.jsx",
  "mobile/src/screens/advances/AdvancesScreen.jsx",
  "mobile/src/screens/bills/BillsScreen.jsx",
  "mobile/src/screens/expenses/AddExpenseScreen.jsx",
  "mobile/src/screens/farms/HarvestEntryScreen.jsx",
  "mobile/src/screens/partners/PartnerSettlementScreen.jsx",
  "mobile/src/screens/reminders/RemindersScreen.jsx",
];

const report = [];
for (const rel of files) {
  const abs = path.join(ROOT, rel);
  let src = fs.readFileSync(abs, "utf8");
  const before = src;

  // 1. new Date().toISOString().split('T')[0]  ->  toLocalDateString()
  src = src.replaceAll("new Date().toISOString().split('T')[0]", "toLocalDateString()");

  // 2. <expr>.toISOString().split('T')[0]  ->  toLocalDateString(<expr>)
  src = src.replaceAll("expDate.toISOString().split('T')[0]", "toLocalDateString(expDate)");
  src = src.replaceAll("sDate.toISOString().split('T')[0]", "toLocalDateString(sDate)");

  // 3. new Date(date) where `date` is a "YYYY-MM-DD" string -> parseLocalDateString(date)
  src = src.replaceAll("date: new Date(date),", "date: parseLocalDateString(date) || new Date(),");
  src = src.replaceAll("date: new Date(saleDate),", "date: parseLocalDateString(saleDate) || new Date(),");
  src = src.replaceAll("date: new Date(dueDate),", "date: parseLocalDateString(dueDate) || new Date(),");
  src = src.replaceAll("date: new Date(customDate),", "date: parseLocalDateString(customDate) || new Date(),");
  src = src.replaceAll("leaseStartDate: new Date(leaseStartDate)", "leaseStartDate: parseLocalDateString(leaseStartDate)");
  src = src.replaceAll("startDate: new Date(startDate)", "startDate: parseLocalDateString(startDate)");

  if (src === before) { report.push(`  (no change) ${rel}`); continue; }

  // Ensure the helpers are imported from the shared helpers module.
  const needed = [];
  if (/\btoLocalDateString\(/.test(src)) needed.push("toLocalDateString");
  if (/\bparseLocalDateString\(/.test(src)) needed.push("parseLocalDateString");

  const importRe = /import\s*\{([^}]*)\}\s*from\s*'([^']*shared\/utils\/helpers\.js)';/;
  const m = src.match(importRe);
  if (m) {
    const existing = m[1].split(",").map(s => s.trim()).filter(Boolean);
    const merged = [...new Set([...existing, ...needed])];
    src = src.replace(importRe, `import { ${merged.join(", ")} } from '${m[2]}';`);
  } else {
    // No helpers import yet: add one with the correct relative depth.
    const depth = rel.startsWith("web/") ? "../../../../shared/utils/helpers.js" : "../../../../shared/utils/helpers.js";
    const lines = src.split("\n");
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) if (/^import .*;$/.test(lines[i].trim())) lastImport = i;
    lines.splice(lastImport + 1, 0, `import { ${needed.join(", ")} } from '${depth}';`);
    src = lines.join("\n");
  }

  fs.writeFileSync(abs, src, "utf8");
  report.push(`  fixed ${rel}  [+${needed.join(", ")}]`);
}
console.log(report.join("\n"));
