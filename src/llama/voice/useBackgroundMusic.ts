import { useCallback, useEffect, useRef, useState } from "react";

const MUSIC_REQUESTED_KEY = "llama-music-requested";
const MUSIC_PLAYING_KEY = "llama-music-playing";

export function useBackgroundMusic(volume: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [requested, setRequested] = useState(
    () => window.localStorage.getItem(MUSIC_REQUESTED_KEY) === "true",
  );

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL;
    const audioUrl = `${baseUrl}${baseUrl.endsWith("/") ? "" : "/"}background.m4a`;
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.preload = "metadata";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setRequested(true);
    window.localStorage.setItem(MUSIC_REQUESTED_KEY, "true");

    if (playing) {
      audio.pause();
      setPlaying(false);
      window.localStorage.setItem(MUSIC_PLAYING_KEY, "false");
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
      window.localStorage.setItem(MUSIC_PLAYING_KEY, "true");
    } catch {
      setPlaying(false);
      window.localStorage.setItem(MUSIC_PLAYING_KEY, "false");
    }
  }, [playing]);

  return { requested, playing, toggle };
}
