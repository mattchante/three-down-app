import { formatAcceptedAnswer } from "../lib/answers";
import { useState } from "react";
import { QUESTION_COPY, scoreOf } from "../lib/game";
import { averageScore, shareText, type PlayerRecord } from "../lib/record";
import type { Game } from "../types";

type Props = {
  game: Game;
  record: PlayerRecord;
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

export function ResultsView({ game, record, onPlayAgain }: Props) {
  const score = scoreOf(game);
  const [shared, setShared] = useState<"idle" | "copied" | "failed">("idle");

  const share = async () => {
    const text = shareText(game);
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShared("copied");
    } catch (error) {
      if ((error as Error).name !== "AbortError") setShared("failed");
    }
  };

  const stats = [
    { label: "Played", value: String(record.played) },
    { label: "Avg", value: averageScore(record) },
    { label: "Perfect", value: String(record.perfect) },
    { label: "Streak", value: String(record.bestStreak) },
  ];

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

      <dl className="mt-8 grid grid-cols-4 gap-2" aria-label="Your record">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-limestone/35 px-2.5 pb-2 pt-2.5">
            <dt className="font-condensed text-[11px] font-semibold tracking-[0.2em] text-limestone/70">
              {stat.label}
            </dt>
            <dd className="mt-1 font-display text-[30px] leading-none">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid grid-cols-[1fr_auto] gap-3">
        <button
          type="button"
          className="action min-h-14 border border-limestone bg-limestone font-condensed text-[20px] font-semibold tracking-[0.22em] text-ink"
          onClick={onPlayAgain}
        >
          Play Again
        </button>
        <button
          type="button"
          className="action min-h-14 border border-limestone px-6 font-condensed text-[20px] font-semibold tracking-[0.22em] text-limestone"
          onClick={share}
        >
          {shared === "copied" ? "Copied" : "Share"}
        </button>
      </div>
      <p className="mt-3 min-h-5 font-condensed text-[14px] tracking-[0.14em] text-limestone/70" role="status" aria-live="polite">
        {shared === "copied" ? "Result copied to clipboard." : shared === "failed" ? "Couldn't copy. Try again." : ""}
      </p>
    </section>
  );
}
