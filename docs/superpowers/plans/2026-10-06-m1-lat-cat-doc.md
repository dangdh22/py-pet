# M1 – Lát cắt dọc: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng bản Py-Pet đầu tiên chạy được trong trình duyệt: con mở 1 bài học của chủ đề "Làm quen với chương trình", đọc thẻ lý thuyết, chạy ví dụ, viết code được chấm bằng test case, nhận giải thích lỗi tiếng Việt, và trả lời câu hỏi song ngữ.

**Architecture:** Web tĩnh React + TypeScript + Vite. Python chạy bằng Pyodide trong 1 Web Worker, được bọc bởi `RunnerClient` (hàng đợi, giới hạn thời gian, tự khởi động lại). Nội dung soạn bằng Markdown + YAML trong `content/`, được script `tools/build_content.ts` kiểm tra cấu trúc rồi gộp thành `src/generated/content.json`; script Python `tools/validate_content.py` chạy thật mọi đoạn code trong nội dung. Logic chấm bài và giải thích lỗi là hàm thuần, tách khỏi giao diện.

**Tech Stack:** Node 24, TypeScript 5.9.3, Vite 8.3.3, React 19.3, Vitest 5.0.3 + Testing Library + jsdom, Playwright, Pyodide 314.0.7 (Python 3.14.2), CodeMirror 6, zod 4.6.5, js-yaml 5.4.3, marked 18.1.0, Python 3.14 + pytest (cho script kiểm tra nội dung).

**Spec:** `docs/superpowers/specs/2026-10-06-py-pet-design.md`

## Global Constraints

- Phạm vi M1 theo spec mục 12.3: khung dự án, i18n, runner, chấm bài, từ điển lỗi, định dạng nội dung, script kiểm tra, màn hình bài học, chủ đề đầu tiên của giai đoạn 1. Không làm lưu trữ, XP/xu, pet, cửa hàng, khu phụ huynh, trạm ôn, kiểm tra (M2 đến M4).
- Pyodide được đóng gói cùng app: chép từ `node_modules/pyodide` vào `public/pyodide/`, không tải từ CDN. Không dùng header COOP/COEP (GitHub Pages không hỗ trợ).
- Giới hạn thời gian chạy code mặc định: 2 000 ms. Giới hạn đầu ra: 100 000 ký tự.
- Code của con được biên dịch với tên file `<bai-cua-con>`. Mỗi lần chạy dùng không gian biến mới.
- So sánh đầu ra: chuẩn hóa Unicode NFC, đổi `\r\n` thành `\n`, bỏ khoảng trắng cuối mỗi dòng, bỏ các dòng trống ở cuối; phần còn lại khớp chính xác. Chế độ `float` so từng token số với `tolerance`. TypeScript (`src/runner/compare.ts`) và Python (`tools/validate_content.py`) phải dùng đúng quy tắc này.
- ID nội dung chỉ gồm chữ thường không dấu, số, dấu chấm, dấu gạch ngang; không bao giờ đổi sau khi phát hành.
- Mọi chuỗi giao diện đi qua `t(key)` với 2 bộ `vi` và `en` cùng tập khóa. Câu `predict` và `mcq` bắt buộc có `vi` và `en`. Bài `code` có `test_eligible: true` bắt buộc có `prompt.en`.
- Biểu thức chính quy trong `content/errors/errors.yaml` dùng cú pháp JavaScript (nhóm có tên là `(?<ten>...)`, không phải `(?P<ten>...)`).
- Mặc định `vite.config.ts` có `base: "./"` để chạy được dưới đường dẫn con của GitHub Pages.
- Phiên bản gói được ghim như trong lệnh cài đặt của Task 1. TypeScript ghim 5.9.3 (không dùng 7.x trong M1 để tránh rủi ro tương thích).
- Không gọi bất kỳ dịch vụ AI nào.
- Script kiểm tra nội dung gồm 2 bước chạy liền nhau trong `npm run content:validate`: `build_content.ts` kiểm tra cấu trúc, song ngữ, ID và tham chiếu (spec 3.9 mục 1 và 10); `validate_content.py` chạy code (spec 3.9 mục 2 đến 7). Việc "mục từ điển lỗi được đúng mục đó nhận diện" (spec 3.9 mục 7) được kiểm tra trong test Pyodide `src/content/parity.pyodide.test.ts`, vì logic nhận diện viết bằng TypeScript. Mục 8 và 9 của spec 3.9 thuộc M3.
- Mọi commit message kết thúc bằng 2 dòng trailer, đúng như các lệnh commit trong kế hoạch:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  ```

## Review Focus

1. Gõ tiếng Việt bằng bộ gõ sinh ra dấu tổ hợp (ví dụ "cha" + dấu huyền rời) phải được chấm đúng khi chữ giống hệt đáp án. Test: Task 5 (`test_normalize_output_uses_nfc`) và Task 8 (`treats composed and decomposed Vietnamese as equal`).
2. Con viết `input("Nhập số: ")` có lời nhắc: kết quả bị chấm sai vì lời nhắc nằm trong đầu ra. App phải giải thích đúng nguyên nhân thay vì chỉ hiện 2 đầu ra khác nhau. Test: Task 6 (`flags input() with a prompt`), Task 8 (`adds the input-prompt misconception`), Task 9 (`problemFromOutcome returns InputPrompt only when judged wrong`), Task 10 (mục `input-prompt` trong test Pyodide).
3. Vòng lặp in vô hạn bọc trong `try/except Exception` không được làm treo app hoặc nuốt mất việc dừng. Test: Task 6 (`stops output that is too long, even inside try/except Exception`), Task 10 (mục `output-limit`).
4. Con bấm Chạy thử / Nộp bài liên tục, hoặc bấm khi Pyodide chưa tải xong: các lần chạy phải xếp hàng, kết quả không lẫn nhau, nút bị khóa khi chưa sẵn sàng. Test: Task 7 (`a run waits for ready`, `runs are serialized`), Task 13 (`disables Run and Submit until the runner is ready`).
5. Con dán dấu nháy cong `“ ”` từ Word hoặc web: phải có giải thích riêng, không rơi vào thông báo chung. Test: Task 9 (`matches the smart quote entry with its captured character`), Task 10 (mục `smart-quote`).

---

## File Structure

```
package.json, tsconfig.json, vite.config.ts, vitest.config.ts, playwright.config.ts, index.html
requirements-dev.txt                    pytest cho script kiểm tra nội dung
content/
  errors/errors.yaml                    Từ điển lỗi song ngữ
  stage-1/stage.yaml
  stage-1/01-lam-quen/                  topic.yaml, concepts.yaml, questions.yaml, 4 file bài học .md
tools/
  copy_pyodide.mjs                      Chép file Pyodide vào public/pyodide/
  build_content.ts                      CLI: content/ -> src/generated/content.json
  content/parseLesson.ts                Tách phần đầu YAML, tách thẻ, chuyển Markdown -> HTML
  content/schema.ts                     Schema zod + chuyển đổi sang kiểu runtime
  content/references.ts                 Kiểm tra ID trùng và tham chiếu
  content/buildBundle.ts                Đọc thư mục, gộp bundle, gom lỗi
  validate_content.py                   Chạy mọi đoạn code trong bundle bằng CPython
  tests/test_validate_content.py        pytest cho validate_content.py
src/
  main.tsx, styles.css
  i18n/  lang.ts, vi.ts, en.ts, translate.ts, LangProvider.tsx
  content/  types.ts, lookup.ts, bundle.ts
  runner/  types.ts, harness.ts, pyRun.ts, protocol.ts, worker.ts, client.ts, browser.ts, compare.ts, judge.ts
  explain/  types.ts, problem.ts, checks.ts, match.ts, providers.ts
  ui/  contexts.tsx, useRunnerClient.ts, useExplain.ts, feedback.ts, Robot.tsx, RobotBubble.tsx, Header.tsx,
       OutputPanel.tsx, CodeExample.tsx, CardView.tsx, CodeEditor.tsx, TestResultList.tsx, CodeExerciseView.tsx,
       QuestionCard.tsx, LessonScreen.tsx, HomeScreen.tsx, routing.ts, ErrorBoundary.tsx, AppRoutes.tsx, App.tsx,
       browserSupport.ts
  test/  setup.ts, fixtures.ts, render.tsx, pyodide.ts, fakeWorker.ts
  generated/content.json                (sinh ra lúc build, không commit)
e2e/lesson.spec.ts
docs/manual-test-checklist.md
```

---

### Task 1: Khung dự án

**Files:**
- Create: `package.json` (qua `npm init`), `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `src/main.tsx`, `src/test/setup.ts`, `src/test/setup.test.tsx`, `tools/copy_pyodide.mjs`, `requirements-dev.txt`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: không có.
- Produces: các lệnh `npm run dev`, `npm run build`, `npm run preview`, `npm run typecheck`, `npm test`, `npm run test:py`, `npm run pyodide:copy`. Môi trường test mặc định là `node`; file test giao diện đặt dòng đầu `// @vitest-environment jsdom`. `src/test/setup.ts` nạp matcher của jest-dom và dọn DOM sau mỗi test.

- [ ] **Step 1: Khởi tạo package và cài gói**

```bash
cd py-pet
npm init -y
npm pkg set name=py-pet version=0.1.0 private=true type=module
npm pkg delete main
npm install react@19.3.0 react-dom@19.3.0 codemirror@6.0.2 @codemirror/lang-python@6.2.1 @codemirror/state@6.7.6 @codemirror/view@6.43.13 @codemirror/commands@6.11.1 @codemirror/language@6.12.4
npm install -D typescript@5.9.3 vite@8.3.3 @vitejs/plugin-react@6.1.2 vitest@5.0.3 jsdom@30.1.2 @testing-library/react@16.3.3 @testing-library/user-event@14.6.7 @testing-library/jest-dom@7.0.1 @types/react@19.3.0 @types/react-dom@19.3.0 @types/node@26.6.4 tsx@4.23.15 pyodide@314.0.7 js-yaml@5.4.3 marked@18.1.0 zod@4.6.5 @playwright/test@1.63.0
npm pkg set scripts.pyodide:copy="node tools/copy_pyodide.mjs"
npm pkg set scripts.dev="npm run pyodide:copy && vite"
npm pkg set scripts.build="npm run pyodide:copy && tsc --noEmit && vite build"
npm pkg set scripts.preview="vite preview --port 4173 --strictPort"
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.test="vitest run"
npm pkg set scripts.test:py=".venv/bin/python -m pytest tools/tests -q"
```

- [ ] **Step 2: Thêm vào `.gitignore`**

Nối vào cuối file `.gitignore`:

```
# Node / build
node_modules/
public/pyodide/
src/generated/
test-results/
playwright-report/
```

- [ ] **Step 3: Tạo các file cấu hình**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client", "node"]
  },
  "include": ["src", "tools", "e2e", "vite.config.ts", "vitest.config.ts", "playwright.config.ts"]
}
```

`vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react()],
  worker: { format: "es" },
});
```

`vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["src/**/*.test.{ts,tsx}", "tools/**/*.test.ts"],
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
```

`index.html`:

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Py-Pet</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/main.tsx` (tạm thời, Task 15 thay bằng app thật):

```tsx
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
if (container) createRoot(container).render(<h1>Py-Pet</h1>);
```

`tools/copy_pyodide.mjs`:

```js
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
```

`requirements-dev.txt`:

```
pytest>=8
```

`src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

afterEach(async () => {
  if (typeof document === "undefined") return;
  const { cleanup } = await import("@testing-library/react");
  cleanup();
});
```

- [ ] **Step 4: Viết test khói cho môi trường jsdom**

`src/test/setup.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

test("jsdom and jest-dom matchers work", () => {
  render(<p>Xin chào</p>);
  expect(screen.getByText("Xin chào")).toBeInTheDocument();
});
```

- [ ] **Step 5: Tạo môi trường Python và chạy kiểm tra**

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
npm test
npm run build
ls public/pyodide
```

Expected: `npm test` báo 1 test PASS; `npm run build` tạo thư mục `dist/` không lỗi; `public/pyodide` có 5 file.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore tsconfig.json vite.config.ts vitest.config.ts index.html src/main.tsx src/test/setup.ts src/test/setup.test.tsx tools/copy_pyodide.mjs requirements-dev.txt
git commit -F - <<'EOF'
chore: scaffold Vite + React + Vitest project with Pyodide copy step

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: Song ngữ (i18n)

**Files:**
- Create: `src/i18n/lang.ts`, `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/i18n/translate.ts`, `src/i18n/LangProvider.tsx`
- Test: `src/i18n/i18n.test.ts`, `src/i18n/LangProvider.test.tsx`

**Interfaces:**
- Consumes: không có.
- Produces:
  - `type Lang = "vi" | "en"`, `type QuestionLang = Lang | "both"`, `interface LocalizedText { vi: string; en?: string }`
  - `pick(text: LocalizedText, lang: Lang): string` (thiếu `en` thì trả `vi`), `pickBoth(text: LocalizedText): string`
  - `vi` (bộ chuỗi), `type MessageKey = keyof typeof vi`, `en: Record<MessageKey, string>`
  - `translate(lang: Lang, key: MessageKey, vars?: MessageVars): string`, `type MessageVars = Record<string, string | number>`
  - `<LangProvider initialLang?>`, `useLang(): LangState` với `{ uiLang, setUiLang, questionLang, setQuestionLang, t(key, vars?) }`

- [ ] **Step 1: Viết test thất bại**

`src/i18n/i18n.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { en } from "./en";
import { pick, pickBoth } from "./lang";
import { translate } from "./translate";
import { vi, type MessageKey } from "./vi";

describe("message catalogs", () => {
  test("vi and en have the same keys", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(vi).sort());
  });

  test("no message is empty", () => {
    for (const message of [...Object.values(vi), ...Object.values(en)]) {
      expect(message.trim()).not.toBe("");
    }
  });

  test("placeholders are the same in vi and en", () => {
    const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(vi) as MessageKey[]) {
      expect(placeholders(en[key])).toEqual(placeholders(vi[key]));
    }
  });
});

describe("translate", () => {
  test("fills placeholders", () => {
    expect(translate("vi", "lesson.cardOf", { current: 2, total: 5 })).toBe("Thẻ 2/5");
    expect(translate("en", "lesson.cardOf", { current: 2, total: 5 })).toBe("Card 2/5");
  });

  test("keeps a placeholder that has no value", () => {
    expect(translate("vi", "lesson.cardOf", { current: 1 })).toBe("Thẻ 1/{total}");
  });
});

describe("pick", () => {
  test("returns the English text when it exists", () => {
    expect(pick({ vi: "Xin chào", en: "Hello" }, "en")).toBe("Hello");
  });

  test("falls back to Vietnamese when English is missing", () => {
    expect(pick({ vi: "Xin chào" }, "en")).toBe("Xin chào");
  });

  test("pickBoth joins the 2 languages only when they differ", () => {
    expect(pickBoth({ vi: "Lỗi", en: "Error" })).toBe("Lỗi / Error");
    expect(pickBoth({ vi: "5", en: "5" })).toBe("5");
    expect(pickBoth({ vi: "Chỉ tiếng Việt" })).toBe("Chỉ tiếng Việt");
  });
});
```

`src/i18n/LangProvider.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi as vitestVi } from "vitest";
import { LangProvider, useLang } from "./LangProvider";

function Probe() {
  const { t, uiLang, setUiLang, questionLang } = useLang();
  return (
    <div>
      <p>{t("lesson.next")}</p>
      <p>ui:{uiLang}</p>
      <p>question:{questionLang}</p>
      <button onClick={() => setUiLang("en")}>to-en</button>
    </div>
  );
}

test("switches the interface language", async () => {
  render(
    <LangProvider>
      <Probe />
    </LangProvider>,
  );
  expect(screen.getByText("Tiếp")).toBeInTheDocument();
  expect(screen.getByText("question:vi")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "to-en" }));
  expect(screen.getByText("Next")).toBeInTheDocument();
  expect(screen.getByText("ui:en")).toBeInTheDocument();
});

test("starts with the given language", () => {
  render(
    <LangProvider initialLang="en">
      <Probe />
    </LangProvider>,
  );
  expect(screen.getByText("Next")).toBeInTheDocument();
});

test("useLang outside the provider throws", () => {
  vitestVi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<Probe />)).toThrow("useLang must be used inside <LangProvider>");
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/i18n`
Expected: FAIL vì chưa có module `./en`, `./lang`, `./translate`, `./vi`, `./LangProvider`.

- [ ] **Step 3: Viết code**

`src/i18n/lang.ts`:

```ts
export type Lang = "vi" | "en";
export type QuestionLang = Lang | "both";

/** Text with a required Vietnamese version and an optional English version. */
export interface LocalizedText {
  vi: string;
  en?: string;
}

export function pick(text: LocalizedText, lang: Lang): string {
  if (lang === "en" && text.en) return text.en;
  return text.vi;
}

/** Vietnamese, then English when the English text exists and differs. */
export function pickBoth(text: LocalizedText): string {
  return text.en && text.en !== text.vi ? `${text.vi} / ${text.en}` : text.vi;
}
```

`src/i18n/vi.ts`:

```ts
export const vi = {
  "app.title": "Py-Pet",
  "app.uiLanguage": "Ngôn ngữ giao diện",
  "app.crash": "Robo bị trục trặc rồi. Con tải lại trang nhé.",
  "app.reload": "Tải lại trang",
  "browser.unsupported": "Trình duyệt này chưa chạy được Py-Pet. Hãy dùng Chrome hoặc Edge.",
  "runner.loading": "Robo đang khởi động...",
  "runner.ready": "Robo sẵn sàng",
  "runner.failed": "Robo chưa khởi động được.",
  "runner.retry": "Thử lại",
  "home.title": "Bài học",
  "home.done": "Đã xong",
  "lesson.cardOf": "Thẻ {current}/{total}",
  "lesson.exerciseOf": "Bài tập {current}/{total}",
  "lesson.next": "Tiếp",
  "lesson.back": "Quay lại",
  "lesson.finish": "Hoàn thành",
  "lesson.doneTitle": "Hoàn thành bài học!",
  "lesson.doneBody": "Robo tự hào về con!",
  "lesson.backHome": "Về danh sách bài",
  "lesson.notFound": "Không tìm thấy bài học này.",
  "code.run": "Chạy thử",
  "code.submit": "Nộp bài",
  "code.running": "Đang chạy...",
  "code.output": "Kết quả",
  "code.noOutput": "(Chương trình không in ra gì)",
  "code.outputTruncated": "(Kết quả quá dài, chỉ hiện phần đầu)",
  "code.rawError": "Xem lỗi gốc",
  "code.editorLabel": "Trình soạn code",
  "code.inputLabel": "Dữ liệu nhập (Input)",
  "code.inputPlaceholder": "Mỗi dòng là 1 giá trị nhập vào",
  "exercise.example": "Ví dụ",
  "exercise.expectedOutput": "Kết quả mong đợi",
  "hint.show": "Gợi ý",
  "hint.next": "Gợi ý tiếp",
  "hint.title": "Gợi ý {n}",
  "solution.show": "Xem lời giải",
  "solution.title": "Lời giải mẫu",
  "judge.results": "Kết quả chấm",
  "judge.accepted": "Đúng hết {passed}/{total} test!",
  "judge.partial": "Đúng {passed}/{total} test. Xem test bị sai ở bên dưới nhé.",
  "judge.test": "Test {n}",
  "judge.hidden": "Test ẩn",
  "judge.passed": "Đúng",
  "judge.failed": "Sai",
  "judge.timeout": "Quá thời gian",
  "judge.error": "Lỗi",
  "judge.notRun": "Chưa chạy",
  "judge.input": "Dữ liệu nhập",
  "judge.expected": "Mong đợi",
  "judge.actual": "Code của con in ra",
  "question.lang": "Ngôn ngữ câu hỏi",
  "question.langVi": "VI",
  "question.langEn": "EN",
  "question.langBoth": "VI + EN",
  "question.choices": "Các lựa chọn",
  "question.check": "Kiểm tra",
  "question.correct": "Chính xác!",
  "question.incorrect": "Chưa đúng rồi.",
  "explain.unknown": "Lỗi này lạ quá, con hỏi bố mẹ nhé.",
} as const;

export type MessageKey = keyof typeof vi;
```

`src/i18n/en.ts`:

```ts
import type { MessageKey } from "./vi";

export const en: Record<MessageKey, string> = {
  "app.title": "Py-Pet",
  "app.uiLanguage": "Interface language",
  "app.crash": "Robo has a problem. Please reload the page.",
  "app.reload": "Reload the page",
  "browser.unsupported": "This browser cannot run Py-Pet. Please use Chrome or Edge.",
  "runner.loading": "Robo is starting...",
  "runner.ready": "Robo is ready",
  "runner.failed": "Robo could not start.",
  "runner.retry": "Try again",
  "home.title": "Lessons",
  "home.done": "Done",
  "lesson.cardOf": "Card {current}/{total}",
  "lesson.exerciseOf": "Exercise {current}/{total}",
  "lesson.next": "Next",
  "lesson.back": "Back",
  "lesson.finish": "Finish",
  "lesson.doneTitle": "Lesson complete!",
  "lesson.doneBody": "Robo is proud of you!",
  "lesson.backHome": "Back to the lessons",
  "lesson.notFound": "This lesson does not exist.",
  "code.run": "Run",
  "code.submit": "Submit",
  "code.running": "Running...",
  "code.output": "Output",
  "code.noOutput": "(The program printed nothing)",
  "code.outputTruncated": "(The output is too long. Only the start is shown)",
  "code.rawError": "Show the original error",
  "code.editorLabel": "Code editor",
  "code.inputLabel": "Input data",
  "code.inputPlaceholder": "Write 1 input value on each line",
  "exercise.example": "Example",
  "exercise.expectedOutput": "Expected output",
  "hint.show": "Hint",
  "hint.next": "Next hint",
  "hint.title": "Hint {n}",
  "solution.show": "Show the solution",
  "solution.title": "Sample solution",
  "judge.results": "Test results",
  "judge.accepted": "All {passed}/{total} tests pass!",
  "judge.partial": "{passed}/{total} tests pass. Look at the failed tests below.",
  "judge.test": "Test {n}",
  "judge.hidden": "Hidden test",
  "judge.passed": "Pass",
  "judge.failed": "Fail",
  "judge.timeout": "Time limit",
  "judge.error": "Error",
  "judge.notRun": "Not run",
  "judge.input": "Input",
  "judge.expected": "Expected",
  "judge.actual": "Your code printed",
  "question.lang": "Question language",
  "question.langVi": "VI",
  "question.langEn": "EN",
  "question.langBoth": "VI + EN",
  "question.choices": "Choices",
  "question.check": "Check",
  "question.correct": "Correct!",
  "question.incorrect": "Not correct.",
  "explain.unknown": "Robo does not know this error. Please ask your parents.",
};
```

`src/i18n/translate.ts`:

```ts
import { en } from "./en";
import type { Lang } from "./lang";
import { vi, type MessageKey } from "./vi";

export type MessageVars = Record<string, string | number>;

const catalogs: Record<Lang, Record<MessageKey, string>> = { vi, en };

export function translate(lang: Lang, key: MessageKey, vars: MessageVars = {}): string {
  return catalogs[lang][key].replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}
```

`src/i18n/LangProvider.tsx`:

```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Lang, QuestionLang } from "./lang";
import { translate, type MessageVars } from "./translate";
import type { MessageKey } from "./vi";

export interface LangState {
  uiLang: Lang;
  setUiLang(lang: Lang): void;
  questionLang: QuestionLang;
  setQuestionLang(lang: QuestionLang): void;
  t(key: MessageKey, vars?: MessageVars): string;
}

const LangContext = createContext<LangState | null>(null);

export function LangProvider({ initialLang = "vi", children }: { initialLang?: Lang; children: ReactNode }) {
  const [uiLang, setUiLang] = useState<Lang>(initialLang);
  const [questionLang, setQuestionLang] = useState<QuestionLang>("vi");
  const value = useMemo<LangState>(
    () => ({
      uiLang,
      setUiLang,
      questionLang,
      setQuestionLang,
      t: (key, vars) => translate(uiLang, key, vars),
    }),
    [uiLang, questionLang],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangState {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang must be used inside <LangProvider>");
  return value;
}
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/i18n && npm run typecheck`
Expected: PASS toàn bộ; `tsc` không báo lỗi.

- [ ] **Step 5: Commit**

```bash
git add src/i18n
git commit -F - <<'EOF'
feat(i18n): add vi/en message catalogs, translate and LangProvider

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Kiểu nội dung và tách file bài học

**Files:**
- Create: `src/content/types.ts`, `src/content/lookup.ts`, `tools/content/parseLesson.ts`
- Test: `src/content/lookup.test.ts`, `tools/content/parseLesson.test.ts`

**Interfaces:**
- Consumes: `LocalizedText`, `Lang` từ `src/i18n/lang.ts`.
- Produces:
  - Kiểu runtime trong `src/content/types.ts`: `TestCase`, `CommonWrong`, `CompareMode`, `CodeExercise`, `Choice`, `ChoiceQuestion`, `Exercise`, `CardSegment`, `Card`, `Lesson`, `Concept`, `Topic`, `Stage`, `CHECK_NAMES`, `CheckName`, `BilingualText`, `ErrorEntry`, `ContentBundle` (định nghĩa đầy đủ ở Step 3).
  - `allLessons(bundle): Lesson[]`, `findLesson(bundle, id): Lesson | undefined`, `allExercises(bundle): Exercise[]` (bài tập trong bài học + câu hỏi ngân hàng).
  - `LessonFormatError`, `splitFrontmatter(text): { frontmatter: string; body: string }`, `splitCards(body): string[]`, `parseCard(markdown): Card`, `parseLessonFile(text): { frontmatter: unknown; cards: Card[] }`.

- [ ] **Step 1: Viết test thất bại**

`tools/content/parseLesson.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { LessonFormatError, parseCard, parseLessonFile, splitCards, splitFrontmatter } from "./parseLesson";

describe("splitFrontmatter", () => {
  test("separates the YAML part from the body", () => {
    expect(splitFrontmatter("---\nid: a\n---\nThân bài")).toEqual({ frontmatter: "id: a\n", body: "Thân bài" });
  });

  test("accepts Windows line endings", () => {
    expect(splitFrontmatter("---\r\nid: a\r\n---\r\nThân")).toEqual({ frontmatter: "id: a\n", body: "Thân" });
  });

  test("accepts a file that ends right after the closing line", () => {
    expect(splitFrontmatter("---\nid: a\n---")).toEqual({ frontmatter: "id: a\n", body: "" });
  });

  test("rejects a file without the opening line", () => {
    expect(() => splitFrontmatter("id: a\n")).toThrow(LessonFormatError);
  });

  test("rejects a file without the closing line", () => {
    expect(() => splitFrontmatter("---\nid: a\n")).toThrow(LessonFormatError);
  });
});

describe("splitCards", () => {
  test("splits on lines that contain only ---", () => {
    expect(splitCards("Một\n---\nHai\n")).toEqual(["Một", "Hai"]);
  });

  test("does not split on --- inside a code fence", () => {
    const body = "Một\n```python\nprint('---')\n---\n```\n---\nHai";
    expect(splitCards(body)).toEqual(["Một\n```python\nprint('---')\n---\n```", "Hai"]);
  });

  test("drops empty cards", () => {
    expect(splitCards("\n---\nMột\n---\n\n")).toEqual(["Một"]);
  });
});

describe("parseCard", () => {
  test("turns Markdown into HTML and Python fences into code segments", () => {
    const card = parseCard('**Biến** là hộp.\n\n```python run\nprint("hi")\n```\n\nHết.');
    expect(card.segments).toEqual([
      { kind: "html", html: "<p><strong>Biến</strong> là hộp.</p>\n" },
      { kind: "code", code: 'print("hi")', run: true, expectError: false },
      { kind: "html", html: "<p>Hết.</p>\n" },
    ]);
  });

  test("reads the expect-error flag and plain Python blocks", () => {
    const card = parseCard("```python run expect-error\nPrint(1)\n```\n```python\nx = 1\n```");
    expect(card.segments).toEqual([
      { kind: "code", code: "Print(1)", run: true, expectError: true },
      { kind: "code", code: "x = 1", run: false, expectError: false },
    ]);
  });

  test("keeps non-Python fences as Markdown", () => {
    const card = parseCard("```text\nxin chào\n```");
    expect(card.segments).toHaveLength(1);
    expect(card.segments[0]).toMatchObject({ kind: "html" });
    expect((card.segments[0] as { html: string }).html).toContain("xin chào");
  });
});

describe("parseLessonFile", () => {
  test("parses YAML and cards", () => {
    const parsed = parseLessonFile("---\nid: s1.a.l1\ntitle: { vi: Bài 1 }\n---\nThẻ 1\n---\nThẻ 2\n");
    expect(parsed.frontmatter).toEqual({ id: "s1.a.l1", title: { vi: "Bài 1" } });
    expect(parsed.cards).toHaveLength(2);
  });

  test("reports invalid YAML as LessonFormatError", () => {
    expect(() => parseLessonFile("---\nid: [\n---\nThẻ\n")).toThrow(LessonFormatError);
  });
});
```

`src/content/lookup.test.ts`:

```ts
import { expect, test } from "vitest";
import { allExercises, allLessons, findLesson } from "./lookup";
import type { ChoiceQuestion, CodeExercise, ContentBundle, Lesson } from "./types";

const code: CodeExercise = {
  id: "a.l1.ex1",
  type: "code",
  concepts: [],
  prompt: { vi: "In ra Hi" },
  starter: "",
  solution: 'print("Hi")',
  tests: [{ input: "", output: "Hi", hidden: false }],
  commonWrong: [],
  hints: [],
  compare: { kind: "exact" },
  testEligible: false,
};
const question: ChoiceQuestion = {
  id: "a.b1",
  type: "mcq",
  concepts: [],
  lessons: ["a.l1"],
  code: null,
  prompt: { vi: "Hỏi?", en: "Question?" },
  choices: [
    { text: { vi: "Có", en: "Yes" }, correct: true, error: false, misconception: null },
    { text: { vi: "Không", en: "No" }, correct: false, error: false, misconception: null },
  ],
  explanation: { vi: "Vì vậy.", en: "Because." },
};
const lesson1: Lesson = { id: "a.l1", title: { vi: "Bài 1" }, cards: [], exercises: [code] };
const lesson2: Lesson = { id: "a.l2", title: { vi: "Bài 2" }, cards: [], exercises: [] };
const bundle: ContentBundle = {
  stages: [
    {
      id: "s1",
      title: { vi: "Giai đoạn 1" },
      topics: [{ id: "a", title: { vi: "A" }, lessons: [lesson1, lesson2], concepts: [], questions: [question] }],
    },
  ],
  errors: [],
};

test("allLessons lists lessons in order", () => {
  expect(allLessons(bundle).map((l) => l.id)).toEqual(["a.l1", "a.l2"]);
});

test("findLesson finds by id", () => {
  expect(findLesson(bundle, "a.l2")).toBe(lesson2);
  expect(findLesson(bundle, "missing")).toBeUndefined();
});

test("allExercises includes lesson exercises and bank questions", () => {
  expect(allExercises(bundle).map((e) => e.id)).toEqual(["a.l1.ex1", "a.b1"]);
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run tools/content src/content`
Expected: FAIL vì chưa có `./parseLesson`, `./lookup`, `./types`.

- [ ] **Step 3: Viết code**

`src/content/types.ts`:

```ts
import type { LocalizedText } from "../i18n/lang";

export type { Lang, LocalizedText } from "../i18n/lang";

export interface TestCase {
  input: string;
  output: string;
  hidden: boolean;
}

/** A typical wrong output for one test case, and the misconception it reveals. */
export interface CommonWrong {
  test: number;
  output: string;
  misconception: string;
  sample: string;
}

export type CompareMode = { kind: "exact" } | { kind: "float"; tolerance: number };

export interface CodeExercise {
  id: string;
  type: "code";
  concepts: string[];
  prompt: LocalizedText;
  starter: string;
  solution: string;
  tests: TestCase[];
  commonWrong: CommonWrong[];
  hints: LocalizedText[];
  compare: CompareMode;
  testEligible: boolean;
}

export interface Choice {
  text: LocalizedText;
  correct: boolean;
  /** True when this choice means "the code stops with an error". */
  error: boolean;
  misconception: string | null;
}

export interface ChoiceQuestion {
  id: string;
  type: "predict" | "mcq";
  concepts: string[];
  lessons: string[];
  code: string | null;
  prompt: LocalizedText;
  choices: Choice[];
  explanation: LocalizedText;
}

export type Exercise = CodeExercise | ChoiceQuestion;

export type CardSegment =
  | { kind: "html"; html: string }
  | { kind: "code"; code: string; run: boolean; expectError: boolean };

export interface Card {
  segments: CardSegment[];
}

export interface Lesson {
  id: string;
  title: LocalizedText;
  cards: Card[];
  exercises: Exercise[];
}

export interface Concept {
  id: string;
  name: LocalizedText;
  misconceptionCard: string | null;
  parentTip: string | null;
}

export interface Topic {
  id: string;
  title: LocalizedText;
  lessons: Lesson[];
  concepts: Concept[];
  questions: ChoiceQuestion[];
}

export interface Stage {
  id: string;
  title: LocalizedText;
  topics: Topic[];
}

export const CHECK_NAMES = ["similar-name", "assign-in-condition", "while-loop"] as const;
export type CheckName = (typeof CHECK_NAMES)[number];

export interface BilingualText {
  vi: string;
  en: string;
}

export interface ErrorEntry {
  id: string;
  match: { type: string; message: string | null; check: CheckName | null };
  explain: BilingualText;
  hint: BilingualText | null;
  misconception: string | null;
  sample: string;
  sampleInput: string;
}

export interface ContentBundle {
  stages: Stage[];
  errors: ErrorEntry[];
}
```

`src/content/lookup.ts`:

```ts
import type { ContentBundle, Exercise, Lesson } from "./types";

export function allLessons(bundle: ContentBundle): Lesson[] {
  return bundle.stages.flatMap((stage) => stage.topics.flatMap((topic) => topic.lessons));
}

export function findLesson(bundle: ContentBundle, id: string): Lesson | undefined {
  return allLessons(bundle).find((lesson) => lesson.id === id);
}

export function allExercises(bundle: ContentBundle): Exercise[] {
  return bundle.stages.flatMap((stage) =>
    stage.topics.flatMap((topic) => [...topic.lessons.flatMap((lesson) => lesson.exercises), ...topic.questions]),
  );
}
```

`tools/content/parseLesson.ts`:

```ts
import { load } from "js-yaml";
import { marked } from "marked";
import type { Card, CardSegment } from "../../src/content/types";

export class LessonFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LessonFormatError";
  }
}

export function splitFrontmatter(text: string): { frontmatter: string; body: string } {
  const source = text.replace(/\r\n/g, "\n");
  if (!source.startsWith("---\n")) throw new LessonFormatError("File bài học phải bắt đầu bằng dòng ---");
  const end = source.indexOf("\n---\n", 3);
  if (end !== -1) return { frontmatter: source.slice(4, end + 1), body: source.slice(end + 5) };
  if (source.endsWith("\n---")) return { frontmatter: source.slice(4, source.length - 3), body: "" };
  throw new LessonFormatError("Không tìm thấy dòng --- kết thúc phần đầu file");
}

export function splitCards(body: string): string[] {
  const cards: string[] = [];
  let current: string[] = [];
  let inFence = false;
  for (const line of body.replace(/\r\n/g, "\n").split("\n")) {
    if (line.startsWith("```")) inFence = !inFence;
    if (!inFence && line.trim() === "---") {
      cards.push(current.join("\n"));
      current = [];
      continue;
    }
    current.push(line);
  }
  cards.push(current.join("\n"));
  return cards.map((card) => card.trim()).filter((card) => card !== "");
}

