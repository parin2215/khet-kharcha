// Minimal dev server that mirrors web/vite.config.js aliases, used to test the
// app in a browser without Vite (the sandbox blocks Vite from spawning esbuild).
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = "C:/Users/patel/OneDrive/Desktop/khet kharcha";
const WEB = path.join(ROOT, "web");
const PORT = Number(process.argv[2] || 5178);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jsx": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

const ALIASES = {
  "firebase/app": path.join(WEB, "node_modules/firebase/app/dist/esm/index.esm.js"),
  "firebase/auth": path.join(WEB, "node_modules/firebase/auth/dist/esm/index.esm.js"),
  "firebase/firestore": path.join(WEB, "node_modules/firebase/firestore/dist/esm/index.esm.js"),
  "firebase/storage": path.join(WEB, "node_modules/firebase/storage/dist/esm/index.esm.js"),
  "@react-native-async-storage/async-storage": path.join(WEB, "src/stubs/async-storage.js"),
};

function tryFiles(p) {
  for (const c of [p, p + ".js", p + ".jsx", path.join(p, "index.js"), path.join(p, "index.jsx")]) {
    try { if (fs.existsSync(c) && fs.statSync(c).isFile()) return c; } catch {}
  }
  return null;
}

function resolveRequest(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0]);

  // Alias rewrites (mirrors vite.config.js resolve.alias)
  for (const [from, to] of Object.entries(ALIASES)) {
    const bare = p.replace(/^\/+/, "");
    if (bare === from) return fs.existsSync(to) ? to : tryFiles(path.join(WEB, "node_modules", from));
    if (bare.startsWith(from + "/")) {
      const rest = bare.slice(from.length + 1);
      const base = path.join(path.dirname(to), rest);
      return tryFiles(base) || tryFiles(path.join(WEB, "node_modules", from, rest));
    }
  }

  if (p === "/") return path.join(WEB, "index.html");

  // Shared code lives outside web/ but is imported with relative paths that
  // escape upward (../../../../shared/...), so allow it.
  const direct = tryFiles(path.join(WEB, p));
  if (direct) return direct;
  const shared = tryFiles(path.join(ROOT, p.replace(/^\/+/, "")));
  if (shared) return shared;
  const up = tryFiles(path.resolve(WEB, p));
  if (up) return up;
  return null;
}

const server = http.createServer((req, res) => {
  const file = resolveRequest(req.url);
  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found: " + req.url);
    return;
  }
  try {
    const body = fs.readFileSync(file);
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("500 " + e.message);
  }
});

server.listen(PORT, "127.0.0.1", () => console.log("serving on http://127.0.0.1:" + PORT));
