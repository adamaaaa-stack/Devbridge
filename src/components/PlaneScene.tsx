'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

/**
 * A low-poly RC warbird built procedurally - no external model to download,
 * so it stays crisp and tiny.
 */
function Plane({ tint = '#ff5a1f' }: { tint?: string }) {
  const body = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f2f5fa', roughness: 0.35, metalness: 0.25,
  }), []);
  const accent = useMemo(() => new THREE.MeshStandardMaterial({
    color: tint, roughness: 0.3, metalness: 0.3,
  }), [tint]);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#16202f', roughness: 0.5, metalness: 0.4,
  }), []);
  const glass = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8fd4ff', roughness: 0.05, metalness: 0.1,
    transparent: true, opacity: 0.65,
  }), []);

  const prop = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (prop.current) prop.current.rotation.z += dt * 34;
  });

  return (
    <group rotation={[0, 0, 0]}>
      {/* fuselage */}
      <mesh material={body} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.19, 1.5, 6, 16]} />
      </mesh>
      {/* nose cone */}
      <mesh material={accent} position={[0.98, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.19, 0.34, 16]} />
      </mesh>
      {/* spinner + prop disc */}
      <mesh ref={prop} material={dark} position={[1.18, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.42, 0.018, 6, 28]} />
      </mesh>
      <mesh material={dark} position={[1.16, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.07, 0.16, 12]} />
      </mesh>
      {/* canopy */}
      <mesh material={glass} position={[0.16, 0.17, 0]} scale={[1.5, 0.7, 0.9]}>
        <sphereGeometry args={[0.19, 16, 12]} />
      </mesh>
      {/* main wing */}
      <mesh material={body} position={[0.05, -0.02, 0]} castShadow>
        <boxGeometry args={[0.62, 0.055, 3.5]} />
      </mesh>
      {/* wing stripes */}
      <mesh material={accent} position={[0.05, -0.005, 1.42]}>
        <boxGeometry args={[0.63, 0.06, 0.42] } />
      </mesh>
      <mesh material={accent} position={[0.05, -0.005, -1.42]}>
        <boxGeometry args={[0.63, 0.06, 0.42]} />
      </mesh>
      {/* tailplane */}
      <mesh material={body} position={[-0.82, 0.02, 0]}>
        <boxGeometry args={[0.36, 0.05, 1.32]} />
      </mesh>
      {/* fin */}
      <mesh material={accent} position={[-0.86, 0.3, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.05]} />
      </mesh>
    </group>
  );
}

/** Flies a long, banking circuit across the viewport. */
function Circuit({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    if (reduced) {
      group.current.position.set(0, 0, 0);
      group.current.rotation.set(0, -0.35, 0.05);
      return;
    }
    const loop = 15;
    const p = (t % loop) / loop;

    // sweep left -> right with a gentle arc towards the viewer
    const x = -13 + p * 26;
    const y = Math.sin(p * Math.PI) * 1.15 - 0.35;
    const z = -5 + Math.sin(p * Math.PI) * 3.2;

    group.current.position.set(x, y, z);
    // bank into the turn, pitch with the climb
    group.current.rotation.z = -Math.cos(p * Math.PI) * 0.42;
    group.current.rotation.y = -0.5 + Math.sin(p * Math.PI) * 0.5;
    group.current.rotation.x = Math.cos(p * Math.PI) * 0.16;
  });

  return (
    <group ref={group}>
      <Float speed={reduced ? 0 : 1.4} rotationIntensity={0.14} floatIntensity={0.32}>
        <Plane />
      </Float>
    </group>
  );
}

export function PlaneScene({ className = '' }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    // Skip the WebGL cost on very small / low-power screens.
    setEnabled(window.innerWidth >= 640);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (!enabled) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      <Canvas
        camera={{ position: [0, 0.6, 9], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 6, 5]} intensity={2.4} />
        <directionalLight position={[-5, -2, -3]} intensity={0.7} color="#38bdf8" />
        <Circuit reduced={reduced} />
      </Canvas>
    </div>
  );
}
