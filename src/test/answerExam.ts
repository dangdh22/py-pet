import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Answers every item of the open test paper: each question with the choice `choice` (in the exam bundles "Đúng" is
 * right and "Sai" is wrong), each code exercise with 1 submit of the starter code. Then hands the paper in.
 */
export async function answerPaper(choice: "Đúng" | "Sai") {
  for (;;) {
    const radio = screen.queryByRole("radio", { name: choice });
    if (radio) {
      await userEvent.click(radio);
      await userEvent.click(screen.getByRole("button", { name: "Chọn đáp án này" }));
    } else {
      await userEvent.click(screen.getByRole("button", { name: "Nộp bài" }));
      await screen.findByText("Đã nộp bài. Kết quả hiện ở cuối bài.");
    }
    const finish = screen.queryByRole("button", { name: "Nộp bài kiểm tra" });
    if (finish) {
      await userEvent.click(finish);
      return;
    }
    await userEvent.click(screen.getByRole("button", { name: "Tiếp" }));
  }
}
