import * as THREE from "three";
import { useCallback, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { SkipForward } from "lucide-react";
import { createLlamaCurve, createWinkCurve } from "./curves/llamaCurves";
import { createIntroRuntime } from "./timeline/introTimeline";
import { createLlamaScript, START_NODE } from "./dialogue/script";
import { useDialogue } from "./dialogue/useDialogue";
import { useSpeechVolume } from "./voice/useSpeechVolume";
import { useBackgroundMusic } from "./voice/useBackgroundMusic";
import LlamaScene from "./scene/LlamaScene";
import SpeechBubble from "./ui/SpeechBubble";
import VolumeControl from "./ui/VolumeControl";
import { ChatIcon } from "./ui/icons";
import { llama as llamaProfile } from "./dialogue/profile";
import LanguageControl from "./ui/LanguageControl";
import { useI18n } from "../i18n";
import type { Exchange, FreeChatAction } from "./ui/FreeChat";

/**
 * The whole llama experience: the 3D intro, then the conversation.
 *
 * The scene reacts to the pointer and drives its own animation clock; React
 * only owns what the visitor can interact with (the bubble and the volume).
 */
export default function LlamaStage() {
  const { t } = useI18n();
  const elapsed = useRef(0);
  const progress = useRef(0);
  const pointer = useRef(new THREE.Vector2());
  const followTarget = useRef(new THREE.Vector3());
  const strokeGroupRef = useRef<THREE.Group | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const [introFinished, setIntroFinished] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactDraft, setContactDraft] = useState("");
  const [freeChatOpen, setFreeChatOpen] = useState(false);
  const [freeChatExchanges, setFreeChatExchanges] = useState<Exchange[]>([]);

  const llamaCurve = useMemo(createLlamaCurve, []);
  const winkCurve = useMemo(createWinkCurve, []);
  const runtime = useMemo(
    () => createIntroRuntime(llamaCurve, winkCurve),
    [llamaCurve, winkCurve],
  );

  const llamaScript = useMemo(() => createLlamaScript(t), [t]);
  const dialogue = useDialogue(llamaScript, START_NODE);
  const speech = useSpeechVolume();
  const music = useBackgroundMusic(speech.effectiveVolume);

  const bubbleVisible = introFinished && dialogue.isOpen;

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();

    pointer.current.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
  };

  const markIntroFinished = useCallback(() => setIntroFinished(true), []);
  const skipIntro = useCallback(() => {
    runtime.skip();
    elapsed.current = runtime.elapsed;
    progress.current = runtime.progress;
    markIntroFinished();
  }, [elapsed, markIntroFinished, progress, runtime]);

  const handleChoose = useCallback(
    (choice: Parameters<typeof dialogue.choose>[0]) => {
      if (choice.action === "openContactForm") {
        setContactDraft("");
        setContactOpen(true);
        return;
      }
      if (choice.action === "openFreeChat") {
        setFreeChatOpen(true);
        return;
      }
      dialogue.choose(choice);
    },
    [dialogue],
  );

  const handleFreeChatAction = useCallback(
    (action: FreeChatAction) => {
      switch (action.type) {
        case "navigate":
          dialogue.navigate(action.page);
          dialogue.open();
          setFreeChatOpen(false);
          break;
        case "play_music":
          void music.play();
          break;
        case "open_contact_form":
          setContactDraft(action.draft ?? "");
          setContactOpen(true);
          dialogue.open();
          setFreeChatOpen(false);
          break;
      }
    },
    [dialogue, music],
  );

  return (
    <div className="llama-stage" onPointerMove={handlePointerMove}>
      <LlamaScene
        runtime={runtime}
        elapsed={elapsed}
        progress={progress}
        pointer={pointer}
        followTarget={followTarget}
        llamaCurve={llamaCurve}
        strokeGroupRef={strokeGroupRef}
        bubbleRef={bubbleRef}
        bubbleVisible={bubbleVisible}
        onIntroFinish={markIntroFinished}
      />

      {introFinished && dialogue.nodeId === "owner" && (
        <div className="llama-human-portal" aria-label="Portrait de Bryan">
          <div className="llama-human-portal__ring" aria-hidden="true" />
          <div className="llama-human-portal__image-wrap">
            <img
              className="llama-human-portal__image"
              src={`${import.meta.env.BASE_URL}human.jpg`}
              alt="Bryan"
            />
          </div>
          <span className="llama-human-portal__label" aria-hidden="true">
            Bryan
          </span>
        </div>
      )}

      <SpeechBubble
        bubbleRef={bubbleRef}
        node={dialogue.node}
        visible={bubbleVisible}
        volume={speech.effectiveVolume}
        onChoose={handleChoose}
        onClose={dialogue.close}
        onMusicToggle={music.toggle}
        contactOpen={contactOpen}
        contactDraft={contactDraft}
        onContactClose={() => setContactOpen(false)}
        freeChatOpen={freeChatOpen}
        onFreeChatClose={() => setFreeChatOpen(false)}
        freeChatExchanges={freeChatExchanges}
        onFreeChatExchangesChange={setFreeChatExchanges}
        onFreeChatAction={handleFreeChatAction}
      />

      {!introFinished && (
        <button
          className="llama-intro-skip"
          type="button"
          onClick={skipIntro}
          aria-label={t.ui.skipIntro}
        >
          <SkipForward size={16} aria-hidden="true" />
          <span>{t.ui.skipIntro}</span>
        </button>
      )}

      {introFinished && !dialogue.isOpen && (
        <button
          className="llama-chat-launcher"
          type="button"
          onClick={() => dialogue.open()}
        >
          <ChatIcon />
          <span>
            {t.ui.talkTo} {llamaProfile.name}
          </span>
        </button>
      )}

      <LanguageControl />

      <VolumeControl
        volume={speech.volume}
        muted={speech.muted}
        onVolumeChange={speech.changeVolume}
        onToggleMute={speech.toggleMuted}
        musicRequested={music.requested}
        musicPlaying={music.playing}
        onMusicToggle={music.toggle}
      />
    </div>
  );
}
