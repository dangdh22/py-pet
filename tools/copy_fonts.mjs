import { cpSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const outDir = join(process.cwd(), "public", "fonts");
const PACKAGES = ["lexend", "jetbrains-mono"];
const SUBSETS = ["latin", "latin-ext", "vietnamese"];

mkdirSync(outDir, { recursive: true });
for (const name of PACKAGES) {
  // The package "exports" map hides package.json, but it exposes LICENSE: use that to find the folder.
  let packageDir;
  try {
    packageDir = dirname(require.resolve(`@fontsource-variable/${name}/LICENSE`));
  } catch {
    console.error(`Không tìm thấy gói @fontsource-variable/${name}`);
    process.exit(1);
  }
  const files = SUBSETS.map((subset) => [`files/${name}-${subset}-wght-normal.woff2`, `${name}-${subset}-wght-normal.woff2`]);
  files.push(["LICENSE", `LICENSE-${name}.txt`]);
  for (const [from, to] of files) {
    const source = join(packageDir, from);
    if (!existsSync(source)) {
      console.error(`Không tìm thấy ${source}`);
      process.exit(1);
    }
    cpSync(source, join(outDir, to));
  }
}
console.log(`Đã chép font vào ${outDir}`);
