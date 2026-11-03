import { useCallback, useEffect, useRef } from "react";
import {
  LLAMA_VOICE,
  SILENT_CHARACTERS,
  type VoiceProfile,
} from "./voiceProfile";

/**
 * Turns a character into a short synthesized blip.
 *
 * Browsers only allow audio after a user gesture, so the audio context is
 * created (and resumed) on the first pointer interaction and stays alive.
 * `volume` is 0 → 1; at 0 nothing is played at all.
 */
export function useLlamaVoice(volume: number, profile: VoiceProfile = {}) {
  const audioContext = useRef<AudioContext | null>(null);
  const volumeRef = useRef(volume);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    const unlock = () => {
      const AudioContextConstructor =
        window.AudioContext ??
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextConstructor) return;

      if (!audioContext.current) {
        audioContext.current = new AudioContextConstructor();
      }

      void audioContext.current.resume();
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  const playBlip = useCallback(
    (character: string) => {
      const context = audioContext.current;
      if (!context || context.state !== "running") return;

      const settings = { ...LLAMA_VOICE, ...profile };
      const level =
        Math.max(0, Math.min(1, volumeRef.current)) * settings.volume;
      if (level === 0 || SILENT_CHARACTERS.test(character)) return;

      const [minPitch, maxPitch] = settings.pitchRange;
      const pitch =
        minPitch + (maxPitch - minPitch) * pitchVariation(character, settings);
      const duration = settings.duration;

      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();

      oscillator.type = settings.waveform;
      oscillator.frequency.setValueAtTime(pitch, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        pitch * 0.72,
        context.currentTime + duration * 0.82,
      );

      filter.type = "lowpass";
      filter.frequency.value = settings.filterFrequency;

      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        level,
        context.currentTime + 0.004,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + duration,
      );

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
    },
    [profile],
  );

  return { playBlip };
}

/**
 * 0 → 1 pitch position for one character. `character` mode hashes the letter
 * so a letter always sounds the same; `random` shakes it every time; `mixed`
 * blends the two.
 */
function pitchVariation(character: string, profile: Required<VoiceProfile>) {
  if (profile.mode === "random") return Math.random();

  let hash = 0;
  for (let index = 0; index < character.length; index += 1) {
    hash = (hash * 31 + character.charCodeAt(index) + profile.seed) >>> 0;
  }

  const stable = (hash % 10000) / 10000;
  if (profile.mode === "character") return stable;

  return stable * (1 - profile.jitter) + Math.random() * profile.jitter;
}
