import { formatAcceptedAnswer, remainingAttempts } from "../lib/answers";
import { QUESTION_COPY } from "../lib/game";
import { splitPlayerName } from "../lib/names";
import type { FeedbackKind, GameQuestion } from "../types";
import { AnswerField } from "./AnswerField";

type Props = {
  question: GameQuestion;
  index: number;
  draft: string;
  feedback: FeedbackKind;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  onContinue: () => void;
  selectVersion: number;
};

const STEP = ["01", "02", "03"] as const;

export function QuestionView({
  question,
  index,
  draft,
  feedback,
  onDraftChange,
  onSubmit,
  onContinue,
  selectVersion,
}: Props) {
  const copy = QUESTION_COPY[question.kind];
  const name = splitPlayerName(question.player.fullName);
  const locked = question.status !== "unanswered";
  const attemptsLeft = remainingAttempts(question.incorrectAttempts);
  const accepted = formatAcceptedAnswer(question.kind, question.player);
  const lastQuestion = index === 2;

  let statusText = `${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left`;
  if (question.status === "correct") statusText = `Correct — ${accepted}`;
  if (question.status === "missed") statusText = `Missed — ${accepted}`;

  return (
    <section
      className={`panel-enter ${feedback === "incorrect" ? "shake" : ""}`}
      aria-labelledby="player-name"
    >
      <div className="mb-7 flex items-end justify-between gap-4 border-b border-limestone/30 pb-3">
        <p className="font-condensed text-[15px] font-semibold tracking-[0.28em] text-limestone/80">
          {STEP[index]} / 03
        </p>
        <p className="font-condensed text-[15px] font-semibold tracking-[0.28em]">{copy.label}</p>
      </div>

      <h2 id="player-name" className="mb-6 leading-none">
        <span className="block font-display text-[clamp(34px,11vw,52px)] text-limestone/80">
          {name.first}
        </span>
        <span className="block break-words font-display text-[clamp(40px,14vw,76px)] uppercase tracking-[-0.03em]">
          {name.last}
        </span>
      </h2>

      <p className="mb-8 max-w-[16ch] font-display text-[26px] italic leading-tight text-limestone/90 sm:text-[30px]">
        {copy.prompt}
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (locked) onContinue();
          else onSubmit();
        }}
      >
        <AnswerField
          kind={question.kind}
          value={locked ? accepted : draft}
          disabled={locked}
          placeholder={copy.placeholder}
          onChange={onDraftChange}
          onSubmit={onSubmit}
          selectVersion={selectVersion}
        />

        <div className="mt-5 flex items-center justify-between gap-4">
          {locked ? (
            <button
              type="submit"
              className="action min-h-14 flex-1 border border-limestone bg-limestone px-5 font-condensed text-[20px] font-semibold tracking-[0.22em] text-ink"
            >
              {lastQuestion ? "Results" : "Continue"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={draft.trim().length === 0}
              className="action min-h-14 flex-1 border border-limestone bg-limestone px-5 font-condensed text-[20px] font-semibold tracking-[0.22em] text-ink disabled:cursor-not-allowed disabled:border-limestone/30 disabled:bg-transparent disabled:text-limestone/35"
            >
              Submit
            </button>
          )}
        </div>
      </form>

      <p
        className={[
          "mt-5 font-condensed text-[16px] tracking-[0.16em]",
          question.status === "missed" || feedback === "incorrect" ? "text-cream" : "text-limestone/75",
        ].join(" ")}
        role="status"
        aria-live="polite"
      >
        {question.status === "correct" ? "In. " : question.status === "missed" ? "Out. " : ""}
        {statusText}
      </p>
    </section>
  );
}
