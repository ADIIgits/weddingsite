import React, { useEffect, useState } from 'react';

const petalEmojis = ['🌸', '🌺', '🏵️', '🪷', '✨'];

export default function FloatingPetals() {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPetal = {
        id: Date.now() + Math.random(),
        emoji: petalEmojis[Math.floor(Math.random() * petalEmojis.length)],
        left: Math.random() * 100,
        duration: Math.random() * 4 + 7,
        size: Math.random() * 0.6 + 0.9,
      };

      setPetals((prev) => [...prev.slice(-15), newPetal]);
    }, 1400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="petals-container" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="floating-petal"
          style={{
            left: `${p.left}vw`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}rem`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
