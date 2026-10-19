import type { Game } from "../types";
import { scoreOf } from "./game";

const KEY = "three-down:record:v1";

export type PlayerRecord = {
  played: number;
  totalScore: number;
  perfect: number;
  streak: number;
  bestStreak: number;
};

const EMPTY: PlayerRecord = { played: 0, totalScore: 0, perfect: 0, streak: 0, bestStreak: 0 };

export function loadRecord(): PlayerRecord {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<PlayerRecord>;
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...EMPTY };
  }
}

/** Folds a finished game into the stored record and returns the new record. */
export function recordGame(game: Game): PlayerRecord {
  const score = scoreOf(game);
  const prev = loadRecord();
  const streak = score === 3 ? prev.streak + 1 : 0;
  const next: PlayerRecord = {
    played: prev.played + 1,
    totalScore: prev.totalScore + score,
    perfect: prev.perfect + (score === 3 ? 1 : 0),
    streak,
    bestStreak: Math.max(prev.bestStreak, streak),
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or storage disabled: the game still works, the record just doesn't persist.
  }
  return next;
}

export function averageScore(record: PlayerRecord): string {
  if (record.played === 0) return "0.0";
  return (record.totalScore / record.played).toFixed(1);
}

export function shareText(game: Game): string {
  const marks = game.questions.map((q) => (q.status === "correct" ? "🟩" : "🟥")).join("");
  return `THREE DOWN ${scoreOf(game)}/3\n${marks}\n${window.location.origin}${window.location.pathname}`;
}
