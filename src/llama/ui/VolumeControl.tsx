import type { ChangeEvent } from "react";
import {
  MusicIcon,
  SpeakerOffIcon,
  SpeakerOnIcon,
} from "./icons";
import { useI18n } from "../../i18n";

type Props = {
  /** 0 → 100. */
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  musicRequested?: boolean;
  musicPlaying?: boolean;
  onMusicToggle?: () => void;
};

/** Mute button with a slider that slides out on hover. */
export default function VolumeControl({
  volume,
  muted,
  onVolumeChange,
  onToggleMute,
  musicRequested = false,
  musicPlaying = false,
  onMusicToggle,
}: Props) {
  const { t } = useI18n();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(Number(event.target.value));
  };

  const label = muted ? t.ui.enableSound : t.ui.disableSound;

  return (
    <div className="llama-volume-control">
      <input
        className="llama-volume-control__range"
        type="range"
        min="0"
        max="100"
        step="1"
        value={volume}
        aria-label={t.ui.voiceVolume}
        title={`${volume}%`}
        onChange={handleChange}
      />

      <button
        className="llama-volume-control__button"
        type="button"
        aria-label={label}
        title={label}
        aria-pressed={!muted}
        onClick={onToggleMute}
      >
        {muted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
      </button>

      {musicRequested && onMusicToggle && (
        <button
          className="llama-volume-control__music"
          type="button"
          aria-label={musicPlaying ? t.ui.stopMusic : t.ui.playMusic}
          title={musicPlaying ? t.ui.stopMusic : t.ui.playMusic}
          aria-pressed={musicPlaying}
          onClick={onMusicToggle}
        >
          <MusicIcon />
        </button>
      )}
    </div>
  );
}
