// Server uji lokal: node tools/server-lokal.mjs [folder] [port]  (meniru pretty URL Cloudflare Pages)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
const root = process.argv[2] || ".", port = +(process.argv[3] || 4321);
const TIPE = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^[\\/]+/, "");
  if (p.includes("..")) { res.writeHead(400); return res.end(); }
  if (p === "" ) p = "index.html"; else if (!extname(p)) p += ".html";
  try { const b = await readFile(join(root, p)); res.writeHead(200, { "content-type": TIPE[extname(p)] || "application/octet-stream" }); res.end(b); }
  catch { res.writeHead(404); res.end("404"); }
}).listen(port, () => console.log("http://localhost:" + port));
