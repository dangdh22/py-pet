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
