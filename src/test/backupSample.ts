import { initialGameState } from "../game/state";
import { APP_VERSION, BACKUP_FORMAT, type BackupPayload } from "../storage/backup";
import { emptyMeta, SCHEMA_VERSION } from "../storage/types";

export function sampleBackupPayload(childName = "An"): BackupPayload {
  const state = initialGameState("2026-10-06");
  state.wallet.xu = 120;
  state.pet.xp = 30;
  state.activity.lastActiveDay = "2026-10-06";
  state.wallet.history = [{ day: "2026-10-06", delta: 8, reason: "code", ref: "s1.lam-quen.l1.ex1" }];
  state.activity.seconds = { "2026-10-06": 300 };
  state.inventory = { consumables: { bong: 1 }, owned: ["kinh-ram"], equipped: ["kinh-ram"] };
  state.rewards = { catalog: [{ id: "r1", name: "Đọc truyện", price: 50, weeklyLimit: 1 }], requests: [] };
  state.vacation = { since: null, ranges: [{ start: "2026-10-20", end: "2026-10-22" }] };
  state.badges = { "first-lesson": "2026-10-06" };
  return {
    format: BACKUP_FORMAT,
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: "2026-10-06T12:00:00.000Z",
    meta: { ...emptyMeta(), activeProfileId: "p1", lastBackupAt: "2026-10-06T12:00:00.000Z" },
    profiles: [
      {
        profile: { id: "p1", childName, robotName: "Robo", createdAt: "2026-10-01T02:00:00.000Z" },
        state,
        attempts: [],
        drafts: [{ profileId: "p1", itemId: "s1.lam-quen.l1.ex1", code: 'print("Xin chào")' }],
      },
    ],
  };
}
