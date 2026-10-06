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
    assert vc.normalize_output("chào") == vc.normalize_output("chào")


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


def graded(kind, **overrides):
    exercise = {
        "id": kind[0],
        "type": kind,
        "concepts": [],
        "prompt": {"vi": "p"},
        "solution": "a = int(input())\nprint(a + 1)\n",
        "tests": [{"input": "1", "output": "2", "hidden": False}],
        "hints": [],
        "compare": EXACT,
        "testEligible": False,
    }
    if kind == "parsons":
        exercise["lines"] = ["a = int(input())", "print(a + 1)"]
    else:
        exercise["template"] = "a = int(input())\nprint(a + ___)\n"
        exercise["answers"] = ["1"]
    exercise.update(overrides)
    return exercise


def test_check_tested_exercise_accepts_valid_parsons_and_fill():
    assert vc.check_tested_exercise(graded("parsons")) == []
    assert vc.check_tested_exercise(graded("fill")) == []


def test_check_tested_exercise_reports_a_wrong_solution():
    problems = vc.check_tested_exercise(graded("parsons", solution="print(3)\n"))
    assert problems == ["[p] lời giải mẫu sai ở test 0: mong đợi '2', nhận '3\\n'"]


def test_check_tested_exercise_reports_a_fill_template_that_passes_when_empty():
    exercise = graded("fill", template="print(2)___\n", answers=["#"], solution="print(2)#\n")
    assert vc.check_tested_exercise(exercise) == ["[f] mẫu để trống vẫn qua hết test, bài tập không có ý nghĩa"]


def test_validate_bundle_checks_practice_exercises():
    bundle = {
        "stages": [{"topics": [{"lessons": [], "questions": [], "practice": [graded("fill", solution="print(0)\n")]}]}],
        "errors": [],
    }
    assert vc.validate_bundle(bundle) == ["[f] lời giải mẫu sai ở test 0: mong đợi '2', nhận '0\\n'"]


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
