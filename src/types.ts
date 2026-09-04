export type Position =
  | "QB"
  | "RB"
  | "WR"
  | "TE"
  | "EDGE"
  | "DL"
  | "OL"
  | "LB"
  | "CB"
  | "S";

export type College = {
  displayName: string;
  acceptedAnswers: string[];
};

export type Player = {
  id: string;
  fullName: string;
  jerseyNumber: number;
  college: College;
  draftYear: number;
  currentTeam: string;
  position: Position;
};

export type QuestionKind = "jersey" | "draftYear" | "college";

export type QuestionStatus = "unanswered" | "correct" | "missed";

export type GameQuestion = {
  kind: QuestionKind;
  player: Player;
  status: QuestionStatus;
  incorrectAttempts: number;
  totalAttempts: number;
};

export type Game = {
  id: string;
  questions: [GameQuestion, GameQuestion, GameQuestion];
  currentIndex: 0 | 1 | 2;
  phase: "playing" | "complete";
};

export type FeedbackKind = "idle" | "incorrect" | "correct" | "missed";
