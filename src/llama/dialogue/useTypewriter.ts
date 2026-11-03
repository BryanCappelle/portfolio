import { useCallback, useEffect, useRef, useState } from "react";

/** Milliseconds between two revealed characters. */
const CHARACTER_DELAY = 35;

type Options = {
  enabled: boolean;
  /** Called for every revealed character, so the voice can blip along. */
  onCharacter?: (character: string) => void;
};

/**
 * Reveals `text` one character at a time. Restarts whenever the text changes,
 * and can be skipped to show everything at once.
 */
export function useTypewriter(text: string, { enabled, onCharacter }: Options) {
  const [visibleText, setVisibleText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const revealed = useRef(0);
  const characterHandler = useRef(onCharacter);

  useEffect(() => {
    characterHandler.current = onCharacter;
  }, [onCharacter]);

  useEffect(() => {
    revealed.current = 0;
    setVisibleText("");
    setIsComplete(false);

    if (!enabled || text.length === 0) return;

    const interval = window.setInterval(() => {
      if (revealed.current >= text.length) {
        window.clearInterval(interval);
        setIsComplete(true);
        return;
      }

      const character = text[revealed.current];
      revealed.current += 1;
      setVisibleText(text.slice(0, revealed.current));
      characterHandler.current?.(character);
    }, CHARACTER_DELAY);

    return () => window.clearInterval(interval);
  }, [text, enabled]);

  const skip = useCallback(() => {
    revealed.current = text.length;
    setVisibleText(text);
    setIsComplete(true);
  }, [text]);

  return { visibleText, isComplete, skip };
}
