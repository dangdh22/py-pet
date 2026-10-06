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
