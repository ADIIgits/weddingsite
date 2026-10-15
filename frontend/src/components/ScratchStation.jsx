import React, { useState, useEffect } from 'react';
import ScratchCard from './ScratchCard';

export default function ScratchStation({
  theme,
  isDateRevealed,
  onDateReveal,
  onMagicReveal,
  onResetScratch,
  onOpenTimerModal,
  resetSignal,
}) {
  const weddingTime = new Date('December 11, 2026 18:00:00 GMT+0530').getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    function calculateTime() {
      const now = new Date().getTime();
      const diff = weddingTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [weddingTime]);

  const format = (num) => String(num).padStart(2, '0');

  return (
    <section className="scratch-station-section" id="scratch-station">
      <div className="section-container">
        <div className="section-header">
          <span className="section-eyebrow">Interactive Secret</span>
          <h2 className="section-title">Scratch to Reveal Wedding Date</h2>
          <p className="section-subtitle">
            Just 3 quick scratches across the golden foil to unlock the date and countdown timer!
          </p>

          <div className="scratch-controls">
            <button className="btn-micro" onClick={onMagicReveal} title="Reveal card instantly">
              🪄 Magic Reveal
            </button>
            <button className="btn-micro secondary" onClick={onResetScratch} title="Re-coat foil and scratch again">
              🔄 Scratch Again
            </button>
          </div>
        </div>

        <div className="single-scratch-card-wrapper">
          {/* Dedicated Card: The Wedding Date */}
          <ScratchCard
            badge="The Big Day • Auspicious Muhurtham"
            foilType="gold"
            icon="💍"
            threshold={15}
            promptText="Swipe 3 times to scratch"
            isRevealed={isDateRevealed}
            onReveal={onDateReveal}
            resetSignal={resetSignal}
            theme={theme}
          >
            <div className="reveal-icon">💍</div>
            <span className="reveal-mini-label">The Wedding Day</span>
            <div className="reveal-highlight-date">Friday, December 11, 2026</div>
            <div className="reveal-details-row">
              <span className="reveal-pill">🕒 Muhurtham: 6:00 PM IST</span>
              <span className="reveal-pill">📍 The Grand Palace, Bina, Madhya Pradesh</span>
            </div>
            <p className="reveal-quote">
              "Two lives, two hearts, joined together in friendship, united forever in love."
            </p>

            {/* Live Countdown Timer displayed inside the revealed card */}
            <div className="revealed-clock-box">
              <div className="revealed-clock-title">⏳ Auspicious Countdown:</div>
              <div className="revealed-clock-digits">
                <span>{format(timeLeft.days)}d</span> :{' '}
                <span>{format(timeLeft.hours)}h</span> :{' '}
                <span>{format(timeLeft.minutes)}m</span> :{' '}
                <span className="pulse-sec">{format(timeLeft.seconds)}s</span>
              </div>
            </div>

            <button
              className="reveal-action-btn"
              onClick={onOpenTimerModal}
              title="Open full wedding timer popup"
            >
              ⏰ Open Wedding Timer Popup
            </button>
          </ScratchCard>
        </div>
      </div>
    </section>
  );
}
