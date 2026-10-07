// Phục vụ thư mục dist/ dưới đường dẫn con /py-pet/, giống GitHub Pages của 1 project repo.
// Dùng cho e2e: bản build phải chạy được khi không nằm ở gốc của máy chủ.
// Mọi yêu cầu ngoài /py-pet/ trả 404, nên đường dẫn tuyệt đối "/assets/..." trong bản build sẽ lộ ra ngay.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const PREFIX = "/py-pet/";
const PORT = Number(process.env.PORT ?? 4174);
const ROOT = resolve(process.cwd(), "dist");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".zip": "application/zip",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function resolveFile(rawUrl) {
  const { pathname } = new URL(rawUrl, "http://localhost");
  if (!pathname.startsWith(PREFIX)) return null;
  let relative;
  try {
    relative = decodeURIComponent(pathname.slice(PREFIX.length)) || "index.html";
  } catch {
    return null; // a malformed %-escape is a 404, not a crash of the server
  }
  const file = normalize(join(ROOT, relative));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return null;
  if (!existsSync(file) || !statSync(file).isFile()) return null;
  return file;
}

createServer((request, response) => {
  const file = resolveFile(request.url ?? "/");
  if (!file) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  const stream = createReadStream(file);
  stream.on("error", () => response.destroy());
  stream.pipe(response);
}).listen(PORT, () => console.log(`Phục vụ ${ROOT} tại http://localhost:${PORT}${PREFIX}`));
