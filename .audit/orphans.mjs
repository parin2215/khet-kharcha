// Which source files are never reachable from an entry point (dead code / unwired features)?
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const babelParser = require("C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/node_modules/@babel/parser");

const ROOT = "C:/Users/patel/OneDrive/Desktop/khet kharcha";
const EXTS = [".js", ".jsx", ".mjs", ".cjs", ".json"];
const ENTRIES = [
  { name: "web", file: path.join(ROOT, "web/src/main.jsx") },
  { name: "mobile", file: path.join(ROOT, "mobile/index.js") },
];
const WEB_ALIAS = new Set(["firebase/app","firebase/auth","firebase/firestore","firebase/storage","@react-native-async-storage/async-storage"]);

function exists(p){try{return fs.statSync(p).isFile();}catch{return false;}}
function isDir(p){try{return fs.statSync(p).isDirectory();}catch{return false;}}
function walkDir(dir,out=[]){let e;try{e=fs.readdirSync(dir,{withFileTypes:true});}catch{return out;}
  for(const x of e){const p=path.join(dir,x.name);const rel=path.relative(ROOT,p).replace(/\\/g,"/");
    if(x.isDirectory()){if(/(^|\/)(node_modules|\.firebase|\.expo|\.cxx|\.gradle|build|dist|\.git|audit|\.firebase)(\/|$)/.test(rel))continue;walkDir(p,out);}
    else if(/\.(js|jsx|mjs|cjs)$/.test(x.name)&&!/^\d.*\.mjs$/.test(x.name))out.push(p);}return out;}

function resolveLocal(spec, fromFile){const base=path.resolve(path.dirname(fromFile),spec);const c=[];
  for(const e of EXTS)c.push(base+e);c.push(base);for(const e of EXTS)c.push(path.join(base,"index"+e));
  for(const x of c)if(exists(x))return x;return null;}

function importsOf(file){
  const src=fs.readFileSync(file,"utf8");
  const isJSX=file.endsWith(".jsx")||/<[A-Za-z][A-Za-z0-9.]*[\s/>]/.test(src);
  let prog=[];
  try{const ast=babelParser.parse(src,{sourceType:"unambiguous",plugins:isJSX?["jsx"]:[],errorRecovery:true});prog=(ast.program||ast).body||[];}catch{}
  const out=[];
  for(const n of prog){if(n.type==="ImportDeclaration")out.push(n.source.value);
    else if((n.type==="ExportNamedDeclaration"||n.type==="ExportAllDeclaration")&&n.source)out.push(n.source.value);}
  const re=/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;let m;while((m=re.exec(src)))out.push(m[1]);
  return out;
}

const reachable=new Set();
for(const e of ENTRIES){
  const q=[e.file];
  while(q.length){const f=q.shift();if(reachable.has(f))continue;reachable.add(f);
    for(const spec of importsOf(f)){
      if(/\.(css|scss|png|jpg|jpeg|svg|webp|gif|ico)$/.test(spec))continue;
      if(spec.startsWith(".")){const r=resolveLocal(spec,f);if(r)q.push(r);continue;}
      if(WEB_ALIAS.has(spec))continue;
      try{const r=require.resolve(spec,{paths:[path.dirname(f)]});if(/\.(js|mjs|cjs|jsx)$/.test(r)&&!r.includes(".bin"))q.push(r);}catch{}
    }
  }
}

const all=walkDir(ROOT).filter(f=>!path.relative(ROOT,f).replace(/\\/g,"/").startsWith(".audit/"));
const orphans=all.filter(f=>!reachable.has(f));
console.log(`Source files: ${all.length}   Reachable from entry points: ${all.filter(f=>reachable.has(f)).length}   UNREACHABLE: ${orphans.length}\n`);
for(const o of orphans.sort())console.log("  "+path.relative(ROOT,o).replace(/\\/g,"/"));
