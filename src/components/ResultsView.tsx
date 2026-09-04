import { formatAcceptedAnswer } from "../lib/answers";
import { QUESTION_COPY, scoreOf } from "../lib/game";
import type { Game } from "../types";

type Props = {
  game: Game;
  onPlayAgain: () => void;
};

function scoreLine(score: number): string {
  if (score === 3) return "Clean sheet.";
  if (score === 2) return "Two down.";
  if (score === 1) return "One down.";
  return "Punt.";
}

function attemptLabel(question: Game["questions"][number]): string {
  if (question.status === "missed") return "Missed";
  const n = question.totalAttempts;
  return `Correct — ${n} attempt${n === 1 ? "" : "s"}`;
}

export function ResultsView({ game, onPlayAgain }: Props) {
  const score = scoreOf(game);

  return (
    <section className="reveal" aria-labelledby="final-score">
      <p className="mb-4 font-condensed text-[15px] font-semibold tracking-[0.28em] text-limestone/75">
        Final
      </p>
      <h2 id="final-score" className="font-display text-[92px] leading-none tracking-[-0.04em] sm:text-[120px]">
        {score} / 3
      </h2>
      <p className="mt-3 font-display text-[28px] italic">{scoreLine(score)}</p>

      <ol className="mt-10 border-t border-limestone/35">
        {game.questions.map((question) => (
          <li
            key={question.kind}
            className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b border-limestone/35 py-5"
          >
            <p className="font-condensed text-[13px] font-semibold tracking-[0.22em] text-limestone/70">
              {QUESTION_COPY[question.kind].label}
            </p>
            <p className="font-condensed text-[13px] font-semibold tracking-[0.18em] text-right">
              {attemptLabel(question)}
            </p>
            <p className="font-display text-[28px] leading-none">{question.player.fullName}</p>
            <p className="self-end text-right font-condensed text-[22px] tracking-[0.08em]">
              {formatAcceptedAnswer(question.kind, question.player)}
            </p>
          </li>
        ))}
      </ol>

      <button
        type="button"
        className="action mt-10 min-h-14 w-full border border-limestone bg-limestone font-condensed text-[20px] font-semibold tracking-[0.22em] text-ink"
        onClick={onPlayAgain}
      >
        Play Again
      </button>
    </section>
  );
}
