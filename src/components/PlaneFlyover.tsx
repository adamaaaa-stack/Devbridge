'use client';

import dynamic from 'next/dynamic';

/**
 * The 3D scene pulls in three.js, so it loads after the hero paints and never
 * blocks first render.
 */
const PlaneScene = dynamic(
  () => import('./PlaneScene').then((m) => m.PlaneScene),
  { ssr: false },
);

export function PlaneFlyover({ className = '' }: { className?: string }) {
  return <PlaneScene className={className} />;
}
