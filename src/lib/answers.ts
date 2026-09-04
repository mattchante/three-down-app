import type { Player, QuestionKind } from "../types";
import { PLAYERS } from "../data/players";

const MAX_INCORRECT = 3;

export function remainingAttempts(incorrectAttempts: number): number {
  return Math.max(0, MAX_INCORRECT - incorrectAttempts);
}

export function normalizeCollege(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[.',]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^the\s+/, "")
    .replace(/^(university of|univ of|u of|college of)\s+/, "")
    .replace(/\s+(university|univ|college)$/, "")
    .trim();
}

export function parseJerseyNumber(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d{1,2}$/.test(trimmed)) return null;
  return Number.parseInt(trimmed, 10);
}

export function parseDraftYear(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d{4}$/.test(trimmed)) return null;
  return Number.parseInt(trimmed, 10);
}

export function isCollegeMatch(input: string, player: Player): boolean {
  const normalized = normalizeCollege(input);
  if (!normalized) return false;
  return player.college.acceptedAnswers.some((alias) => normalizeCollege(alias) === normalized);
}

export function checkAnswer(kind: QuestionKind, input: string, player: Player): boolean {
  if (kind === "jersey") {
    const value = parseJerseyNumber(input);
    return value !== null && value === player.jerseyNumber;
  }
  if (kind === "draftYear") {
    const value = parseDraftYear(input);
    return value !== null && value === player.draftYear;
  }
  return isCollegeMatch(input, player);
}

export function formatAcceptedAnswer(kind: QuestionKind, player: Player): string {
  if (kind === "jersey") return String(player.jerseyNumber);
  if (kind === "draftYear") return String(player.draftYear);
  return player.college.displayName;
}

const COLLEGE_INDEX = PLAYERS.map((player) => ({
  displayName: player.college.displayName,
  needles: player.college.acceptedAnswers.map(normalizeCollege),
}));

export function getCollegeSuggestions(query: string, limit = 5): string[] {
  const needle = normalizeCollege(query);
  if (!needle) return [];

  const starts: string[] = [];
  const contains: string[] = [];
  const used = new Set<string>();

  for (const entry of COLLEGE_INDEX) {
    const key = normalizeCollege(entry.displayName);
    if (used.has(key)) continue;

    const startHit = entry.needles.some((alias) => alias.startsWith(needle));
    const containHit = entry.needles.some((alias) => alias.includes(needle));
    if (startHit) {
      starts.push(entry.displayName);
      used.add(key);
    } else if (containHit) {
      contains.push(entry.displayName);
      used.add(key);
    }
  }

  return [...starts, ...contains].slice(0, limit);
}

export { MAX_INCORRECT };