const FENCE_OPEN = /^```(\S*)\s*(.*)$/;

export function parseCard(markdown: string): Card {
  const segments: CardSegment[] = [];
  let text: string[] = [];
  const flushText = () => {
    const md = text.join("\n").trim();
    if (md !== "") segments.push({ kind: "html", html: marked.parse(md, { async: false }) as string });
    text = [];
  };
  const lines = markdown.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] as string;
    const open = FENCE_OPEN.exec(line);
    if (open && open[1] === "python") {
      const flags = (open[2] ?? "").split(/\s+/).filter(Boolean);
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] as string).startsWith("```")) {
        code.push(lines[i] as string);
        i += 1;
      }
      i += 1;
      flushText();
      segments.push({
        kind: "code",
        code: code.join("\n"),
        run: flags.includes("run"),
        expectError: flags.includes("expect-error"),
      });
      continue;
    }
    text.push(line);
    i += 1;
  }
  flushText();
  return { segments };
}

export function parseLessonFile(text: string): { frontmatter: unknown; cards: Card[] } {
  const { frontmatter, body } = splitFrontmatter(text);
  let data: unknown;
  try {
    data = load(frontmatter);
  } catch (error) {
    throw new LessonFormatError(`YAML ở phần đầu file bị lỗi: ${(error as Error).message}`);
  }
  return { frontmatter: data, cards: splitCards(body).map(parseCard) };
}
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run tools/content src/content && npm run typecheck`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add src/content tools/content
git commit -F - <<'EOF'
feat(content): add runtime content types and lesson file parser

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: Schema nội dung, gộp bundle và lệnh build nội dung

**Files:**
- Create: `tools/content/schema.ts`, `tools/content/references.ts`, `tools/content/buildBundle.ts`, `tools/build_content.ts`, `content/errors/errors.yaml` (bản khởi đầu 1 mục, Task 10 thay thế)
- Modify: `package.json` (scripts)
- Test: `tools/content/buildBundle.test.ts`

**Interfaces:**
- Consumes: kiểu trong `src/content/types.ts`; `parseLessonFile`, `LessonFormatError` từ Task 3.
- Produces:
  - `buildBundle(contentDir: string): ContentBundle` (ném `ContentError` chứa `problems: string[]`, mỗi dòng có dạng `<đường dẫn tương đối>: <vị trí>: <thông báo>`).
  - `checkReferences(bundle: ContentBundle): string[]`.
  - Lệnh `npm run content:build` ghi `src/generated/content.json`. Các lệnh `dev`, `build`, `typecheck`, `test` chạy `content:build` trước.
  - Quy ước file YAML (spec mục 3): `stage.yaml { id, title, topics: [tên thư mục] }`; `topic.yaml { id, title, lessons: [tên file .md] }`; `concepts.yaml { concepts: [{ id, name, misconception_card?, parent_tip? }] }`; `questions.yaml { questions: [...] }` (không bắt buộc có file); bài tập `code` có `id, type, concepts?, prompt, starter?, solution, tests[{input?, output, hidden?}], common_wrong?[{test?, output, misconception, sample}], hints?, compare? (exact|float), tolerance?, test_eligible?`; câu `predict`/`mcq` có `id, type, concepts?, lessons?, code?, prompt{vi,en}, choices[{text | vi+en, correct?, error?, misconception?}], explanation{vi,en}`; mục từ điển lỗi có `id, match{type, message?, check?}, explain{vi,en}, hint?{vi,en}, misconception?, sample, sample_input?`.

- [ ] **Step 1: Viết test thất bại**

`tools/content/buildBundle.test.ts`:

```ts
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";
import { buildBundle, ContentError } from "./buildBundle";

function writeTree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "py-pet-content-"));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), text);
  }
  return root;
}

const LESSON = `---
id: s1.a.l1
title: { vi: Bài 1 }
exercises:
  - id: s1.a.l1.ex1
    type: code
    concepts: [print-call]
    prompt: { vi: In ra Hi }
    solution: 'print("Hi")'
    tests:
      - { output: Hi }
---
Thẻ **một**
`;

function minimalTree(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    "stage-1/stage.yaml": "id: s1\ntitle: { vi: Khởi động, en: Getting started }\ntopics: [01-a]\n",
    "stage-1/01-a/topic.yaml": "id: s1.a\ntitle: { vi: Chủ đề A }\nlessons: [01-x.md]\n",
    "stage-1/01-a/concepts.yaml": "concepts:\n  - id: print-call\n    name: { vi: Lệnh print }\n",
    "stage-1/01-a/questions.yaml": [
      "questions:",
      "  - id: s1.a.b1",
      "    type: mcq",
      "    lessons: [s1.a.l1]",
      "    prompt: { vi: Câu hỏi?, en: Question? }",
      "    choices:",
      "      - { text: A, correct: true }",
      "      - { vi: Không, en: No }",
      "    explanation: { vi: Vì vậy., en: Because. }",
      "",
    ].join("\n"),
    "stage-1/01-a/01-x.md": LESSON,
    "errors/errors.yaml": [
      "- id: zero-division",
      "  match: { type: ZeroDivisionError }",
      "  explain: { vi: Chia cho 0, en: Division by 0 }",
      "  sample: 'print(1 / 0)'",
      "",
    ].join("\n"),
    ...overrides,
  };
}

function problemsOf(files: Record<string, string>): string[] {
  try {
    buildBundle(writeTree(files));
  } catch (error) {
    if (error instanceof ContentError) return error.problems;
    throw error;
  }
  return [];
}

describe("buildBundle", () => {
  test("builds a bundle from a valid tree", () => {
    const bundle = buildBundle(writeTree(minimalTree()));
    const topic = bundle.stages[0]!.topics[0]!;
    const lesson = topic.lessons[0]!;
    expect(bundle.stages[0]!.title).toEqual({ vi: "Khởi động", en: "Getting started" });
    expect(lesson.cards[0]!.segments[0]).toEqual({ kind: "html", html: "<p>Thẻ <strong>một</strong></p>\n" });
    expect(lesson.exercises[0]).toEqual({
      id: "s1.a.l1.ex1",
      type: "code",
      concepts: ["print-call"],
      prompt: { vi: "In ra Hi" },
      starter: "",
      solution: 'print("Hi")',
      tests: [{ input: "", output: "Hi", hidden: false }],
      commonWrong: [],
      hints: [],
      compare: { kind: "exact" },
      testEligible: false,
    });
    expect(topic.questions[0]!.choices).toEqual([
      { text: { vi: "A", en: "A" }, correct: true, error: false, misconception: null },
      { text: { vi: "Không", en: "No" }, correct: false, error: false, misconception: null },
    ]);
    expect(topic.concepts).toEqual([
      { id: "print-call", name: { vi: "Lệnh print" }, misconceptionCard: null, parentTip: null },
    ]);
    expect(bundle.errors).toEqual([
      {
        id: "zero-division",
        match: { type: "ZeroDivisionError", message: null, check: null },
        explain: { vi: "Chia cho 0", en: "Division by 0" },
        hint: null,
        misconception: null,
        sample: "print(1 / 0)",
        sampleInput: "",
      },
    ]);
  });

  test("gives lesson questions their own lesson id", () => {
    const lesson = LESSON.replace(
      "---\nThẻ",
      [
        "  - id: s1.a.l1.q1",
        "    type: predict",
        "    code: 'print(1)'",
        "    prompt: { vi: In ra gì?, en: What is printed? }",
        "    choices:",
        "      - { text: '1', correct: true }",
        "      - { text: '2' }",
        "    explanation: { vi: Một., en: One. }",
        "---",
        "Thẻ",
      ].join("\n"),
    );
    const bundle = buildBundle(writeTree(minimalTree({ "stage-1/01-a/01-x.md": lesson })));
    const question = bundle.stages[0]!.topics[0]!.lessons[0]!.exercises[1]!;
    expect(question).toMatchObject({ id: "s1.a.l1.q1", lessons: ["s1.a.l1"], code: "print(1)" });
  });

  test("requires English for a test-eligible code exercise", () => {
    const lesson = LESSON.replace("    prompt: { vi: In ra Hi }", "    prompt: { vi: In ra Hi }\n    test_eligible: true");
    const problems = problemsOf(minimalTree({ "stage-1/01-a/01-x.md": lesson }));
    expect(problems).toEqual([expect.stringMatching(/^stage-1\/01-a\/01-x\.md: exercises\.0: prompt\.en: /)]);
  });

  test("requires English in mcq prompts", () => {
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!.replace(
      "{ vi: Câu hỏi?, en: Question? }",
      "{ vi: Câu hỏi? }",
    );
    const problems = problemsOf(minimalTree({ "stage-1/01-a/questions.yaml": questions }));
    expect(problems).toEqual([expect.stringContaining("questions.0: prompt.en")]);
  });

  test("requires code in predict questions and exactly 1 correct choice", () => {
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!
      .replace("type: mcq", "type: predict")
      .replace("{ text: A, correct: true }", "{ text: A }");
    const problems = problemsOf(minimalTree({ "stage-1/01-a/questions.yaml": questions }));
    expect(problems).toEqual(
      expect.arrayContaining([expect.stringContaining("code: Câu predict"), expect.stringContaining("choices: Phải có đúng 1")]),
    );
  });

  test("reports duplicate ids", () => {
    const lesson = LESSON.replace("id: s1.a.l1.ex1", "id: s1.a.b1");
    const problems = problemsOf(minimalTree({ "stage-1/01-a/01-x.md": lesson }));
    expect(problems).toEqual([expect.stringContaining('ID trùng "s1.a.b1"')]);
  });

  test("reports unknown concepts and unknown lessons", () => {
    const lesson = LESSON.replace("concepts: [print-call]", "concepts: [khong-co]");
    const questions = minimalTree()["stage-1/01-a/questions.yaml"]!.replace("lessons: [s1.a.l1]", "lessons: [s1.a.l9]");
    const problems = problemsOf(minimalTree({ "stage-1/01-a/01-x.md": lesson, "stage-1/01-a/questions.yaml": questions }));
    expect(problems).toEqual(
      expect.arrayContaining([
        expect.stringContaining('khái niệm "khong-co"'),
        expect.stringContaining('bài học "s1.a.l9" không tồn tại'),
      ]),
    );
  });

  test("reports an invalid regular expression in the error dictionary", () => {
    const errors = minimalTree()["errors/errors.yaml"]!.replace(
      "match: { type: ZeroDivisionError }",
      'match: { type: ZeroDivisionError, message: "(" }',
    );
    const problems = problemsOf(minimalTree({ "errors/errors.yaml": errors }));
    expect(problems).toEqual([expect.stringContaining("match.message: Biểu thức chính quy không hợp lệ")]);
  });

  test("reports a missing file", () => {
    const problems = problemsOf(minimalTree({ "stage-1/01-a/topic.yaml": "id: s1.a\ntitle: { vi: A }\nlessons: [99-y.md]\n" }));
    expect(problems).toEqual(expect.arrayContaining([expect.stringContaining("stage-1/01-a/99-y.md: không tìm thấy file")]));
  });

  test("reports a lesson without cards", () => {
    const problems = problemsOf(minimalTree({ "stage-1/01-a/01-x.md": LESSON.replace("Thẻ **một**\n", "") }));
    expect(problems).toEqual([expect.stringContaining("bài học phải có ít nhất 1 thẻ")]);
  });

  test("sorts stage folders by number and allows a tree with only errors", () => {
    const tree = minimalTree();
    const onlyErrors = { "errors/errors.yaml": tree["errors/errors.yaml"]! };
    expect(buildBundle(writeTree(onlyErrors)).stages).toEqual([]);
    const stage10 = Object.fromEntries(
      Object.entries(tree)
        .filter(([path]) => path.startsWith("stage-1/"))
        .map(([path, text]) => [
          path.replace("stage-1/", "stage-10/"),
          text.replaceAll("s1.a", "s10.a").replaceAll("print-call", "print-call-b").replace("id: s1\n", "id: s10\n"),
        ]),
    );
    const bundle = buildBundle(writeTree({ ...tree, ...stage10 }));
    expect(bundle.stages.map((s) => s.id)).toEqual(["s1", "s10"]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run tools/content/buildBundle.test.ts`
Expected: FAIL vì chưa có `./buildBundle`.

- [ ] **Step 3: Viết `tools/content/schema.ts`**

```ts
import { z } from "zod";
import {
  CHECK_NAMES,
  type Choice,
  type ChoiceQuestion,
  type CodeExercise,
  type Concept,
  type ErrorEntry,
  type Exercise,
} from "../../src/content/types";
import type { LocalizedText } from "../../src/i18n/lang";

const ID_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const idSchema = z.string().regex(ID_PATTERN, "ID chỉ gồm chữ thường không dấu, số, dấu chấm và dấu gạch ngang");
const localizedSchema = z.object({ vi: z.string().min(1), en: z.string().min(1).optional() }).strict();
const bilingualSchema = z.object({ vi: z.string().min(1), en: z.string().min(1) }).strict();

const testCaseSchema = z
  .object({ input: z.string().default(""), output: z.string(), hidden: z.boolean().default(false) })
  .strict();

const commonWrongSchema = z
  .object({
    test: z.number().int().min(0).default(0),
    output: z.string(),
    misconception: idSchema,
    sample: z.string().min(1),
  })
  .strict();

const codeExerciseSchema = z
  .object({
    id: idSchema,
    type: z.literal("code"),
    concepts: z.array(idSchema).default([]),
    prompt: localizedSchema,
    starter: z.string().default(""),
    solution: z.string().min(1),
    tests: z.array(testCaseSchema).min(1),
    common_wrong: z.array(commonWrongSchema).default([]),
    hints: z.array(localizedSchema).default([]),
    compare: z.enum(["exact", "float"]).default("exact"),
    tolerance: z.number().positive().optional(),
    test_eligible: z.boolean().default(false),
  })
  .strict()
  .superRefine((ex, ctx) => {
    if (ex.test_eligible && ex.prompt.en === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["prompt", "en"],
        message: "Bài code dùng trong đề kiểm tra (test_eligible) phải có bản tiếng Anh",
      });
    }
    if (ex.compare === "float" && ex.tolerance === undefined) {
      ctx.addIssue({ code: "custom", path: ["tolerance"], message: "compare: float cần có tolerance" });
    }
    ex.common_wrong.forEach((cw, i) => {
      if (cw.test >= ex.tests.length) {
        ctx.addIssue({ code: "custom", path: ["common_wrong", i, "test"], message: "test vượt quá số test case" });
      }
    });
  });

const choiceSchema = z
  .object({
    text: z.string().optional(),
    vi: z.string().optional(),
    en: z.string().optional(),
    correct: z.boolean().default(false),
    error: z.boolean().default(false),
    misconception: idSchema.optional(),
  })
  .strict()
  .superRefine((choice, ctx) => {
    const hasText = choice.text !== undefined;
    const hasLocalized = choice.vi !== undefined || choice.en !== undefined;
    if (hasText === hasLocalized) {
      ctx.addIssue({ code: "custom", path: [], message: "Lựa chọn phải có text (trung tính) hoặc có vi + en" });
    } else if (hasLocalized && (!choice.vi || !choice.en)) {
      ctx.addIssue({ code: "custom", path: [], message: "Lựa chọn song ngữ phải có đủ vi và en" });
    }
  });

const choiceQuestionSchema = z
  .object({
    id: idSchema,
    type: z.enum(["predict", "mcq"]),
    concepts: z.array(idSchema).default([]),
    lessons: z.array(idSchema).default([]),
    code: z.string().min(1).optional(),
    prompt: bilingualSchema,
    choices: z.array(choiceSchema).min(2).max(6),
    explanation: bilingualSchema,
  })
  .strict()
  .superRefine((q, ctx) => {
    if (q.type === "predict" && q.code === undefined) {
      ctx.addIssue({ code: "custom", path: ["code"], message: "Câu predict phải có code" });
    }
    if (q.choices.filter((c) => c.correct).length !== 1) {
      ctx.addIssue({ code: "custom", path: ["choices"], message: "Phải có đúng 1 lựa chọn correct: true" });
    }
  });

export const stageFileSchema = z
  .object({ id: idSchema, title: localizedSchema, topics: z.array(z.string().min(1)).min(1) })
  .strict();

export const topicFileSchema = z
  .object({ id: idSchema, title: localizedSchema, lessons: z.array(z.string().min(1)).min(1) })
  .strict();

const conceptSchema = z
  .object({
    id: idSchema,
    name: localizedSchema,
    misconception_card: z.string().min(1).optional(),
    parent_tip: z.string().min(1).optional(),
  })
  .strict();

export const conceptsFileSchema = z.object({ concepts: z.array(conceptSchema) }).strict();

export const questionsFileSchema = z.object({ questions: z.array(z.unknown()) }).strict();

export const lessonFrontmatterSchema = z
  .object({ id: idSchema, title: localizedSchema, exercises: z.array(z.unknown()).default([]) })
  .strict();

const errorEntrySchema = z
  .object({
    id: idSchema,
    match: z
      .object({ type: z.string().min(1), message: z.string().min(1).optional(), check: z.enum(CHECK_NAMES).optional() })
      .strict(),
    explain: bilingualSchema,
    hint: bilingualSchema.optional(),
    misconception: idSchema.optional(),
    sample: z.string().min(1),
    sample_input: z.string().default(""),
  })
  .strict()
  .superRefine((entry, ctx) => {
    if (entry.match.message === undefined) return;
    try {
      new RegExp(entry.match.message);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        path: ["match", "message"],
        message: `Biểu thức chính quy không hợp lệ: ${(error as Error).message}`,
      });
    }
  });

export const errorsFileSchema = z.array(errorEntrySchema);

export type ParseResult<T> = { ok: true; value: T } | { ok: false; issues: string[] };
export type SafeResult<T> = { success: true; data: T } | { success: false; error: z.ZodError };

export function formatIssues(error: z.ZodError, where: string): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `: ${issue.path.join(".")}` : "";
    return `${where}${path}: ${issue.message}`;
  });
}

export function parseWith<T>(result: SafeResult<T>, where: string): ParseResult<T> {
  return result.success ? { ok: true, value: result.data } : { ok: false, issues: formatIssues(result.error, where) };
}

export function toLocalized(raw: { vi: string; en?: string | undefined }): LocalizedText {
  return raw.en === undefined ? { vi: raw.vi } : { vi: raw.vi, en: raw.en };
}

function toChoice(raw: z.infer<typeof choiceSchema>): Choice {
  const text: LocalizedText =
    raw.text !== undefined ? { vi: raw.text, en: raw.text } : { vi: raw.vi ?? "", en: raw.en ?? "" };
  return { text, correct: raw.correct, error: raw.error, misconception: raw.misconception ?? null };
}

function toCodeExercise(raw: z.infer<typeof codeExerciseSchema>): CodeExercise {
  return {
    id: raw.id,
    type: "code",
    concepts: raw.concepts,
    prompt: toLocalized(raw.prompt),
    starter: raw.starter,
    solution: raw.solution,
    tests: raw.tests.map((t) => ({ input: t.input, output: t.output, hidden: t.hidden })),
    commonWrong: raw.common_wrong.map((cw) => ({
      test: cw.test,
      output: cw.output,
      misconception: cw.misconception,
      sample: cw.sample,
    })),
    hints: raw.hints.map(toLocalized),
    compare: raw.compare === "float" ? { kind: "float", tolerance: raw.tolerance ?? 0 } : { kind: "exact" },
    testEligible: raw.test_eligible,
  };
}

function toChoiceQuestion(raw: z.infer<typeof choiceQuestionSchema>, ownerLessonId: string | null): ChoiceQuestion {
  return {
    id: raw.id,
    type: raw.type,
    concepts: raw.concepts,
    lessons: raw.lessons.length > 0 ? raw.lessons : ownerLessonId ? [ownerLessonId] : [],
    code: raw.code ?? null,
    prompt: raw.prompt,
    choices: raw.choices.map(toChoice),
    explanation: raw.explanation,
  };
}

/** Parses 1 exercise. A predict/mcq inside a lesson gets that lesson as its default `lessons`. */
export function parseExercise(raw: unknown, ownerLessonId: string | null, where: string): ParseResult<Exercise> {
  const type = typeof raw === "object" && raw !== null ? (raw as { type?: unknown }).type : undefined;
  if (type === "code") {
    const result = parseWith(codeExerciseSchema.safeParse(raw), where);
    return result.ok ? { ok: true, value: toCodeExercise(result.value) } : result;
  }
  if (type === "predict" || type === "mcq") {
    const result = parseWith(choiceQuestionSchema.safeParse(raw), where);
    return result.ok ? { ok: true, value: toChoiceQuestion(result.value, ownerLessonId) } : result;
  }
  return { ok: false, issues: [`${where}: type phải là code, predict hoặc mcq`] };
}

export function toConcept(raw: z.infer<typeof conceptSchema>): Concept {
  return {
    id: raw.id,
    name: toLocalized(raw.name),
    misconceptionCard: raw.misconception_card ?? null,
    parentTip: raw.parent_tip ?? null,
  };
}

export function toErrorEntry(raw: z.infer<typeof errorEntrySchema>): ErrorEntry {
  return {
    id: raw.id,
    match: { type: raw.match.type, message: raw.match.message ?? null, check: raw.match.check ?? null },
    explain: raw.explain,
    hint: raw.hint ?? null,
    misconception: raw.misconception ?? null,
    sample: raw.sample,
    sampleInput: raw.sample_input,
  };
}
```

- [ ] **Step 4: Viết `tools/content/references.ts`**

```ts
import type { ContentBundle, Exercise } from "../../src/content/types";

export function checkReferences(bundle: ContentBundle): string[] {
  const problems: string[] = [];
  const owners = new Map<string, string>();
  const claim = (id: string, what: string) => {
    const previous = owners.get(id);
    if (previous) problems.push(`ID trùng "${id}": ${previous} và ${what}`);
    else owners.set(id, what);
  };

  const conceptIds = new Set<string>();
  const lessonIds = new Set<string>();
  const items: Exercise[] = [];

  for (const stage of bundle.stages) {
    claim(stage.id, "giai đoạn");
    for (const topic of stage.topics) {
      claim(topic.id, "chủ đề");
      for (const concept of topic.concepts) {
        if (conceptIds.has(concept.id)) problems.push(`Khái niệm trùng "${concept.id}"`);
        conceptIds.add(concept.id);
      }
      for (const lesson of topic.lessons) {
        claim(lesson.id, "bài học");
        lessonIds.add(lesson.id);
        for (const exercise of lesson.exercises) {
          claim(exercise.id, "bài tập");
          items.push(exercise);
        }
      }
      for (const question of topic.questions) {
        claim(question.id, "câu hỏi");
        items.push(question);
      }
    }
  }
  for (const entry of bundle.errors) claim(entry.id, "mục từ điển lỗi");

  const needConcept = (id: string, where: string) => {
    if (!conceptIds.has(id)) problems.push(`${where}: khái niệm "${id}" chưa được khai báo trong concepts.yaml`);
  };
  for (const item of items) {
    item.concepts.forEach((id) => needConcept(id, item.id));
    if (item.type === "code") {
      item.commonWrong.forEach((cw) => needConcept(cw.misconception, item.id));
    } else {
      item.choices.forEach((choice) => {
        if (choice.misconception) needConcept(choice.misconception, item.id);
      });
      item.lessons.forEach((id) => {
        if (!lessonIds.has(id)) problems.push(`${item.id}: bài học "${id}" không tồn tại`);
      });
    }
  }
  for (const entry of bundle.errors) {
    if (entry.misconception) needConcept(entry.misconception, `errors/${entry.id}`);
  }
  return problems;
}
```

- [ ] **Step 5: Viết `tools/content/buildBundle.ts`**

```ts
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { load } from "js-yaml";
import type { z } from "zod";
import type { ChoiceQuestion, ContentBundle, ErrorEntry, Exercise, Lesson, Stage, Topic } from "../../src/content/types";
import { LessonFormatError, parseLessonFile } from "./parseLesson";
import { checkReferences } from "./references";
import {
  conceptsFileSchema,
  errorsFileSchema,
  lessonFrontmatterSchema,
  parseExercise,
  parseWith,
  questionsFileSchema,
  stageFileSchema,
  toConcept,
  toErrorEntry,
  toLocalized,
  topicFileSchema,
  type SafeResult,
} from "./schema";

export class ContentError extends Error {
  constructor(readonly problems: string[]) {
    super(`Nội dung có ${problems.length} lỗi:\n${problems.join("\n")}`);
    this.name = "ContentError";
  }
}

class Collector {
  readonly problems: string[] = [];

  constructor(readonly root: string) {}

  exists(rel: string): boolean {
    return existsSync(join(this.root, rel));
  }

  readText(rel: string): string | undefined {
    if (!this.exists(rel)) {
      this.problems.push(`${rel}: không tìm thấy file`);
      return undefined;
    }
    return readFileSync(join(this.root, rel), "utf8");
  }

  readYaml(rel: string): unknown {
    const text = this.readText(rel);
    if (text === undefined) return undefined;
    try {
      return load(text);
    } catch (error) {
      this.problems.push(`${rel}: YAML lỗi: ${(error as Error).message}`);
      return undefined;
    }
  }

  parse<S extends z.ZodType>(schema: S, raw: unknown, where: string): z.infer<S> | undefined {
    const result = parseWith(schema.safeParse(raw) as SafeResult<z.infer<S>>, where);
    if (result.ok) return result.value;
    this.problems.push(...result.issues);
    return undefined;
  }
}

export function buildBundle(contentDir: string): ContentBundle {
  const collector = new Collector(contentDir);
  const stageDirs = readdirSync(contentDir)
    .filter((name) => /^stage-\d+$/.test(name))
    .sort((a, b) => Number(a.slice(6)) - Number(b.slice(6)));
  const stages = stageDirs.map((dir) => buildStage(collector, dir)).filter((s): s is Stage => s !== undefined);

  const errorsFile = "errors/errors.yaml";
  const rawErrors = collector.parse(errorsFileSchema, collector.readYaml(errorsFile), errorsFile);
  const errors: ErrorEntry[] = rawErrors ? rawErrors.map(toErrorEntry) : [];

  const bundle: ContentBundle = { stages, errors };
  const problems = [...collector.problems, ...checkReferences(bundle)];
  if (problems.length > 0) throw new ContentError(problems);
  return bundle;
}

function buildStage(c: Collector, dir: string): Stage | undefined {
  const file = `${dir}/stage.yaml`;
  const raw = c.parse(stageFileSchema, c.readYaml(file), file);
  if (!raw) return undefined;
  const topics = raw.topics.map((name) => buildTopic(c, `${dir}/${name}`)).filter((t): t is Topic => t !== undefined);
  return { id: raw.id, title: toLocalized(raw.title), topics };
}

function buildTopic(c: Collector, dir: string): Topic | undefined {
  const topicFile = `${dir}/topic.yaml`;
  const conceptsFile = `${dir}/concepts.yaml`;
  const raw = c.parse(topicFileSchema, c.readYaml(topicFile), topicFile);
  const rawConcepts = c.parse(conceptsFileSchema, c.readYaml(conceptsFile), conceptsFile);
  if (!raw) return undefined;
  const lessons = raw.lessons.map((name) => buildLesson(c, `${dir}/${name}`)).filter((l): l is Lesson => l !== undefined);
  return {
    id: raw.id,
    title: toLocalized(raw.title),
    lessons,
    concepts: rawConcepts ? rawConcepts.concepts.map(toConcept) : [],
    questions: buildQuestions(c, `${dir}/questions.yaml`),
  };
}

function buildLesson(c: Collector, file: string): Lesson | undefined {
  const text = c.readText(file);
  if (text === undefined) return undefined;
  let parsed: ReturnType<typeof parseLessonFile>;
  try {
    parsed = parseLessonFile(text);
  } catch (error) {
    if (error instanceof LessonFormatError) {
      c.problems.push(`${file}: ${error.message}`);
      return undefined;
    }
    throw error;
  }
  const frontmatter = c.parse(lessonFrontmatterSchema, parsed.frontmatter, file);
  if (!frontmatter) return undefined;
  if (parsed.cards.length === 0) c.problems.push(`${file}: bài học phải có ít nhất 1 thẻ`);
  const exercises: Exercise[] = [];
  frontmatter.exercises.forEach((rawExercise, i) => {
    const result = parseExercise(rawExercise, frontmatter.id, `${file}: exercises.${i}`);
    if (result.ok) exercises.push(result.value);
    else c.problems.push(...result.issues);
  });
  return { id: frontmatter.id, title: toLocalized(frontmatter.title), cards: parsed.cards, exercises };
}

