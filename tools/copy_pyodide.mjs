import { cpSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const pyodideDir = dirname(require.resolve("pyodide/package.json"));
const outDir = join(process.cwd(), "public", "pyodide");
const FILES = ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];

mkdirSync(outDir, { recursive: true });
for (const file of FILES) {
  const source = join(pyodideDir, file);
  if (!existsSync(source)) {
    console.error(`Không tìm thấy ${source}`);
    process.exit(1);
  }
  cpSync(source, join(outDir, file));
}
console.log(`Đã chép Pyodide vào ${outDir}`);
