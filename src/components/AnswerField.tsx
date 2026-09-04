import { useEffect, useId, useRef, useState } from "react";
import { getCollegeSuggestions } from "../lib/answers";
import type { QuestionKind } from "../types";

type Props = {
  kind: QuestionKind;
  value: string;
  disabled: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  selectVersion?: number;
};

export function AnswerField({
  kind,
  value,
  disabled,
  placeholder,
  onChange,
  onSubmit,
  selectVersion = 0,
}: Props) {
  const inputId = useId();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const suggestions = kind === "college" ? getCollegeSuggestions(value) : [];
  const numeric = kind !== "college";

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled, kind]);

  useEffect(() => {
    if (selectVersion > 0 && !disabled) {
      inputRef.current?.select();
    }
  }, [disabled, selectVersion]);

  useEffect(() => {
    setHighlight(-1);
    setOpen(kind === "college" && value.trim().length > 0 && suggestions.length > 0 && !disabled);
  }, [disabled, kind, suggestions.length, value]);

  const applySuggestion = (name: string) => {
    onChange(name);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <label className="sr-only" htmlFor={inputId}>
        {kind === "jersey" ? "Jersey number" : kind === "draftYear" ? "Draft year" : "College"}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        className="field w-full border border-limestone/70 bg-transparent px-4 py-4 font-condensed text-[28px] uppercase tracking-[0.12em] text-limestone placeholder:text-limestone/35 disabled:opacity-45"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode={numeric ? "numeric" : "text"}
        maxLength={numeric ? (kind === "jersey" ? 2 : 4) : 64}
        aria-autocomplete={kind === "college" ? "list" : undefined}
        aria-controls={kind === "college" ? listId : undefined}
        aria-expanded={kind === "college" ? open : undefined}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            if (open && highlight >= 0 && suggestions[highlight]) {
              event.preventDefault();
              applySuggestion(suggestions[highlight]);
              return;
            }
            event.preventDefault();
            onSubmit();
            return;
          }
          if (!open) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlight((index) => (index + 1) % suggestions.length);
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlight((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
          }
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-10 mt-px border border-limestone/50 bg-cobalt-deep"
        >
          {suggestions.map((name, index) => (
            <li key={name} role="option" aria-selected={index === highlight}>
              <button
                type="button"
                className={[
                  "ghost w-full px-4 py-2.5 text-left font-condensed text-[18px] uppercase tracking-[0.12em]",
                  index === highlight ? "bg-limestone text-ink" : "text-limestone",
                ].join(" ")}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applySuggestion(name)}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
