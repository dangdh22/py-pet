// Writes e2e/fixtures/drained.pypet: a backup of Robo in form 3 with an empty battery, wearing the crown.
// Regenerate it (npx tsx tools/make_e2e_backup.ts) and commit the file when SCHEMA_VERSION changes,
// or the e2e import will no longer match the app. Unlike src/storage/fixtures/, this file is not frozen.
import { mkdirSync, writeFileSync } from "node:fs";
import { encodeBackup } from "../src/storage/backup";
import { sampleBackupPayload } from "../src/test/backupSample";

const out = "e2e/fixtures/drained.pypet";
const payload = sampleBackupPayload("Lan");
const state = payload.profiles[0].state;
state.pet = { stage: 3, xp: 600, stageStartXp: 500, pin: 0, vui: 3, correctRun: 0 };
state.inventory = { consumables: {}, owned: ["vuong-mien", "chau-cay"], equipped: ["vuong-mien"] };
// 1 finished lesson of stage 1 (a real content ID), so the room offers "Sạc cho Robo".
state.progress.completedLessons = ["s1.lam-quen.l1"];
state.activity.lastActiveDay = "2026-10-01";
state.activity.seconds = { "2026-10-01": 300 };
state.wallet.history = [];
state.badges = {};
state.vacation = { since: null, ranges: [] };
payload.profiles[0].drafts = [];
mkdirSync("e2e/fixtures", { recursive: true });
writeFileSync(out, await encodeBackup(payload));
console.log(`Wrote ${out}`);
