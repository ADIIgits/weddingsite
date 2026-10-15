import React from 'react';

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg-overlay"></div>

      {/* Floating Cultural Micro-Animations */}
      <div className="cultural-float dhol-float" title="Punjabi Dhol">
        <span className="instrument-emoji">🥁</span>
        <span className="instrument-tag">Balle-Balle!</span>
      </div>

      <div className="cultural-float pungi-float" title="South Indian Nadaswaram">
        <span className="instrument-emoji">🎺</span>
        <span className="instrument-tag">Ayyioo!</span>
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-sparkle">✨</span>
          <span>Two Souls • One Beautiful Love Story</span>
          <span className="badge-sparkle">✨</span>
        </div>

        <p className="family-invitation">Together With Their Families</p>

        <h1 className="couple-title">
          <span className="name bride">Dr. Sonali</span>
          <span className="ampersand">&</span>
          <span className="name groom">Dr. Sudev</span>
        </h1>

        <div className="wedding-announcement">
          <span className="married-text">are getting married!</span>
          <div className="fusion-tag">
            <span className="fusion-firework">🎉</span>
            <span className="fusion-highlight">Balle-Balle Meets Ayyioo</span>
            <span className="fusion-firework">🎊</span>
          </div>
        </div>

        <p className="hero-description">
          Join us for a celebration of two beautiful souls, and the joy of bringing families together across Punjabi beats and South Indian grace.
        </p>

        <div className="hero-actions">
          <a href="#scratch-station" className="btn btn-primary pulse-btn">
            <span>✨ Scratch to Reveal Secrets ✨</span>
          </a>
          <a href="#rsvp" className="btn btn-secondary">
            <span>Confirm Attendance 💌</span>
          </a>
        </div>

        <a href="#scratch-station" className="scroll-indicator" aria-label="Scroll down">
          <span className="scroll-arrow">↓</span>
        </a>
      </div>
    </section>
  );
}
