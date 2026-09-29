import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const babelCore = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/core");
const cjsPlugin = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/plugin-transform-modules-commonjs");
const babelParser = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/parser");
const ROOT = "C:/Users/patel/OneDrive/Desktop/khet kharcha";
function loadModule(file) {
  const src = fs.readFileSync(file, "utf8");
  const isJSX = file.endsWith(".jsx");
  const ast = babelParser.parse(src, { sourceType: "unambiguous", plugins: isJSX ? ["jsx"] : [] });
  const out = babelCore.transformFromAstSync(ast, src, { babelrc:false, configFile:false, plugins:[cjsPlugin], parserOpts:{ sourceType:"unambiguous", plugins: isJSX?["jsx"]:[] } });
  const m = { exports: {} };
  const req = (spec) => {
    if (spec.startsWith(".")) {
      let p = path.resolve(path.dirname(file), spec);
      if (!path.extname(p)) p += ".js";
      if (!fs.existsSync(p) && fs.existsSync(p + ".js")) p += ".js";
      if (!fs.existsSync(p) && fs.existsSync(path.join(p, "index.js"))) p = path.join(p, "index.js");
      return loadModule(p);
    }
    return require(spec);
  };
  new Function("exports","require","module","__filename","__dirname", out.code)(m.exports, req, m, file, path.dirname(file));
  return m.exports;
}
const { normalizeText } = loadModule(path.join(ROOT, "shared/utils/voiceExpense.js"));
const TOTAL_HINTS = ['grand total','amount payable','amount due','net payable','total amount','total payable','payable','amount paid','bill total','total'];
const line = "Bijli Bill";
console.log("has digit:", /[\d]/.test(line));
const hit = TOTAL_HINTS.filter(h => normalizeText(line).includes(h));
console.log("total-hint hits:", hit);
console.log("normalized:", JSON.stringify(normalizeText(line)));
