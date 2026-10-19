import { useCallback, useRef, useState } from "react";
import { checkAnswer, remainingAttempts } from "../lib/answers";
import { generateGame } from "../lib/game";
import { loadRecord, recordGame, type PlayerRecord } from "../lib/record";
import type { FeedbackKind, Game } from "../types";

const LOCK_MS = 280;

export function useGame() {
  const [game, setGame] = useState<Game>(() => generateGame());
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState<FeedbackKind>("idle");
  const [selectVersion, setSelectVersion] = useState(0);
  const [record, setRecord] = useState<PlayerRecord>(() => loadRecord());
  const lockRef = useRef(false);

  const question = game.questions[game.currentIndex];
  const resolved = question.status !== "unanswered";

  const submit = useCallback(() => {
    if (lockRef.current || game.phase !== "playing") return;
    const current = game.questions[game.currentIndex];
    if (current.status !== "unanswered") return;

    const value = draft;
    if (value.trim().length === 0) return;

    lockRef.current = true;
    const correct = checkAnswer(current.kind, value, current.player);
    const incorrectAttempts = correct ? current.incorrectAttempts : current.incorrectAttempts + 1;
    const missed = !correct && remainingAttempts(incorrectAttempts) === 0;
    const status = correct ? "correct" : missed ? "missed" : "unanswered";

    setGame((prev) => {
      const questions = [...prev.questions] as Game["questions"];
      questions[prev.currentIndex] = {
        ...questions[prev.currentIndex],
        status,
        incorrectAttempts,
        totalAttempts: questions[prev.currentIndex].totalAttempts + 1,
      };
      return { ...prev, questions };
    });

    if (correct) {
      setFeedback("correct");
    } else if (missed) {
      setFeedback("missed");
    } else {
      setFeedback("incorrect");
      setSelectVersion((n) => n + 1);
      window.setTimeout(() => {
        setFeedback("idle");
        lockRef.current = false;
      }, LOCK_MS);
      return;
    }

    window.setTimeout(() => {
      lockRef.current = false;
    }, LOCK_MS);
  }, [draft, game]);

  const goNext = useCallback(() => {
    if (lockRef.current || game.phase !== "playing") return;
    const current = game.questions[game.currentIndex];
    if (current.status === "unanswered") return;

    if (game.currentIndex >= 2) {
      lockRef.current = true;
      setRecord(recordGame(game));
      setGame((prev) => ({ ...prev, phase: "complete" }));
      return;
    }

    lockRef.current = true;
    const nextIndex = (game.currentIndex + 1) as 0 | 1 | 2;
    setGame((prev) => ({ ...prev, currentIndex: nextIndex }));
    setDraft("");
    setFeedback("idle");
    setSelectVersion(0);
    window.setTimeout(() => {
      lockRef.current = false;
    }, 160);
  }, [game]);

  const playAgain = useCallback(() => {
    const previousIds = game.questions.map((item) => item.player.id);
    setGame(generateGame(previousIds));
    setDraft("");
    setFeedback("idle");
    setSelectVersion(0);
    lockRef.current = false;
  }, [game]);

  return {
    game,
    record,
    question,
    draft,
    setDraft,
    feedback,
    selectVersion,
    resolved,
    submit,
    goNext,
    playAgain,
  };
}
