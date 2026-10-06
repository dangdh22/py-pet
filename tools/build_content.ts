import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { buildBundle, ContentError } from "./content/buildBundle";
import { contentWarnings } from "./content/coverage";

const [contentDir = "content", outFile = "src/generated/content.json"] = process.argv.slice(2);

try {
  const bundle = buildBundle(contentDir);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, `${JSON.stringify(bundle, null, 2)}\n`);
  const lessons = bundle.stages.reduce((n, s) => n + s.topics.reduce((m, t) => m + t.lessons.length, 0), 0);
  for (const warning of contentWarnings(bundle)) console.warn(`Cảnh báo: ${warning}`);
  console.log(`Đã build nội dung: ${bundle.stages.length} giai đoạn, ${lessons} bài học, ${bundle.errors.length} mục lỗi -> ${outFile}`);
} catch (error) {
  if (error instanceof ContentError) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}
