import type { GameQuestion } from "../types";

type Props = {
  questions: GameQuestion[];
  currentIndex: number;
};

const LABELS = ["01", "02", "03"] as const;

export function ProgressMarks({ questions, currentIndex }: Props) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Question progress">
      {questions.map((question, index) => {
        const active = index === currentIndex && question.status === "unanswered";
        const done = question.status !== "unanswered";
        return (
          <li key={question.kind}>
            <div
              className={[
                "relative flex h-[58px] items-end border px-2.5 pb-2 pt-2 transition-colors duration-300",
                active
                  ? "border-limestone bg-limestone text-ink"
                  : done && question.status === "correct"
                    ? "border-limestone bg-limestone text-ink"
                    : done && question.status === "missed"
                      ? "border-ink bg-ink text-limestone"
                      : "border-limestone/45 bg-transparent text-limestone",
              ].join(" ")}
            >
              <span className="font-condensed text-[11px] font-semibold tracking-[0.22em]">
                {LABELS[index]}
              </span>
              {done ? (
                <span className="absolute right-2 top-2 font-condensed text-[11px] tracking-[0.16em]">
                  {question.status === "correct" ? "IN" : "OUT"}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
