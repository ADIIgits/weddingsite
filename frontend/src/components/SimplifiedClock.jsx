import React, { useState, useEffect } from 'react';

export default function SimplifiedClock({ isHighlighted = false }) {
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

  const handleAddToCalendar = () => {
    const title = encodeURIComponent("Dr. Sonali & Dr. Sudev's Wedding Celebration");
    const details = encodeURIComponent(
      "Balle-Balle Meets Ayyioo! Celebrating the wedding of Dr. Sonali & Dr. Sudev. Auspicious Muhurtham at 6:00 PM IST."
    );
    const location = encodeURIComponent("The Grand Heritage Palace, New Delhi, India");
    const start = "20261211T123000Z"; // 18:00 IST = 12:30 UTC
    const end = "20261211T183000Z";

    // Google Calendar Link
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;

    // Generate .ics file download
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sonali and Sudev//Wedding Celebration//EN',
      'BEGIN:VEVENT',
      'UID:wedding-sonali-sudev-2026@celebration',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      'DTSTART:' + start,
      'DTEND:' + end,
      'SUMMARY:Dr. Sonali & Dr. Sudev Wedding',
      'DESCRIPTION:Balle-Balle Meets Ayyioo! Celebrating the wedding of Dr. Sonali & Dr. Sudev.',
      'LOCATION:The Grand Heritage Palace, New Delhi, India',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const icsUrl = URL.createObjectURL(blob);

    window.open(gcalUrl, '_blank');

    const downloadLink = document.createElement('a');
    downloadLink.href = icsUrl;
    downloadLink.download = 'Sonali_and_Sudev_Wedding.ics';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(icsUrl);
  };

  const format = (num) => String(num).padStart(2, '0');

  return (
    <section className="clock-section" id="clock-section">
      <div className="section-container">
        <div className={`clock-wrapper ${isHighlighted ? 'highlighted-glow' : ''}`}>
          <div className="clock-badge">
            <span className="clock-pulse-dot"></span>
            <span>Live Wedding Countdown</span>
          </div>

          <h3 className="clock-heading">Approaching The Auspicious Moment</h3>
          <p className="clock-subheading">December 11, 2026 • 6:00 PM IST</p>

          {/* Simplified Minimal Capsule Clock */}
          <div className="simplified-clock-capsule">
            <div className="clock-unit-pill">
              <span className="clock-val">{format(timeLeft.days)}</span>
              <span className="clock-label">Days</span>
            </div>
            <span className="clock-separator">:</span>

            <div className="clock-unit-pill">
              <span className="clock-val">{format(timeLeft.hours)}</span>
              <span className="clock-label">Hours</span>
            </div>
            <span className="clock-separator">:</span>

            <div className="clock-unit-pill">
              <span className="clock-val">{format(timeLeft.minutes)}</span>
              <span className="clock-label">Minutes</span>
            </div>
            <span className="clock-separator">:</span>

            <div className="clock-unit-pill highlight">
              <span className="clock-val pulse-sec">{format(timeLeft.seconds)}</span>
              <span className="clock-label">Seconds</span>
            </div>
          </div>

          <div className="clock-footer-actions">
            <button className="btn-calendar" onClick={handleAddToCalendar} title="Save to Google Calendar or Download .ics">
              <span>📅 Add to Calendar</span>
            </button>
            <span className="clock-note">✨ Blessings & celebrations await! ✨</span>
          </div>
        </div>
      </div>
    </section>
  );
}