function buildQuestions(c: Collector, file: string): ChoiceQuestion[] {
  if (!c.exists(file)) return [];
  const raw = c.parse(questionsFileSchema, c.readYaml(file), file);
  if (!raw) return [];
  const questions: ChoiceQuestion[] = [];
  raw.questions.forEach((rawQuestion, i) => {
    const where = `${file}: questions.${i}`;
    const result = parseExercise(rawQuestion, null, where);
    if (!result.ok) {
      c.problems.push(...result.issues);
      return;
    }
    if (result.value.type === "code") {
      c.problems.push(`${where}: questions.yaml chỉ chứa câu predict hoặc mcq`);
      return;
    }
    if (result.value.lessons.length === 0) {
      c.problems.push(`${where}: câu hỏi trong ngân hàng phải có lessons`);
      return;
    }
    questions.push(result.value);
  });
  return questions;
}
```

- [ ] **Step 6: Chạy test, xác nhận thành công**

Run: `npx vitest run tools/content`
Expected: PASS toàn bộ. Nếu 1 test về thông báo lỗi bị lệch chữ, chỉ sửa test khi phần mã sinh ra thông báo đã đúng ý (đường dẫn file + vị trí + nội dung).

- [ ] **Step 7: Viết CLI, file từ điển khởi đầu, cập nhật scripts**

`tools/build_content.ts`:

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { buildBundle, ContentError } from "./content/buildBundle";

const [contentDir = "content", outFile = "src/generated/content.json"] = process.argv.slice(2);

try {
  const bundle = buildBundle(contentDir);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, `${JSON.stringify(bundle, null, 2)}\n`);
  const lessons = bundle.stages.reduce((n, s) => n + s.topics.reduce((m, t) => m + t.lessons.length, 0), 0);
  console.log(`Đã build nội dung: ${bundle.stages.length} giai đoạn, ${lessons} bài học, ${bundle.errors.length} mục lỗi -> ${outFile}`);
} catch (error) {
  if (error instanceof ContentError) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}
```

`content/errors/errors.yaml` (bản khởi đầu, Task 10 thay toàn bộ):

```yaml
- id: zero-division
  match: { type: ZeroDivisionError }
  explain:
    vi: "Dòng {line}: không thể chia cho 0."
    en: "Line {line}: you cannot divide by 0."
  sample: "print(5 / 0)"
```

Cập nhật scripts:

```bash
npm pkg set scripts.content:build="tsx tools/build_content.ts content src/generated/content.json"
npm pkg set scripts.dev="npm run pyodide:copy && npm run content:build && vite"
npm pkg set scripts.build="npm run pyodide:copy && npm run content:build && tsc --noEmit && vite build"
npm pkg set scripts.typecheck="npm run content:build && tsc --noEmit"
npm pkg set scripts.test="npm run content:build && vitest run"
```

- [ ] **Step 8: Chạy toàn bộ**

Run: `npm run content:build && cat src/generated/content.json && npm test && npm run typecheck`
Expected: dòng `Đã build nội dung: 0 giai đoạn, 0 bài học, 1 mục lỗi`; file JSON có `"stages": []` và 1 mục lỗi; mọi test PASS.

- [ ] **Step 9: Commit**

```bash
git add tools/content tools/build_content.ts content/errors/errors.yaml package.json
git commit -F - <<'EOF'
feat(content): validate content with zod and build the content bundle

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 5: Script Python kiểm tra nội dung bằng cách chạy code

**Files:**
- Create: `tools/validate_content.py`, `tools/tests/test_validate_content.py`
- Modify: `package.json` (script `content:validate`)

**Interfaces:**
- Consumes: JSON của `ContentBundle` (khóa camelCase như `src/content/types.ts`).
- Produces: `python3 tools/validate_content.py <content.json>` in ra từng lỗi dạng `[<id>] <thông báo>`, thoát mã 1 khi có lỗi, 0 khi hợp lệ. Hàm công khai cho test: `normalize_output`, `outputs_match`, `run_code`, `check_code_exercise`, `check_choice_question`, `check_examples`, `check_error_entries`, `validate_bundle`, `main`. Lệnh `npm run content:validate`.

- [ ] **Step 1: Viết test thất bại**

`tools/tests/test_validate_content.py`:

```python
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import validate_content as vc  # noqa: E402

EXACT = {"kind": "exact"}


def code_exercise(**overrides):
    exercise = {
        "id": "ex",
        "type": "code",
        "concepts": [],
        "prompt": {"vi": "p"},
        "starter": "",
        "solution": "a = int(input())\nprint(a + 1)",
        "tests": [{"input": "1", "output": "2", "hidden": False}, {"input": "9", "output": "10", "hidden": True}],
        "commonWrong": [],
        "hints": [],
        "compare": EXACT,
        "testEligible": False,
    }
    exercise.update(overrides)
    return exercise


def choice(text, correct=False, error=False):
    return {"text": {"vi": text, "en": text}, "correct": correct, "error": error, "misconception": None}


def predict(code, choices):
    return {
        "id": "q",
        "type": "predict",
        "concepts": [],
        "lessons": ["l"],
        "code": code,
        "prompt": {"vi": "?", "en": "?"},
        "choices": choices,
        "explanation": {"vi": ".", "en": "."},
    }


def test_normalize_output_strips_trailing_spaces_and_blank_lines():
    assert vc.normalize_output("a  \r\nb\n\n\n") == ["a", "b"]


def test_normalize_output_uses_nfc():
    assert vc.normalize_output("cha\u0300o") == vc.normalize_output("ch\u00e0o")


def test_outputs_match_float_tolerance():
    compare = {"kind": "float", "tolerance": 0.01}
    assert vc.outputs_match("3.14 x", "3.141 x", compare)
    assert not vc.outputs_match("3.14", "3.2", compare)
    assert not vc.outputs_match("1 2", "1", compare)


def test_run_code_reads_stdin_and_keeps_vietnamese():
    result = vc.run_code("print(input() + ' chào')", "Xin\n")
    assert result.outcome == "ok"
    assert result.stdout == "Xin chào\n"


def test_run_code_reports_error_type():
    result = vc.run_code("print(1)\nprint(x)")
    assert result.outcome == "error"
    assert result.error_type == "NameError"
    assert result.stdout == "1\n"


def test_run_code_reports_timeout(monkeypatch):
    monkeypatch.setattr(vc, "TIMEOUT_SECONDS", 1.0)
    assert vc.run_code("while True:\n    pass").outcome == "timeout"


def test_check_code_exercise_accepts_a_valid_exercise():
    assert vc.check_code_exercise(code_exercise()) == []


def test_check_code_exercise_reports_a_wrong_solution():
    problems = vc.check_code_exercise(code_exercise(solution="print(2)"))
    assert len(problems) == 1
    assert problems[0].startswith("[ex] lời giải mẫu sai ở test 1")


def test_check_code_exercise_reports_a_starter_that_passes():
    exercise = code_exercise(starter="a = int(input())\nprint(a + 1)")
    assert vc.check_code_exercise(exercise) == ["[ex] code starter qua hết test, bài tập không có ý nghĩa"]


def test_check_code_exercise_checks_common_wrong_samples():
    good = {"test": 0, "output": "11", "misconception": "input-str", "sample": "a = input()\nprint(a + '1')"}
    bad = {"test": 0, "output": "99", "misconception": "input-str", "sample": "a = input()\nprint(a + '1')"}
    assert vc.check_code_exercise(code_exercise(commonWrong=[good])) == []
    problems = vc.check_code_exercise(code_exercise(commonWrong=[bad]))
    assert problems == ["[ex] common_wrong 0: code mẫu in ra '11\\n', không phải '99'"]


def test_check_choice_question_accepts_matching_output():
    question = predict("print('A')\nprint('B')", [choice("A\nB", correct=True), choice("AB")])
    assert vc.check_choice_question(question) == []


def test_check_choice_question_reports_a_wrong_answer():
    question = predict("print('A')", [choice("B", correct=True), choice("A")])
    assert vc.check_choice_question(question) == [
        "[q] đầu ra thật là 'A\\n', nhưng không khớp đúng 1 lựa chọn và lựa chọn đó phải là đáp án đúng"
    ]


def test_check_choice_question_requires_error_choice_when_code_fails():
    ok = predict("print(x)", [choice("Lỗi", correct=True, error=True), choice("x")])
    bad = predict("print(x)", [choice("x", correct=True), choice("Lỗi", error=True)])
    assert vc.check_choice_question(ok) == []
    assert vc.check_choice_question(bad) == ["[q] code bị lỗi NameError nhưng đáp án đúng không có error: true"]


def test_check_choice_question_ignores_mcq():
    question = {"id": "m", "type": "mcq", "choices": [choice("a", correct=True), choice("b")]}
    assert vc.check_choice_question(question) == []


def test_check_examples():
    lesson = {
        "id": "l",
        "cards": [
            {
                "segments": [
                    {"kind": "code", "code": "print(1)", "run": True, "expectError": False},
                    {"kind": "code", "code": "print(x)", "run": True, "expectError": False},
                    {"kind": "code", "code": "print(1)", "run": True, "expectError": True},
                    {"kind": "code", "code": "print(x)", "run": False, "expectError": False},
                    {"kind": "html", "html": "<p>a</p>"},
                ]
            }
        ],
    }
    assert vc.check_examples(lesson) == [
        "[l] ví dụ ở thẻ 1 bị lỗi NameError",
        "[l] ví dụ ở thẻ 1 được đánh dấu expect-error nhưng chạy không lỗi",
    ]


def test_check_error_entries(monkeypatch):
    monkeypatch.setattr(vc, "TIMEOUT_SECONDS", 1.0)

    def entry(entry_id, error_type, sample):
        return {"id": entry_id, "match": {"type": error_type}, "sample": sample, "sampleInput": ""}

    entries = [
        entry("zero", "ZeroDivisionError", "print(1 / 0)"),
        entry("wrong", "ZeroDivisionError", "print(1)"),
        entry("slow", "Timeout", "while True:\n    pass"),
        entry("loud", "OutputLimit", "for i in range(30000):\n    print('Robo')"),
        entry("prompt", "InputPrompt", "x = input('a')"),
    ]
    assert vc.check_error_entries(entries) == ["[wrong] code mẫu không sinh lỗi ZeroDivisionError (kết quả: ok)"]


def test_main_exit_codes(tmp_path, capsys):
    good = {"stages": [], "errors": []}
    path = tmp_path / "content.json"
    path.write_text(json.dumps(good), encoding="utf-8")
    assert vc.main(["validate_content.py", str(path)]) == 0
    bad = {
        "stages": [
            {
                "id": "s",
                "topics": [
                    {
                        "id": "t",
                        "lessons": [{"id": "l", "cards": [], "exercises": [code_exercise(solution="print(0)")]}],
                        "questions": [],
                    }
                ],
            }
        ],
        "errors": [],
    }
    path.write_text(json.dumps(bad), encoding="utf-8")
    assert vc.main(["validate_content.py", str(path)]) == 1
    assert "[ex] lời giải mẫu sai" in capsys.readouterr().out
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npm run test:py`
Expected: FAIL với `ModuleNotFoundError: No module named 'validate_content'`.

- [ ] **Step 3: Viết `tools/validate_content.py`**

```python
#!/usr/bin/env python3
"""Run every code sample of the built content bundle with CPython.

Usage: python3 tools/validate_content.py src/generated/content.json
Exit code: 0 when the content is valid, 1 when a problem is found, 2 on bad usage.
The structure, the bilingual fields and the references are checked earlier by
tools/build_content.ts.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import unicodedata
from dataclasses import dataclass

TIMEOUT_SECONDS = 5.0
OUTPUT_LIMIT_CHARS = 100_000
PSEUDO_ERROR_TYPES = {"Timeout", "OutputLimit", "InputPrompt"}

_HARNESS = r"""
import io, json, sys
request = json.loads(sys.stdin.read())
captured = io.StringIO()
real_stdout = sys.stdout
sys.stdin = io.StringIO(request["stdin"])
sys.stdout = captured
result = {"outcome": "ok", "errorType": None}
try:
    exec(compile(request["code"], "<bai-cua-con>", "exec"), {"__name__": "__main__"})
except SystemExit:
    pass
except BaseException as error:
    result["outcome"] = "error"
    result["errorType"] = type(error).__name__
finally:
    sys.stdout = real_stdout
