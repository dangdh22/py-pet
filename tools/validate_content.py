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


def _check_solution(exercise: dict) -> list[str]:
    ex_id, compare = exercise["id"], exercise["compare"]
    problems = []
    for index, test in enumerate(exercise["tests"]):
        result = run_code(exercise["solution"], test["input"])
        if result.outcome != "ok":
            problems.append(f"[{ex_id}] lời giải mẫu bị {_describe(result)} ở test {index}")
        elif not outputs_match(test["output"], result.stdout, compare):
            problems.append(
                f"[{ex_id}] lời giải mẫu sai ở test {index}: mong đợi {test['output']!r}, nhận {result.stdout!r}"
            )
    return problems


def _passes_all(code: str, exercise: dict) -> bool:
    for test in exercise["tests"]:
        result = run_code(code, test["input"])
        if result.outcome != "ok" or not outputs_match(test["output"], result.stdout, exercise["compare"]):
            return False
    return True


def check_code_exercise(exercise: dict) -> list[str]:
    ex_id, tests = exercise["id"], exercise["tests"]
    problems = _check_solution(exercise)
    compare = exercise["compare"]
    if _passes_all(exercise["starter"], exercise):
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


FILL_BLANK = "___"


def check_tested_exercise(exercise: dict) -> list[str]:
    """Parsons and fill: the solution passes every test; a fill template with empty blanks does not."""
    problems = _check_solution(exercise)
    if exercise["type"] == "fill" and _passes_all(exercise["template"].replace(FILL_BLANK, ""), exercise):
        problems.append(f"[{exercise['id']}] mẫu để trống vẫn qua hết test, bài tập không có ý nghĩa")
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
            for exercise in topic.get("practice", []):
                yield "item", exercise


def validate_bundle(bundle: dict) -> list[str]:
    problems = []
    for kind, item in _items(bundle):
        if kind == "lesson":
            problems += check_examples(item)
        elif item["type"] == "code":
            problems += check_code_exercise(item)
        elif item["type"] in ("parsons", "fill"):
            problems += check_tested_exercise(item)
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
