import { ProgressMarks } from "./components/ProgressMarks";
import { QuestionView } from "./components/QuestionView";
import { ResultsView } from "./components/ResultsView";
import { useGame } from "./hooks/useGame";

export default function App() {
  const { game, record, question, draft, setDraft, feedback, selectVersion, submit, goNext, playAgain } = useGame();

  return (
    <div className="relative min-h-dvh bg-cobalt">
      <div className="grain" aria-hidden="true" />
      <div className="frame" aria-hidden="true" />
      <div className="horizon" aria-hidden="true" />
      <div className="pillar left-0 hidden md:block" aria-hidden="true" />
      <div className="pillar right-0 hidden md:block" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[560px] flex-col px-5 pb-20 pt-[max(1.25rem,env(safe-area-inset-top))] md:max-w-[620px] md:px-8">
        <header className="mb-8 flex items-baseline justify-between">
          <p className="font-condensed text-[18px] font-semibold tracking-[0.32em]">THREE DOWN</p>
          {game.phase === "playing" ? (
            <p className="font-condensed text-[13px] tracking-[0.2em] text-limestone/70">
              {String(game.currentIndex + 1).padStart(2, "0")} / 03
            </p>
          ) : (
            <p className="font-condensed text-[13px] tracking-[0.2em] text-limestone/70">Complete</p>
          )}
        </header>

        <ProgressMarks questions={[...game.questions]} currentIndex={game.currentIndex} />

        <main className="mt-10 flex-1">
          {game.phase === "complete" ? (
            <ResultsView game={game} record={record} onPlayAgain={playAgain} />
          ) : (
            <QuestionView
              key={`${game.id}-${game.currentIndex}`}
              question={question}
              index={game.currentIndex}
              draft={draft}
              feedback={feedback}
              onDraftChange={setDraft}
              onSubmit={submit}
              onContinue={goNext}
              selectVersion={selectVersion}
            />
          )}
        </main>
      </div>
    </div>
  );
}
