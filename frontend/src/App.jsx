import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ScratchStation from './components/ScratchStation';
import EventsSection from './components/EventsSection';
import RsvpSection from './components/RsvpSection';
import Footer from './components/Footer';
import GuestListModal from './components/GuestListModal';
import SuccessModal from './components/SuccessModal';
import WeddingTimerModal from './components/WeddingTimerModal';
import FloatingPetals from './components/FloatingPetals';
import { getAudioContext, setSfxEnabled, playChimeSound } from './utils/audio';
import confetti from 'canvas-confetti';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('wedding_theme') || 'light';
  });

  const [sfx, setSfx] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isDateRevealed, setIsDateRevealed] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [isGuestListOpen, setIsGuestListOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    rsvpData: null,
    emailStatus: null,
  });

  const audioRef = useRef(null);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wedding_theme', theme);
  }, [theme]);

  // Authentic Shehnai music: play all the time when user is active
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.35;

    const startAudio = () => {
      audio
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => {});
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
      window.removeEventListener('scroll', startAudio);
      window.removeEventListener('keydown', startAudio);
      window.removeEventListener('pointerdown', startAudio);
    };

    // Try playing immediately
    audio
      .play()
      .then(() => setIsPlayingMusic(true))
      .catch(() => {
        // Browser autoplay blocked: listen for first interaction anywhere on page
        window.addEventListener('click', startAudio, { once: true });
        window.addEventListener('touchstart', startAudio, { once: true });
        window.addEventListener('scroll', startAudio, { once: true });
        window.addEventListener('keydown', startAudio, { once: true });
        window.addEventListener('pointerdown', startAudio, { once: true });
      });

    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
      window.removeEventListener('scroll', startAudio);
      window.removeEventListener('keydown', startAudio);
      window.removeEventListener('pointerdown', startAudio);
    };
  }, []);

  const handleToggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    playChimeSound();
  };

  const handleToggleSfx = () => {
    const next = !sfx;
    setSfx(next);
    setSfxEnabled(next);
    if (next) playChimeSound();
  };

  const handleToggleMusic = () => {
    getAudioContext();
    if (!audioRef.current) return;

    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.volume = 0.35;
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => console.log('Audio autoplay prevented'));
    }
  };

  const handleDateReveal = () => {
    setIsDateRevealed(true);
    // Unmask card and pop up the wedding timer popup!
    setTimeout(() => {
      setIsTimerModalOpen(true);
    }, 400);
  };

  const handleMagicReveal = () => {
    getAudioContext();
    setIsDateRevealed(true);
    setTimeout(() => {
      setIsTimerModalOpen(true);
    }, 400);

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.4 },
      colors: ['#d46b85', '#c69255', '#2d6a4f', '#dab8d8', '#ffd700'],
    });
    playChimeSound();
  };

  const handleResetScratch = () => {
    setIsDateRevealed(false);
    setIsTimerModalOpen(false);
    setResetSignal((prev) => prev + 1);
    playChimeSound();
  };

  const handleRsvpSuccess = (rsvpData, emailStatus) => {
    setSuccessModal({
      isOpen: true,
      rsvpData,
      emailStatus,
    });
  };

  return (
    <div className="wedding-app">
      {/* Floating Petals Microinteraction */}
      <FloatingPetals />

      {/* Navigation Bar */}
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        sfxEnabled={sfx}
        onToggleSfx={handleToggleSfx}
        isPlayingMusic={isPlayingMusic}
        onToggleMusic={handleToggleMusic}
        onOpenGuestList={() => setIsGuestListOpen(true)}
      />

      {/* Hero Section */}
      <Hero />

      {/* Scratch & Reveal Station (Wedding Date Card - 3 scratches unlock countdown!) */}
      <ScratchStation
        theme={theme}
        isDateRevealed={isDateRevealed}
        onDateReveal={handleDateReveal}
        onMagicReveal={handleMagicReveal}
        onResetScratch={handleResetScratch}
        onOpenTimerModal={() => setIsTimerModalOpen(true)}
        resetSignal={resetSignal}
      />

      {/* Celebrations Section (Mehendi, Sagan, Haldi, Shaadi) */}
      <EventsSection />

      {/* RSVP Section */}
      <RsvpSection onRsvpSuccess={handleRsvpSuccess} />

      {/* Footer */}
      <Footer />

      {/* Wedding Timer Popup Modal (Pops up when card is scratched!) */}
      <WeddingTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
      />

      {/* Admin Guest List Modal */}
      <GuestListModal
        isOpen={isGuestListOpen}
        onClose={() => setIsGuestListOpen(false)}
      />

      {/* RSVP Confirmation Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, rsvpData: null, emailStatus: null })}
        rsvpData={successModal.rsvpData}
        emailStatus={successModal.emailStatus}
      />

      {/* Authentic Classical Shehnai Dhun Music Track (Loops continuously when user is active) */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src="/assets/shehnai.mp3"
      />
    </div>
  );
}
