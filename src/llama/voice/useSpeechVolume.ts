import { useCallback, useEffect, useState } from "react";

const VOLUME_KEY = "llama-speech-volume";
const MUTED_KEY = "llama-speech-muted";
const DEFAULT_VOLUME = 35;
const MAX_VOLUME = 100;

function readStoredVolume() {
  const stored = window.localStorage.getItem(VOLUME_KEY);
  const parsed = stored ? Number(stored) : DEFAULT_VOLUME;

  if (!Number.isFinite(parsed)) return DEFAULT_VOLUME;
  return Math.max(0, Math.min(MAX_VOLUME, parsed));
}

/**
 * Remembers the voice settings between visits. `effectiveVolume` is what the
 * voice should actually use (0 → 1).
 */
export function useSpeechVolume() {
  const [volume, setVolume] = useState(readStoredVolume);
  const [muted, setMuted] = useState(
    () => window.localStorage.getItem(MUTED_KEY) === "true",
  );

  useEffect(() => {
    window.localStorage.setItem(VOLUME_KEY, String(volume));
  }, [volume]);

  useEffect(() => {
    window.localStorage.setItem(MUTED_KEY, String(muted));
  }, [muted]);

  const changeVolume = useCallback((nextVolume: number) => {
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((current) => {
      if (current && volume === 0) setVolume(DEFAULT_VOLUME);
      return !current;
    });
  }, [volume]);

  return {
    volume,
    muted: muted || volume === 0,
    effectiveVolume: muted ? 0 : volume / MAX_VOLUME,
    changeVolume,
    toggleMuted,
  };
}
