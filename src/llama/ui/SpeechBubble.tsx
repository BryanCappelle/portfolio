import type { RefObject } from "react";
import type { DialogueChoice, DialogueNode } from "../dialogue/types";
import { useTypewriter } from "../dialogue/useTypewriter";
import { useLlamaVoice } from "../voice/useLlamaVoice";
import { llama as llamaProfile } from "../dialogue/profile";
import { ArrowUpRightIcon, CloseIcon } from "./icons";
import { useI18n } from "../../i18n";

type Props = {
  /** The floating DOM node, positioned every frame by the 3D scene. */
  bubbleRef: RefObject<HTMLDivElement | null>;
  node: DialogueNode;
  /** True once the intro is over and the conversation is open. */
  visible: boolean;
  /** 0 → 1 */
  volume: number;
  onChoose: (choice: DialogueChoice) => void;
  onClose: () => void;
};

/**
 * The llama's speech bubble: types out what it says, blips along like a video
 * game character, then offers the visitor a set of answers.
 */
export default function SpeechBubble({
  bubbleRef,
  node,
  visible,
  volume,
  onChoose,
  onClose,
}: Props) {
  const { t } = useI18n();
  const { playBlip } = useLlamaVoice(volume);
  const { visibleText, isComplete, skip } = useTypewriter(node.text, {
    enabled: visible,
    onCharacter: playBlip,
  });

  return (
    <div
      ref={bubbleRef}
      className="llama-speech-bubble"
      data-visible={visible ? "true" : "false"}
      role="group"
      aria-label={`${t.ui.conversationWith} ${llamaProfile.name}`}
    >
      <div className="llama-speech-bubble__header">
        <span className="llama-speech-bubble__kicker">
          {t.ui.llamaPortfolio.replace("Paco", llamaProfile.name)}
        </span>
        <button
          className="llama-speech-bubble__close"
          type="button"
          aria-label={t.ui.closeConversation}
          title={t.ui.close}
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <p className="llama-speech-bubble__text" onClick={skip}>
        <span aria-hidden="true">
          {visibleText}
          {!isComplete && <span className="llama-speech-bubble__caret" />}
        </span>
        <span className="visually-hidden">{node.text}</span>
      </p>

      {isComplete && node.choices.length > 0 && (
        <div className="llama-speech-bubble__choices">
          {node.choices.map((choice) => (
            <ChoiceButton
              key={choice.label}
              choice={choice}
              onChoose={onChoose}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ChoiceButton({
  choice,
  onChoose,
}: {
  choice: DialogueChoice;
  onChoose: (choice: DialogueChoice) => void;
}) {
  if (choice.href) {
    return (
      <a
        className="llama-choice llama-choice--link"
        href={choice.href}
        target={choice.href.startsWith("mailto:") ? undefined : "_blank"}
        rel="noreferrer"
      >
        <span>{choice.label}</span>
        <ArrowUpRightIcon size={14} />
      </a>
    );
  }

  return (
    <button
      className="llama-choice"
      type="button"
      onClick={() => onChoose(choice)}
    >
      {choice.label}
    </button>
  );
}
