import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import type { RefObject } from "react";
import type { AnimationRuntime } from "../animation";
import AnimationRunner from "./AnimationRunner";
import BubbleAnchor from "./BubbleAnchor";
import CameraRig from "./CameraRig";
import LlamaStroke from "./LlamaStroke";
import ParticleBurst from "./ParticleBurst";
import ShapeFill from "./ShapeFill";

type Props = {
  runtime: AnimationRuntime;
  elapsed: RefObject<number>;
  progress: RefObject<number>;
  pointer: RefObject<THREE.Vector2>;
  followTarget: RefObject<THREE.Vector3>;
  /** The llama's outline, used to frame the camera and place the bubble. */
  llamaCurve: THREE.CatmullRomCurve3;
  strokeGroupRef: RefObject<THREE.Group | null>;
  bubbleRef: RefObject<HTMLDivElement | null>;
  bubbleVisible: boolean;
  onIntroFinish: () => void;
};

/** Everything that lives inside the WebGL canvas. */
export default function LlamaScene({
  runtime,
  elapsed,
  progress,
  pointer,
  followTarget,
  llamaCurve,
  strokeGroupRef,
  bubbleRef,
  bubbleVisible,
  onIntroFinish,
}: Props) {
  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
      <ambientLight intensity={0.1} />
      <directionalLight color="white" position={[0, 0, 5]} />

      <Stars
        radius={38}
        depth={24}
        count={900}
        factor={1.1}
        saturation={0.15}
        fade
        speed={0.18}
      />

      <AnimationRunner
        runtime={runtime}
        elapsed={elapsed}
        progress={progress}
        onFinish={onIntroFinish}
      />

      <LlamaStroke
        runtime={runtime}
        elapsed={elapsed}
        pointer={pointer}
        followTarget={followTarget}
        groupRef={strokeGroupRef}
      />

      <ShapeFill runtime={runtime} elapsed={elapsed} />
      <ParticleBurst runtime={runtime} elapsed={elapsed} />

      <CameraRig
        curve={llamaCurve}
        elapsed={elapsed}
        followTarget={followTarget}
        runtime={runtime}
      />

      <BubbleAnchor
        bubbleRef={bubbleRef}
        anchorRef={strokeGroupRef}
        curve={llamaCurve}
        visible={bubbleVisible}
      />

      <EffectComposer>
        <Bloom
          intensity={0.7}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
