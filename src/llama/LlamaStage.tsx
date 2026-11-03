import * as THREE from "three";
import { useCallback, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { createLlamaCurve, createWinkCurve } from "./curves/llamaCurves";
import { createIntroRuntime } from "./timeline/introTimeline";
import { llamaScript, START_NODE } from "./dialogue/script";
import { useDialogue } from "./dialogue/useDialogue";
import { useSpeechVolume } from "./voice/useSpeechVolume";
import LlamaScene from "./scene/LlamaScene";
import SpeechBubble from "./ui/SpeechBubble";
import VolumeControl from "./ui/VolumeControl";
import { ChatIcon } from "./ui/icons";
import { llama as llamaProfile } from "./dialogue/profile";

/**
 * The whole llama experience: the 3D intro, then the conversation.
 *
 * The scene reacts to the pointer and drives its own animation clock; React
 * only owns what the visitor can interact with (the bubble and the volume).
 */
export default function LlamaStage() {
  const elapsed = useRef(0);
  const progress = useRef(0);
  const pointer = useRef(new THREE.Vector2());
  const followTarget = useRef(new THREE.Vector3());
  const strokeGroupRef = useRef<THREE.Group | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const [introFinished, setIntroFinished] = useState(false);

  const llamaCurve = useMemo(createLlamaCurve, []);
  const winkCurve = useMemo(createWinkCurve, []);
  const runtime = useMemo(
    () => createIntroRuntime(llamaCurve, winkCurve),
    [llamaCurve, winkCurve],
  );

  const dialogue = useDialogue(llamaScript, START_NODE);
  const speech = useSpeechVolume();

  const bubbleVisible = introFinished && dialogue.isOpen;

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();

    pointer.current.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
  };

  const markIntroFinished = useCallback(() => setIntroFinished(true), []);

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

      <SpeechBubble
        bubbleRef={bubbleRef}
        node={dialogue.node}
        visible={bubbleVisible}
        volume={speech.effectiveVolume}
        onChoose={dialogue.choose}
        onClose={dialogue.close}
      />

      {introFinished && !dialogue.isOpen && (
        <button
          className="llama-chat-launcher"
          type="button"
          onClick={() => dialogue.open()}
        >
          <ChatIcon />
          <span>Parler à {llamaProfile.name}</span>
        </button>
      )}

      <VolumeControl
        volume={speech.volume}
        muted={speech.muted}
        onVolumeChange={speech.changeVolume}
        onToggleMute={speech.toggleMuted}
      />
    </div>
  );
}
