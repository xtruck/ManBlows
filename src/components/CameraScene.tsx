"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { markSceneReady } from "@/lib/intro";

const MODEL_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/models/camera.glb`;

// Model framing, tuned by eye against the camera model.
const BODY_SIZE = 2.1; // largest side of the camera body, in scene units
const START_YAW = -0.75; // three-quarter view at rest
const FACE_YAW = 0; // the model's lens points down +Z

const { clamp, lerp, damp } = THREE.MathUtils;
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

type Props = {
  /** Scroll progress through the hero, 0 → 1. */
  progress: React.RefObject<number>;
  compact: boolean;
};

function CameraModel({ progress, compact }: Props) {
  const { scene } = useGLTF(MODEL_URL);
  const rig = useRef<THREE.Group>(null);
  const pointer = useRef(new THREE.Vector2());
  const lensWorld = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(), []);
  const camStart = useMemo(() => new THREE.Vector3(0, 0.25, 8.5), []);
  const camEnd = useMemo(() => new THREE.Vector3(), []);

  // Hide the tripod, center the camera body on the origin, scale it, and find the lens front.
  const lens = useMemo(() => {
    // Measure detached: useGLTF caches the scene, so it may still sit inside a moved rig.
    const parent = scene.parent;
    parent?.remove(scene);
    scene.scale.setScalar(1);
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.updateMatrixWorld(true);
    let body: THREE.Object3D = scene;
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      const name = `${mesh.name} ${mesh.geometry?.name ?? ""} ${mesh.parent?.name ?? ""}`.toLowerCase();
      if (name.includes("tripod")) mesh.visible = false;
      else body = mesh;
    });
    const box = new THREE.Box3().setFromObject(body);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = BODY_SIZE / Math.max(size.x, size.y, size.z);
    scene.scale.setScalar(s);
    scene.position.copy(center).multiplyScalar(-s);
    parent?.add(scene);
    return new THREE.Vector3(0, 0, (size.z / 2) * s);
  }, [scene]);

  useEffect(() => {
    markSceneReady();
    const onMove = (e: PointerEvent) => {
      pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const r = rig.current;
    if (!r) return;
    const p = progress.current ?? 0;
    const t = state.clock.elapsedTime;
    const turn = smooth(0, 0.45, p); // swing round to face the viewer
    const dive = smooth(0.35, 1, p); // then fly into the lens
    const free = 1 - turn; // idle and pointer motion fade out as the scroll takes over

    const yaw = lerp(START_YAW, FACE_YAW, turn) + free * (pointer.current.x * 0.3 + Math.sin(t * 0.35) * 0.06);
    r.rotation.y = damp(r.rotation.y, yaw, 5, delta);
    r.rotation.x = damp(r.rotation.x, free * pointer.current.y * 0.08, 5, delta);
    r.position.x = lerp(compact ? 0 : 1.35, 0, turn);
    r.position.y = lerp(compact ? 0.7 : 0.45, 0, turn) + free * Math.sin(t * 0.8) * 0.04;
    r.scale.setScalar(compact ? lerp(0.72, 1, turn) : 1); // smaller at rest so the phone hero breathes
    r.updateMatrixWorld();

    lensWorld.copy(lens).applyMatrix4(r.matrixWorld);
    camEnd.copy(lensWorld).add(new THREE.Vector3(0, 0, 0.12));
    state.camera.position.lerpVectors(camStart, camEnd, dive * dive * dive);
    lookAt.set(0, 0, 0).lerp(lensWorld, turn);
    state.camera.lookAt(lookAt);
  });

  return (
    <group ref={rig}>
      <primitive object={scene} />
    </group>
  );
}

export default function CameraScene({ progress, compact }: Props) {
  return (
    <Canvas
      dpr={[1, compact ? 1.5 : 2]}
      shadows={!compact}
      camera={{ position: [0, 0.25, 8.5], fov: 30, near: 0.01, far: 50 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.15} />
      <spotLight position={[4, 6, 5]} angle={0.45} penumbra={1} intensity={80} castShadow={!compact} />
      <Suspense fallback={null}>
        <CameraModel progress={progress} compact={compact} />
        {/* Local studio lighting: no HDR download needed */}
        <Environment resolution={256} environmentIntensity={0.55}>
          <Lightformer form="rect" intensity={1.6} position={[0, 5, -1]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
          <Lightformer form="rect" intensity={2.4} color="#ffc400" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[3, 8, 1]} />
          <Lightformer form="rect" intensity={0.9} position={[5, 1, 3]} rotation-y={-Math.PI / 2} scale={[4, 8, 1]} />
        </Environment>
        <ContactShadows position={[0, -1.7, 0]} opacity={0.5} scale={8} blur={2.8} far={3} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
