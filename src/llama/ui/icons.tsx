type IconProps = {
  /** Rendered size in pixels. */
  size?: number;
};

const STROKE_PROPS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SpeakerOnIcon({ size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M11 5 6.5 9H3v6h3.5L11 19V5Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M15 8.5a5 5 0 0 1 0 7" {...STROKE_PROPS} />
      <path d="M17.8 6a8.5 8.5 0 0 1 0 12" {...STROKE_PROPS} />
    </svg>
  );
}

export function SpeakerOffIcon({ size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M11 5 6.5 9H3v6h3.5L11 19V5Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="m15 9 5 6" {...STROKE_PROPS} />
      <path d="m20 9-5 6" {...STROKE_PROPS} />
    </svg>
  );
}

export function CloseIcon({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="m6 6 12 12" {...STROKE_PROPS} />
      <path d="m18 6-12 12" {...STROKE_PROPS} />
    </svg>
  );
}

export function ChatIcon({ size = 18 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-8Z"
        {...STROKE_PROPS}
      />
    </svg>
  );
}

export function MusicIcon({ size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M9 18V7l10-2v11M9 18c0 1.4-1.3 2.5-3 2.5S3 19.4 3 18s1.3-2.5 3-2.5S9 16.6 9 18Zm10-2c0 1.4-1.3 2.5-3 2.5S13 17.4 13 16s1.3-2.5 3-2.5 3 1.1 3 2.5Z"
        {...STROKE_PROPS}
      />
    </svg>
  );
}

export function ArrowUpRightIcon({ size = 14 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M8 16 16 8" {...STROKE_PROPS} />
      <path d="M9 8h7v7" {...STROKE_PROPS} />
    </svg>
  );
}
