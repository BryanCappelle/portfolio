/**
 * The llama's voice. It does not say words: each letter of the speech bubble
 * triggers a very short blip, the way old games did. Changing these values
 * changes Paco's character.
 */
export type VoiceProfile = {
  /** `character` keeps the same pitch per letter, `random` varies, `mixed` blends both. */
  mode?: "character" | "random" | "mixed";
  seed?: number;
  waveform?: OscillatorType;
  /** Lowest and highest pitch, in hertz. */
  pitchRange?: readonly [number, number];
  volume?: number;
  /** Length of one blip, in seconds. */
  duration?: number;
  filterFrequency?: number;
  /** 0 = perfectly regular, 1 = very erratic. */
  jitter?: number;
};

export const LLAMA_VOICE: Required<VoiceProfile> = {
  mode: "mixed",
  seed: 2026,
  waveform: "square",
  pitchRange: [145, 255],
  volume: 0.1,
  duration: 0.055,
  filterFrequency: 900,
  jitter: 0.18,
};

/** Characters that should stay silent. */
export const SILENT_CHARACTERS = /[ ,.!?;:—…]/;
