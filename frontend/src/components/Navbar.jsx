import React from 'react';

export default function Navbar({
  theme,
  onToggleTheme,
  sfxEnabled,
  onToggleSfx,
  isPlayingMusic,
  onToggleMusic,
  onOpenGuestList,
}) {
  return (
    <header className="navbar" id="navbar">
      <div className="nav-container">
        <a href="#hero" className="nav-brand" aria-label="Sonali and Sudev Wedding">
          <span className="monogram">S&S</span>
          <span className="nav-brand-text">Sonali & Sudev</span>
        </a>

        <nav className="nav-links">
          <a href="#scratch-station" className="nav-link">Reveal Cards</a>
          <a href="#clock-section" className="nav-link">Countdown</a>
          <a href="#events" className="nav-link">Celebrations</a>
          <a href="#rsvp" className="nav-link">RSVP</a>
        </nav>

        <div className="nav-actions">
          {/* Light / Dark Mode Toggle */}
          <button
            className="icon-btn"
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* Sound FX Toggle */}
          <button
            className={`icon-btn ${sfxEnabled ? 'active' : ''}`}
            onClick={onToggleSfx}
            title="Toggle Sound Effects (Scratch & Chimes)"
            aria-label="Toggle sound effects"
          >
            {sfxEnabled ? '🔔' : '🔕'}
          </button>

          {/* Shehnai / Music Player */}
          <button
            className={`music-btn ${isPlayingMusic ? 'playing' : ''}`}
            onClick={onToggleMusic}
            title="Toggle Background Music"
            aria-label="Toggle background music"
          >
            <div className="sound-bars">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="music-label">Shehnai</span>
          </button>

          {/* Guest List Admin Pill */}
          <button className="admin-pill-btn" onClick={onOpenGuestList} title="View RSVPs & Guest Count">
            <span>📋</span>
            <span className="admin-text">Guest List</span>
          </button>
        </div>
      </div>
    </header>
  );
}
