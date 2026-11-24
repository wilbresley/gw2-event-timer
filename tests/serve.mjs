import { createServer } from "node:http";
import { readFileSync, statSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../site", import.meta.url)));
const port = Number(process.env.PORT || 8099);
const headersText = readFileSync(join(root, "_headers"), "utf8");

function readBlock(path) {
  const lines = headersText.split(/\r?\n/);
  const start = lines.indexOf(path);
  if (start < 0) return {};
  const out = {};
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || !/^\s/.test(line)) break;
    const match = line.match(/^\s+([^:]+):\s*(.+)$/);
    if (match) out[match[1]] = match[2];
  }
  return out;
}

const globalHeaders = readBlock("/*");
const assetHeaders = readBlock("/assets/*");
const mime = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2"
};

const server = createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  let pathname = "/";
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch (error) {
    pathname = "/";
  }
  if (pathname === "/") pathname = "/index.html";
  const relative = pathname.replace(/^\/+/, "");
  const target = resolve(root, relative);
  if (target !== root && !target.startsWith(root + sep)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  let file = target;
  try {
    if (statSync(file).isDirectory()) file = join(file, "index.html");
  } catch (error) {
    file = target;
  }

  let status = 200;
  let body;
  try {
    body = readFileSync(file);
  } catch (error) {
    status = 404;
    body = readFileSync(join(root, "404.html"));
    file = join(root, "404.html");
  }

  const headers = Object.assign(
    {},
    globalHeaders,
    pathname.startsWith("/assets/") ? assetHeaders : {}
  );
  if (!headers["Content-Type"]) {
    headers["Content-Type"] = mime[extname(file).toLowerCase()] || "application/octet-stream";
  }
  response.writeHead(status, headers);
  response.end(body);
});

server.listen(port, "127.0.0.1", () => {
  console.log("http://127.0.0.1:" + port);
});