result["stdout"] = captured.getvalue()
print(json.dumps(result))
"""


@dataclass
class RunResult:
    outcome: str
    stdout: str
    error_type: str | None


def run_code(code: str, stdin: str = "") -> RunResult:
    request = json.dumps({"code": code, "stdin": stdin})
    env = dict(os.environ, PYTHONIOENCODING="utf-8")
    try:
        proc = subprocess.run(
            [sys.executable, "-I", "-c", _HARNESS],
            input=request,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=TIMEOUT_SECONDS,
            env=env,
        )
    except subprocess.TimeoutExpired:
        return RunResult("timeout", "", None)
    lines = proc.stdout.strip().splitlines()
    if proc.returncode != 0 or not lines:
        return RunResult("error", "", "HarnessFailure")
    data = json.loads(lines[-1])
    return RunResult(data["outcome"], data["stdout"], data["errorType"])


def normalize_output(text: str) -> list[str]:
    text = unicodedata.normalize("NFC", text.replace("\r\n", "\n"))
    lines = [line.rstrip() for line in text.split("\n")]
    while lines and lines[-1] == "":
        lines.pop()
    return lines


def _is_number(token: str) -> bool:
    try:
        float(token)
    except ValueError:
        return False
    return True


def outputs_match(expected: str, actual: str, compare: dict) -> bool:
    expected_lines, actual_lines = normalize_output(expected), normalize_output(actual)
    if len(expected_lines) != len(actual_lines):
        return False
    if compare["kind"] == "exact":
        return expected_lines == actual_lines
    tolerance = compare["tolerance"]
    for expected_line, actual_line in zip(expected_lines, actual_lines):
        expected_tokens, actual_tokens = expected_line.split(), actual_line.split()
        if len(expected_tokens) != len(actual_tokens):
            return False
        for e, a in zip(expected_tokens, actual_tokens):
            if _is_number(e) and _is_number(a):
                if abs(float(e) - float(a)) > tolerance:
                    return False
            elif e != a:
                return False
    return True


def _describe(result: RunResult) -> str:
    return result.outcome if result.error_type is None else f"{result.outcome} ({result.error_type})"


def check_code_exercise(exercise: dict) -> list[str]:
    ex_id, compare, tests = exercise["id"], exercise["compare"], exercise["tests"]
    problems = []
    for index, test in enumerate(tests):
        result = run_code(exercise["solution"], test["input"])
        if result.outcome != "ok":
            problems.append(f"[{ex_id}] lời giải mẫu bị {_describe(result)} ở test {index}")
        elif not outputs_match(test["output"], result.stdout, compare):
            problems.append(
                f"[{ex_id}] lời giải mẫu sai ở test {index}: mong đợi {test['output']!r}, nhận {result.stdout!r}"
            )
    starter_passes = True
    for test in tests:
        result = run_code(exercise["starter"], test["input"])
        if result.outcome != "ok" or not outputs_match(test["output"], result.stdout, compare):
            starter_passes = False
            break
    if starter_passes:
        problems.append(f"[{ex_id}] code starter qua hết test, bài tập không có ý nghĩa")
    for index, wrong in enumerate(exercise["commonWrong"]):
        test = tests[wrong["test"]]
        result = run_code(wrong["sample"], test["input"])
        if result.outcome != "ok" or normalize_output(result.stdout) != normalize_output(wrong["output"]):
            problems.append(
                f"[{ex_id}] common_wrong {index}: code mẫu in ra {result.stdout!r}, không phải {wrong['output']!r}"
            )
        if outputs_match(test["output"], wrong["output"], compare):
            problems.append(f"[{ex_id}] common_wrong {index}: đầu ra trùng với đáp án đúng")
    return problems


def check_choice_question(question: dict) -> list[str]:
    if question["type"] != "predict":
        return []
    q_id = question["id"]
    result = run_code(question["code"])
    correct = [c for c in question["choices"] if c["correct"]]
    if result.outcome == "timeout":
        return [f"[{q_id}] code chạy quá thời gian"]
    if result.outcome == "error":
        if not correct or not correct[0]["error"]:
            return [f"[{q_id}] code bị lỗi {result.error_type} nhưng đáp án đúng không có error: true"]
        return []
    matching = [
        c
        for c in question["choices"]
        if not c["error"] and normalize_output(c["text"]["vi"]) == normalize_output(result.stdout)
    ]
    if len(matching) != 1 or not matching[0]["correct"]:
        return [
            f"[{q_id}] đầu ra thật là {result.stdout!r}, nhưng không khớp đúng 1 lựa chọn"
            " và lựa chọn đó phải là đáp án đúng"
        ]
    return []


def check_examples(lesson: dict) -> list[str]:
    problems = []
    for card_index, card in enumerate(lesson["cards"], start=1):
        for segment in card["segments"]:
            if segment["kind"] != "code" or not segment["run"]:
                continue
            result = run_code(segment["code"])
            if segment["expectError"] and result.outcome != "error":
                problems.append(
                    f"[{lesson['id']}] ví dụ ở thẻ {card_index} được đánh dấu expect-error nhưng chạy không lỗi"
                )
            elif not segment["expectError"] and result.outcome != "ok":
                reason = f"lỗi {result.error_type}" if result.outcome == "error" else result.outcome
                problems.append(f"[{lesson['id']}] ví dụ ở thẻ {card_index} bị {reason}")
    return problems


def check_error_entries(entries: list[dict]) -> list[str]:
    problems = []
    for entry in entries:
        error_type = entry["match"]["type"]
        if error_type == "InputPrompt":
            continue
        result = run_code(entry["sample"], entry["sampleInput"])
        if error_type == "Timeout":
            if result.outcome != "timeout":
                problems.append(f"[{entry['id']}] code mẫu không chạy quá thời gian (kết quả: {result.outcome})")
        elif error_type == "OutputLimit":
            if result.outcome != "ok" or len(result.stdout) <= OUTPUT_LIMIT_CHARS:
                problems.append(f"[{entry['id']}] code mẫu không in ra quá {OUTPUT_LIMIT_CHARS} ký tự")
        elif result.outcome != "error" or result.error_type != error_type:
            problems.append(f"[{entry['id']}] code mẫu không sinh lỗi {error_type} (kết quả: {_describe(result)})")
    return problems


def _items(bundle: dict):
    for stage in bundle["stages"]:
        for topic in stage["topics"]:
            for lesson in topic["lessons"]:
                yield "lesson", lesson
                for exercise in lesson["exercises"]:
                    yield "item", exercise
            for question in topic["questions"]:
                yield "item", question


def validate_bundle(bundle: dict) -> list[str]:
    problems = []
    for kind, item in _items(bundle):
        if kind == "lesson":
            problems += check_examples(item)
        elif item["type"] == "code":
            problems += check_code_exercise(item)
        else:
            problems += check_choice_question(item)
    problems += check_error_entries(bundle["errors"])
    return problems


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("Cách dùng: python3 tools/validate_content.py <content.json>", file=sys.stderr)
        return 2
    with open(argv[1], encoding="utf-8") as handle:
        bundle = json.load(handle)
    problems = validate_bundle(bundle)
    for problem in problems:
        print(problem)
    if problems:
        print(f"Có {len(problems)} lỗi nội dung.", file=sys.stderr)
        return 1
    print("Nội dung hợp lệ.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npm run test:py`
Expected: PASS toàn bộ (khoảng 17 test; các test timeout mất khoảng 1 giây mỗi test).

- [ ] **Step 5: Thêm script và chạy trên nội dung thật**

```bash
npm pkg set scripts.content:validate="npm run content:build && python3 tools/validate_content.py src/generated/content.json"
npm run content:validate
```

Expected: `Nội dung hợp lệ.` (mới có 1 mục lỗi `zero-division`).

- [ ] **Step 6: Commit**

```bash
git add tools/validate_content.py tools/tests/test_validate_content.py package.json
git commit -F - <<'EOF'
feat(content): run every content code sample with CPython in validate_content.py

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 6: Harness chạy code trên Pyodide

**Files:**
- Create: `src/runner/types.ts`, `src/runner/harness.ts`, `src/runner/pyRun.ts`, `src/test/pyodide.ts`
- Test: `src/runner/pyRun.pyodide.test.ts`

**Interfaces:**
- Consumes: gói `pyodide` (kiểu `PyodideAPI`, hàm `loadPyodide` trong Node).
- Produces:
  - `interface PyErrorInfo { type: string; message: string; line: number | null; column: number | null; lineText: string }`
  - `type RunOutcome = "ok" | "error" | "timeout" | "output-limit"`
  - `interface RunResult { stdout: string; stderr: string; durationMs: number; outcome: RunOutcome; error: PyErrorInfo | null; usedInputPrompt: boolean }`
  - `type RunFn = (code: string, stdin: string, timeoutMs?: number) => Promise<RunResult>`
  - `OUTPUT_LIMIT_CHARS = 100_000`, `DEFAULT_TIMEOUT_MS = 2_000`
  - `HARNESS_PY: string` (định nghĩa hàm Python `run_user_code(code, stdin_text, limit) -> str JSON`)
  - `type PyRunner = (code: string, stdin: string) => RunResult`, `createPyRunner(py: PyodideAPI): PyRunner`, `formatRawError(error: PyErrorInfo): string`
  - Test helper `getPyRunner(): Promise<PyRunner>` (nạp Pyodide 1 lần cho mỗi file test).

- [ ] **Step 1: Viết test thất bại**

`src/test/pyodide.ts`:

```ts
import { loadPyodide } from "pyodide";
import { createPyRunner, type PyRunner } from "../runner/pyRun";

let runner: Promise<PyRunner> | null = null;

/** Loads Pyodide in Node once per test file. */
export function getPyRunner(): Promise<PyRunner> {
  runner ??= loadPyodide().then(createPyRunner);
  return runner;
}
```

`src/runner/pyRun.pyodide.test.ts`:

```ts
import { beforeAll, describe, expect, test } from "vitest";
import { getPyRunner } from "../test/pyodide";
import { formatRawError, type PyRunner } from "./pyRun";
import { OUTPUT_LIMIT_CHARS } from "./types";

let run: PyRunner;

beforeAll(async () => {
  run = await getPyRunner();
});

describe("createPyRunner on real Pyodide", () => {
  test("reads input() lines from stdin", () => {
    expect(run("a = int(input())\nb = int(input())\nprint(a + b)", "2\n3\n")).toMatchObject({
      outcome: "ok",
      stdout: "5\n",
      error: null,
      usedInputPrompt: false,
    });
  });

  test("keeps Vietnamese text", () => {
    expect(run('print("Xin chào Robo")', "").stdout).toBe("Xin chào Robo\n");
  });

  test("reports a runtime error with the line of the user code", () => {
    const result = run('print("x")\nprint(y)', "");
    expect(result.outcome).toBe("error");
    expect(result.stdout).toBe("x\n");
    expect(result.error).toEqual({
      type: "NameError",
      message: "name 'y' is not defined",
      line: 2,
      column: null,
      lineText: "print(y)",
    });
  });

  test("reports a syntax error with its line and column", () => {
    expect(run("if True\n    print(1)", "").error).toEqual({
      type: "SyntaxError",
      message: "expected ':'",
      line: 1,
      column: 8,
      lineText: "if True",
    });
  });

  test("reports IndentationError by its own name", () => {
    expect(run("if True:\nprint(1)", "").error).toMatchObject({ type: "IndentationError", line: 2 });
  });

  test("raises EOFError when the input runs out", () => {
    expect(run("print(input())", "").error).toMatchObject({ type: "EOFError", line: 1 });
  });

  test("each run starts with fresh variables", () => {
    run("x = 1", "");
    expect(run("print(x)", "").error?.type).toBe("NameError");
  });

  test("stops output that is too long, even inside try/except Exception", () => {
    const result = run("try:\n    while True:\n        print('spam')\nexcept Exception:\n    pass", "");
    expect(result.outcome).toBe("output-limit");
    expect(result.stdout.length).toBeLessThanOrEqual(OUTPUT_LIMIT_CHARS);
  });

  test("flags input() with a prompt", () => {
    const result = run('x = input("Nhập: ")\nprint(x)', "5\n");
    expect(result.usedInputPrompt).toBe(true);
    expect(result.stdout).toBe("Nhập: 5\n");
  });

  test("sys.exit() ends the program normally", () => {
    expect(run('import sys\nprint("a")\nsys.exit()\nprint("b")', "")).toMatchObject({ outcome: "ok", stdout: "a\n" });
  });

  test("captures stderr and measures the duration", () => {
    const result = run('import sys\nsys.stderr.write("oops")', "");
    expect(result.stderr).toBe("oops");
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});

describe("formatRawError", () => {
  test("shows the file, the line and the message", () => {
    expect(
      formatRawError({ type: "NameError", message: "name 'y' is not defined", line: 2, column: null, lineText: "print(y)" }),
    ).toBe('File "<bai-cua-con>", line 2\n    print(y)\nNameError: name \'y\' is not defined');
  });

  test("leaves out the location when there is no line", () => {
    expect(formatRawError({ type: "MemoryError", message: "", line: null, column: null, lineText: "" })).toBe(
      "MemoryError: ",
    );
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/runner/pyRun.pyodide.test.ts`
Expected: FAIL vì chưa có `../runner/pyRun` và `./types`.

- [ ] **Step 3: Viết code**

`src/runner/types.ts`:

```ts
export interface PyErrorInfo {
  type: string;
  message: string;
  line: number | null;
  column: number | null;
  lineText: string;
}

export type RunOutcome = "ok" | "error" | "timeout" | "output-limit";

export interface RunResult {
  stdout: string;
  stderr: string;
  durationMs: number;
  outcome: RunOutcome;
  error: PyErrorInfo | null;
  /** True when the code called input() with a non-empty prompt. */
  usedInputPrompt: boolean;
}

export type RunFn = (code: string, stdin: string, timeoutMs?: number) => Promise<RunResult>;

export const OUTPUT_LIMIT_CHARS = 100_000;
export const DEFAULT_TIMEOUT_MS = 2_000;
```

`src/runner/harness.ts`:

```ts
/**
 * Python code installed once in Pyodide. It defines run_user_code(), which runs
 * the child's code in fresh globals and returns a JSON string.
 */
export const HARNESS_PY = String.raw`
import sys, io, json, builtins

class _OutputLimit(BaseException):
    pass

class _Writer(io.TextIOBase):
    def __init__(self, limit):
        self.parts, self.size, self.limit = [], 0, limit
    def writable(self):
        return True
    def write(self, s):
        self.size += len(s)
        if self.size > self.limit:
            raise _OutputLimit()
        self.parts.append(s)
        return len(s)
    def value(self):
        return "".join(self.parts)

def run_user_code(code, stdin_text, limit):
    out, err = _Writer(limit), _Writer(limit)
    saved = (sys.stdin, sys.stdout, sys.stderr, builtins.input)
    used_prompt = [False]
    real_input = builtins.input
    def _input(prompt=""):
        if prompt:
            used_prompt[0] = True
        return real_input(prompt)
    sys.stdin, sys.stdout, sys.stderr = io.StringIO(stdin_text), out, err
    builtins.input = _input
    result = {"outcome": "ok", "error": None}
    try:
        exec(compile(code, "<bai-cua-con>", "exec"), {"__name__": "__main__"})
    except _OutputLimit:
        result["outcome"] = "output-limit"
    except SystemExit:
        pass
    except SyntaxError as e:
        result["outcome"] = "error"
        result["error"] = {"type": type(e).__name__, "message": e.msg, "line": e.lineno, "column": e.offset, "lineText": (e.text or "").rstrip("\n")}
    except BaseException as e:
        tb, line = e.__traceback__, None
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == "<bai-cua-con>":
                line = tb.tb_lineno
            tb = tb.tb_next
        lines = code.splitlines()
        result["outcome"] = "error"
        result["error"] = {"type": type(e).__name__, "message": str(e), "line": line, "column": None, "lineText": lines[line - 1] if line and line <= len(lines) else ""}
    finally:
        sys.stdin, sys.stdout, sys.stderr, builtins.input = saved
    result["stdout"] = out.value()
    result["stderr"] = err.value()
    result["usedInputPrompt"] = used_prompt[0]
    return json.dumps(result)
`;
```

Lưu ý: dùng `String.raw` nên `"\n"` trong chuỗi Python giữ nguyên là 2 ký tự `\` và `n`, đúng như Python cần.

`src/runner/pyRun.ts`:

```ts
import type { PyodideAPI } from "pyodide";
import { HARNESS_PY } from "./harness";
import { OUTPUT_LIMIT_CHARS, type PyErrorInfo, type RunResult } from "./types";

export type PyRunner = (code: string, stdin: string) => RunResult;

interface HarnessJson {
  outcome: "ok" | "error" | "output-limit";
  error: PyErrorInfo | null;
  stdout: string;
  stderr: string;
  usedInputPrompt: boolean;
}

export function createPyRunner(py: PyodideAPI): PyRunner {
  py.runPython(HARNESS_PY);
  const runUserCode = py.globals.get("run_user_code") as unknown as (code: string, stdin: string, limit: number) => string;
  return (code, stdin) => {
    const started = performance.now();
    const json = runUserCode(code, stdin, OUTPUT_LIMIT_CHARS);
    const durationMs = Math.round(performance.now() - started);
    const parsed = JSON.parse(json) as HarnessJson;
    return { ...parsed, durationMs };
  };
}

export function formatRawError(error: PyErrorInfo): string {
  const location = error.line === null ? "" : `File "<bai-cua-con>", line ${error.line}\n    ${error.lineText.trim()}\n`;
  return `${location}${error.type}: ${error.message}`;
}
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/runner/pyRun.pyodide.test.ts && npm run typecheck`
Expected: PASS toàn bộ (nạp Pyodide mất khoảng 1 giây).

- [ ] **Step 5: Commit**

```bash
git add src/runner/types.ts src/runner/harness.ts src/runner/pyRun.ts src/runner/pyRun.pyodide.test.ts src/test/pyodide.ts
git commit -F - <<'EOF'
feat(runner): add the Python harness and run it on Pyodide

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 7: Web Worker và RunnerClient

**Files:**
- Create: `src/runner/protocol.ts`, `src/runner/worker.ts`, `src/runner/client.ts`, `src/runner/browser.ts`, `src/test/fakeWorker.ts`
- Test: `src/runner/client.test.ts`

**Interfaces:**
- Consumes: `RunResult`, `DEFAULT_TIMEOUT_MS` (Task 6), `createPyRunner` (Task 6).
- Produces:
  - `type WorkerRequest = { type: "init"; indexURL: string } | { type: "run"; id: number; code: string; stdin: string }`
  - `type WorkerResponse = { type: "ready" } | { type: "init-failed"; message: string } | { type: "result"; id: number; result: RunResult } | { type: "run-failed"; id: number; message: string }`
  - `type RunnerStatus = "loading" | "ready" | "failed"`, `interface WorkerLike`, `type WorkerFactory = () => WorkerLike`, `class RunnerCrashError extends Error`, `MAX_CONSECUTIVE_CRASHES = 3`
  - `class RunnerClient { constructor(createWorker: WorkerFactory, indexURL: string); get status(): RunnerStatus; subscribe(listener): () => void; run(code, stdin, timeoutMs = 2000): Promise<RunResult>; retry(): void }`. `subscribe` gọi listener ngay với trạng thái hiện tại. Quá thời gian thì trả `outcome: "timeout"` (không ném lỗi) và khởi động Worker mới. Worker sập khi đang chạy thì `run` bị reject với `RunnerCrashError`.
  - `createBrowserRunner(): RunnerClient`
  - Test helper `FakeWorker` với `sent`, `terminated`, `emit(message)`, `crash()`, `lastRun()`.

- [ ] **Step 1: Viết test thất bại**

`src/test/fakeWorker.ts`:

```ts
import type { WorkerLike } from "../runner/client";
import type { WorkerRequest, WorkerResponse } from "../runner/protocol";

type RunRequest = Extract<WorkerRequest, { type: "run" }>;

export class FakeWorker implements WorkerLike {
  onmessage: WorkerLike["onmessage"] = null;
  onerror: WorkerLike["onerror"] = null;
  readonly sent: WorkerRequest[] = [];
  terminated = false;

  postMessage(message: WorkerRequest): void {
    this.sent.push(message);
  }

  terminate(): void {
    this.terminated = true;
  }

  emit(message: WorkerResponse): void {
    this.onmessage?.({ data: message });
  }

  crash(): void {
    this.onerror?.(new Error("worker crashed"));
  }

  lastRun(): RunRequest | undefined {
    return [...this.sent].reverse().find((m): m is RunRequest => m.type === "run");
  }
}
```

`src/runner/client.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { FakeWorker } from "../test/fakeWorker";
import { RunnerClient, RunnerCrashError } from "./client";
import type { RunResult } from "./types";

function setup() {
  const workers: FakeWorker[] = [];
  const client = new RunnerClient(() => {
    const worker = new FakeWorker();
    workers.push(worker);
    return worker;
  }, "http://localhost/pyodide/");
  return { client, workers, current: () => workers[workers.length - 1] as FakeWorker };
}

const flush = async () => {
  for (let i = 0; i < 20; i += 1) await Promise.resolve();
};

const ok = (stdout: string): RunResult => ({
  stdout,
  stderr: "",
  durationMs: 1,
  outcome: "ok",
  error: null,
  usedInputPrompt: false,
});

describe("RunnerClient", () => {
  test("starts a worker and sends init", () => {
    const { client, current } = setup();
    expect(current().sent[0]).toEqual({ type: "init", indexURL: "http://localhost/pyodide/" });
    expect(client.status).toBe("loading");
  });

  test("becomes ready and notifies subscribers", () => {
    const { client, current } = setup();
    const seen: string[] = [];
    client.subscribe((status) => seen.push(status));
    current().emit({ type: "ready" });
    expect(client.status).toBe("ready");
    expect(seen).toEqual(["loading", "ready"]);
  });

  test("a run waits for ready, then resolves with the matching result", async () => {
    const { client, current } = setup();
    const pending = client.run("print(1)", "");
    await flush();
    expect(current().lastRun()).toBeUndefined();
    current().emit({ type: "ready" });
    await flush();
    const request = current().lastRun();
    expect(request).toMatchObject({ type: "run", code: "print(1)", stdin: "" });
    current().emit({ type: "result", id: request!.id, result: ok("1\n") });
    await expect(pending).resolves.toEqual(ok("1\n"));
  });

  test("runs are serialized", async () => {
    const { client, current } = setup();
    current().emit({ type: "ready" });
    const first = client.run("print(1)", "");
    const second = client.run("print(2)", "");
    await flush();
    expect(current().sent.filter((m) => m.type === "run")).toHaveLength(1);
    current().emit({ type: "result", id: current().lastRun()!.id, result: ok("1\n") });
    await expect(first).resolves.toEqual(ok("1\n"));
    await flush();
    expect(current().lastRun()).toMatchObject({ code: "print(2)" });
    current().emit({ type: "result", id: current().lastRun()!.id, result: ok("2\n") });
    await expect(second).resolves.toEqual(ok("2\n"));
  });

  test("ignores a result with an unknown id", async () => {
    const { client, current } = setup();
    current().emit({ type: "ready" });
    const pending = client.run("print(1)", "");
    await flush();
    current().emit({ type: "result", id: 999, result: ok("x") });
    current().emit({ type: "result", id: current().lastRun()!.id, result: ok("1\n") });
    await expect(pending).resolves.toEqual(ok("1\n"));
  });

  test("init failure makes the status failed and runs reject", async () => {
    const { client, current } = setup();
    current().emit({ type: "init-failed", message: "no wasm" });
    expect(client.status).toBe("failed");
    await expect(client.run("print(1)", "")).rejects.toThrow("no wasm");
  });

  test("a crash during a run rejects and restarts the worker", async () => {
    const { client, workers, current } = setup();
    current().emit({ type: "ready" });
    const pending = client.run("print(1)", "");
    await flush();
    current().crash();
    await expect(pending).rejects.toBeInstanceOf(RunnerCrashError);
    expect(workers).toHaveLength(2);
    expect(workers[0]!.terminated).toBe(true);
    expect(client.status).toBe("loading");
  });

  test("3 crashes in a row make the status failed", async () => {
    const { client, workers, current } = setup();
    for (let i = 0; i < 3; i += 1) {
      current().emit({ type: "ready" });
      const pending = client.run("print(1)", "");
      await flush();
      current().crash();
      await expect(pending).rejects.toBeInstanceOf(RunnerCrashError);
    }
    expect(client.status).toBe("failed");
    expect(workers).toHaveLength(3);
    await expect(client.run("print(1)", "")).rejects.toBeInstanceOf(RunnerCrashError);
  });

  test("retry starts a new worker after a failure", () => {
    const { client, workers, current } = setup();
    current().emit({ type: "init-failed", message: "no wasm" });
    client.retry();
    expect(workers).toHaveLength(2);
    expect(client.status).toBe("loading");
    current().emit({ type: "ready" });
    expect(client.status).toBe("ready");
  });

  describe("timeouts", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    test("a run that is too long returns timeout and restarts the worker", async () => {
      const { client, workers, current } = setup();
      current().emit({ type: "ready" });
      const pending = client.run("while True:\n    pass", "", 2000);
      await vi.advanceTimersByTimeAsync(0);
      expect(current().lastRun()).toBeDefined();
      await vi.advanceTimersByTimeAsync(2000);
      await expect(pending).resolves.toEqual({
        stdout: "",
        stderr: "",
        durationMs: 2000,
        outcome: "timeout",
        error: null,
        usedInputPrompt: false,
      });
      expect(workers[0]!.terminated).toBe(true);
      expect(workers).toHaveLength(2);
      expect(workers[1]!.sent[0]).toMatchObject({ type: "init" });
      expect(client.status).toBe("loading");
    });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/runner/client.test.ts`
Expected: FAIL vì chưa có `./client` và `../runner/protocol`.

- [ ] **Step 3: Viết code**

`src/runner/protocol.ts`:

```ts
import type { RunResult } from "./types";

export type WorkerRequest =
  | { type: "init"; indexURL: string }
  | { type: "run"; id: number; code: string; stdin: string };

export type WorkerResponse =
  | { type: "ready" }
  | { type: "init-failed"; message: string }
  | { type: "result"; id: number; result: RunResult }
  | { type: "run-failed"; id: number; message: string };
```

`src/runner/client.ts`:

```ts
import type { WorkerRequest, WorkerResponse } from "./protocol";
import { DEFAULT_TIMEOUT_MS, type RunResult } from "./types";

export type RunnerStatus = "loading" | "ready" | "failed";

export interface WorkerLike {
  postMessage(message: WorkerRequest): void;
  terminate(): void;
  onmessage: ((event: { data: WorkerResponse }) => void) | null;
  onerror: ((event: unknown) => void) | null;
}

export type WorkerFactory = () => WorkerLike;

export class RunnerCrashError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RunnerCrashError";
  }
}

export const MAX_CONSECUTIVE_CRASHES = 3;

interface PendingRun {
  id: number;
  resolve(result: RunResult): void;
  reject(error: Error): void;
  timer: ReturnType<typeof setTimeout>;
}

export class RunnerClient {
  private worker: WorkerLike | null = null;
  private ready: Promise<void> = Promise.resolve();
  private pending: PendingRun | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private nextId = 1;
  private crashes = 0;
  private currentStatus: RunnerStatus = "loading";
  private readonly listeners = new Set<(status: RunnerStatus) => void>();

  constructor(
    private readonly createWorker: WorkerFactory,
    private readonly indexURL: string,
  ) {
    this.start();
  }

  get status(): RunnerStatus {
    return this.currentStatus;
  }

  subscribe(listener: (status: RunnerStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentStatus);
    return () => {
      this.listeners.delete(listener);
    };
  }

  run(code: string, stdin: string, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<RunResult> {
    const task = this.queue.then(() => this.runNow(code, stdin, timeoutMs));
    this.queue = task.catch(() => undefined);
    return task;
  }

  retry(): void {
    this.crashes = 0;
    this.restart();
  }

  private setStatus(status: RunnerStatus): void {
    this.currentStatus = status;
    for (const listener of this.listeners) listener(status);
  }

  private start(): void {
    const worker = this.createWorker();
    this.worker = worker;
    this.setStatus("loading");
    this.ready = new Promise<void>((resolve, reject) => {
      worker.onmessage = (event) => {
        const message = event.data;
        switch (message.type) {
          case "ready":
            this.setStatus("ready");
            resolve();
            break;
          case "init-failed":
            this.setStatus("failed");
            reject(new Error(message.message));
            break;
          case "result":
            this.settle(message.id, (pending) => {
              this.crashes = 0;
              pending.resolve(message.result);
            });
            break;
          case "run-failed":
            this.settle(message.id, (pending) => pending.reject(new RunnerCrashError(message.message)));
            break;
        }
      };
      worker.onerror = () => {
        if (this.currentStatus === "loading") {
          this.setStatus("failed");
          reject(new Error("Pyodide worker failed to start"));
          return;
        }
        this.handleCrash();
      };
    });
    this.ready.catch(() => undefined);
    worker.postMessage({ type: "init", indexURL: this.indexURL });
  }

  private restart(): void {
    this.worker?.terminate();
    this.start();
  }

  private settle(id: number, action: (pending: PendingRun) => void): void {
    const pending = this.pending;
    if (!pending || pending.id !== id) return;
    clearTimeout(pending.timer);
    this.pending = null;
    action(pending);
  }

  private handleCrash(): void {
    const pending = this.pending;
    if (pending) {
      clearTimeout(pending.timer);
      this.pending = null;
      pending.reject(new RunnerCrashError("Pyodide worker crashed"));
    }
    this.crashes += 1;
    if (this.crashes >= MAX_CONSECUTIVE_CRASHES) {
      this.worker?.terminate();
      this.worker = null;
      this.setStatus("failed");
      this.ready = Promise.reject(new RunnerCrashError("Pyodide worker crashed too many times"));
      this.ready.catch(() => undefined);
      return;
    }
    this.restart();
  }

  private async runNow(code: string, stdin: string, timeoutMs: number): Promise<RunResult> {
    await this.ready;
    const worker = this.worker;
    if (!worker) throw new RunnerCrashError("Pyodide worker is not available");
    const id = this.nextId++;
    return new Promise<RunResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending?.id !== id) return;
        this.pending = null;
        this.restart();
        resolve({ stdout: "", stderr: "", durationMs: timeoutMs, outcome: "timeout", error: null, usedInputPrompt: false });
      }, timeoutMs);
      this.pending = { id, resolve, reject, timer };
      worker.postMessage({ type: "run", id, code, stdin });
    });
  }
}
```

`src/runner/worker.ts`:

```ts
import type { PyodideAPI } from "pyodide";
import type { WorkerRequest, WorkerResponse } from "./protocol";
import { createPyRunner, type PyRunner } from "./pyRun";

interface WorkerScope {
  postMessage(message: WorkerResponse): void;
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
}

const scope = self as unknown as WorkerScope;
let runner: PyRunner | null = null;

scope.onmessage = async (event) => {
  const message = event.data;
  if (message.type === "init") {
    try {
      const url = `${message.indexURL}pyodide.mjs`;
      const module = (await import(/* @vite-ignore */ url)) as {
        loadPyodide(options: { indexURL: string }): Promise<PyodideAPI>;
      };
      const py = await module.loadPyodide({ indexURL: message.indexURL });
      runner = createPyRunner(py);
      scope.postMessage({ type: "ready" });
    } catch (error) {
      scope.postMessage({ type: "init-failed", message: String(error) });
    }
    return;
  }
  if (!runner) {
    scope.postMessage({ type: "run-failed", id: message.id, message: "Pyodide is not ready" });
    return;
  }
  scope.postMessage({ type: "result", id: message.id, result: runner(message.code, message.stdin) });
};
```

`src/runner/browser.ts`:

```ts
import { RunnerClient, type WorkerLike } from "./client";

export function createBrowserRunner(): RunnerClient {
  const indexURL = new URL(`${import.meta.env.BASE_URL}pyodide/`, window.location.href).href;
  return new RunnerClient(
    () => new Worker(new URL("./worker.ts", import.meta.url), { type: "module" }) as unknown as WorkerLike,
    indexURL,
  );
}
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/runner/client.test.ts && npm run typecheck`
Expected: PASS toàn bộ. Worker và `browser.ts` được kiểm chứng thật ở test đầu cuối (Task 17).

- [ ] **Step 5: Commit**

```bash
git add src/runner/protocol.ts src/runner/client.ts src/runner/client.test.ts src/runner/worker.ts src/runner/browser.ts src/test/fakeWorker.ts
git commit -F - <<'EOF'
feat(runner): run Pyodide in a Web Worker behind a queued RunnerClient with timeouts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 8: So sánh đầu ra và chấm bài

**Files:**
- Create: `src/runner/compare.ts`, `src/runner/judge.ts`
- Test: `src/runner/compare.test.ts`, `src/runner/judge.test.ts`

**Interfaces:**
- Consumes: `CodeExercise`, `CompareMode` (Task 3); `RunFn`, `RunResult`, `RunOutcome`, `PyErrorInfo` (Task 6).
- Produces:
  - `normalizeOutput(text: string): string[]`, `interface CompareResult { equal: boolean; firstDiffLine: number | null }` (chỉ số dòng tính từ 0), `compareOutput(expected, actual, mode): CompareResult`
  - `type JudgeStatus = "accepted" | "wrong-answer" | "error" | "timeout"`
  - `interface TestOutcome { index: number; passed: boolean; hidden: boolean; ran: boolean; input: string; expected: string; actual: string; firstDiffLine: number | null; outcome: RunOutcome | null; error: PyErrorInfo | null; usedInputPrompt: boolean }`
  - `interface JudgeResult { status: JudgeStatus; passedCount: number; total: number; tests: TestOutcome[]; misconceptions: string[] }`
  - `type ErrorMisconceptionFn = (error: PyErrorInfo, code: string) => string | undefined`
  - `INPUT_PROMPT_MISCONCEPTION = "input-prompt"`
  - `judge(exercise, code, run: RunFn, errorMisconception?: ErrorMisconceptionFn): Promise<JudgeResult>`. Chạy lần lượt từng test; gặp `timeout` thì dừng, các test sau có `ran: false`, `outcome: null`. Thứ tự ưu tiên trạng thái: timeout, rồi error (gồm cả `output-limit`), rồi accepted, cuối cùng wrong-answer.

- [ ] **Step 1: Viết test thất bại**

`src/runner/compare.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { compareOutput, normalizeOutput } from "./compare";

const exact = { kind: "exact" } as const;

describe("normalizeOutput", () => {
  test("drops trailing spaces, trailing blank lines and CRLF", () => {
    expect(normalizeOutput("a  \r\nb\n\n\n")).toEqual(["a", "b"]);
  });
});

describe("compareOutput", () => {
  test("accepts the same text", () => {
    expect(compareOutput("Hi\n", "Hi", exact)).toEqual({ equal: true, firstDiffLine: null });
  });

  test("finds the first different line", () => {
    expect(compareOutput("1\n2\n3", "1\n5\n3", exact)).toEqual({ equal: false, firstDiffLine: 1 });
  });

  test("reports a missing last line", () => {
    expect(compareOutput("1\n2\n3", "1\n2", exact)).toEqual({ equal: false, firstDiffLine: 2 });
  });

  test("keeps leading spaces significant", () => {
    expect(compareOutput("  *", "*", exact).equal).toBe(false);
  });

  test("treats composed and decomposed Vietnamese as equal", () => {
    expect(compareOutput("Xin ch\u00e0o", "Xin cha\u0300o", exact).equal).toBe(true);
  });

  test("compares numbers with a tolerance in float mode", () => {
    const float = { kind: "float", tolerance: 0.01 } as const;
    expect(compareOutput("3.14 cm", "3.141 cm", float).equal).toBe(true);
    expect(compareOutput("3.14", "3.2", float).equal).toBe(false);
    expect(compareOutput("1 2", "1", float).equal).toBe(false);
    expect(compareOutput("abc", "abd", float).equal).toBe(false);
  });
});
```

`src/runner/judge.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import type { CodeExercise } from "../content/types";
import { INPUT_PROMPT_MISCONCEPTION, judge } from "./judge";
import type { RunFn, RunResult } from "./types";

const exercise: CodeExercise = {
  id: "ex",
  type: "code",
  concepts: [],
  prompt: { vi: "Cộng 1" },
  starter: "",
  solution: "print(int(input()) + 1)",
  tests: [
    { input: "1", output: "2", hidden: false },
    { input: "5", output: "6", hidden: true },
  ],
  commonWrong: [{ test: 0, output: "11", misconception: "input-str", sample: "print(input() + '1')" }],
  hints: [],
  compare: { kind: "exact" },
  testEligible: false,
};

const result = (stdout: string, extra: Partial<RunResult> = {}): RunResult => ({
  stdout,
  stderr: "",
  durationMs: 1,
  outcome: "ok",
  error: null,
  usedInputPrompt: false,
  ...extra,
});

function fakeRun(byInput: (stdin: string) => RunResult): RunFn & { calls: string[] } {
  const calls: string[] = [];
  const run = async (_code: string, stdin: string) => {
    calls.push(stdin);
    return byInput(stdin);
  };
  return Object.assign(run, { calls });
}

describe("judge", () => {
  test("accepts when every test matches", async () => {
    const run = fakeRun((stdin) => result(`${Number(stdin) + 1}  \n`));
    const judged = await judge(exercise, "code", run);
    expect(judged.status).toBe("accepted");
    expect(judged.passedCount).toBe(2);
    expect(judged.total).toBe(2);
    expect(judged.misconceptions).toEqual([]);
    expect(judged.tests.map((t) => t.hidden)).toEqual([false, true]);
  });

  test("reports a wrong answer with the first different line", async () => {
    const judged = await judge(exercise, "code", fakeRun(() => result("7\n")));
    expect(judged.status).toBe("wrong-answer");
    expect(judged.passedCount).toBe(0);
    expect(judged.tests[0]).toMatchObject({ passed: false, ran: true, expected: "2", actual: "7\n", firstDiffLine: 0 });
  });

  test("detects a common wrong output only for its own test", async () => {
    const judged = await judge(exercise, "code", fakeRun((stdin) => result(`${stdin}1\n`)));
    expect(judged.misconceptions).toEqual(["input-str"]);
    const onlySecond = await judge(exercise, "code", fakeRun((stdin) => result(stdin === "1" ? "2\n" : "11\n")));
    expect(onlySecond.misconceptions).toEqual([]);
  });

  test("adds the input-prompt misconception", async () => {
    const run = fakeRun((stdin) => result(`Nhập: ${Number(stdin) + 1}\n`, { usedInputPrompt: true }));
    const judged = await judge(exercise, "code", run);
    expect(judged.status).toBe("wrong-answer");
    expect(judged.misconceptions).toEqual([INPUT_PROMPT_MISCONCEPTION]);
  });

  test("reports errors and asks for the error misconception", async () => {
    const error = { type: "NameError", message: "name 'x' is not defined", line: 1, column: null, lineText: "print(x)" };
    const run = fakeRun(() => result("", { outcome: "error", error }));
    const judged = await judge(exercise, "print(x)", run, (e, code) => (e.type === "NameError" && code === "print(x)" ? "string-quotes" : undefined));
    expect(judged.status).toBe("error");
    expect(judged.tests[0]).toMatchObject({ passed: false, outcome: "error", error });
    expect(judged.misconceptions).toEqual(["string-quotes"]);
  });

  test("treats output-limit as an error", async () => {
    const judged = await judge(exercise, "code", fakeRun(() => result("spam", { outcome: "output-limit" })));
    expect(judged.status).toBe("error");
  });

  test("stops after a timeout and marks the other tests as not run", async () => {
    const run = fakeRun(() => result("", { outcome: "timeout" }));
    const judged = await judge(exercise, "code", run);
    expect(judged.status).toBe("timeout");
    expect(run.calls).toEqual(["1"]);
    expect(judged.tests[1]).toMatchObject({ ran: false, passed: false, outcome: null, actual: "" });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/runner/compare.test.ts src/runner/judge.test.ts`
Expected: FAIL vì chưa có `./compare`, `./judge`.

- [ ] **Step 3: Viết code**

`src/runner/compare.ts`:

```ts
import type { CompareMode } from "../content/types";

export interface CompareResult {
  equal: boolean;
  /** 0-based index of the first line that differs, or null when equal. */
  firstDiffLine: number | null;
}

export function normalizeOutput(text: string): string[] {
  const lines = text
    .normalize("NFC")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd());
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function isNumber(token: string): boolean {
  return token !== "" && !Number.isNaN(Number(token));
}

function linesEqual(expected: string | undefined, actual: string | undefined, mode: CompareMode): boolean {
  if (expected === undefined || actual === undefined) return false;
  if (mode.kind === "exact") return expected === actual;
  const expectedTokens = expected.trim().split(/\s+/);
  const actualTokens = actual.trim().split(/\s+/);
  if (expectedTokens.length !== actualTokens.length) return false;
  return expectedTokens.every((token, i) => {
    const other = actualTokens[i] as string;
    if (isNumber(token) && isNumber(other)) return Math.abs(Number(token) - Number(other)) <= mode.tolerance;
    return token === other;
  });
}

export function compareOutput(expected: string, actual: string, mode: CompareMode): CompareResult {
  const expectedLines = normalizeOutput(expected);
  const actualLines = normalizeOutput(actual);
  const count = Math.max(expectedLines.length, actualLines.length);
  for (let i = 0; i < count; i += 1) {
    if (!linesEqual(expectedLines[i], actualLines[i], mode)) return { equal: false, firstDiffLine: i };
  }
  return { equal: true, firstDiffLine: null };
}
```

`src/runner/judge.ts`:

```ts
import type { CodeExercise } from "../content/types";
import { compareOutput } from "./compare";
import type { PyErrorInfo, RunFn, RunOutcome } from "./types";

export type JudgeStatus = "accepted" | "wrong-answer" | "error" | "timeout";

export interface TestOutcome {
  index: number;
  passed: boolean;
  hidden: boolean;
  ran: boolean;
  input: string;
  expected: string;
  actual: string;
  firstDiffLine: number | null;
  outcome: RunOutcome | null;
  error: PyErrorInfo | null;
  usedInputPrompt: boolean;
}

export interface JudgeResult {
  status: JudgeStatus;
  passedCount: number;
  total: number;
  tests: TestOutcome[];
  misconceptions: string[];
}

export type ErrorMisconceptionFn = (error: PyErrorInfo, code: string) => string | undefined;

export const INPUT_PROMPT_MISCONCEPTION = "input-prompt";

export async function judge(
  exercise: CodeExercise,
  code: string,
  run: RunFn,
  errorMisconception: ErrorMisconceptionFn = () => undefined,
): Promise<JudgeResult> {
  const tests: TestOutcome[] = [];
  let stopped = false;
  for (const [index, testCase] of exercise.tests.entries()) {
    const base = { index, hidden: testCase.hidden, input: testCase.input, expected: testCase.output };
    if (stopped) {
      tests.push({ ...base, passed: false, ran: false, actual: "", firstDiffLine: null, outcome: null, error: null, usedInputPrompt: false });
      continue;
    }
    const result = await run(code, testCase.input);
    const comparison =
      result.outcome === "ok"
        ? compareOutput(testCase.output, result.stdout, exercise.compare)
        : { equal: false, firstDiffLine: null };
    tests.push({
      ...base,
      passed: comparison.equal,
      ran: true,
      actual: result.stdout,
      firstDiffLine: comparison.firstDiffLine,
      outcome: result.outcome,
      error: result.error,
      usedInputPrompt: result.usedInputPrompt,
    });
    if (result.outcome === "timeout") stopped = true;
  }

  const passedCount = tests.filter((t) => t.passed).length;
  let status: JudgeStatus = "wrong-answer";
  if (tests.some((t) => t.outcome === "timeout")) status = "timeout";
  else if (tests.some((t) => t.outcome === "error" || t.outcome === "output-limit")) status = "error";
  else if (passedCount === tests.length) status = "accepted";

  return {
    status,
    passedCount,
    total: tests.length,
    tests,
    misconceptions: collectMisconceptions(exercise, code, tests, errorMisconception),
  };
}

function collectMisconceptions(
  exercise: CodeExercise,
  code: string,
  tests: TestOutcome[],
  errorMisconception: ErrorMisconceptionFn,
): string[] {
  const found = new Set<string>();
  for (const test of tests) {
    if (!test.ran || test.passed) continue;
    if (test.outcome === "ok") {
      for (const wrong of exercise.commonWrong) {
        if (wrong.test === test.index && compareOutput(wrong.output, test.actual, { kind: "exact" }).equal) {
          found.add(wrong.misconception);
        }
      }
      if (test.usedInputPrompt) found.add(INPUT_PROMPT_MISCONCEPTION);
    } else if (test.error) {
      const misconception = errorMisconception(test.error, code);
      if (misconception) found.add(misconception);
    }
  }
  return [...found];
}
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/runner && npm run typecheck`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add src/runner/compare.ts src/runner/compare.test.ts src/runner/judge.ts src/runner/judge.test.ts
git commit -F - <<'EOF'
feat(runner): compare outputs and judge code exercises against test cases

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 9: Giải thích lỗi (bộ so khớp từ điển và provider)

**Files:**
- Create: `src/explain/types.ts`, `src/explain/problem.ts`, `src/explain/checks.ts`, `src/explain/match.ts`, `src/explain/providers.ts`
- Test: `src/explain/explain.test.ts`

**Interfaces:**
- Consumes: `ErrorEntry`, `CheckName`, `CodeExercise`, `Lang` (Task 3); `PyErrorInfo`, `RunOutcome` (Task 6); `TestOutcome`, `ErrorMisconceptionFn` (Task 8).
- Produces:
  - `interface ExplainContext { error: PyErrorInfo; code: string; lang: Lang; exercise?: CodeExercise; failedTest?: TestOutcome; recentMisconceptions?: string[] }`
  - `interface Explanation { text: string; hint: string | null; entryId: string | null; misconception: string | null }`
  - `interface ExplainProvider { explain(context: ExplainContext): Promise<Explanation | null> }`
  - `PSEUDO_ERROR_TYPES = ["Timeout", "OutputLimit", "InputPrompt"]`, `isPseudoError(type): boolean`
  - `problemFromOutcome(o: { outcome: RunOutcome | null; error: PyErrorInfo | null; usedInputPrompt: boolean }, judgedWrong: boolean): PyErrorInfo | null`
  - `levenshtein(a, b): number`, `findSimilarName(name, code): string | null`, `checks: Record<CheckName, (input: CheckInput) => CheckResult>`
  - `interface ErrorMatch { entry: ErrorEntry; vars: Record<string, string> }`, `matchError(entries, error, code): ErrorMatch | null`, `renderTemplate(template, vars): string`
  - `class DictionaryProvider implements ExplainProvider`, `explainWithChain(providers, context): Promise<Explanation | null>`, `errorMisconceptionFrom(entries): ErrorMisconceptionFn`
  - Biến luôn có sẵn khi render: `line` (số dòng hoặc `?`), `type`, `message`, cộng các nhóm có tên của biểu thức chính quy, cộng biến do `check` thêm vào (`suggestion`).

- [ ] **Step 1: Viết test thất bại**

`src/explain/explain.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import type { ErrorEntry } from "../content/types";
import type { PyErrorInfo } from "../runner/types";
import { findSimilarName, levenshtein } from "./checks";
import { matchError, renderTemplate } from "./match";
import { isPseudoError, problemFromOutcome } from "./problem";
import { DictionaryProvider, errorMisconceptionFrom, explainWithChain } from "./providers";
import type { ExplainProvider } from "./types";

function entry(id: string, type: string, extra: Partial<ErrorEntry> = {}): ErrorEntry {
  return {
    id,
    match: { type, message: null, check: null },
    explain: { vi: `vi ${id}: dòng {line}`, en: `en ${id}: line {line}` },
    hint: null,
    misconception: null,
    sample: "",
    sampleInput: "",
    ...extra,
  };
}

function error(type: string, message = "", line: number | null = 1, lineText = ""): PyErrorInfo {
  return { type, message, line, column: null, lineText };
}

const NAME_MESSAGE = "^name '(?<name>\\w+)' is not defined$";
const entries: ErrorEntry[] = [
  entry("name-similar", "NameError", {
    match: { type: "NameError", message: NAME_MESSAGE, check: "similar-name" },
    explain: { vi: 'Dòng {line}: "{name}" hay "{suggestion}"?', en: 'Line {line}: "{name}" or "{suggestion}"?' },
    misconception: "case-sensitive",
  }),
  entry("name-undefined", "NameError", {
    match: { type: "NameError", message: NAME_MESSAGE, check: null },
    misconception: "string-quotes",
  }),
  entry("smart-quote", "SyntaxError", {
    match: { type: "SyntaxError", message: "^invalid character '(?<char>.)' \\(U\\+(?<code>[0-9A-F]+)\\)$", check: null },
    explain: { vi: "Ký tự lạ {char} ({code})", en: "Strange character {char} ({code})" },
  }),
  entry("assign-in-condition", "SyntaxError", {
    match: { type: "SyntaxError", message: "Maybe you meant '=='", check: "assign-in-condition" },
  }),
  entry("syntax-other", "SyntaxError"),
  entry("timeout-while", "Timeout", { match: { type: "Timeout", message: null, check: "while-loop" } }),
  entry("timeout", "Timeout"),
];

describe("checks", () => {
  test("levenshtein", () => {
    expect(levenshtein("prnt", "print")).toBe(1);
    expect(levenshtein("abc", "abc")).toBe(0);
    expect(levenshtein("", "ab")).toBe(2);
  });

  test("findSimilarName finds case mistakes, typos and known names", () => {
    expect(findSimilarName("Print", "Print('hi')")).toBe("print");
    expect(findSimilarName("prnt", "prnt(1)")).toBe("print");
    expect(findSimilarName("tuoii", "tuoi = 11\nprint(tuoii)")).toBe("tuoi");
  });

  test("findSimilarName ignores far names, other first letters and words inside strings", () => {
    expect(findSimilarName("Robo", "print(Robo)")).toBeNull();
    expect(findSimilarName("Xin", "print(Xin)")).toBeNull();
    expect(findSimilarName("tuoii", 'print("tuoi")\nprint(tuoii)')).toBeNull();
  });
});

describe("matchError", () => {
  test("uses the first matching entry and fills the variables", () => {
    const match = matchError(entries, error("NameError", "name 'Print' is not defined", 3), "Print('hi')");
    expect(match?.entry.id).toBe("name-similar");
    expect(match?.vars).toMatchObject({ line: "3", name: "Print", suggestion: "print" });
  });

  test("falls through when a check fails", () => {
    expect(matchError(entries, error("NameError", "name 'Robo' is not defined"), "print(Robo)")?.entry.id).toBe(
      "name-undefined",
    );
  });

  test("matches the smart quote entry with its captured character", () => {
    const match = matchError(entries, error("SyntaxError", "invalid character '\u201c' (U+201C)"), "print(\u201chi\u201d)");
    expect(match?.entry.id).toBe("smart-quote");
    expect(match?.vars).toMatchObject({ char: "\u201c", code: "201C" });
  });

  test("assign-in-condition needs a condition line", () => {
    const message = "invalid syntax. Maybe you meant '==' or ':=' instead of '='?";
    expect(matchError(entries, error("SyntaxError", message, 2, "if x = 5:"), "")?.entry.id).toBe("assign-in-condition");
    expect(matchError(entries, error("SyntaxError", message, 2, "print(x = 5)"), "")?.entry.id).toBe("syntax-other");
  });

  test("while-loop check for timeouts", () => {
    expect(matchError(entries, error("Timeout", "", null), "while True:\n    pass")?.entry.id).toBe("timeout-while");
    expect(matchError(entries, error("Timeout", "", null), "for i in range(10**12):\n    pass")?.entry.id).toBe("timeout");
  });

  test("returns null when no entry matches", () => {
    expect(matchError(entries, error("KeyError", "'a'"), "")).toBeNull();
  });

  test("renderTemplate keeps unknown variables", () => {
    expect(renderTemplate("{a} và {b}", { a: "1" })).toBe("1 và {b}");
  });
});

describe("problemFromOutcome", () => {
  const pyError = error("NameError", "x");

  test("returns the Python error", () => {
    expect(problemFromOutcome({ outcome: "error", error: pyError, usedInputPrompt: false }, false)).toBe(pyError);
  });

  test("turns timeout and output-limit into pseudo errors", () => {
    expect(problemFromOutcome({ outcome: "timeout", error: null, usedInputPrompt: false }, false)?.type).toBe("Timeout");
    expect(problemFromOutcome({ outcome: "output-limit", error: null, usedInputPrompt: false }, false)?.type).toBe(
      "OutputLimit",
    );
  });

  test("problemFromOutcome returns InputPrompt only when judged wrong", () => {
    expect(problemFromOutcome({ outcome: "ok", error: null, usedInputPrompt: true }, true)?.type).toBe("InputPrompt");
    expect(problemFromOutcome({ outcome: "ok", error: null, usedInputPrompt: true }, false)).toBeNull();
    expect(problemFromOutcome({ outcome: "ok", error: null, usedInputPrompt: false }, true)).toBeNull();
    expect(problemFromOutcome({ outcome: null, error: null, usedInputPrompt: false }, true)).toBeNull();
  });

  test("isPseudoError", () => {
    expect(isPseudoError("Timeout")).toBe(true);
    expect(isPseudoError("NameError")).toBe(false);
  });
});

describe("providers", () => {
  test("DictionaryProvider explains in the requested language", async () => {
    const provider = new DictionaryProvider(entries);
    const context = { error: error("NameError", "name 'Robo' is not defined", 4), code: "print(Robo)" };
    expect(await provider.explain({ ...context, lang: "vi" })).toEqual({
      text: "vi name-undefined: dòng 4",
      hint: null,
      entryId: "name-undefined",
      misconception: "string-quotes",
    });
    expect((await provider.explain({ ...context, lang: "en" }))?.text).toBe("en name-undefined: line 4");
  });

  test("DictionaryProvider renders the hint", async () => {
    const withHint = [entry("zero", "ZeroDivisionError", { hint: { vi: "Gợi ý dòng {line}", en: "Hint line {line}" } })];
    const result = await new DictionaryProvider(withHint).explain({ error: error("ZeroDivisionError", "division by zero", 2), code: "", lang: "vi" });
    expect(result?.hint).toBe("Gợi ý dòng 2");
  });

  test("explainWithChain uses the first provider that answers", async () => {
    const silent: ExplainProvider = { explain: async () => null };
    const loud: ExplainProvider = { explain: async () => ({ text: "AI", hint: null, entryId: null, misconception: null }) };
    const context = { error: error("KeyError", "'a'"), code: "", lang: "vi" as const };
    expect(await explainWithChain([new DictionaryProvider(entries), silent, loud], context)).toMatchObject({ text: "AI" });
    expect(await explainWithChain([silent], context)).toBeNull();
  });

  test("errorMisconceptionFrom", () => {
    const find = errorMisconceptionFrom(entries);
    expect(find(error("NameError", "name 'Print' is not defined"), "Print(1)")).toBe("case-sensitive");
    expect(find(error("KeyError", "'a'"), "")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/explain`
Expected: FAIL vì chưa có các module trong `src/explain`.

- [ ] **Step 3: Viết code**

`src/explain/types.ts`:

```ts
import type { CodeExercise, Lang } from "../content/types";
import type { TestOutcome } from "../runner/judge";
import type { PyErrorInfo } from "../runner/types";

export interface ExplainContext {
  error: PyErrorInfo;
  code: string;
  lang: Lang;
  exercise?: CodeExercise;
  failedTest?: TestOutcome;
  recentMisconceptions?: string[];
}

export interface Explanation {
  text: string;
  hint: string | null;
  entryId: string | null;
  misconception: string | null;
}

export interface ExplainProvider {
  explain(context: ExplainContext): Promise<Explanation | null>;
}
```

`src/explain/problem.ts`:

```ts
import type { PyErrorInfo, RunOutcome } from "../runner/types";

export const PSEUDO_ERROR_TYPES = ["Timeout", "OutputLimit", "InputPrompt"] as const;

export function isPseudoError(type: string): boolean {
  return (PSEUDO_ERROR_TYPES as readonly string[]).includes(type);
}

function pseudo(type: (typeof PSEUDO_ERROR_TYPES)[number]): PyErrorInfo {
  return { type, message: "", line: null, column: null, lineText: "" };
}

/** The problem to explain for 1 run, or null when there is nothing to explain. */
export function problemFromOutcome(
  outcome: { outcome: RunOutcome | null; error: PyErrorInfo | null; usedInputPrompt: boolean },
  judgedWrong: boolean,
): PyErrorInfo | null {
  switch (outcome.outcome) {
    case "error":
      return outcome.error;
    case "timeout":
      return pseudo("Timeout");
    case "output-limit":
      return pseudo("OutputLimit");
    case "ok":
      return judgedWrong && outcome.usedInputPrompt ? pseudo("InputPrompt") : null;
    default:
      return null;
  }
}
```

`src/explain/checks.ts`:

```ts
import type { CheckName } from "../content/types";
import type { PyErrorInfo } from "../runner/types";

export interface CheckInput {
  error: PyErrorInfo;
  code: string;
  vars: Record<string, string>;
}

export type CheckResult = { ok: true; vars: Record<string, string> } | { ok: false };

const KNOWN_NAMES = [
  "print", "input", "int", "float", "str", "len", "range", "round", "abs", "max", "min", "sum",
  "list", "dict", "bool", "type", "True", "False", "None",
];

export function levenshtein(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min((previous[j] as number) + 1, (current[j - 1] as number) + 1, (previous[j - 1] as number) + cost);
    }
    previous = current;
  }
  return previous[b.length] as number;
}

function stripStringsAndComments(code: string): string {
  return code
    .replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/g, '""')
    .replace(/#.*$/gm, "");
}

/** A known or used name that looks like `name`: same letters in another case, or a small typo. */
export function findSimilarName(name: string, code: string): string | null {
  const used = stripStringsAndComments(code).match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [];
  const candidates = new Set<string>([...KNOWN_NAMES, ...used]);
  candidates.delete(name);
  const lower = name.toLowerCase();
  for (const candidate of candidates) {
    if (candidate.toLowerCase() === lower) return candidate;
  }
  const maxDistance = name.length <= 4 ? 1 : 2;
  let best: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    if (candidate[0]?.toLowerCase() !== lower[0]) continue;
    const distance = levenshtein(lower, candidate.toLowerCase());
    if (distance <= maxDistance && distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

export const checks: Record<CheckName, (input: CheckInput) => CheckResult> = {
  "similar-name": ({ code, vars }) => {
    const name = vars.name;
    if (!name) return { ok: false };
    const suggestion = findSimilarName(name, code);
    return suggestion ? { ok: true, vars: { ...vars, suggestion } } : { ok: false };
  },
  "assign-in-condition": ({ error, vars }) =>
    /^\s*(if|elif|while)\b/.test(error.lineText) ? { ok: true, vars } : { ok: false },
  "while-loop": ({ code, vars }) => (/^\s*while\b/m.test(code) ? { ok: true, vars } : { ok: false }),
};
```

`src/explain/match.ts`:

```ts
import type { ErrorEntry } from "../content/types";
import type { PyErrorInfo } from "../runner/types";
import { checks } from "./checks";

export interface ErrorMatch {
  entry: ErrorEntry;
  vars: Record<string, string>;
}

/** Entries are tried in file order; the first one that matches wins. */
export function matchError(entries: ErrorEntry[], error: PyErrorInfo, code: string): ErrorMatch | null {
  for (const entry of entries) {
    if (entry.match.type !== error.type) continue;
    let vars: Record<string, string> = {
      line: error.line === null ? "?" : String(error.line),
      type: error.type,
      message: error.message,
    };
    if (entry.match.message !== null) {
      const found = new RegExp(entry.match.message).exec(error.message);
      if (!found) continue;
      for (const [key, value] of Object.entries(found.groups ?? {})) {
        if (value !== undefined) vars[key] = value;
      }
    }
    if (entry.match.check !== null) {
      const result = checks[entry.match.check]({ error, code, vars });
      if (!result.ok) continue;
      vars = result.vars;
    }
    return { entry, vars };
  }
  return null;
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => vars[name] ?? whole);
}
```

`src/explain/providers.ts`:

```ts
import type { ErrorEntry } from "../content/types";
import type { ErrorMisconceptionFn } from "../runner/judge";
import { matchError, renderTemplate } from "./match";
import type { ExplainContext, Explanation, ExplainProvider } from "./types";

export class DictionaryProvider implements ExplainProvider {
  constructor(private readonly entries: ErrorEntry[]) {}

  async explain(context: ExplainContext): Promise<Explanation | null> {
    const match = matchError(this.entries, context.error, context.code);
    if (!match) return null;
    const { entry, vars } = match;
    return {
      text: renderTemplate(entry.explain[context.lang], vars),
      hint: entry.hint ? renderTemplate(entry.hint[context.lang], vars) : null,
      entryId: entry.id,
      misconception: entry.misconception,
    };
  }
}

export async function explainWithChain(providers: ExplainProvider[], context: ExplainContext): Promise<Explanation | null> {
  for (const provider of providers) {
    const explanation = await provider.explain(context);
    if (explanation) return explanation;
  }
  return null;
}

export function errorMisconceptionFrom(entries: ErrorEntry[]): ErrorMisconceptionFn {
  return (error, code) => matchError(entries, error, code)?.entry.misconception ?? undefined;
}
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/explain && npm run typecheck`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add src/explain
git commit -F - <<'EOF'
feat(explain): match Python errors against the dictionary and explain them in vi/en

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 10: Nội dung từ điển lỗi và test đối chiếu trên Pyodide

**Files:**
- Modify: `content/errors/errors.yaml` (thay toàn bộ)
- Create: `src/content/parity.pyodide.test.ts`

**Interfaces:**
- Consumes: `buildBundle` qua `npm run content:build` (Task 4); `validate_content.py` (Task 5); `getPyRunner` (Task 6); `matchError`, `problemFromOutcome` (Task 9).
- Produces: 27 mục từ điển lỗi theo thứ tự ưu tiên (mục cụ thể trước mục chung cùng loại). Trường `misconception` được thêm ở Task 16, khi đã có `concepts.yaml`. Test đối chiếu: mỗi `sample` chạy trên Pyodide phải được chính mục đó nhận diện.

- [ ] **Step 1: Viết test thất bại**

`src/content/parity.pyodide.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, test } from "vitest";
import { matchError } from "../explain/match";
import { problemFromOutcome } from "../explain/problem";
import type { PyRunner } from "../runner/pyRun";
import { getPyRunner } from "../test/pyodide";
import type { ContentBundle } from "./types";

const bundle = JSON.parse(readFileSync("src/generated/content.json", "utf8")) as ContentBundle;

let run: PyRunner;

beforeAll(async () => {
  run = await getPyRunner();
});

describe("error dictionary on Pyodide", () => {
  test("has the expected number of entries", () => {
    expect(bundle.errors.length).toBe(27);
  });

  for (const entry of bundle.errors) {
    test(`${entry.id}: the sample is recognized by its own entry`, () => {
      if (entry.match.type === "Timeout") {
        const timeout = { type: "Timeout", message: "", line: null, column: null, lineText: "" };
        expect(matchError(bundle.errors, timeout, entry.sample)?.entry.id).toBe(entry.id);
        return;
      }
      const result = run(entry.sample, entry.sampleInput);
      const problem = problemFromOutcome(result, entry.match.type === "InputPrompt");
      expect(problem?.type).toBe(entry.match.type);
      expect(matchError(bundle.errors, problem!, entry.sample)?.entry.id).toBe(entry.id);
    });
  }
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npm test -- src/content/parity.pyodide.test.ts`
Expected: FAIL ở test `has the expected number of entries` (mới có 1 mục).

- [ ] **Step 3: Viết toàn bộ `content/errors/errors.yaml`**

```yaml
# Thứ tự trong file là độ ưu tiên: mục cụ thể đặt trước mục chung của cùng loại lỗi.
# Biểu thức chính quy dùng cú pháp JavaScript: nhóm có tên là (?<ten>...).
# Biến dùng được trong explain/hint: {line}, {type}, {message}, các nhóm có tên, và {suggestion} (check similar-name).

- id: missing-colon
  match: { type: SyntaxError, message: "^expected ':'$" }
  explain:
    vi: "Dòng {line}: thiếu dấu hai chấm (:) ở cuối dòng. Sau if, elif, else, for và while luôn phải có dấu hai chấm."
    en: "Line {line}: a colon (:) is missing at the end of the line. Put a colon after if, elif, else, for and while."
  hint:
    vi: "Thêm dấu : vào cuối dòng {line}."
    en: "Add : at the end of line {line}."
  sample: "if True\n    print(1)"

- id: indent-expected
  match: { type: IndentationError, message: "^expected an indented block after .+ on line (?<header>\\d+)$" }
  explain:
    vi: "Dòng {line}: dòng này phải thụt lề vào 4 dấu cách, vì nó nằm trong khối lệnh của dòng {header}."
    en: "Line {line}: indent this line by 4 spaces. It is inside the block of line {header}."
  sample: "if True:\nprint(1)"

- id: indent-unexpected
  match: { type: IndentationError, message: "^unexpected indent$" }
  explain:
    vi: "Dòng {line} bị thụt lề thừa. Dòng này không nằm trong khối lệnh nào, nên phải viết sát lề trái."
    en: "Line {line} has extra indentation. This line is not inside a block, so start it at the left edge."
  sample: "print(1)\n    print(2)"

- id: indent-unmatched
  match: { type: IndentationError, message: "^unindent does not match any outer indentation level$" }
  explain:
    vi: "Dòng {line}: thụt lề không khớp với các dòng phía trên. Mỗi mức thụt lề nên dùng đúng 4 dấu cách."
    en: "Line {line}: the indentation does not match the lines above. Use exactly 4 spaces for each level."
  sample: "if True:\n        print(1)\n    print(2)"

- id: unterminated-string
  match: { type: SyntaxError, message: "^unterminated (triple-quoted )?string literal" }
  explain:
    vi: "Dòng {line}: chuỗi chưa có dấu nháy đóng. Mở chuỗi bằng dấu nháy nào thì phải đóng bằng đúng dấu nháy đó."
    en: "Line {line}: the string has no closing quote. Close the string with the same quote that opens it."
  hint:
    vi: "Ví dụ đúng: print(\"Xin chào\")"
    en: "Correct example: print(\"Hello\")"
  sample: "print(\"Xin chào)"

- id: smart-quote
  match: { type: SyntaxError, message: "^invalid character '(?<char>.)' \\(U\\+(?<code>[0-9A-F]+)\\)$" }
  explain:
    vi: "Dòng {line}: có ký tự lạ {char}. Có thể con đã dán dấu nháy cong từ Word hoặc trang web. Hãy xóa và gõ lại dấu nháy thẳng \" bằng bàn phím."
    en: "Line {line}: the character {char} is not allowed. Maybe you pasted a curly quote from Word or a web page. Delete it and type a straight quote \" with the keyboard."
  sample: "print(“Xin chào”)"

- id: paren-never-closed
  match: { type: SyntaxError, message: "^'(?<paren>[(\\[{])' was never closed$" }
  explain:
    vi: "Dòng {line}: dấu {paren} đã mở nhưng chưa được đóng."
    en: "Line {line}: the bracket {paren} opens but does not close."
  sample: "print(\"Robo\""

- id: paren-unmatched
  match: { type: SyntaxError, message: "^unmatched '(?<paren>[)\\]}])'$" }
  explain:
    vi: "Dòng {line}: thừa dấu {paren}, không có dấu mở tương ứng."
    en: "Line {line}: there is an extra {paren} with no opening bracket."
  sample: "print(\"Robo\"))"

- id: print-no-paren
  match: { type: SyntaxError, message: "^Missing parentheses in call to 'print'" }
  explain:
    vi: "Dòng {line}: lệnh print cần dấu ngoặc tròn, ví dụ print(\"Robo\")."
    en: "Line {line}: print needs round brackets, for example print(\"Robo\")."
  sample: "print \"Robo\""

- id: assign-in-condition
  match: { type: SyntaxError, message: "Maybe you meant '==' or ':=' instead of '='", check: assign-in-condition }
  explain:
    vi: "Dòng {line}: trong điều kiện, so sánh bằng phải viết == (2 dấu bằng). Một dấu = dùng để gán giá trị."
    en: "Line {line}: in a condition, write == (2 equal signs) to compare. One = gives a value to a variable."
  sample: "x = 5\nif x = 5:\n    print(x)"

- id: missing-comma
  match: { type: SyntaxError, message: "Perhaps you forgot a comma\\?" }
  explain:
    vi: "Dòng {line}: có thể con quên dấu phẩy giữa các giá trị."
    en: "Line {line}: maybe a comma is missing between the values."
  sample: "print(\"a\" \"b\" 1)"

- id: invalid-decimal
  match: { type: SyntaxError, message: "^invalid decimal literal$" }
  explain:
    vi: "Dòng {line}: số và chữ bị viết liền nhau. Tên biến không được bắt đầu bằng số, còn phép nhân phải có dấu *, ví dụ 2*y."
    en: "Line {line}: a number and letters are written together. A variable name cannot start with a number, and multiplication needs *, for example 2*y."
  sample: "x = 2y"

- id: syntax-other
  match: { type: SyntaxError }
  explain:
    vi: "Dòng {line}: Python không hiểu cách viết ở dòng này. Hãy kiểm tra dấu ngoặc, dấu nháy và dấu hai chấm."
    en: "Line {line}: Python does not understand this line. Check the brackets, the quotes and the colons."
  sample: "class = 1"

- id: name-similar
  match: { type: NameError, message: "^name '(?<name>\\w+)' is not defined$", check: similar-name }
  explain:
    vi: "Dòng {line}: Python không biết \"{name}\" là gì. Có phải con muốn viết \"{suggestion}\" không?"
    en: "Line {line}: Python does not know \"{name}\". Did you mean \"{suggestion}\"?"
  hint:
    vi: "Python phân biệt chữ hoa và chữ thường: print khác Print."
    en: "Python sees upper-case and lower-case letters as different: print is not Print."
  sample: "Print(\"Robo\")"

- id: name-undefined
  match: { type: NameError, message: "^name '(?<name>\\w+)' is not defined$" }
  explain:
    vi: "Dòng {line}: Python không biết \"{name}\" là gì. Nếu là chữ cần in ra, hãy đặt trong dấu nháy: \"{name}\". Nếu là biến, con cần gán giá trị cho nó trước khi dùng."
    en: "Line {line}: Python does not know \"{name}\". If it is text to print, put it in quotes: \"{name}\". If it is a variable, give it a value before you use it."
  sample: "print(Robo)"

- id: concat-str
  match: { type: TypeError, message: "^can only concatenate str \\(not \"(?<other>\\w+)\"\\) to str$" }
  explain:
    vi: "Dòng {line}: không thể nối chuỗi với giá trị kiểu {other}. Hãy đổi số thành chuỗi bằng str(), hoặc đổi chuỗi thành số bằng int() trước khi cộng."
    en: "Line {line}: you cannot join a string and a value of type {other}. Change the number to a string with str(), or change the string to a number with int() before you add."
  sample: "print(\"Tuổi: \" + 11)"

- id: unsupported-operand
  match: { type: TypeError, message: "^unsupported operand type\\(s\\) for (?<op>.+): '(?<left>\\w+)' and '(?<right>\\w+)'$" }
  explain:
    vi: "Dòng {line}: không dùng được phép {op} giữa kiểu {left} và kiểu {right}. Có thể một giá trị là chuỗi (str), ví dụ giá trị đọc từ input()."
    en: "Line {line}: you cannot use {op} with type {left} and type {right}. Maybe one value is a string (str), for example a value from input()."
  sample: "print(1 + \"2\")"

- id: not-callable
  match: { type: TypeError, message: "^'(?<kind>\\w+)' object is not callable$" }
  explain:
    vi: "Dòng {line}: con đang gọi một giá trị kiểu {kind} như gọi hàm. Có thể con đã đặt tên biến trùng tên hàm, ví dụ print = 5."
    en: "Line {line}: you call a value of type {kind} as if it is a function. Maybe a variable has the same name as a function, for example print = 5."
  sample: "print = 5\nprint(1)"

- id: type-other
  match: { type: TypeError }
  explain:
    vi: "Dòng {line}: kiểu dữ liệu không phù hợp với phép tính hoặc lệnh này."
    en: "Line {line}: the data type is not correct for this operation."
  sample: "print(len(5))"

- id: int-invalid
  match: { type: ValueError, message: "^invalid literal for int\\(\\) with base 10: '(?<value>.*)'$" }
  explain:
    vi: "Dòng {line}: không đổi được '{value}' thành số nguyên. int() chỉ nhận chuỗi gồm các chữ số, ví dụ '12'. Với số thập phân như '5.5', hãy dùng float()."
    en: "Line {line}: '{value}' cannot become an integer. int() accepts only a string of digits, for example '12'. For a decimal number such as '5.5', use float()."
  sample: "x = int(\"5.5\")"

- id: zero-division
  match: { type: ZeroDivisionError }
  explain:
    vi: "Dòng {line}: không thể chia cho 0."
    en: "Line {line}: you cannot divide by 0."
  sample: "print(5 / 0)"

- id: index-range
  match: { type: IndexError, message: "^(?<kind>list|string|tuple) index out of range$" }
  explain:
    vi: "Dòng {line}: vị trí con lấy vượt quá độ dài. Vị trí đầu tiên là 0, vị trí cuối cùng là độ dài trừ 1."
    en: "Line {line}: the position is outside the length. The first position is 0 and the last position is the length minus 1."
  sample: "a = [1, 2]\nprint(a[2])"

- id: eof
  match: { type: EOFError }
  explain:
    vi: "Dòng {line}: chương trình cần thêm dữ liệu nhập, nhưng ô Input đã hết. Con điền dữ liệu vào ô Input nhé, mỗi giá trị một dòng."
    en: "Line {line}: the program needs more input data, but the Input box has no more lines. Write the data in the Input box, 1 value on each line."
  sample: "x = input()"
  sample_input: ""

- id: timeout-while
  match: { type: Timeout, check: while-loop }
  explain:
    vi: "Code chạy lâu quá nên Robo đã dừng lại. Có thể vòng lặp while không bao giờ dừng: hãy kiểm tra điều kiện có thay đổi sau mỗi vòng không."
    en: "The code ran too long, so Robo stopped it. Maybe the while loop never stops: check that the condition changes in each loop."
  sample: "i = 0\nwhile i < 5:\n    i = i * 1"

- id: timeout
  match: { type: Timeout }
  explain:
    vi: "Code chạy lâu quá nên Robo đã dừng lại. Hãy kiểm tra xem có vòng lặp nào chạy quá nhiều lần không."
    en: "The code ran too long, so Robo stopped it. Check if a loop runs too many times."
  sample: "x = 0\nfor i in range(10 ** 12):\n    x = x + i"

- id: output-limit
  match: { type: OutputLimit }
  explain:
    vi: "Chương trình in ra quá nhiều nên Robo đã dừng lại. Có thể có vòng lặp in ra mãi không dừng."
    en: "The program printed too much, so Robo stopped it. Maybe a loop prints again and again without end."
  sample: "for i in range(200000):\n    print(\"Robo\")"

- id: input-prompt
  match: { type: InputPrompt }
  explain:
    vi: "Con đã viết chữ bên trong input(...). Khi chấm bài, chữ này bị tính vào kết quả nên bị sai. Hãy để trống: input()."
    en: "You wrote text inside input(...). The judge counts this text as output, so the answer is wrong. Leave it empty: input()."
  sample: "x = input(\"Nhập tên: \")\nprint(x)"
  sample_input: "Robo"
```

- [ ] **Step 4: Chạy test đối chiếu và script Python**

Run: `npm test -- src/content/parity.pyodide.test.ts && npm run content:validate`
Expected: 28 test PASS; script Python in `Nội dung hợp lệ.` (mất khoảng 10 giây vì 2 mục Timeout chờ hết 5 giây). Nếu 1 mục không được chính nó nhận diện, sửa biểu thức chính quy hoặc thứ tự các mục, không sửa test.

- [ ] **Step 5: Commit**

```bash
git add content/errors/errors.yaml src/content/parity.pyodide.test.ts
git commit -F - <<'EOF'
feat(content): add the bilingual error dictionary and check it on Pyodide

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 11: Nền giao diện (context, robot, bong bóng thoại, header)

**Files:**
- Create: `src/ui/contexts.tsx`, `src/ui/useRunnerClient.ts`, `src/ui/useExplain.ts`, `src/ui/feedback.ts`, `src/ui/Robot.tsx`, `src/ui/RobotBubble.tsx`, `src/ui/Header.tsx`, `src/test/fixtures.ts`, `src/test/render.tsx`
- Test: `src/ui/shell.test.tsx`, `src/ui/feedback.test.ts`

**Interfaces:**
- Consumes: `LangProvider`, `useLang`, `translate`, `MessageKey`, `MessageVars` (Task 2); kiểu nội dung (Task 3); `RunFn`, `RunResult`, `PyErrorInfo` (Task 6); `formatRawError` (Task 6); `RunnerClient`, `RunnerStatus` (Task 7); `DictionaryProvider`, `explainWithChain`, `ExplainProvider`, `Explanation`, `isPseudoError` (Task 9).
- Produces:
  - `interface RunnerApi { status: RunnerStatus; run: RunFn; retry(): void }`
  - `<AppProviders bundle runner initialLang?>`, `useContent(): ContentBundle`, `useRunner(): RunnerApi`, `useExplainProviders(): ExplainProvider[]`
  - `useRunnerClient(client: RunnerClient): RunnerApi`
  - `useExplain(): Explain` với `type Explain = (error: PyErrorInfo, code: string) => Promise<Explanation | null>`
  - `interface Feedback { mood: RobotMood; message: string; hint: string | null; rawError: string | null }`, `type Translate = (key: MessageKey, vars?: MessageVars) => string`, `feedbackForProblem(problem, code, explain, t): Promise<Feedback>`, `crashFeedback(t): Feedback`
  - `type RobotMood = "happy" | "neutral" | "sad" | "thinking"`, `<Robot mood? size?>` (SVG có `role="img"`, `aria-label="Robo"`, `data-mood`)
  - `<RobotBubble mood message hint? rawError?>` (`role="status"`)
  - `<Header>`
  - Test helper: `fixtureErrors`, `fixtureCodeExercise`, `fixtureQuestion`, `fixtureLesson`, `testBundle()`, `okResult(stdout, extra?)`, `errorResult(error, stdout?)`, `fakeRunner(impl, status?)` (có `calls` và `retry` là `vi.fn()`), `renderWithApp(ui, { bundle?, runner?, lang? })`

- [ ] **Step 1: Viết test helper và test thất bại**

`src/test/fixtures.ts`:

```ts
import type { ChoiceQuestion, CodeExercise, ContentBundle, ErrorEntry, Lesson } from "../content/types";

export const fixtureErrors: ErrorEntry[] = [
  {
    id: "name-undefined",
    match: { type: "NameError", message: "^name '(?<name>\\w+)' is not defined$", check: null },
    explain: { vi: 'Dòng {line}: Python không biết "{name}" là gì.', en: 'Line {line}: Python does not know "{name}".' },
    hint: { vi: "Đặt chữ trong dấu nháy.", en: "Put the text in quotes." },
    misconception: "string-quotes",
    sample: "print(Robo)",
    sampleInput: "",
  },
  {
    id: "timeout",
    match: { type: "Timeout", message: null, check: null },
    explain: { vi: "Code chạy lâu quá.", en: "The code ran too long." },
    hint: null,
    misconception: null,
    sample: "while True:\n    pass",
    sampleInput: "",
  },
];

export const fixtureCodeExercise: CodeExercise = {
  id: "t.l1.ex1",
  type: "code",
  concepts: [],
  prompt: { vi: "In ra Hi", en: "Print Hi" },
  starter: "",
  solution: 'print("Hi")',
  tests: [
    { input: "", output: "Hi", hidden: false },
    { input: "", output: "Hi", hidden: true },
  ],
  commonWrong: [],
  hints: [{ vi: "Dùng print" }, { vi: "Nhớ dấu nháy" }],
  compare: { kind: "exact" },
  testEligible: false,
};

export const fixtureQuestion: ChoiceQuestion = {
  id: "t.l1.q1",
  type: "predict",
  concepts: [],
  lessons: ["t.l1"],
  code: 'print("A")',
  prompt: { vi: "In ra gì?", en: "What is printed?" },
  choices: [
    { text: { vi: "A", en: "A" }, correct: true, error: false, misconception: null },
    { text: { vi: "Lỗi", en: "Error" }, correct: false, error: true, misconception: null },
  ],
  explanation: { vi: "Lệnh print in ra A.", en: "print shows A." },
};

export const fixtureLesson: Lesson = {
  id: "t.l1",
  title: { vi: "Bài thử", en: "Test lesson" },
  cards: [
    {
      segments: [
        { kind: "html", html: "<p>Thẻ một</p>" },
        { kind: "code", code: 'print("Xin chào")', run: true, expectError: false },
      ],
    },
    { segments: [{ kind: "html", html: "<p>Thẻ hai</p>" }] },
  ],
  exercises: [fixtureCodeExercise, fixtureQuestion],
};

const fixtureLesson2: Lesson = {
  id: "t.l2",
  title: { vi: "Bài thử 2", en: "Test lesson 2" },
  cards: [{ segments: [{ kind: "html", html: "<p>Chỉ 1 thẻ</p>" }] }],
  exercises: [],
};

export function testBundle(): ContentBundle {
  return {
    stages: [
      {
        id: "t",
        title: { vi: "Giai đoạn thử", en: "Test stage" },
        topics: [
          {
            id: "t.topic",
            title: { vi: "Chủ đề thử", en: "Test topic" },
            lessons: [fixtureLesson, fixtureLesson2],
            concepts: [],
            questions: [],
          },
        ],
      },
    ],
    errors: fixtureErrors,
  };
}
```

`src/test/render.tsx`:

```tsx
import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";
import type { ContentBundle, Lang } from "../content/types";
import type { RunnerStatus } from "../runner/client";
import type { PyErrorInfo, RunResult } from "../runner/types";
import { AppProviders, type RunnerApi } from "../ui/contexts";
import { testBundle } from "./fixtures";

export function okResult(stdout: string, extra: Partial<RunResult> = {}): RunResult {
  return { stdout, stderr: "", durationMs: 5, outcome: "ok", error: null, usedInputPrompt: false, ...extra };
}

export function errorResult(
  error: Pick<PyErrorInfo, "type" | "message" | "line"> & Partial<PyErrorInfo>,
  stdout = "",
): RunResult {
  return {
    stdout,
    stderr: "",
    durationMs: 5,
    outcome: "error",
    error: { column: null, lineText: "", ...error },
    usedInputPrompt: false,
  };
}

export interface FakeRunner extends RunnerApi {
  calls: { code: string; stdin: string }[];
  retry: ReturnType<typeof vi.fn>;
}

export function fakeRunner(
  impl: (code: string, stdin: string) => RunResult | Promise<RunResult>,
  status: RunnerStatus = "ready",
): FakeRunner {
  const calls: { code: string; stdin: string }[] = [];
  return {
    status,
    calls,
    retry: vi.fn(),
    run: async (code, stdin) => {
      calls.push({ code, stdin });
      return impl(code, stdin);
    },
  };
}

export function renderWithApp(
  ui: ReactElement,
  options: { bundle?: ContentBundle; runner?: RunnerApi; lang?: Lang } = {},
): RenderResult {
  return render(
    <AppProviders
      bundle={options.bundle ?? testBundle()}
      runner={options.runner ?? fakeRunner(() => okResult(""))}
      initialLang={options.lang ?? "vi"}
    >
      {ui}
    </AppProviders>,
  );
}
```

`src/ui/shell.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { fakeRunner, okResult, renderWithApp } from "../test/render";
import { useContent } from "./contexts";
import { Header } from "./Header";
import { Robot } from "./Robot";
import { RobotBubble } from "./RobotBubble";

describe("Header", () => {
  test("shows the runner status", () => {
    renderWithApp(<Header />, { runner: fakeRunner(() => okResult(""), "loading") });
    expect(screen.getByText("Robo đang khởi động...")).toBeInTheDocument();
  });

  test("offers retry when the runner failed", async () => {
    const runner = fakeRunner(() => okResult(""), "failed");
    renderWithApp(<Header />, { runner });
    expect(screen.getByText("Robo chưa khởi động được.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(runner.retry).toHaveBeenCalledOnce();
  });

  test("switches the interface language", async () => {
    renderWithApp(<Header />);
    expect(screen.getByText("Robo sẵn sàng")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByText("Robo is ready")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("Robot", () => {
  test("exposes the mood", () => {
    render(<Robot mood="happy" />);
    expect(screen.getByRole("img", { name: "Robo" })).toHaveAttribute("data-mood", "happy");
  });
});

describe("RobotBubble", () => {
  test("shows the message, the hint and a collapsed raw error", () => {
    renderWithApp(
      <RobotBubble mood="sad" message="Dòng 1: lỗi" hint="Gợi ý nhỏ" rawError="NameError: name 'x' is not defined" />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Dòng 1: lỗi");
    expect(screen.getByText("Gợi ý nhỏ")).toBeInTheDocument();
    expect(screen.getByText("Xem lỗi gốc")).toBeInTheDocument();
  });

  test("hides the hint and raw error when they are absent", () => {
    renderWithApp(<RobotBubble mood="happy" message="Tuyệt" />);
    expect(screen.queryByText("Xem lỗi gốc")).not.toBeInTheDocument();
  });
});

describe("contexts", () => {
  test("useContent outside the providers throws", () => {
    function Probe() {
      useContent();
      return null;
    }
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow("useContent must be used inside <AppProviders>");
  });
});
```

`src/ui/feedback.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { translate } from "../i18n/translate";
import type { MessageKey } from "../i18n/vi";
import type { MessageVars } from "../i18n/translate";
import { crashFeedback, feedbackForProblem } from "./feedback";

const t = (key: MessageKey, vars?: MessageVars) => translate("vi", key, vars);
const nameError = { type: "NameError", message: "name 'x' is not defined", line: 2, column: null, lineText: "print(x)" };

describe("feedbackForProblem", () => {
  test("uses the explanation and the raw error", async () => {
    const explain = async () => ({ text: "Giải thích", hint: "Gợi ý", entryId: "x", misconception: null });
    expect(await feedbackForProblem(nameError, "print(x)", explain, t)).toEqual({
      mood: "sad",
      message: "Giải thích",
      hint: "Gợi ý",
      rawError: 'File "<bai-cua-con>", line 2\n    print(x)\nNameError: name \'x\' is not defined',
    });
  });

  test("falls back to the unknown message", async () => {
    const feedback = await feedbackForProblem(nameError, "print(x)", async () => null, t);
    expect(feedback.message).toBe("Lỗi này lạ quá, con hỏi bố mẹ nhé.");
    expect(feedback.rawError).toContain("NameError");
  });

  test("has no raw error for pseudo errors", async () => {
    const timeout = { type: "Timeout", message: "", line: null, column: null, lineText: "" };
    const explain = async () => ({ text: "Lâu quá", hint: null, entryId: "timeout", misconception: null });
    expect((await feedbackForProblem(timeout, "", explain, t)).rawError).toBeNull();
  });
});

test("crashFeedback", () => {
  expect(crashFeedback(t)).toEqual({ mood: "sad", message: "Robo bị trục trặc rồi. Con tải lại trang nhé.", hint: null, rawError: null });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui`
Expected: FAIL vì chưa có các module trong `src/ui`.

- [ ] **Step 3: Viết code**

`src/ui/contexts.tsx`:

```tsx
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ContentBundle, Lang } from "../content/types";
import { DictionaryProvider } from "../explain/providers";
import type { ExplainProvider } from "../explain/types";
import { LangProvider } from "../i18n/LangProvider";
import type { RunnerStatus } from "../runner/client";
import type { RunFn } from "../runner/types";

export interface RunnerApi {
  status: RunnerStatus;
  run: RunFn;
  retry(): void;
}

const ContentContext = createContext<ContentBundle | null>(null);
const RunnerContext = createContext<RunnerApi | null>(null);
const ExplainContext = createContext<ExplainProvider[] | null>(null);

export function AppProviders({
  bundle,
  runner,
  initialLang = "vi",
  children,
}: {
  bundle: ContentBundle;
  runner: RunnerApi;
  initialLang?: Lang;
  children: ReactNode;
}) {
  const providers = useMemo<ExplainProvider[]>(() => [new DictionaryProvider(bundle.errors)], [bundle]);
  return (
    <LangProvider initialLang={initialLang}>
      <ContentContext.Provider value={bundle}>
        <RunnerContext.Provider value={runner}>
          <ExplainContext.Provider value={providers}>{children}</ExplainContext.Provider>
        </RunnerContext.Provider>
      </ContentContext.Provider>
    </LangProvider>
  );
}

function required<T>(value: T | null, name: string): T {
  if (value === null) throw new Error(`${name} must be used inside <AppProviders>`);
  return value;
}

export function useContent(): ContentBundle {
  return required(useContext(ContentContext), "useContent");
}

export function useRunner(): RunnerApi {
  return required(useContext(RunnerContext), "useRunner");
}

export function useExplainProviders(): ExplainProvider[] {
  return required(useContext(ExplainContext), "useExplainProviders");
}
```

`src/ui/useRunnerClient.ts`:

```ts
import { useEffect, useMemo, useState } from "react";
import type { RunnerClient, RunnerStatus } from "../runner/client";
import type { RunnerApi } from "./contexts";

export function useRunnerClient(client: RunnerClient): RunnerApi {
  const [status, setStatus] = useState<RunnerStatus>(client.status);
  useEffect(() => client.subscribe(setStatus), [client]);
  return useMemo(
    () => ({
      status,
      run: (code: string, stdin: string, timeoutMs?: number) => client.run(code, stdin, timeoutMs),
      retry: () => client.retry(),
    }),
    [client, status],
  );
}
```

`src/ui/useExplain.ts`:

```ts
import { useCallback } from "react";
import { explainWithChain } from "../explain/providers";
import { useLang } from "../i18n/LangProvider";
import type { PyErrorInfo } from "../runner/types";
import { useExplainProviders } from "./contexts";
import type { Explain } from "./feedback";

export function useExplain(): Explain {
  const providers = useExplainProviders();
  const { uiLang } = useLang();
  return useCallback(
    (error: PyErrorInfo, code: string) => explainWithChain(providers, { error, code, lang: uiLang }),
    [providers, uiLang],
  );
}
```

`src/ui/feedback.ts`:

```ts
import { isPseudoError } from "../explain/problem";
import type { Explanation } from "../explain/types";
import type { MessageVars } from "../i18n/translate";
import type { MessageKey } from "../i18n/vi";
import { formatRawError } from "../runner/pyRun";
import type { PyErrorInfo } from "../runner/types";
import type { RobotMood } from "./Robot";

export interface Feedback {
  mood: RobotMood;
  message: string;
  hint: string | null;
  rawError: string | null;
}

export type Translate = (key: MessageKey, vars?: MessageVars) => string;
export type Explain = (error: PyErrorInfo, code: string) => Promise<Explanation | null>;

export async function feedbackForProblem(
  problem: PyErrorInfo,
  code: string,
  explain: Explain,
  t: Translate,
): Promise<Feedback> {
  const explanation = await explain(problem, code);
  return {
    mood: "sad",
    message: explanation ? explanation.text : t("explain.unknown"),
    hint: explanation?.hint ?? null,
    rawError: isPseudoError(problem.type) ? null : formatRawError(problem),
  };
}

export function crashFeedback(t: Translate): Feedback {
  return { mood: "sad", message: t("app.crash"), hint: null, rawError: null };
}
```

`src/ui/Robot.tsx`:

```tsx
import type { ReactNode } from "react";

export type RobotMood = "happy" | "neutral" | "sad" | "thinking";

const EYES: Record<RobotMood, ReactNode> = {
  happy: <path d="M20 21 q3 -5 6 0 M30 21 q3 -5 6 0" stroke="#6ff" strokeWidth="2" fill="none" />,
  neutral: (
    <>
      <circle cx="23" cy="20" r="2.5" fill="#6ff" />
      <circle cx="33" cy="20" r="2.5" fill="#6ff" />
    </>
  ),
  sad: <path d="M20 19 q3 4 6 0 M30 19 q3 4 6 0" stroke="#6ff" strokeWidth="2" fill="none" />,
  thinking: (
    <>
      <circle cx="23" cy="20" r="2.5" fill="#6ff" />
      <path d="M30 20 h6" stroke="#6ff" strokeWidth="2" />
    </>
  ),
};

export function Robot({ mood = "neutral", size = 56 }: { mood?: RobotMood; size?: number }) {
  return (
    <svg
      role="img"
      aria-label="Robo"
      data-mood={mood}
      width={size}
      height={Math.round((size * 62) / 56)}
      viewBox="0 0 56 62"
    >
      <line x1="28" y1="8" x2="28" y2="1" stroke="#7b8bb3" strokeWidth="2" />
      <circle cx="28" cy="2" r="3" fill="#ff5c7a" />
      <rect x="10" y="8" width="36" height="26" rx="9" fill="#9aa8cc" />
      <rect x="15" y="13" width="26" height="14" rx="5" fill="#1d2440" />
      {EYES[mood]}
      <rect x="14" y="36" width="28" height="18" rx="6" fill="#7b8bb3" />
      <rect x="18" y="54" width="7" height="7" fill="#7b8bb3" />
      <rect x="31" y="54" width="7" height="7" fill="#7b8bb3" />
    </svg>
  );
}
```

`src/ui/RobotBubble.tsx`:

```tsx
import { useLang } from "../i18n/LangProvider";
import { Robot, type RobotMood } from "./Robot";

export interface RobotBubbleProps {
  mood: RobotMood;
  message: string;
  hint?: string | null;
  rawError?: string | null;
}

export function RobotBubble({ mood, message, hint = null, rawError = null }: RobotBubbleProps) {
  const { t } = useLang();
  return (
    <div className="robot-bubble" role="status">
      <Robot mood={mood} size={44} />
      <div className="bubble">
        <p>{message}</p>
        {hint && <p className="bubble-hint">{hint}</p>}
        {rawError && (
          <details>
            <summary>{t("code.rawError")}</summary>
            <pre>{rawError}</pre>
          </details>
        )}
      </div>
    </div>
  );
}
```

`src/ui/Header.tsx`:

```tsx
import { useLang } from "../i18n/LangProvider";
import { useRunner } from "./contexts";

export function Header() {
  const { t, uiLang, setUiLang } = useLang();
  const runner = useRunner();
  return (
    <header className="app-header">
      <a href="#/" className="app-title">
        {t("app.title")}
      </a>
      <span className={`runner-status runner-${runner.status}`}>
        {runner.status === "loading" && t("runner.loading")}
        {runner.status === "ready" && t("runner.ready")}
        {runner.status === "failed" && (
          <>
            {t("runner.failed")} <button onClick={runner.retry}>{t("runner.retry")}</button>
          </>
        )}
      </span>
      <div role="group" aria-label={t("app.uiLanguage")} className="lang-switch">
        <button aria-pressed={uiLang === "vi"} onClick={() => setUiLang("vi")}>
          VI
        </button>
        <button aria-pressed={uiLang === "en"} onClick={() => setUiLang("en")}>
          EN
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/ui && npm run typecheck`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add src/ui src/test/fixtures.ts src/test/render.tsx
git commit -F - <<'EOF'
feat(ui): add app providers, robot, speech bubble, header and test helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 12: Thẻ lý thuyết và ví dụ chạy được

**Files:**
- Create: `src/ui/OutputPanel.tsx`, `src/ui/CodeExample.tsx`, `src/ui/CardView.tsx`
- Test: `src/ui/CardView.test.tsx`

**Interfaces:**
- Consumes: `useRunner`, `useExplain`, `feedbackForProblem`, `crashFeedback`, `RobotBubble` (Task 11); `problemFromOutcome` (Task 9); `Card` (Task 3).
- Produces: `<OutputPanel stdout>` (`role="region"`, nhãn "Kết quả"; hiện tối đa `OUTPUT_DISPLAY_LIMIT = 10_000` ký tự), `<CodeExample code>`, `<CardView card>`. Nút "Chạy thử" bị khóa khi runner chưa `ready` hoặc đang chạy.

- [ ] **Step 1: Viết test thất bại**

`src/ui/CardView.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { RunnerCrashError } from "../runner/client";
import { fixtureLesson } from "../test/fixtures";
import { errorResult, fakeRunner, okResult, renderWithApp } from "../test/render";
import { CardView } from "./CardView";
import { OUTPUT_DISPLAY_LIMIT, OutputPanel } from "./OutputPanel";

const card = fixtureLesson.cards[0]!;

describe("CardView", () => {
  test("renders text and runs an example", async () => {
    const runner = fakeRunner(() => okResult("Xin chào\n"));
    renderWithApp(<CardView card={card} />, { runner });
    expect(screen.getByText("Thẻ một")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByRole("region", { name: "Kết quả" })).toHaveTextContent("Xin chào");
    expect(runner.calls).toEqual([{ code: 'print("Xin chào")', stdin: "" }]);
  });

  test("explains an error from an example", async () => {
    const runner = fakeRunner(() => errorResult({ type: "NameError", message: "name 'Robo' is not defined", line: 1 }));
    renderWithApp(<CardView card={card} />, { runner });
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByText('Dòng 1: Python không biết "Robo" là gì.')).toBeInTheDocument();
    expect(screen.getByText("Đặt chữ trong dấu nháy.")).toBeInTheDocument();
  });

  test("explains a timeout", async () => {
    renderWithApp(<CardView card={card} />, { runner: fakeRunner(() => okResult("", { outcome: "timeout" })) });
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByText("Code chạy lâu quá.")).toBeInTheDocument();
  });

  test("shows a crash message when the runner fails", async () => {
    const runner = fakeRunner(() => {
      throw new RunnerCrashError("worker crashed");
    });
    renderWithApp(<CardView card={card} />, { runner });
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByText("Robo bị trục trặc rồi. Con tải lại trang nhé.")).toBeInTheDocument();
  });

  test("disables Run until the runner is ready", () => {
    renderWithApp(<CardView card={card} />, { runner: fakeRunner(() => okResult(""), "loading") });
    expect(screen.getByRole("button", { name: "Chạy thử" })).toBeDisabled();
  });

  test("shows a code block that cannot run without a Run button", () => {
    renderWithApp(<CardView card={{ segments: [{ kind: "code", code: "x = 1", run: false, expectError: false }] }} />);
    expect(screen.getByText("x = 1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Chạy thử" })).not.toBeInTheDocument();
  });
});

describe("OutputPanel", () => {
  test("says when nothing is printed", () => {
    renderWithApp(<OutputPanel stdout="" />);
    expect(screen.getByRole("region", { name: "Kết quả" })).toHaveTextContent("(Chương trình không in ra gì)");
  });

  test("cuts very long output", () => {
    renderWithApp(<OutputPanel stdout={"a".repeat(OUTPUT_DISPLAY_LIMIT + 5)} />);
    expect(screen.getByText("(Kết quả quá dài, chỉ hiện phần đầu)")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/CardView.test.tsx`
Expected: FAIL vì chưa có `./CardView`, `./OutputPanel`.

- [ ] **Step 3: Viết code**

`src/ui/OutputPanel.tsx`:

```tsx
import { useLang } from "../i18n/LangProvider";

export const OUTPUT_DISPLAY_LIMIT = 10_000;

export function OutputPanel({ stdout }: { stdout: string }) {
  const { t } = useLang();
  const truncated = stdout.length > OUTPUT_DISPLAY_LIMIT;
  return (
    <div className="output" role="region" aria-label={t("code.output")}>
      <pre>{stdout === "" ? t("code.noOutput") : stdout.slice(0, OUTPUT_DISPLAY_LIMIT)}</pre>
      {truncated && <p>{t("code.outputTruncated")}</p>}
    </div>
  );
}
```

`src/ui/CodeExample.tsx`:

```tsx
import { useState } from "react";
import { problemFromOutcome } from "../explain/problem";
import { useLang } from "../i18n/LangProvider";
import { useRunner } from "./contexts";
import { crashFeedback, feedbackForProblem, type Feedback } from "./feedback";
import { OutputPanel } from "./OutputPanel";
import { RobotBubble } from "./RobotBubble";
import { useExplain } from "./useExplain";

export function CodeExample({ code }: { code: string }) {
  const { t } = useLang();
  const runner = useRunner();
  const explain = useExplain();
  const [running, setRunning] = useState(false);
  const [stdout, setStdout] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleRun() {
    setRunning(true);
    setFeedback(null);
    try {
      const result = await runner.run(code, "");
      setStdout(result.stdout);
      const problem = problemFromOutcome(result, false);
      setFeedback(problem ? await feedbackForProblem(problem, code, explain, t) : null);
    } catch {
      setFeedback(crashFeedback(t));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="code-example">
      <pre className="code-block">
        <code>{code}</code>
      </pre>
      <button onClick={handleRun} disabled={running || runner.status !== "ready"}>
        {running ? t("code.running") : t("code.run")}
      </button>
      {stdout !== null && <OutputPanel stdout={stdout} />}
      {feedback && <RobotBubble {...feedback} />}
    </div>
  );
}
```

`src/ui/CardView.tsx`:

```tsx
import type { Card } from "../content/types";
import { CodeExample } from "./CodeExample";

export function CardView({ card }: { card: Card }) {
  return (
    <div className="card">
      {card.segments.map((segment, i) => {
        if (segment.kind === "html") {
          return <div key={i} className="card-text" dangerouslySetInnerHTML={{ __html: segment.html }} />;
        }
        if (segment.run) return <CodeExample key={i} code={segment.code} />;
        return (
          <pre key={i} className="code-block">
            <code>{segment.code}</code>
          </pre>
        );
      })}
    </div>
  );
}
```

Ghi chú: `dangerouslySetInnerHTML` an toàn ở đây vì HTML sinh ra lúc build từ nội dung trong repo, không từ người dùng.

Ghi chú cho người thực hiện: khi nút đang chạy, nhãn đổi thành "Đang chạy...", nên trong test luôn bấm nút lúc nó còn tên "Chạy thử".

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/ui && npm run typecheck`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add src/ui/OutputPanel.tsx src/ui/CodeExample.tsx src/ui/CardView.tsx src/ui/CardView.test.tsx
git commit -F - <<'EOF'
feat(ui): render theory cards with runnable Python examples

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 13: Trình soạn code và màn hình bài tập chia đôi

**Files:**
- Create: `src/ui/CodeEditor.tsx`, `src/ui/TestResultList.tsx`, `src/ui/CodeExerciseView.tsx`
- Test: `src/ui/CodeExerciseView.test.tsx`

**Interfaces:**
- Consumes: `judge`, `JudgeResult` (Task 8); `errorMisconceptionFrom`, `problemFromOutcome` (Task 9); `useRunner`, `useContent`, `useExplain`, `feedbackForProblem`, `crashFeedback`, `RobotBubble` (Task 11); `OutputPanel` (Task 12); `pick` (Task 2).
- Produces:
  - `<CodeEditor value onChange errorLine ariaLabel>`: CodeMirror 6, Python, thụt lề 4 dấu cách, Tab thụt lề, tô đỏ dòng `errorLine` (tính từ 1), bỏ tô khi sửa code. Vùng soạn thảo có `role="textbox"` với nhãn `ariaLabel`.
  - `<TestResultList result>`: danh sách có nhãn "Kết quả chấm"; test ẩn không lộ dữ liệu; dòng khác đầu tiên có class `diff-line`.
  - `type ExerciseOutcome = "solved" | "viewed-solution"`, `<CodeExerciseView exercise onComplete(outcome)>`. Sau 3 lần nộp sai mới hiện nút "Xem lời giải".

- [ ] **Step 1: Viết test thất bại**

`src/ui/CodeExerciseView.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { fixtureCodeExercise } from "../test/fixtures";
import { errorResult, fakeRunner, okResult, renderWithApp } from "../test/render";
import { CodeExerciseView } from "./CodeExerciseView";

vi.mock("./CodeEditor", () => ({
  CodeEditor: (props: { value: string; onChange(value: string): void; errorLine: number | null; ariaLabel: string }) => (
    <textarea
      aria-label={props.ariaLabel}
      data-error-line={props.errorLine ?? ""}
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
    />
  ),
}));

const editor = () => screen.getByRole("textbox", { name: "Trình soạn code" });
const submitButton = () => screen.getByRole("button", { name: "Nộp bài" });

async function submitOnce() {
  await userEvent.click(submitButton());
  await waitFor(() => expect(submitButton()).toBeEnabled());
}

describe("CodeExerciseView", () => {
  test("shows the prompt, the example and the starter code", () => {
    renderWithApp(<CodeExerciseView exercise={{ ...fixtureCodeExercise, starter: "# code" }} onComplete={() => {}} />);
    expect(screen.getByText("In ra Hi")).toBeInTheDocument();
    expect(screen.getByText("Kết quả mong đợi")).toBeInTheDocument();
    expect(editor()).toHaveValue("# code");
  });

  test("Run sends the code and the input, then shows the output", async () => {
    const runner = fakeRunner(() => okResult("Hi\n"));
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={() => {}} />, { runner });
    await userEvent.type(editor(), 'print("Hi")');
    await userEvent.type(screen.getByRole("textbox", { name: "Dữ liệu nhập (Input)" }), "5");
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByRole("region", { name: "Kết quả" })).toHaveTextContent("Hi");
    expect(runner.calls).toEqual([{ code: 'print("Hi")', stdin: "5" }]);
  });

  test("Run explains an error and marks the error line", async () => {
    const runner = fakeRunner(() =>
      errorResult({ type: "NameError", message: "name 'Robo' is not defined", line: 1, lineText: "print(Robo)" }),
    );
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={() => {}} />, { runner });
    await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
    expect(await screen.findByText('Dòng 1: Python không biết "Robo" là gì.')).toBeInTheDocument();
    expect(editor()).toHaveAttribute("data-error-line", "1");
  });

  test("Submit accepts a correct answer", async () => {
    const onComplete = vi.fn();
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={onComplete} />, {
      runner: fakeRunner(() => okResult("Hi\n")),
    });
    await userEvent.click(submitButton());
    expect(await screen.findByText("Đúng hết 2/2 test!")).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith("solved");
  });

  test("Submit shows the failed tests without leaking hidden data", async () => {
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={() => {}} />, {
      runner: fakeRunner(() => okResult("Hello\n")),
    });
    await userEvent.click(submitButton());
    expect(await screen.findByText("Đúng 0/2 test. Xem test bị sai ở bên dưới nhé.")).toBeInTheDocument();
    const results = screen.getByRole("list", { name: "Kết quả chấm" });
    expect(within(results).getAllByText("Mong đợi")).toHaveLength(1);
    expect(within(results).getAllByText("Code của con in ra")).toHaveLength(1);
    expect(within(results).getByText("Test ẩn")).toBeInTheDocument();
  });

  test("hints appear one by one", async () => {
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Gợi ý" }));
    expect(screen.getByText("Gợi ý 1: Dùng print")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Gợi ý tiếp" }));
    expect(screen.getByText("Gợi ý 2: Nhớ dấu nháy")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Gợi ý tiếp" })).not.toBeInTheDocument();
  });

  test("the solution appears only after 3 failed submits", async () => {
    const onComplete = vi.fn();
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={onComplete} />, {
      runner: fakeRunner(() => okResult("x\n")),
    });
    await submitOnce();
    await submitOnce();
    expect(screen.queryByRole("button", { name: "Xem lời giải" })).not.toBeInTheDocument();
    await submitOnce();
    await userEvent.click(screen.getByRole("button", { name: "Xem lời giải" }));
    expect(screen.getByText("Lời giải mẫu")).toBeInTheDocument();
    expect(screen.getByText('print("Hi")')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith("viewed-solution");
  });

  test("disables Run and Submit until the runner is ready", () => {
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={() => {}} />, {
      runner: fakeRunner(() => okResult(""), "loading"),
    });
    expect(screen.getByRole("button", { name: "Chạy thử" })).toBeDisabled();
    expect(submitButton()).toBeDisabled();
  });

  test("shows the English prompt when the interface is English", () => {
    renderWithApp(<CodeExerciseView exercise={fixtureCodeExercise} onComplete={() => {}} />, { lang: "en" });
    expect(screen.getByText("Print Hi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/CodeExerciseView.test.tsx`
Expected: FAIL vì chưa có `./CodeExerciseView`.

- [ ] **Step 3: Viết code**

`src/ui/CodeEditor.tsx`:

```tsx
import { indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { indentUnit } from "@codemirror/language";
import { EditorState, StateEffect, StateField } from "@codemirror/state";
import { Decoration, keymap, type DecorationSet } from "@codemirror/view";
import { basicSetup, EditorView } from "codemirror";
import { useEffect, useLayoutEffect, useRef } from "react";

const setErrorLine = StateEffect.define<number | null>();

const errorLineField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decorations, transaction) {
    let next = transaction.docChanged ? Decoration.none : decorations.map(transaction.changes);
    for (const effect of transaction.effects) {
      if (!effect.is(setErrorLine)) continue;
      const line = effect.value;
      next =
        line === null || line < 1 || line > transaction.state.doc.lines
          ? Decoration.none
          : Decoration.set([Decoration.line({ class: "cm-error-line" }).range(transaction.state.doc.line(line).from)]);
    }
    return next;
  },
  provide: (field) => EditorView.decorations.from(field),
});

export interface CodeEditorProps {
  value: string;
  onChange(value: string): void;
  /** 1-based line to highlight, or null. */
  errorLine: number | null;
  ariaLabel: string;
}

export function CodeEditor({ value, onChange, errorLine, ariaLabel }: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const editor = new EditorView({
      parent: host.current as HTMLDivElement,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          python(),
          indentUnit.of("    "),
          keymap.of([indentWithTab]),
          errorLineField,
          EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = null;
    };
    // The editor is created once; later value changes are synced by the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const editor = view.current;
    if (editor && editor.state.doc.toString() !== value) {
      editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({ effects: setErrorLine.of(errorLine) });
  }, [errorLine]);

  return <div ref={host} className="code-editor" />;
}
```

`src/ui/TestResultList.tsx`:

```tsx
import { useLang } from "../i18n/LangProvider";
import type { JudgeResult, TestOutcome } from "../runner/judge";

function DiffLines({ text, highlight }: { text: string; highlight: number | null }) {
  return (
    <pre>
      {text.split("\n").map((line, i) => (
        <span key={i} className={i === highlight ? "diff-line" : undefined}>
          {line}
          {"\n"}
        </span>
      ))}
    </pre>
  );
}

function statusLabel(test: TestOutcome, t: ReturnType<typeof useLang>["t"]): string {
  if (!test.ran) return t("judge.notRun");
  if (test.passed) return t("judge.passed");
  if (test.outcome === "timeout") return t("judge.timeout");
  if (test.outcome === "error" || test.outcome === "output-limit") return t("judge.error");
  return t("judge.failed");
}

export function TestResultList({ result }: { result: JudgeResult }) {
  const { t } = useLang();
  return (
    <ol className="test-results" aria-label={t("judge.results")}>
      {result.tests.map((test) => (
        <li key={test.index} className={test.passed ? "pass" : "fail"}>
          <strong>{test.hidden ? t("judge.hidden") : t("judge.test", { n: test.index + 1 })}</strong>:{" "}
          {statusLabel(test, t)}
          {!test.passed && !test.hidden && test.ran && (
            <div className="diff">
              {test.input !== "" && (
                <>
                  <span>{t("judge.input")}</span>
                  <pre>{test.input}</pre>
                </>
              )}
              <span>{t("judge.expected")}</span>
              <DiffLines text={test.expected} highlight={test.firstDiffLine} />
              <span>{t("judge.actual")}</span>
              <DiffLines text={test.actual} highlight={test.firstDiffLine} />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
```

`src/ui/CodeExerciseView.tsx`:

```tsx
import { useMemo, useState } from "react";
import type { CodeExercise } from "../content/types";
import { problemFromOutcome } from "../explain/problem";
import { errorMisconceptionFrom } from "../explain/providers";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { judge, type JudgeResult } from "../runner/judge";
import { CodeEditor } from "./CodeEditor";
import { useContent, useRunner } from "./contexts";
import { crashFeedback, feedbackForProblem, type Feedback } from "./feedback";
import { OutputPanel } from "./OutputPanel";
import { RobotBubble } from "./RobotBubble";
import { TestResultList } from "./TestResultList";
import { useExplain } from "./useExplain";

export type ExerciseOutcome = "solved" | "viewed-solution";

const FAILED_SUBMITS_BEFORE_SOLUTION = 3;

export function CodeExerciseView({
  exercise,
  onComplete,
}: {
  exercise: CodeExercise;
  onComplete(outcome: ExerciseOutcome): void;
}) {
  const { t, uiLang } = useLang();
  const runner = useRunner();
  const bundle = useContent();
  const explain = useExplain();
  const misconceptionOf = useMemo(() => errorMisconceptionFrom(bundle.errors), [bundle]);
  const example = exercise.tests.find((test) => !test.hidden) ?? null;

  const [code, setCode] = useState(exercise.starter);
  const [stdin, setStdin] = useState(example?.input ?? "");
  const [busy, setBusy] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(null);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [failedSubmits, setFailedSubmits] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);

  function reset() {
    setFeedback(null);
    setErrorLine(null);
    setRunOutput(null);
    setJudgeResult(null);
  }

  async function handleRun() {
    reset();
    setBusy(true);
    try {
      const result = await runner.run(code, stdin);
      setRunOutput(result.stdout);
      const problem = problemFromOutcome(result, false);
      if (problem) {
        setErrorLine(problem.line);
        setFeedback(await feedbackForProblem(problem, code, explain, t));
      }
    } catch {
      setFeedback(crashFeedback(t));
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    reset();
    setBusy(true);
    try {
      const result = await judge(exercise, code, runner.run, misconceptionOf);
      setJudgeResult(result);
      if (result.status === "accepted") {
        setFeedback({ mood: "happy", message: t("judge.accepted", { passed: result.passedCount, total: result.total }), hint: null, rawError: null });
        onComplete("solved");
        return;
      }
      setFailedSubmits((n) => n + 1);
      const failed = result.tests.find((test) => test.ran && !test.passed);
      const problem = failed ? problemFromOutcome(failed, true) : null;
      if (problem) {
        setErrorLine(problem.line);
        setFeedback(await feedbackForProblem(problem, code, explain, t));
      } else {
        setFeedback({ mood: "sad", message: t("judge.partial", { passed: result.passedCount, total: result.total }), hint: null, rawError: null });
      }
    } catch {
      setFeedback(crashFeedback(t));
    } finally {
      setBusy(false);
    }
  }

  function showSolution() {
    setSolutionShown(true);
    onComplete("viewed-solution");
  }

  const disabled = busy || runner.status !== "ready";

  return (
    <div className="exercise-split">
      <section className="exercise-left">
        <p className="exercise-prompt">{pick(exercise.prompt, uiLang)}</p>
        {example && (
          <div className="example">
            <h4>{t("exercise.example")}</h4>
            {example.input !== "" && (
              <>
                <span>{t("judge.input")}</span>
                <pre>{example.input}</pre>
              </>
            )}
            <span>{t("exercise.expectedOutput")}</span>
            <pre>{example.output}</pre>
          </div>
        )}
        {exercise.hints.slice(0, hintsShown).map((hint, i) => (
          <p key={i} className="hint">
            {t("hint.title", { n: i + 1 })}: {pick(hint, uiLang)}
          </p>
        ))}
        {hintsShown < exercise.hints.length && (
          <button onClick={() => setHintsShown((n) => n + 1)}>{hintsShown === 0 ? t("hint.show") : t("hint.next")}</button>
        )}
        {failedSubmits >= FAILED_SUBMITS_BEFORE_SOLUTION && !solutionShown && (
          <button onClick={showSolution}>{t("solution.show")}</button>
        )}
        {solutionShown && (
          <div className="solution">
            <h4>{t("solution.title")}</h4>
            <pre>{exercise.solution.trimEnd()}</pre>
          </div>
        )}
        {feedback && <RobotBubble {...feedback} />}
      </section>
      <section className="exercise-right">
        <CodeEditor value={code} onChange={setCode} errorLine={errorLine} ariaLabel={t("code.editorLabel")} />
        <label className="input-label">
          {t("code.inputLabel")}
          <textarea
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            placeholder={t("code.inputPlaceholder")}
            rows={3}
          />
        </label>
        <div className="exercise-actions">
          <button onClick={handleRun} disabled={disabled}>
            {t("code.run")}
          </button>
          <button className="primary" onClick={handleSubmit} disabled={disabled}>
            {t("code.submit")}
          </button>
        </div>
        {busy && <p>{t("code.running")}</p>}
        {runOutput !== null && <OutputPanel stdout={runOutput} />}
        {judgeResult && <TestResultList result={judgeResult} />}
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/ui && npm run typecheck`
Expected: PASS toàn bộ. `CodeEditor` thật được kiểm chứng ở test đầu cuối (Task 17), vì CodeMirror cần đo bố cục mà jsdom không hỗ trợ.

- [ ] **Step 5: Commit**

```bash
git add src/ui/CodeEditor.tsx src/ui/TestResultList.tsx src/ui/CodeExerciseView.tsx src/ui/CodeExerciseView.test.tsx
git commit -F - <<'EOF'
feat(ui): add the CodeMirror editor and the split code exercise screen

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 14: Thẻ câu hỏi song ngữ

**Files:**
- Create: `src/ui/QuestionCard.tsx`
- Test: `src/ui/QuestionCard.test.tsx`

**Interfaces:**
- Consumes: `ChoiceQuestion`, `LocalizedText` (Task 3); `pick`, `pickBoth`, `QuestionLang`, `useLang` (Task 2); `RobotBubble` (Task 11).
- Produces: `<QuestionCard question onAnswered(correct: boolean)>`. Ngôn ngữ ban đầu lấy từ `questionLang` của `LangProvider`; nút "VI", "EN", "VI + EN" đổi ngôn ngữ cho câu đó. Sau khi bấm "Kiểm tra", các lựa chọn bị khóa và lời giải thích hiện trong bong bóng robot.

- [ ] **Step 1: Viết test thất bại**

`src/ui/QuestionCard.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { fixtureQuestion } from "../test/fixtures";
import { renderWithApp } from "../test/render";
import { QuestionCard } from "./QuestionCard";

describe("QuestionCard", () => {
  test("shows the Vietnamese prompt and the code", () => {
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={() => {}} />);
    expect(screen.getByText("In ra gì?")).toBeInTheDocument();
    expect(screen.getByText('print("A")')).toBeInTheDocument();
  });

  test("checks a correct answer", async () => {
    const onAnswered = vi.fn();
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={onAnswered} />);
    const check = screen.getByRole("button", { name: "Kiểm tra" });
    expect(check).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "A" }));
    await userEvent.click(check);
    expect(onAnswered).toHaveBeenCalledWith(true);
    expect(screen.getByText("Chính xác!")).toBeInTheDocument();
    expect(screen.getByText("Lệnh print in ra A.")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "A" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Kiểm tra" })).not.toBeInTheDocument();
  });

  test("checks a wrong answer", async () => {
    const onAnswered = vi.fn();
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={onAnswered} />);
    await userEvent.click(screen.getByRole("radio", { name: "Lỗi" }));
    await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    expect(onAnswered).toHaveBeenCalledWith(false);
    expect(screen.getByText("Chưa đúng rồi.")).toBeInTheDocument();
  });

  test("switches the question language", async () => {
    renderWithApp(<QuestionCard question={fixtureQuestion} onAnswered={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByText("What is printed?")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Error" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "VI + EN" }));
    expect(screen.getByText("In ra gì?")).toBeInTheDocument();
    expect(screen.getByText("What is printed?")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Lỗi / Error" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/QuestionCard.test.tsx`
Expected: FAIL vì chưa có `./QuestionCard`.

- [ ] **Step 3: Viết code**

`src/ui/QuestionCard.tsx`:

```tsx
import { useState } from "react";
import type { ChoiceQuestion, LocalizedText } from "../content/types";
import { pick, pickBoth, type QuestionLang } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { RobotBubble } from "./RobotBubble";

const LANG_BUTTONS = [
  { lang: "vi", label: "question.langVi" },
  { lang: "en", label: "question.langEn" },
  { lang: "both", label: "question.langBoth" },
] as const;

function show(text: LocalizedText, lang: QuestionLang): string {
  return lang === "both" ? pickBoth(text) : pick(text, lang);
}

export function QuestionCard({
  question,
  onAnswered,
}: {
  question: ChoiceQuestion;
  onAnswered(correct: boolean): void;
}) {
  const { t, questionLang } = useLang();
  const [lang, setLang] = useState<QuestionLang>(questionLang);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correctIndex = question.choices.findIndex((choice) => choice.correct);
  const isCorrect = selected === correctIndex;

  function check() {
    if (selected === null) return;
    setChecked(true);
    onAnswered(isCorrect);
  }

  function choiceClass(i: number): string {
    if (!checked) return "choice";
    if (i === correctIndex) return "choice choice-correct";
    if (i === selected) return "choice choice-wrong";
    return "choice";
  }

  return (
    <div className="question-card">
      <div role="group" aria-label={t("question.lang")} className="lang-switch">
        {LANG_BUTTONS.map((button) => (
          <button key={button.lang} aria-pressed={lang === button.lang} onClick={() => setLang(button.lang)}>
            {t(button.label)}
          </button>
        ))}
      </div>
      {lang === "both" ? (
        <>
          <p className="question-prompt">{question.prompt.vi}</p>
          {question.prompt.en && (
            <p className="question-prompt" lang="en">
              {question.prompt.en}
            </p>
          )}
        </>
      ) : (
        <p className="question-prompt">{pick(question.prompt, lang)}</p>
      )}
      {question.code && (
        <pre className="code-block">
          <code>{question.code.trimEnd()}</code>
        </pre>
      )}
      <fieldset disabled={checked}>
        <legend className="sr-only">{t("question.choices")}</legend>
        {question.choices.map((choice, i) => (
          <label key={i} className={choiceClass(i)}>
            <input type="radio" name={question.id} checked={selected === i} onChange={() => setSelected(i)} />
            <span className={question.type === "predict" ? "choice-text code" : "choice-text"}>{show(choice.text, lang)}</span>
          </label>
        ))}
      </fieldset>
      {!checked && (
        <button className="primary" disabled={selected === null} onClick={check}>
          {t("question.check")}
        </button>
      )}
      {checked && (
        <RobotBubble
          mood={isCorrect ? "happy" : "sad"}
          message={isCorrect ? t("question.correct") : t("question.incorrect")}
          hint={show(question.explanation, lang)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npx vitest run src/ui && npm run typecheck`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add src/ui/QuestionCard.tsx src/ui/QuestionCard.test.tsx
git commit -F - <<'EOF'
feat(ui): add the bilingual question card with VI/EN/both toggle

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 15: Màn hình bài học, danh sách bài, định tuyến và khởi động app

**Files:**
- Create: `src/ui/LessonScreen.tsx`, `src/ui/HomeScreen.tsx`, `src/ui/routing.ts`, `src/ui/ErrorBoundary.tsx`, `src/ui/AppRoutes.tsx`, `src/ui/App.tsx`, `src/ui/browserSupport.ts`, `src/content/bundle.ts`, `src/styles.css`
- Modify: `src/main.tsx` (thay toàn bộ)
- Test: `src/ui/LessonScreen.test.tsx`, `src/ui/AppRoutes.test.tsx`, `src/ui/routing.test.ts`

**Interfaces:**
- Consumes: mọi component ở Task 11 đến 14; `findLesson` (Task 3); `RunnerClient` (Task 7); `createBrowserRunner` (Task 7); `useRunnerClient` (Task 11); `translate` (Task 2).
- Produces:
  - `<LessonScreen lesson onComplete(lessonId) onExit>`: các thẻ trước, bài tập sau; nút "Tiếp" ở bài tập chỉ mở khi đã làm xong (code đúng hoặc đã xem lời giải; câu hỏi đã kiểm tra); bước cuối hiện nút "Hoàn thành".
  - `<HomeScreen completed: ReadonlySet<string>>`
  - `type Route = { name: "home" } | { name: "lesson"; lessonId: string }`, `parseHash(hash): Route`, `routeToHash(route): string`, `useHashRoute(): [Route, (route: Route) => void]`
  - `<ErrorBoundary>`, `<AppRoutes>` (giữ danh sách bài đã xong trong bộ nhớ, M2 mới lưu bền), `<App bundle runnerClient>`
  - `isBrowserSupported(env?): boolean`, `contentBundle: ContentBundle`

- [ ] **Step 1: Viết test thất bại**

`src/ui/routing.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { isBrowserSupported } from "./browserSupport";
import { parseHash, routeToHash } from "./routing";

describe("routing", () => {
  test("parses the home and lesson hashes", () => {
    expect(parseHash("")).toEqual({ name: "home" });
    expect(parseHash("#/")).toEqual({ name: "home" });
    expect(parseHash("#/lesson/s1.lam-quen.l1")).toEqual({ name: "lesson", lessonId: "s1.lam-quen.l1" });
  });

  test("round-trips a lesson route", () => {
    const route = { name: "lesson", lessonId: "s1.a.l2" } as const;
    expect(parseHash(routeToHash(route))).toEqual(route);
    expect(routeToHash({ name: "home" })).toBe("#/");
  });
});

describe("isBrowserSupported", () => {
  test("needs WebAssembly and Worker", () => {
    expect(isBrowserSupported({ WebAssembly: {}, Worker: function Worker() {} })).toBe(true);
    expect(isBrowserSupported({ Worker: function Worker() {} })).toBe(false);
    expect(isBrowserSupported({ WebAssembly: {} })).toBe(false);
  });
});
```

`src/ui/LessonScreen.test.tsx`:

```tsx
// @vitest-environment jsdom
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { fixtureLesson } from "../test/fixtures";
import { fakeRunner, okResult, renderWithApp } from "../test/render";
import { LessonScreen } from "./LessonScreen";

vi.mock("./CodeEditor", () => ({
  CodeEditor: (props: { value: string; onChange(value: string): void; ariaLabel: string }) => (
    <textarea aria-label={props.ariaLabel} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
  ),
}));

test("goes through cards, a code exercise and a question, then finishes", async () => {
  const onComplete = vi.fn();
  const onExit = vi.fn();
  renderWithApp(<LessonScreen lesson={fixtureLesson} onComplete={onComplete} onExit={onExit} />, {
    runner: fakeRunner(() => okResult("Hi\n")),
  });

  expect(screen.getByText("Thẻ 1/2")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Quay lại" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  expect(screen.getByText("Thẻ 2/2")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));

  expect(screen.getByText("Bài tập 1/2")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Tiếp" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
  expect(await screen.findByText("Đúng hết 2/2 test!")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));

  expect(screen.getByText("Bài tập 2/2")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Hoàn thành" })).toBeDisabled();
  await userEvent.click(screen.getByRole("radio", { name: "A" }));
  await userEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
  await userEvent.click(screen.getByRole("button", { name: "Hoàn thành" }));

  expect(screen.getByText("Hoàn thành bài học!")).toBeInTheDocument();
  expect(onComplete).toHaveBeenCalledWith("t.l1");
  await userEvent.click(screen.getByRole("button", { name: "Về danh sách bài" }));
  expect(onExit).toHaveBeenCalledOnce();
});

test("a new card starts without the output of the previous card", async () => {
  const lesson = {
    ...fixtureLesson,
    cards: [fixtureLesson.cards[0]!, { segments: [{ kind: "code" as const, code: "print(2)", run: true, expectError: false }] }],
    exercises: [],
  };
  renderWithApp(<LessonScreen lesson={lesson} onComplete={() => {}} onExit={() => {}} />, {
    runner: fakeRunner(() => okResult("Xin chào\n")),
  });
  await userEvent.click(screen.getByRole("button", { name: "Chạy thử" }));
  expect(await screen.findByRole("region", { name: "Kết quả" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  expect(screen.queryByRole("region", { name: "Kết quả" })).not.toBeInTheDocument();
});
```

`src/ui/AppRoutes.test.tsx`:

```tsx
// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { RunnerClient } from "../runner/client";
import { FakeWorker } from "../test/fakeWorker";
import { testBundle } from "../test/fixtures";
import { renderWithApp } from "../test/render";
import { App } from "./App";
import { AppRoutes } from "./AppRoutes";
import { ErrorBoundary } from "./ErrorBoundary";

beforeEach(() => {
  window.location.hash = "";
});

describe("AppRoutes", () => {
  test("lists the lessons and opens one", async () => {
    renderWithApp(<AppRoutes />);
    expect(screen.getByRole("heading", { name: "Bài học" })).toBeInTheDocument();
    expect(screen.getByText("Giai đoạn thử")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Bài thử" }));
    expect(await screen.findByText("Thẻ 1/2")).toBeInTheDocument();
  });

  test("marks a finished lesson as done", async () => {
    renderWithApp(<AppRoutes />);
    await userEvent.click(screen.getByRole("link", { name: "Bài thử 2" }));
    await userEvent.click(await screen.findByRole("button", { name: "Hoàn thành" }));
    await userEvent.click(screen.getByRole("button", { name: "Về danh sách bài" }));
    expect(await screen.findByText("Đã xong")).toBeInTheDocument();
  });

  test("shows a message for an unknown lesson", () => {
    window.location.hash = "#/lesson/khong-co";
    renderWithApp(<AppRoutes />);
    expect(screen.getByText("Không tìm thấy bài học này.")).toBeInTheDocument();
  });
});

describe("ErrorBoundary", () => {
  test("shows a friendly message when a screen throws", () => {
    function Boom(): never {
      throw new Error("boom");
    }
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderWithApp(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Robo bị trục trặc rồi.");
    expect(screen.getByRole("button", { name: "Tải lại trang" })).toBeInTheDocument();
  });
});

describe("App", () => {
  test("shows the runner status from the client", async () => {
    const workers: FakeWorker[] = [];
    const client = new RunnerClient(() => {
      const worker = new FakeWorker();
      workers.push(worker);
      return worker;
    }, "http://localhost/pyodide/");
    render(<App bundle={testBundle()} runnerClient={client} />);
    expect(screen.getByText("Robo đang khởi động...")).toBeInTheDocument();
    act(() => workers[0]!.emit({ type: "ready" }));
    expect(await screen.findByText("Robo sẵn sàng")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `npx vitest run src/ui/routing.test.ts src/ui/LessonScreen.test.tsx src/ui/AppRoutes.test.tsx`
Expected: FAIL vì chưa có các module mới.

- [ ] **Step 3: Viết code**

`src/ui/routing.ts`:

```ts
import { useCallback, useEffect, useState } from "react";

export type Route = { name: "home" } | { name: "lesson"; lessonId: string };

export function parseHash(hash: string): Route {
  const match = /^#\/lesson\/(.+)$/.exec(hash);
  return match ? { name: "lesson", lessonId: decodeURIComponent(match[1] as string) } : { name: "home" };
}

export function routeToHash(route: Route): string {
  return route.name === "lesson" ? `#/lesson/${encodeURIComponent(route.lessonId)}` : "#/";
}

export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const navigate = useCallback((next: Route) => {
    window.location.hash = routeToHash(next);
  }, []);
  return [route, navigate];
}
```

`src/ui/browserSupport.ts`:

```ts
interface BrowserEnv {
  WebAssembly?: unknown;
  Worker?: unknown;
}

export function isBrowserSupported(env: BrowserEnv = globalThis as BrowserEnv): boolean {
  return typeof env.WebAssembly === "object" && env.WebAssembly !== null && typeof env.Worker === "function";
}
```

`src/ui/ErrorBoundary.tsx`:

```tsx
import { Component, type ReactNode } from "react";
import { useLang } from "../i18n/LangProvider";
import { Robot } from "./Robot";

function CrashFallback() {
  const { t } = useLang();
  return (
    <div role="alert" className="crash">
      <Robot mood="sad" size={80} />
      <p>{t("app.crash")}</p>
      <button onClick={() => window.location.reload()}>{t("app.reload")}</button>
    </div>
  );
}

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    console.error(error);
  }

  render(): ReactNode {
    return this.state.failed ? <CrashFallback /> : this.props.children;
  }
}
```

`src/ui/LessonScreen.tsx`:

```tsx
import { useMemo, useState } from "react";
import type { Card, Exercise, Lesson } from "../content/types";
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { CardView } from "./CardView";
import { CodeExerciseView } from "./CodeExerciseView";
import { QuestionCard } from "./QuestionCard";
import { Robot } from "./Robot";

type Step = { kind: "card"; card: Card } | { kind: "exercise"; exercise: Exercise };

export interface LessonScreenProps {
  lesson: Lesson;
  onComplete(lessonId: string): void;
  onExit(): void;
}

export function LessonScreen({ lesson, onComplete, onExit }: LessonScreenProps) {
  const { t, uiLang } = useLang();
  const steps = useMemo<Step[]>(
    () => [
      ...lesson.cards.map((card): Step => ({ kind: "card", card })),
      ...lesson.exercises.map((exercise): Step => ({ kind: "exercise", exercise })),
    ],
    [lesson],
  );
  const [index, setIndex] = useState(0);
  const [doneSteps, setDoneSteps] = useState<ReadonlySet<number>>(() => new Set());
  const [finished, setFinished] = useState(false);

  const step = steps[index];
  if (finished || step === undefined) {
    return (
      <main className="lesson-done">
        <Robot mood="happy" size={96} />
        <h2>{t("lesson.doneTitle")}</h2>
        <p>{t("lesson.doneBody")}</p>
        <button className="primary" onClick={onExit}>
          {t("lesson.backHome")}
        </button>
      </main>
    );
  }

  const markDone = (stepIndex: number) => setDoneSteps((previous) => new Set(previous).add(stepIndex));
  const next = () => {
    if (index + 1 < steps.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
      onComplete(lesson.id);
    }
  };

  const cardCount = lesson.cards.length;
  const progress =
    step.kind === "card"
      ? t("lesson.cardOf", { current: index + 1, total: cardCount })
      : t("lesson.exerciseOf", { current: index - cardCount + 1, total: lesson.exercises.length });
  const canGoNext = step.kind === "card" || doneSteps.has(index);
  const isLast = index === steps.length - 1;

  let body;
  if (step.kind === "card") {
    body = <CardView key={`card-${index}`} card={step.card} />;
  } else if (step.exercise.type === "code") {
    body = <CodeExerciseView key={step.exercise.id} exercise={step.exercise} onComplete={() => markDone(index)} />;
  } else {
    body = <QuestionCard key={step.exercise.id} question={step.exercise} onAnswered={() => markDone(index)} />;
  }

  return (
    <main className="lesson">
      <div className="lesson-top">
        <h1>{pick(lesson.title, uiLang)}</h1>
        <span>{progress}</span>
      </div>
      {body}
      <nav className="lesson-nav">
        <button onClick={() => setIndex(index - 1)} disabled={index === 0}>
          {t("lesson.back")}
        </button>
        <button className="primary" onClick={next} disabled={!canGoNext}>
          {isLast ? t("lesson.finish") : t("lesson.next")}
        </button>
      </nav>
    </main>
  );
}
```

`src/ui/HomeScreen.tsx`:

```tsx
import { pick } from "../i18n/lang";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { routeToHash } from "./routing";

export function HomeScreen({ completed }: { completed: ReadonlySet<string> }) {
  const bundle = useContent();
  const { t, uiLang } = useLang();
  return (
    <main className="home">
      <h1>{t("home.title")}</h1>
      {bundle.stages.map((stage) => (
        <section key={stage.id}>
          <h2>{pick(stage.title, uiLang)}</h2>
          {stage.topics.map((topic) => (
            <div key={topic.id} className="topic">
              <h3>{pick(topic.title, uiLang)}</h3>
              <ol className="lesson-list">
                {topic.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <a href={routeToHash({ name: "lesson", lessonId: lesson.id })}>{pick(lesson.title, uiLang)}</a>
                    {completed.has(lesson.id) && <span className="badge-done">{t("home.done")}</span>}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
```

`src/ui/AppRoutes.tsx`:

```tsx
import { useState } from "react";
import { findLesson } from "../content/lookup";
import { useLang } from "../i18n/LangProvider";
import { useContent } from "./contexts";
import { ErrorBoundary } from "./ErrorBoundary";
import { Header } from "./Header";
import { HomeScreen } from "./HomeScreen";
import { LessonScreen } from "./LessonScreen";
import { routeToHash, useHashRoute } from "./routing";

export function AppRoutes() {
  const [route, navigate] = useHashRoute();
  const bundle = useContent();
  const { t } = useLang();
  const [completed, setCompleted] = useState<ReadonlySet<string>>(() => new Set());

  let screen;
  if (route.name === "lesson") {
    const lesson = findLesson(bundle, route.lessonId);
    screen = lesson ? (
      <LessonScreen
        key={lesson.id}
        lesson={lesson}
        onComplete={(id) => setCompleted((previous) => new Set(previous).add(id))}
        onExit={() => navigate({ name: "home" })}
      />
    ) : (
      <main className="home">
        <p>{t("lesson.notFound")}</p>
        <a href="#/">{t("lesson.backHome")}</a>
      </main>
    );
  } else {
    screen = <HomeScreen completed={completed} />;
  }

  return (
    <>
      <Header />
      <ErrorBoundary key={routeToHash(route)}>{screen}</ErrorBoundary>
    </>
  );
}
```

`src/ui/App.tsx`:

```tsx
import type { ContentBundle } from "../content/types";
import type { RunnerClient } from "../runner/client";
import { AppRoutes } from "./AppRoutes";
import { AppProviders } from "./contexts";
import { useRunnerClient } from "./useRunnerClient";

export function App({ bundle, runnerClient }: { bundle: ContentBundle; runnerClient: RunnerClient }) {
  const runner = useRunnerClient(runnerClient);
  return (
    <AppProviders bundle={bundle} runner={runner}>
      <AppRoutes />
    </AppProviders>
  );
}
```

`src/content/bundle.ts`:

```ts
import generated from "../generated/content.json";
import type { ContentBundle } from "./types";

export const contentBundle = generated as unknown as ContentBundle;
```

`src/main.tsx` (thay toàn bộ):

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { contentBundle } from "./content/bundle";
import { translate } from "./i18n/translate";
import { createBrowserRunner } from "./runner/browser";
import { App } from "./ui/App";
import { isBrowserSupported } from "./ui/browserSupport";
import "./styles.css";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root element");
const root = createRoot(container);

if (isBrowserSupported()) {
  root.render(
    <StrictMode>
      <App bundle={contentBundle} runnerClient={createBrowserRunner()} />
    </StrictMode>,
  );
} else {
  root.render(<p className="crash">{translate("vi", "browser.unsupported")}</p>);
}
```

`src/styles.css`:

```css
:root {
  --bg: #f6f8fc;
  --surface: #ffffff;
  --text: #1d2440;
  --muted: #5b6475;
  --primary: #4f7cff;
  --success: #2a9d4a;
  --danger: #d33a3a;
  --border: #d5dcea;
  --code-bg: #1e1e2e;
  --code-text: #e6e9f2;
  --radius: 10px;
  --mono: ui-monospace, Menlo, Consolas, monospace;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: var(--text);
  background: var(--bg);
}

* { box-sizing: border-box; }
body { margin: 0; }

button {
  font: inherit;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
}
button.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
button[aria-pressed="true"] { background: var(--text); border-color: var(--text); color: #fff; }

.app-header { display: flex; align-items: center; gap: 16px; padding: 10px 20px; background: var(--text); color: #fff; }
.app-title { color: #fff; font-weight: 700; font-size: 1.2rem; text-decoration: none; }
.runner-status { margin-left: auto; font-size: 0.9rem; }
.lang-switch { display: flex; gap: 4px; }

.home, .lesson { max-width: 1200px; margin: 0 auto; padding: 20px; }
.lesson-list a { color: var(--primary); font-size: 1.1rem; }
.badge-done { margin-left: 8px; color: var(--success); font-weight: 600; }
.lesson-top { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
.lesson-nav { display: flex; justify-content: space-between; margin-top: 16px; }
.lesson-done, .crash { text-align: center; padding: 40px; }

.card, .question-card {
  max-width: 760px;
  margin: 0 auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  font-size: 1.1rem;
  line-height: 1.6;
}

.code-block, .output pre, .exercise-left pre, .diff pre, .bubble pre {
  background: var(--code-bg);
  color: var(--code-text);
  padding: 10px 12px;
  border-radius: 8px;
  font-family: var(--mono);
  font-size: 1rem;
  white-space: pre-wrap;
  overflow-x: auto;
}
.output { margin-top: 8px; }

.exercise-split { display: grid; grid-template-columns: minmax(280px, 1fr) minmax(360px, 1.3fr); gap: 20px; }
.exercise-left, .exercise-right {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}
.exercise-prompt { white-space: pre-wrap; font-size: 1.1rem; }
.input-label { display: block; margin-top: 8px; }
.input-label textarea { display: block; width: 100%; font-family: var(--mono); font-size: 1rem; }
.exercise-actions { display: flex; gap: 8px; margin: 8px 0; }
.hint { color: var(--muted); }

.code-editor { border: 1px solid var(--border); border-radius: 8px; font-size: 1.05rem; }
.code-editor .cm-editor { min-height: 220px; }
.cm-error-line { background: rgba(211, 58, 58, 0.18); }

.robot-bubble { display: flex; gap: 10px; align-items: flex-start; margin-top: 12px; }
.bubble { background: #fff8ea; border: 1px solid #f0d9a8; border-radius: var(--radius); padding: 8px 12px; }
.bubble-hint { color: var(--muted); }

.test-results { padding-left: 20px; }
.test-results .pass { color: var(--success); }
.test-results .fail { color: var(--danger); }
.diff { color: var(--text); }
.diff-line { display: block; background: rgba(211, 58, 58, 0.35); }

.question-card fieldset { border: none; padding: 0; margin: 12px 0; display: grid; gap: 8px; }
.choice { display: flex; gap: 8px; align-items: flex-start; border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; }
.choice-text { white-space: pre-wrap; }
.choice-text.code { font-family: var(--mono); }
.choice-correct { border-color: var(--success); background: #e6f7ea; }
.choice-wrong { border-color: var(--danger); background: #fdecec; }

.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@media (max-width: 900px) {
  .exercise-split { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Chạy test, xác nhận thành công**

Run: `npm test && npm run typecheck && npm run build`
Expected: PASS toàn bộ; `vite build` tạo `dist/` có file worker riêng (tên dạng `dist/assets/worker-*.js`).

- [ ] **Step 5: Chạy thử bằng tay**

Run: `npm run dev`, mở địa chỉ Vite in ra bằng Chrome.
Expected: header hiện "Robo đang khởi động..." rồi "Robo sẵn sàng"; trang chủ chưa có bài học (nội dung có ở Task 16). Không có lỗi đỏ trong Console. Tắt server bằng Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add src/ui src/content/bundle.ts src/main.tsx src/styles.css
git commit -F - <<'EOF'
feat(ui): wire the lesson screen, home screen, hash routing and app bootstrap

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 16: Nội dung chủ đề "Làm quen với chương trình"

**Files:**
- Create: `content/stage-1/stage.yaml`, `content/stage-1/01-lam-quen/topic.yaml`, `content/stage-1/01-lam-quen/concepts.yaml`, `content/stage-1/01-lam-quen/questions.yaml`, `content/stage-1/01-lam-quen/01-chuong-trinh-la-gi.md`, `content/stage-1/01-lam-quen/02-chu-hoa-dau-nhay.md`, `content/stage-1/01-lam-quen/03-tu-tren-xuong.md`, `content/stage-1/01-lam-quen/04-khi-may-khong-hieu.md`
- Modify: `content/errors/errors.yaml` (thêm `misconception` cho 5 mục), `src/content/parity.pyodide.test.ts` (thêm phần bài học)

**Interfaces:**
- Consumes: định dạng nội dung (Task 4); `judge`, `compareOutput` (Task 8); `allExercises`, `allLessons` (Task 3).
- Produces: giai đoạn `s1` với chủ đề `s1.lam-quen` gồm 4 bài (`s1.lam-quen.l1` đến `l4`), 6 khái niệm (`run-order`, `print-call`, `string-quotes`, `case-sensitive`, `read-error`, `ai-basics`), 8 câu hỏi ngân hàng. Bài đầu tiên có tiêu đề "Chương trình là gì?" và bài tập in ra `Xin chào Robo` (test đầu cuối dựa vào 2 chi tiết này).

- [ ] **Step 1: Mở rộng test đối chiếu cho bài học (test thất bại)**

Thay toàn bộ `src/content/parity.pyodide.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, test } from "vitest";
import { matchError } from "../explain/match";
import { problemFromOutcome } from "../explain/problem";
import { compareOutput } from "../runner/compare";
import { judge } from "../runner/judge";
import type { PyRunner } from "../runner/pyRun";
import { DEFAULT_TIMEOUT_MS, type RunFn } from "../runner/types";
import { getPyRunner } from "../test/pyodide";
import { allExercises, allLessons } from "./lookup";
import type { ChoiceQuestion, CodeExercise, ContentBundle } from "./types";

const bundle = JSON.parse(readFileSync("src/generated/content.json", "utf8")) as ContentBundle;
const exact = { kind: "exact" } as const;

let run: PyRunner;
let runAsync: RunFn;

beforeAll(async () => {
  run = await getPyRunner();
  runAsync = async (code, stdin) => run(code, stdin);
});

describe("error dictionary on Pyodide", () => {
  test("has the expected number of entries", () => {
    expect(bundle.errors.length).toBe(27);
  });

  for (const entry of bundle.errors) {
    test(`${entry.id}: the sample is recognized by its own entry`, () => {
      if (entry.match.type === "Timeout") {
        const timeout = { type: "Timeout", message: "", line: null, column: null, lineText: "" };
        expect(matchError(bundle.errors, timeout, entry.sample)?.entry.id).toBe(entry.id);
        return;
      }
      const result = run(entry.sample, entry.sampleInput);
      const problem = problemFromOutcome(result, entry.match.type === "InputPrompt");
      expect(problem?.type).toBe(entry.match.type);
      expect(matchError(bundle.errors, problem!, entry.sample)?.entry.id).toBe(entry.id);
    });
  }
});

describe("lesson content on Pyodide", () => {
  test("stage 1 has content", () => {
    expect(allLessons(bundle).length).toBeGreaterThan(0);
  });

  const exercises = allExercises(bundle);

  for (const exercise of exercises.filter((e): e is CodeExercise => e.type === "code")) {
    test(`${exercise.id}: solution passes fast, starter fails, common wrong outputs match`, async () => {
      expect((await judge(exercise, exercise.solution, runAsync)).status).toBe("accepted");
      for (const testCase of exercise.tests) {
        expect(run(exercise.solution, testCase.input).durationMs).toBeLessThan(DEFAULT_TIMEOUT_MS);
      }
      expect((await judge(exercise, exercise.starter, runAsync)).status).not.toBe("accepted");
      for (const wrong of exercise.commonWrong) {
        const testCase = exercise.tests[wrong.test]!;
        expect(compareOutput(wrong.output, run(wrong.sample, testCase.input).stdout, exact).equal).toBe(true);
      }
    });
  }

  for (const question of exercises.filter((e): e is ChoiceQuestion => e.type === "predict")) {
    test(`${question.id}: the marked answer matches Pyodide`, () => {
      const result = run(question.code ?? "", "");
      const correct = question.choices.find((choice) => choice.correct)!;
      if (result.outcome === "error") {
        expect(correct.error).toBe(true);
        return;
      }
      expect(result.outcome).toBe("ok");
      const matching = question.choices.filter(
        (choice) => !choice.error && compareOutput(choice.text.vi, result.stdout, exact).equal,
      );
      expect(matching).toEqual([correct]);
    });
  }

  for (const lesson of allLessons(bundle)) {
    test(`${lesson.id}: card examples behave as marked`, () => {
      for (const card of lesson.cards) {
        for (const segment of card.segments) {
          if (segment.kind !== "code" || !segment.run) continue;
          const result = run(segment.code, "");
          expect(result.outcome).toBe(segment.expectError ? "error" : "ok");
        }
      }
    });
  }
});
```

Run: `npm test -- src/content/parity.pyodide.test.ts`
Expected: FAIL ở `stage 1 has content` (chưa có bài học).

- [ ] **Step 2: Viết file giai đoạn, chủ đề, khái niệm**

`content/stage-1/stage.yaml`:

```yaml
id: s1
title: { vi: "Giai đoạn 1: Khởi động", en: "Stage 1: Getting started" }
topics:
  - 01-lam-quen
```

`content/stage-1/01-lam-quen/topic.yaml`:

```yaml
id: s1.lam-quen
title: { vi: "Làm quen với chương trình", en: "Meet your first program" }
lessons:
  - 01-chuong-trinh-la-gi.md
  - 02-chu-hoa-dau-nhay.md
  - 03-tu-tren-xuong.md
  - 04-khi-may-khong-hieu.md
```

`content/stage-1/01-lam-quen/concepts.yaml`:

```yaml
concepts:
  - id: run-order
    name: { vi: "Lệnh chạy lần lượt từ trên xuống", en: "Statements run from top to bottom" }
    misconception_card: |
      Nhiều bạn nghĩ máy tính tự chọn lệnh để chạy. Thực ra máy tính chạy **lần lượt từng dòng, từ trên xuống dưới**.
    parent_tip: |
      Cho con đọc to từng dòng code như đọc công thức nấu ăn: làm xong bước 1 mới tới bước 2.
  - id: print-call
    name: { vi: "Lệnh print cần dấu ngoặc tròn", en: "print needs round brackets" }
    misconception_card: |
      `print "Robo"` là cách viết của Python cũ. Bây giờ phải viết `print("Robo")`. Lệnh `print()` để trống sẽ in ra 1 dòng trống.
    parent_tip: |
      So sánh print với cái hộp: thứ cần in phải được đặt vào trong hộp ( ).
  - id: string-quotes
    name: { vi: "Chữ cần in phải nằm trong dấu nháy", en: "Text must be inside quotes" }
    misconception_card: |
      Không có dấu nháy, Python nghĩ `Robo` là tên biến. Có dấu nháy, `"Robo"` là chữ để in ra. Mở bằng dấu nháy nào thì đóng bằng dấu nháy đó.
    parent_tip: |
      Dấu nháy giống cặp ngoặc kép khi trích lời nói: những gì nằm trong đó được in ra y nguyên.
  - id: case-sensitive
    name: { vi: "Python phân biệt chữ hoa và chữ thường", en: "Python is case-sensitive" }
    misconception_card: |
      Với Python, `print`, `Print` và `PRINT` là 3 tên khác nhau. Chỉ có `print` là lệnh in.
    parent_tip: |
      Viết "an" và "An" lên giấy rồi hỏi con: với máy tính, 2 chữ này có giống nhau không? (Không.)
  - id: read-error
    name: { vi: "Đọc thông báo lỗi", en: "Reading error messages" }
    misconception_card: |
      Thông báo lỗi luôn có **số dòng** và **tên lỗi**. Hãy nhìn số dòng trước, rồi mới đọc tên lỗi.
    parent_tip: |
      Khi con gặp lỗi, hỏi con: "Lỗi ở dòng mấy? Tên lỗi là gì?" trước khi sửa.
  - id: ai-basics
    name: { vi: "AI là gì", en: "What AI is" }
    misconception_card: |
      AI không phải phép thuật. AI là chương trình máy tính học từ rất nhiều ví dụ để làm những việc giống con người, như nhận ra khuôn mặt hay hiểu giọng nói.
    parent_tip: |
      Tìm cùng con 3 thứ trong nhà có dùng AI, ví dụ mở khóa điện thoại bằng khuôn mặt hoặc trợ lý giọng nói.
```

- [ ] **Step 3: Viết 4 bài học**

`content/stage-1/01-lam-quen/01-chuong-trinh-la-gi.md`:

````markdown
---
id: s1.lam-quen.l1
title: { vi: "Chương trình là gì?", en: "What is a program?" }
exercises:
  - id: s1.lam-quen.l1.ex1
    type: code
    concepts: [print-call, string-quotes]
    prompt:
      vi: "Viết chương trình in ra dòng chữ: Xin chào Robo"
      en: "Write a program that prints this text: Xin chào Robo"
    starter: |
      # Viết lệnh của con ở dưới dòng này
    solution: |
      print("Xin chào Robo")
    tests:
      - { output: "Xin chào Robo" }
    hints:
      - { vi: "Dùng lệnh print(...).", en: "Use print(...)." }
      - { vi: "Chữ cần in phải nằm trong dấu nháy kép: print(\"...\")", en: "Put the text inside double quotes: print(\"...\")" }
    test_eligible: true
  - id: s1.lam-quen.l1.q1
    type: mcq
    concepts: [print-call, string-quotes, case-sensitive]
    prompt:
      vi: "Lệnh nào in ra màn hình dòng chữ Hello?"
      en: "Which statement prints the text Hello?"
    choices:
      - { text: "print(\"Hello\")", correct: true }
      - { text: "print(Hello)", misconception: string-quotes }
      - { text: "Print(\"Hello\")", misconception: case-sensitive }
      - { text: "print \"Hello\"", misconception: print-call }
    explanation:
      vi: "Lệnh in là print viết thường, có dấu ngoặc tròn, và chữ cần in nằm trong dấu nháy."
      en: "The print statement uses lower-case print, round brackets, and quotes around the text."
---
**Chương trình** là một danh sách **lệnh** viết cho máy tính. Máy tính làm đúng từng lệnh, không hơn, không kém.

Trong Py-Pet, con viết lệnh bằng ngôn ngữ **Python**. Bấm **Chạy thử** để xem máy tính làm gì:

```python run
print("Xin chào, mình là Robo!")
```
---
Lệnh `print(...)` nghĩa là **in ra màn hình**. Chữ muốn in phải nằm trong cặp dấu nháy kép `"..."`.

```python run
print("Python thật vui")
```

Con thử đoán: nếu đổi chữ bên trong dấu nháy thì kết quả sẽ thay đổi thế nào?
````

`content/stage-1/01-lam-quen/02-chu-hoa-dau-nhay.md`:

````markdown
---
id: s1.lam-quen.l2
title: { vi: "Dấu nháy và chữ hoa, chữ thường", en: "Quotes and letter case" }
exercises:
  - id: s1.lam-quen.l2.ex1
    type: code
    concepts: [case-sensitive, string-quotes]
    prompt:
      vi: "Đoạn code bên phải có 2 lỗi. Hãy sửa để chương trình in ra: Robo đang học Python"
      en: "The code on the right has 2 errors. Fix it so that the program prints: Robo đang học Python"
    starter: |
      Print("Robo đang học Python)
    solution: |
      print("Robo đang học Python")
    tests:
      - { output: "Robo đang học Python" }
    hints:
      - { vi: "Python phân biệt chữ hoa và chữ thường.", en: "Python sees upper-case and lower-case letters as different." }
      - { vi: "Chuỗi mở bằng dấu \" thì phải đóng bằng dấu \".", en: "A string that opens with \" must close with \"." }
    test_eligible: true
  - id: s1.lam-quen.l2.q1
    type: predict
    concepts: [string-quotes]
    code: |
      print("Robo")
      print('Robo')
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "Robo\nRobo", correct: true }
      - { vi: "Báo lỗi ở dòng 2", en: "An error on line 2", error: true, misconception: string-quotes }
      - { text: "\"Robo\"\n'Robo'" }
      - { text: "Robo" }
    explanation:
      vi: "Nháy kép và nháy đơn đều dùng được. Dấu nháy không được in ra, chỉ có chữ bên trong."
      en: "Double quotes and single quotes both work. The quotes are not printed. Only the text inside is printed."
---
Python phân biệt **chữ hoa** và **chữ thường**. `print` là đúng, còn `Print` hay `PRINT` là sai. Bấm Chạy thử để xem Robo giải thích lỗi:

```python run expect-error
Print("Robo")
```
---
Chữ cần in phải nằm trong cặp dấu nháy. Có thể dùng nháy kép `"..."` hoặc nháy đơn `'...'`, nhưng **mở bằng loại nào thì đóng bằng loại đó**.

```python run
print('Robo thích Python')
print("Robo thích Python")
```
````

`content/stage-1/01-lam-quen/03-tu-tren-xuong.md`:

````markdown
---
id: s1.lam-quen.l3
title: { vi: "Lệnh chạy từ trên xuống", en: "From top to bottom" }
exercises:
  - id: s1.lam-quen.l3.ex1
    type: code
    concepts: [run-order, print-call]
    prompt:
      vi: "Viết chương trình in ra khuôn mặt của Robo, đúng 4 dòng như phần Ví dụ."
      en: "Write a program that prints the face of Robo: 4 lines, exactly as in the Example."
    starter: |
      print("+-----+")
    solution: |
      print("+-----+")
      print("| o o |")
      print("|  -  |")
      print("+-----+")
    tests:
      - output: |
          +-----+
          | o o |
          |  -  |
          +-----+
    common_wrong:
      - output: |
          +-----+
          +-----+
          | o o |
          |  -  |
        misconception: run-order
        sample: |
          print("+-----+")
          print("+-----+")
          print("| o o |")
          print("|  -  |")
    hints:
      - { vi: "Mỗi lệnh print in ra 1 dòng. Con cần 4 lệnh print.", en: "Each print statement prints 1 line. You need 4 print statements." }
      - { vi: "Các dòng được in theo đúng thứ tự con viết lệnh.", en: "The lines come out in the same order as your statements." }
    test_eligible: true
  - id: s1.lam-quen.l3.q1
    type: predict
    concepts: [print-call]
    code: |
      print("A")
      print()
      print("B")
    prompt:
      vi: "Đoạn code in ra gì?"
      en: "What is the output of this code?"
    choices:
      - { text: "A\n\nB", correct: true }
      - { text: "A\nB", misconception: print-call }
      - { text: "AB" }
      - { text: "A\n()\nB", misconception: print-call }
    explanation:
      vi: "print() không có gì bên trong sẽ in ra 1 dòng trống."
      en: "print() with nothing inside prints 1 empty line."
---
Máy tính chạy các lệnh **lần lượt từ trên xuống dưới**. Mỗi lệnh `print` in ra **1 dòng**.

```python run
print("1. Thức dậy")
print("2. Đánh răng")
print("3. Học Python")
```
---
Muốn in ra **1 dòng trống**, dùng `print()` và để trống bên trong.

```python run
print("Dòng 1")
print()
print("Dòng 3")
```
````

`content/stage-1/01-lam-quen/04-khi-may-khong-hieu.md`:

````markdown
---
id: s1.lam-quen.l4
title: { vi: "Khi máy tính không hiểu", en: "When the computer does not understand" }
exercises:
  - id: s1.lam-quen.l4.q1
    type: predict
    concepts: [read-error, string-quotes]
    code: |
      print("Một")
      print(Hai)
      print("Ba")
    prompt:
      vi: "Chuyện gì xảy ra khi chạy đoạn code này?"
      en: "What happens when this code runs?"
    choices:
      - { vi: "In ra Một, rồi báo lỗi NameError ở dòng 2", en: "It prints Một, then shows a NameError on line 2", correct: true, error: true }
      - { text: "Một\nHai\nBa", misconception: string-quotes }
      - { text: "Một\nBa" }
      - { vi: "Không in gì, báo lỗi SyntaxError ở dòng 2", en: "It prints nothing and shows a SyntaxError on line 2", error: true, misconception: read-error }
    explanation:
      vi: "Dòng 1 chạy bình thường. Ở dòng 2, Hai không có dấu nháy nên Python nghĩ đó là tên biến chưa có, và dừng lại với lỗi NameError. Dòng 3 không được chạy."
      en: "Line 1 runs. On line 2, Hai has no quotes, so Python thinks it is a variable that does not exist and stops with a NameError. Line 3 does not run."
  - id: s1.lam-quen.l4.ex1
    type: code
    concepts: [read-error, string-quotes]
    prompt:
      vi: "Đoạn code bên phải có 2 lỗi. Hãy đọc thông báo lỗi để tìm và sửa từng lỗi, sao cho chương trình in ra 3 dòng như phần Ví dụ."
      en: "The code on the right has 2 errors. Read the error messages to find and fix each error, so that the program prints the 3 lines in the Example."
    starter: |
      print("Robo")
      print("đang học)
      print(Python)
    solution: |
      print("Robo")
      print("đang học")
      print("Python")
    tests:
      - output: |
          Robo
          đang học
          Python
    hints:
      - { vi: "Bấm Chạy thử và xem số dòng trong thông báo lỗi.", en: "Click Run and look at the line number in the error message." }
      - { vi: "Sửa xong 1 lỗi thì chạy lại để tìm lỗi tiếp theo.", en: "After you fix 1 error, run the code again to find the next error." }
    test_eligible: true
---
Khi code viết sai, Python dừng lại và báo **lỗi**. Lỗi không có gì đáng sợ: nó cho biết **dòng nào** sai và **sai kiểu gì**.

```python run expect-error
print("Bắt đầu")
print(Robo)
```

Con thấy không? Dòng 1 vẫn in ra "Bắt đầu", rồi Python dừng ở dòng 2.
---
Thông báo lỗi có 2 phần quan trọng: **số dòng** (line) và **tên lỗi** (ví dụ SyntaxError, NameError). Robo giải thích bằng tiếng Việt, còn bản gốc tiếng Anh nằm trong mục *Xem lỗi gốc*.

Với lỗi cú pháp **SyntaxError**, Python không chạy dòng nào cả, kể cả các dòng đúng ở phía trên:

```python run expect-error
print("Bắt đầu")
print("Thiếu dấu nháy)
```
````

- [ ] **Step 4: Viết ngân hàng câu hỏi**

`content/stage-1/01-lam-quen/questions.yaml`:

```yaml
questions:
  - id: s1.lam-quen.b1
    type: mcq
    concepts: [ai-basics]
    lessons: [s1.lam-quen.l1]
    prompt:
      vi: "Trí tuệ nhân tạo (AI) là gì?"
      en: "What is artificial intelligence (AI)?"
    choices:
      - { vi: "Một chương trình chỉ làm theo một bộ quy tắc cố định, không bao giờ thay đổi", en: "A program that only follows a fixed set of rules and never changes" }
      - { vi: "Một hệ thống máy tính làm được những việc thường cần trí thông minh của con người", en: "A computer system that can do tasks that usually need human intelligence", correct: true }
      - { vi: "Một loại máy tính chạy không cần điện", en: "A type of computer that runs without electricity" }
      - { vi: "Một trò chơi do robot chơi", en: "A game that robots play" }
    explanation:
      vi: "AI giúp máy tính làm những việc như nhận ra giọng nói, hiểu ngôn ngữ hay đưa ra quyết định."
      en: "AI lets computers do tasks such as recognizing speech, understanding language or making decisions."

  - id: s1.lam-quen.b2
    type: mcq
    concepts: [ai-basics]
    lessons: [s1.lam-quen.l1]
    prompt: { vi: "Ví dụ nào dưới đây có dùng AI?", en: "Which example uses AI?" }
    choices:
      - { vi: "Máy tính cầm tay cộng 2 số", en: "A calculator adds 2 numbers" }
      - { vi: "Điện thoại nhận ra khuôn mặt để mở khóa", en: "A phone recognizes a face to unlock", correct: true }
      - { vi: "Bóng đèn bật khi nhấn công tắc", en: "A light turns on when you press the switch" }
      - { vi: "Đồng hồ báo thức kêu lúc 6 giờ", en: "An alarm clock rings at 6 o'clock" }
    explanation:
      vi: "Nhận ra khuôn mặt cần học từ rất nhiều ảnh, đó là việc của AI. Các ví dụ khác chỉ làm theo một quy tắc cố định."
      en: "To recognize a face, a system learns from many photos. That is AI. The other examples only follow a fixed rule."

  - id: s1.lam-quen.b3
    type: mcq
    concepts: [run-order]
    lessons: [s1.lam-quen.l3]
    prompt: { vi: "Máy tính chạy các lệnh trong chương trình theo thứ tự nào?", en: "In which order does the computer run the statements of a program?" }
    choices:
      - { vi: "Lần lượt từ trên xuống dưới", en: "One by one, from top to bottom", correct: true }
      - { vi: "Từ dưới lên trên", en: "From bottom to top", misconception: run-order }
      - { vi: "Lệnh ngắn chạy trước, lệnh dài chạy sau", en: "Short statements first, long statements last", misconception: run-order }
      - { vi: "Tất cả cùng một lúc", en: "All at the same time", misconception: run-order }
    explanation:
      vi: "Máy tính chạy từng lệnh một, từ dòng đầu tiên tới dòng cuối cùng."
      en: "The computer runs one statement at a time, from the first line to the last line."

  - id: s1.lam-quen.b4
    type: predict
    concepts: [run-order]
    lessons: [s1.lam-quen.l3]
    code: |
      print("Py")
      print("Pet")
    prompt: { vi: "Đoạn code in ra gì?", en: "What is the output of this code?" }
    choices:
      - { text: "Py\nPet", correct: true }
      - { text: "Pet\nPy", misconception: run-order }
      - { text: "PyPet" }
      - { text: "Py Pet" }
    explanation:
      vi: "Mỗi print in 1 dòng, theo thứ tự từ trên xuống."
      en: "Each print shows 1 line, in order from top to bottom."

  - id: s1.lam-quen.b5
    type: predict
    concepts: [print-call]
    lessons: [s1.lam-quen.l3]
    code: |
      print("Xin")
      print()
      print()
      print("chào")
    prompt: { vi: "Đoạn code in ra gì?", en: "What is the output of this code?" }
    choices:
      - { text: "Xin\n\n\nchào", correct: true }
      - { text: "Xin\n\nchào", misconception: print-call }
      - { text: "Xin chào" }
      - { text: "Xin\nchào", misconception: print-call }
    explanation:
      vi: "Mỗi print() để trống in ra 1 dòng trống. Có 2 lệnh như vậy nên có 2 dòng trống."
      en: "Each empty print() prints 1 empty line. There are 2 of them, so there are 2 empty lines."

  - id: s1.lam-quen.b6
    type: predict
    concepts: [case-sensitive, read-error]
    lessons: [s1.lam-quen.l2]
    code: |
      print('Hi')
      Print('Bye')
    prompt: { vi: "Chuyện gì xảy ra khi chạy đoạn code này?", en: "What happens when this code runs?" }
    choices:
      - { vi: "In ra Hi, rồi báo lỗi NameError ở dòng 2", en: "It prints Hi, then shows a NameError on line 2", correct: true, error: true }
      - { text: "Hi\nBye", misconception: case-sensitive }
      - { text: "Hi" }
      - { vi: "Không in ra gì", en: "Nothing is printed" }
    explanation:
      vi: "Dòng 1 in ra Hi. Ở dòng 2, Print viết hoa nên Python không biết đó là lệnh gì và báo lỗi NameError."
      en: "Line 1 prints Hi. On line 2, Print has an upper-case P, so Python does not know it and shows a NameError."

  - id: s1.lam-quen.b7
    type: mcq
    concepts: [case-sensitive, string-quotes]
    lessons: [s1.lam-quen.l2]
    prompt: { vi: "Dòng code nào viết đúng?", en: "Which line of code is correct?" }
    choices:
      - { text: "print(\"Robo\")", correct: true }
      - { text: "PRINT(\"Robo\")", misconception: case-sensitive }
      - { text: "print(Robo)", misconception: string-quotes }
      - { text: "print(\"Robo')", misconception: string-quotes }
    explanation:
      vi: "print phải viết thường, và chữ phải mở, đóng bằng cùng một loại dấu nháy."
      en: "print must be in lower-case letters, and the text must open and close with the same type of quote."

  - id: s1.lam-quen.b8
    type: mcq
    concepts: [read-error]
    lessons: [s1.lam-quen.l4]
    prompt: { vi: "Thông báo lỗi của Python cho con biết điều gì?", en: "What does a Python error message tell you?" }
    choices:
      - { vi: "Dòng bị lỗi và tên loại lỗi", en: "The line with the error and the type of error", correct: true }
      - { vi: "Cách sửa lỗi đúng hoàn toàn", en: "The complete correct fix", misconception: read-error }
      - { vi: "Máy tính đã bị hỏng", en: "The computer is broken" }
      - { vi: "Không có thông tin gì quan trọng", en: "Nothing important", misconception: read-error }
    explanation:
      vi: "Thông báo lỗi cho biết lỗi ở dòng nào và là loại lỗi gì. Con dùng thông tin đó để tự tìm cách sửa."
      en: "An error message tells you the line and the type of the error. You use this information to find the fix."
```

- [ ] **Step 5: Gắn khái niệm cho từ điển lỗi**

Trong `content/errors/errors.yaml`, thêm đúng 1 dòng `misconception` vào mỗi mục sau, đặt ngay dưới dòng `match`:

| Mục | Dòng thêm vào |
|---|---|
| `unterminated-string` | `  misconception: string-quotes` |
| `smart-quote` | `  misconception: string-quotes` |
| `print-no-paren` | `  misconception: print-call` |
| `name-similar` | `  misconception: case-sensitive` |
| `name-undefined` | `  misconception: string-quotes` |

Ví dụ kết quả cho mục `print-no-paren`:

```yaml
- id: print-no-paren
  match: { type: SyntaxError, message: "^Missing parentheses in call to 'print'" }
  misconception: print-call
  explain:
    vi: "Dòng {line}: lệnh print cần dấu ngoặc tròn, ví dụ print(\"Robo\")."
    en: "Line {line}: print needs round brackets, for example print(\"Robo\")."
  sample: "print \"Robo\""
```

- [ ] **Step 6: Chạy toàn bộ kiểm tra nội dung**

Run: `npm run content:validate && npm test`
Expected: dòng `Đã build nội dung: 1 giai đoạn, 4 bài học, 27 mục lỗi`; `Nội dung hợp lệ.`; mọi test PASS (gồm test đối chiếu cho 4 bài tập code, 6 câu predict và 4 bài học). Nếu 1 câu predict báo không khớp, sửa nội dung câu hỏi cho đúng với Python thật, không sửa test.

- [ ] **Step 7: Chạy thử bằng tay**

Run: `npm run dev`, mở bằng Chrome, học thử bài 1 đến bài 4.
Expected: các ví dụ chạy được; ví dụ `expect-error` hiện giải thích tiếng Việt; bài tập nộp lời giải mẫu thì đúng hết; nút VI/EN của câu hỏi đổi được ngôn ngữ.

- [ ] **Step 8: Commit**

```bash
git add content src/content/parity.pyodide.test.ts
git commit -F - <<'EOF'
feat(content): add stage 1 topic "Làm quen với chương trình" with 4 lessons and 8 bank questions

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 17: Test đầu cuối, checklist kiểm thử thủ công và tài liệu chạy dự án

**Files:**
- Create: `playwright.config.ts`, `e2e/lesson.spec.ts`, `docs/manual-test-checklist.md`
- Modify: `README.md`, `package.json` (scripts `test:e2e`, `check`)

**Interfaces:**
- Consumes: toàn bộ app (Task 1 đến 16), nội dung bài `s1.lam-quen.l1`.
- Produces: `npm run test:e2e` (Playwright, Chromium, chạy trên bản build qua `vite preview` cổng 4173); `npm run check` chạy mọi kiểm tra theo thứ tự.

- [ ] **Step 1: Cài trình duyệt cho Playwright và viết cấu hình**

```bash
npx playwright install chromium
npm pkg set scripts.test:e2e="playwright test"
npm pkg set scripts.check="npm run typecheck && npm test && npm run test:py && npm run content:validate && npm run test:e2e"
```

`playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  expect: { timeout: 30_000 },
  use: { baseURL: "http://localhost:4173/", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4173/",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

- [ ] **Step 2: Viết test đầu cuối**

`e2e/lesson.spec.ts`:

```ts
import { expect, test, type Page } from "@playwright/test";

async function openFirstExercise(page: Page) {
  await page.goto("./");
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
  await page.getByRole("link", { name: "Chương trình là gì?" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await page.getByRole("button", { name: "Tiếp" }).click();
  await expect(page.getByText("Bài tập 1/2")).toBeVisible();
}

async function typeCode(page: Page, code: string) {
  const editor = page.getByRole("textbox", { name: "Trình soạn code" });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type(code);
}

test("runs an example on a card with real Pyodide", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
  await page.getByRole("link", { name: "Chương trình là gì?" }).click();
  await page.getByRole("button", { name: "Chạy thử" }).click();
  await expect(page.getByRole("region", { name: "Kết quả" })).toContainText("Xin chào, mình là Robo!");
});

test("submits a correct answer to the first exercise", async ({ page }) => {
  await openFirstExercise(page);
  await typeCode(page, 'print("Xin chào Robo")');
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tiếp" })).toBeEnabled();
});

test("explains an error in Vietnamese and marks the line", async ({ page }) => {
  await openFirstExercise(page);
  await typeCode(page, "print(Robo)");
  await page.getByRole("button", { name: "Chạy thử" }).click();
  await expect(page.getByText('Dòng 1: Python không biết "Robo" là gì.', { exact: false })).toBeVisible();
  await expect(page.locator(".cm-error-line")).toHaveCount(1);
  await expect(page.getByText("Xem lỗi gốc")).toBeVisible();
});

test("stops an endless loop and stays usable", async ({ page }) => {
  await openFirstExercise(page);
  await typeCode(page, "while True:\npass");
  await page.getByRole("button", { name: "Chạy thử" }).click();
  await expect(page.getByText("Code chạy lâu quá nên Robo đã dừng lại.", { exact: false })).toBeVisible();
  await expect(page.getByText("Robo sẵn sàng")).toBeVisible({ timeout: 60_000 });
  await typeCode(page, 'print("Xin chào Robo")');
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(page.getByText("Đúng hết 1/1 test!")).toBeVisible();
});

test("switches the interface to English", async ({ page }) => {
  await openFirstExercise(page);
  await page.getByRole("group", { name: "Ngôn ngữ giao diện" }).getByRole("button", { name: "EN" }).click();
  await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  await expect(page.getByText("Write a program that prints this text: Xin chào Robo")).toBeVisible();
});
```

Ghi chú: trong test vòng lặp vô hạn, CodeMirror tự thụt lề dòng `pass` sau khi gõ Enter sau dấu `:`, nên chuỗi gõ vào không cần dấu cách.

- [ ] **Step 3: Chạy test đầu cuối**

Run: `npm run test:e2e`
Expected: 5 test PASS. Nếu Worker không tải được `pyodide.mjs` từ `public/pyodide/` (lỗi trong Console của trace), kiểm tra lại `tools/copy_pyodide.mjs` đã chép đủ 5 file và `createBrowserRunner` dựng `indexURL` từ `import.meta.env.BASE_URL`; không chuyển sang tải Pyodide từ CDN.

- [ ] **Step 4: Viết checklist kiểm thử thủ công**

`docs/manual-test-checklist.md`:

```markdown
# Checklist kiểm thử thủ công (M1)

Chạy trước mỗi lần phát hành. Ghi kết quả (Đạt / Không đạt + ghi chú) và ngày kiểm thử (YYYY-MM-DD).

## Môi trường

- [ ] Chrome bản mới nhất trên macOS
- [ ] Edge bản mới nhất trên Windows (nếu có máy)
- [ ] Laptop màn hình 13 inch: màn hình bài tập chia đôi không bị tràn ngang
- [ ] Laptop màn hình 15 inch

## Gõ tiếng Việt trong trình soạn code

- [ ] Bộ gõ tiếng Việt của macOS (Telex): gõ `print("Xin chào Robo")`, nộp bài 1 được chấm đúng
- [ ] Unikey hoặc EVKey (Telex) trên Windows: gõ như trên, được chấm đúng
- [ ] Gõ dấu xong rồi xóa lùi: không còn ký tự dấu thừa
- [ ] Gõ tiếng Việt trong ô Input: chương trình đọc đúng chữ có dấu

## Hành vi chạy code

- [ ] Lần đầu mở trang: hiện "Robo đang khởi động..." rồi "Robo sẵn sàng" trong vòng 15 giây
- [ ] Bấm "Chạy thử" nhiều lần liên tiếp thật nhanh: kết quả không bị lẫn, không treo
- [ ] Vòng lặp vô hạn: sau khoảng 2 giây có thông báo dừng, sau đó chạy tiếp được
- [ ] Dán dấu nháy cong từ Word vào code: có giải thích riêng về dấu nháy cong
- [ ] Viết `input("Nhập: ")` trong bài có Input rồi nộp: có giải thích về chữ trong input()

## Quan sát con dùng thử

- [ ] Con tự học bài 1 mà không cần hỏi bố mẹ
- [ ] Ghi lại những chỗ con dừng lại lâu, hỏi lại, hoặc bấm nhầm
- [ ] Hỏi con: lời giải thích lỗi của Robo có dễ hiểu không?
```

- [ ] **Step 5: Cập nhật `README.md`**

Thay toàn bộ `README.md`:

````markdown
# py-pet

Ứng dụng web dạy Python cho học sinh lớp 6 qua việc nuôi robot ảo. Python chạy ngay trong trình duyệt bằng Pyodide.

- Thiết kế: `docs/superpowers/specs/2026-10-06-py-pet-design.md`
- Kế hoạch M1: `docs/superpowers/plans/2026-10-06-m1-lat-cat-doc.md`

## Cài đặt lần đầu

```bash
npm install
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
npx playwright install chromium
```

## Lệnh thường dùng

| Lệnh | Việc làm |
|---|---|
| `npm run dev` | Chạy app ở chế độ phát triển |
| `npm test` | Build nội dung rồi chạy test Vitest (gồm test trên Pyodide thật) |
| `npm run test:py` | Test cho script kiểm tra nội dung |
| `npm run content:validate` | Build nội dung và chạy mọi đoạn code trong nội dung bằng Python |
| `npm run test:e2e` | Test đầu cuối bằng Playwright trên bản build |
| `npm run check` | Chạy tất cả kiểm tra ở trên |
| `npm run build` | Build bản tĩnh vào `dist/` |

## Soạn nội dung

Nội dung nằm trong `content/`. Mỗi bài học là 1 file Markdown có phần đầu YAML. Sau khi sửa nội dung, chạy `npm run content:validate`. ID đã phát hành thì không được đổi.
````

- [ ] **Step 6: Chạy toàn bộ kiểm tra**

Run: `npm run check`
Expected: typecheck sạch; Vitest PASS; pytest PASS; `Nội dung hợp lệ.`; Playwright 5 test PASS.

- [ ] **Step 7: Commit**

```bash
git add playwright.config.ts e2e docs/manual-test-checklist.md README.md package.json
git commit -F - <<'EOF'
test: add Playwright end-to-end tests, manual checklist and project README

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Ngoài phạm vi M1 (để rõ ranh giới)

| Mục trong spec | Mốc |
|---|---|
| Lưu tiến độ, nháp code, nhật ký lỗi lạ vào IndexedDB; Web Locks chống mở 2 tab; nút xuất file trong màn hình lỗi | M2 |
| XP, xu, Pin/Vui, Phòng robot, Bản đồ học, màn hình kết quả | M2 |
| Thẻ "Hiểu lầm thường gặp", điểm thành thạo, trạm ôn, kiểm tra, bài `parsons`/`fill`; kiểm tra spec 3.9 mục 8 và 9 | M3 |
| Cài đặt `questionLanguage` mặc định do phụ huynh chọn | M4 |
| CI GitHub Actions và deploy GitHub Pages | M6 |
