import fs from "fs";
const file = "C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/src/screens/farms/HarvestEntryScreen.jsx";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

// --- Fix 1: lift the advisory out of the useEffect into component scope ---
const adviceStart = lines.findIndex((l) => l.includes("const mandiAdvice"));
let adviceEnd = adviceStart;
while (adviceEnd < lines.length && !lines[adviceEnd].trim().startsWith("});")) adviceEnd++;
const adviceLines = lines.slice(adviceStart, adviceEnd + 1);

let removeFrom = adviceStart;
if (lines[adviceStart - 1] && lines[adviceStart - 1].trim().startsWith("// Live mandi-rate")) removeFrom = adviceStart - 1;
if (lines[removeFrom - 1] && lines[removeFrom - 1].trim() === "") removeFrom -= 1;
let removeTo = adviceEnd;
if (lines[removeTo + 1] && lines[removeTo + 1].trim() === "") removeTo += 1;
lines.splice(removeFrom, removeTo - removeFrom + 1);

// Component return (the "return (" whose following line opens a ScrollView).
const returnIdx = lines.findIndex((l, i) => l.trim() === "return (" && (lines[i + 1] || "").includes("<ScrollView"));
if (returnIdx === -1) { console.log("component return not found"); process.exit(1); }
lines.splice(returnIdx, 0, ...adviceLines, "");

// --- Fix 2: lift the advisory card out of the subtitle <Text> ---
const cardStart = lines.findIndex((l) => l.includes("{mandiAdvice.verdict !== 'unknown' && ("));
let cardEnd = cardStart;
while (cardEnd < lines.length && lines[cardEnd].trim() !== "</Card>") cardEnd++;
let closeIdx = cardEnd + 1;
while (closeIdx < lines.length && lines[closeIdx].trim() === "") closeIdx++;
const cardLines = lines.slice(cardStart, closeIdx + 1);

let cardFrom = cardStart;
if (lines[cardStart - 1] && lines[cardStart - 1].trim() === "") cardFrom = cardStart - 1;
let cardTo = closeIdx;
if (lines[cardTo + 1] && lines[cardTo + 1].trim() === "") cardTo += 1;
lines.splice(cardFrom, cardTo - cardFrom + 1);

// Restore the subtitle's closing tag if the card removal took it.
const subLine = lines.findIndex((l) => l.includes("selectedFarm?.currentCrop ? `("));
if (lines[subLine + 1]?.trim() !== "</Text>") {
  lines.splice(subLine + 1, 0, "      </Text>");
  console.log("restored subtitle </Text>");
}

// Re-insert the card after the subtitle Text closes.
const afterText = lines.findIndex((l, i) => i > subLine && l.trim() === "</Text>");
lines.splice(afterText + 1, 0, ...cardLines);

fs.writeFileSync(file, lines.join("\r\n"), "utf8");
console.log("mandi advisory relocated");
