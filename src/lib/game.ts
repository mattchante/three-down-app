import { PLAYERS } from "../data/players";
import type { Game, GameQuestion, QuestionKind } from "../types";

const KINDS: [QuestionKind, QuestionKind, QuestionKind] = ["jersey", "draftYear", "college"];

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function comboKey(ids: string[]): string {
  return [...ids].sort().join("|");
}

function makeQuestion(kind: QuestionKind, player: GameQuestion["player"]): GameQuestion {
  return {
    kind,
    player,
    status: "unanswered",
    incorrectAttempts: 0,
    totalAttempts: 0,
  };
}

export function generateGame(previousIds: string[] = []): Game {
  if (PLAYERS.length < 3) {
    throw new Error("Player dataset must contain at least 3 players");
  }

  const previous = previousIds.length === 3 ? comboKey(previousIds) : null;
  let selected = shuffle(PLAYERS).slice(0, 3);

  for (let attempt = 0; attempt < 8 && previous; attempt += 1) {
    if (comboKey(selected.map((player) => player.id)) !== previous) break;
    selected = shuffle(PLAYERS).slice(0, 3);
  }

  return {
    id: crypto.randomUUID(),
    questions: [
      makeQuestion(KINDS[0], selected[0]),
      makeQuestion(KINDS[1], selected[1]),
      makeQuestion(KINDS[2], selected[2]),
    ],
    currentIndex: 0,
    phase: "playing",
  };
}

export function scoreOf(game: Game): number {
  return game.questions.filter((question) => question.status === "correct").length;
}

export const QUESTION_COPY: Record<
  QuestionKind,
  { label: string; prompt: string; placeholder: string }
> = {
  jersey: {
    label: "Jersey Number",
    prompt: "What number does he wear?",
    placeholder: "00",
  },
  draftYear: {
    label: "Draft Year",
    prompt: "What year was he drafted?",
    placeholder: "2018",
  },
  college: {
    label: "College",
    prompt: "Where did he play college football?",
    placeholder: "School",
  },
};
