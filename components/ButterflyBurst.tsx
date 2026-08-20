"use client";

import { useEffect, useState } from "react";

type Particle = { id: number; bx: number; by: number; brot: number; color: string; delay: number };

const PARTICLE_COUNT = 14;
const GOLD = "#B8935F"; // matches --color-bronze
const WHITE = "#FFFFFF";

function makeParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.4;
    const distance = 70 + Math.random() * 130;
    return {
      id: i,
      bx: Math.cos(angle) * distance,
      by: Math.sin(angle) * distance - 30, // slight upward drift
      brot: (Math.random() - 0.5) * 360,
      color: i % 2 === 0 ? GOLD : WHITE,
      delay: Math.random() * 0.15,
    };
  });
}

// A one-shot burst of butterfly shapes scattering from (originX, originY) —
// mounted on click, unmounts itself via onDone once the animation finishes.
export default function ButterflyBurst({
  originX,
  originY,
  onDone,
}: {
  originX: number;
  originY: number;
  onDone: () => void;
}) {
  const [particles] = useState<Particle[]>(makeParticles);

  useEffect(() => {
    const timeout = setTimeout(onDone, 1000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {particles.map((p) => (
        <svg
          key={p.id}
          className="butterfly-particle"
          style={
            {
              left: originX,
              top: originY,
              "--bx": `${p.bx}px`,
              "--by": `${p.by}px`,
              "--brot": `${p.brot}deg`,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties
          }
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={p.color}
          aria-hidden
        >
          <path d="M12 3c-1.2 3-4.4 3.6-6.8 2.8C2.8 5 1 7.4 1.6 9.8c.6 2.4 3 3.6 5.2 3 1.8-.5 3.4-1.7 4.2-3.3.1 2 .5 5.3 1 7.5.5-2.2.9-5.5 1-7.5.8 1.6 2.4 2.8 4.2 3.3 2.2.6 4.6-.6 5.2-3 .6-2.4-1.2-4.8-3.6-4-2.4.8-5.6.2-6.8-2.8z" />
        </svg>
      ))}
    </>
  );
}
