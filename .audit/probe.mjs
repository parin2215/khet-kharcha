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
const rp = loadModule(path.join(ROOT, "shared/utils/receiptParser.js"));
const cases = [
  "Bijli Bill\nConsumer No 1234\nAmount Rs. 2450.00\nDate 04-11-2025",
  "Kisan Khad Bhandar\nTotal 12,500\nGST 18%",
  "HPCL Diesel Pump\nUnit Price 96.50\nAmount 9650.50\nInvoice No 8891",
  "Invoice\nGrand Total: Rs 1,20,000",
  "Tractor Repair\nBill No: 4471\nAmount 3500\nDate 2025-03-09\nMachinery Parts",
  "Sabzi Mandi Receipt\nTotal 860.00",
  ""
];
for (const c of cases) console.log(JSON.stringify(rp.parseReceiptText(c)));
