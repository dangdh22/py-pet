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
