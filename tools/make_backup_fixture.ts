import { mkdirSync, writeFileSync } from "node:fs";
import { encodeBackup } from "../src/storage/backup";
import { SCHEMA_VERSION } from "../src/storage/types";
import { sampleBackupPayload } from "../src/test/backupSample";

// Run once per schema version and commit the file: future versions must still import it.
const out = `src/storage/fixtures/backup-v${SCHEMA_VERSION}.pypet`;
mkdirSync("src/storage/fixtures", { recursive: true });
writeFileSync(out, await encodeBackup(sampleBackupPayload()));
console.log(`Wrote ${out}`);
