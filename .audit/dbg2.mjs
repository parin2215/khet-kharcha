import fs from "fs"; import path from "path"; import { createRequire } from "module";
const require = createRequire(import.meta.url);
const WEBPKG = "C:/Users/patel/OneDrive/Desktop/khet kharcha/web/node_modules/";
const babelCore = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/core");
const cjsPlugin = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/plugin-transform-modules-commonjs");
const babelParser = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/parser");
const React = require(WEBPKG + "react");
const store = new Map();
globalThis.localStorage = { getItem:()=>null, setItem:()=>{}, removeItem:()=>{}, clear:()=>{} };
function load(file){
  const src = fs.readFileSync(file,"utf8");
  const ast = babelParser.parse(src,{sourceType:"unambiguous",plugins:file.endsWith(".jsx")?["jsx"]:[]});
  const out = babelCore.transformFromAstSync(ast,src,{babelrc:false,configFile:false,plugins:[cjsPlugin],parserOpts:{sourceType:"unambiguous",plugins:file.endsWith(".jsx")?["jsx"]:[]}});
  const m={exports:{}};
  const req=(s)=>{ if(s==="react") return React; if(s.startsWith(".")){let p=path.resolve(path.dirname(file),s); if(!path.extname(p))p+=".js"; if(!fs.existsSync(p)&&fs.existsSync(p+".js"))p+=".js"; return load(p);} try{return require(WEBPKG+s)}catch{return {}} };
  new Function("exports","require","module","__filename","__dirname",out.code)(m.exports,req,m,file,path.dirname(file));
  return m.exports;
}
const s = load("C:/Users/patel/OneDrive/Desktop/khet kharcha/web/src/store/useFarmStore.js");
console.log("exports:", Object.keys(s));
const h = s.useFarmStore;
console.log("has setState?", typeof h?.setState);
console.log("before:", JSON.stringify(h?.getState?.()?.farms));
h?.setState?.({ farms: [{id:"f1",name:"North Field"}], selectedFarm: {id:"f1",name:"North Field"} });
console.log("after:", JSON.stringify(h?.getState?.()?.farms));
