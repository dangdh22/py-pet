import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

/**
 * The colors of the light code editor (UI revamp plan, design decision 9). Every syntax color has at least 4.5:1
 * with the editor background, the selection and the 2 line tints, also when a tint is over the selection
 * (`editorTheme.test.ts` checks this). The error line is not `--danger-bg`: that color would drop 3 syntax colors under 4.5:1.
 *
 * `activeLine` and `errorLine` are translucent on purpose. CodeMirror draws the selection in a layer behind the text,
 * and the background of a line is painted over that layer: an opaque tint would hide the selection on the line with
 * the cursor and on the error line. Over `background` they look like the plan's `#f8f1de` and `#ffecec`.
 */
export const EDITOR_COLORS = {
  background: "#fffdf6",
  gutterBackground: "#f6efdc",
  gutterText: "#6b6455",
  activeLine: "rgba(238, 223, 186, 0.4)",
  selection: "#dbe4ff",
  errorLine: "rgba(255, 211, 221, 0.4)",
  syntax: {
    keyword: "#b03a0a",
    string: "#146c34",
    number: "#7e22ce",
    function: "#1d4ed8",
    comment: "#555555",
    text: "#141414",
  },
} as const;

/** The line between the line numbers and the code; it is a decoration, so it has no contrast rule. */
const GUTTER_BORDER = "#efe6cf";

const theme = EditorView.theme(
  {
    "&": {
      backgroundColor: EDITOR_COLORS.background,
      color: EDITOR_COLORS.syntax.text,
      fontSize: "16px",
    },
    "&.cm-focused": {
      outline: "3px solid var(--primary)",
      outlineOffset: "2px",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono)",
      // The code is shown as typed: `!=`, `==`, `<=` and `->` must not turn into one sign (the font joins them).
      fontVariantLigatures: "none",
      lineHeight: "1.6",
    },
    ".cm-content": {
      caretColor: EDITOR_COLORS.syntax.text,
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: EDITOR_COLORS.syntax.text,
      borderLeftWidth: "2px",
    },
    ".cm-gutters": {
      backgroundColor: EDITOR_COLORS.gutterBackground,
      color: EDITOR_COLORS.gutterText,
      border: "none",
      borderRight: `2px solid ${GUTTER_BORDER}`,
    },
    ".cm-activeLine": {
      backgroundColor: EDITOR_COLORS.activeLine,
    },
    ".cm-activeLineGutter": {
      backgroundColor: EDITOR_COLORS.gutterBackground,
      color: EDITOR_COLORS.syntax.text,
      fontWeight: "700",
    },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: EDITOR_COLORS.selection,
      },
    // `.cm-line.cm-error-line` is more specific than `.cm-activeLine`, so the error line wins when the cursor is on it.
    ".cm-line.cm-error-line": {
      backgroundColor: EDITOR_COLORS.errorLine,
      boxShadow: "inset 4px 0 0 var(--coral)",
    },
  },
  { dark: false },
);

const highlightStyle = HighlightStyle.define([
  {
    tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword, tags.operatorKeyword, tags.moduleKeyword],
    color: EDITOR_COLORS.syntax.keyword,
    fontWeight: "600",
  },
  { tag: [tags.string, tags.special(tags.string)], color: EDITOR_COLORS.syntax.string },
  { tag: [tags.number, tags.bool, tags.null], color: EDITOR_COLORS.syntax.number },
  {
    tag: [tags.function(tags.variableName), tags.function(tags.propertyName), tags.className],
    color: EDITOR_COLORS.syntax.function,
  },
  { tag: tags.comment, color: EDITOR_COLORS.syntax.comment, fontStyle: "italic" },
]);

export const editorTheme: Extension = [theme, syntaxHighlighting(highlightStyle)];
