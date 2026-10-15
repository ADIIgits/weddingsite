import React, { useState } from 'react';
import { playChimeSound } from '../utils/audio';
import confetti from 'canvas-confetti';

const events = [
  {
    id: 'mehndi',
    name: 'Mehendi',
    date: 'December 10 • Afternoon',
    icon: '🌺',
    desc: 'Colors bloom, henna flows, hearts celebrate. Intricate artistry, vibrant joy, and beautiful traditions come alive.',
    themeName: '🟢 Lush Green',
    chipClass: 'chip-green',
  },
  {
    id: 'sagan',
    name: 'Sagan',
    date: 'December 10 • Evening',
    icon: '🎭',
    desc: 'Elegance meets grace. Two families unite with formal acceptance, blessings flow, and traditions honor the beginning.',
    themeName: '🖤 Elegant Black',
    chipClass: 'chip-black',
  },
  {
    id: 'haldi',
    name: 'Haldi',
    date: 'December 11 • Afternoon',
    icon: '✨',
    desc: 'Golden turmeric, playful moments, intimate bonding. A surprise celebration wrapped in tradition and love.',
    themeName: '💜 Soft Lavender',
    chipClass: 'chip-lavender',
  },
  {
    id: 'wedding',
    name: 'Wedding',
    date: 'December 11 • Evening (6 PM)',
    icon: '💍',
    desc: 'Sacred vows, eternal love. Two hearts become one, families unite, and a beautiful new chapter begins with blessings.',
    themeName: '🎨 Rainbow of Emotions',
    chipClass: 'chip-rainbow',
    isSpecial: true,
  },
];

export default function EventsSection() {
  const [revealedThemes, setRevealedThemes] = useState({});

  const toggleTheme = (id, e) => {
    playChimeSound();
    const isNowRevealed = !revealedThemes[id];
    setRevealedThemes((prev) => ({ ...prev, [id]: isNowRevealed }));

    if (isNowRevealed && e) {
      const rect = e.currentTarget.getBoundingClientRect();
      confetti({
        particleCount: 25,
        spread: 45,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#d46b85', '#c69255', '#2d6a4f', '#dab8d8'],
      });
    }
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  return (
    <section className="events-section" id="events">
      <div className="section-container">
        <div className="section-header">
          <span className="section-eyebrow">Four Days of Joy</span>
          <h2 className="section-title">Wedding Itinerary & Themes</h2>
          <p className="section-subtitle">
            Moments of togetherness, love, and sacred celebrations
          </p>
        </div>

        <div className="events-grid">
          {events.map((evt) => {
            const isRevealed = !!revealedThemes[evt.id];
            return (
              <div
                key={evt.id}
                className={`event-card ${evt.id}-theme ${evt.isSpecial ? 'highlight-card' : ''}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <div className="event-icon-circle">{evt.icon}</div>
                <h3 className="event-title">{evt.name}</h3>

                <div className="event-meta">
                  <span className={`event-date-badge ${evt.isSpecial ? 'auspicious' : ''}`}>
                    {evt.date}
                  </span>
                </div>

                <p className="event-description">{evt.desc}</p>

                {evt.isSpecial && (
                  <div className="blessing-highlight">✨ Happiness & Blessings ✨</div>
                )}

                {/* Interactive Theme Box */}
                <div
                  className={`event-theme-box ${isRevealed ? 'revealed' : ''} ${evt.isSpecial ? 'special' : ''}`}
                  onClick={(e) => toggleTheme(evt.id, e)}
                  title="Click to reveal dress theme"
                >
                  <div className="theme-unrevealed">
                    <span className="sparkle-spin">✨</span>
                    <span>Tap to Reveal Theme</span>
                  </div>
                  <div className="theme-revealed">
                    <span className={`theme-color-chip ${evt.chipClass}`}></span>
                    <span className="theme-text">{evt.themeName}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
