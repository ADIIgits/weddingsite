import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playScratchSound, playChimeSound } from '../utils/audio';
import confetti from 'canvas-confetti';

export default function ScratchCard({
  badge = 'Interactive Secret',
  foilType = 'gold',
  threshold = 15, // Low threshold so card unlocks quickly
  promptText = 'Scratch 3 times to reveal',
  icon = '💍',
  isRevealed = false,
  onReveal,
  resetSignal = 0,
  theme = 'light',
  children,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [percent, setPercent] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);
  const [cleared, setCleared] = useState(false);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const strokeCountRef = useRef(0);

  const drawFoil = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);

    const isDark = theme === 'dark';
    const grad = ctx.createLinearGradient(0, 0, w, h);

    if (foilType === 'gold') {
      if (isDark) {
        grad.addColorStop(0, '#e5b36a');
        grad.addColorStop(0.35, '#fff0c7');
        grad.addColorStop(0.65, '#b58338');
        grad.addColorStop(1, '#f7d899');
      } else {
        grad.addColorStop(0, '#d4a870');
        grad.addColorStop(0.35, '#fae6c2');
        grad.addColorStop(0.7, '#c89556');
        grad.addColorStop(1, '#edd6ad');
      }
    } else {
      if (isDark) {
        grad.addColorStop(0, '#eb839a');
        grad.addColorStop(0.35, '#ffd6e1');
        grad.addColorStop(0.65, '#b8546b');
        grad.addColorStop(1, '#ffc9d6');
      } else {
        grad.addColorStop(0, '#e38da1');
        grad.addColorStop(0.35, '#fde3ea');
        grad.addColorStop(0.7, '#c96b82');
        grad.addColorStop(1, '#fad7e2');
      }
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stipple Metallic Texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 500; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      ctx.beginPath();
      ctx.arc(rx, ry, Math.random() * 2 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Border Frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    // Embossed Emblem
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '38px sans-serif';
    ctx.fillText(icon, w / 2, h / 2 - 44);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.font = 'bold 15px "Outfit", sans-serif';
    ctx.fillText('✨ S & S • ROYAL WEDDING ✨', w / 2 + 1, h / 2 + 2);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Outfit", sans-serif';
    ctx.fillText('✨ S & S • ROYAL WEDDING ✨', w / 2, h / 2 + 1);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = 'italic 18px "Cormorant Garamond", serif';
    ctx.fillText('Scratch to Unveil The Big Day', w / 2, h / 2 + 35);

    ctx.font = '12px "Outfit", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText('🪙 Just 3 scratches to unlock the countdown! 🪙', w / 2, h / 2 + 65);
  }, [foilType, theme, icon]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }, []);

  // Setup / Reset foil
  useEffect(() => {
    resize();
    setPercent(0);
    setStrokeCount(0);
    strokeCountRef.current = 0;
    setCleared(false);
    drawFoil();

    const handleResize = () => {
      if (!cleared && !isRevealed) {
        resize();
        drawFoil();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resize, drawFoil, resetSignal, cleared, isRevealed]);

  // Handle external reveal trigger
  useEffect(() => {
    if (isRevealed && !cleared) {
      triggerFullReveal();
    }
  }, [isRevealed]);

  const triggerFullReveal = () => {
    setCleared(true);
    setPercent(100);
    setStrokeCount(3);
    playChimeSound();

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      confetti({
        particleCount: 80,
        spread: 75,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#d46b85', '#c69255', '#2d6a4f', '#dab8d8', '#ffd700'],
      });
    }

    if (onReveal) {
      onReveal();
    }
  };

  const registerStroke = () => {
    if (cleared) return;
    strokeCountRef.current += 1;
    const count = strokeCountRef.current;
    setStrokeCount(count);
    setPercent(Math.min(100, Math.round((count / 3) * 100)));

    // 3 scratches unlock whole card!
    if (count >= 3) {
      triggerFullReveal();
    }
  };

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas || cleared) return;
    const ctx = canvas.getContext('2d');

    // Generous, smooth scratch width
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 65;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (lastPointRef.current) {
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
    } else {
      ctx.arc(x, y, 32, 0, Math.PI * 2);
    }
    ctx.stroke();

    playScratchSound();
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handlePointerDown = (e) => {
    if (cleared) return;
    isDrawingRef.current = true;
    const coords = getCoordinates(e);
    lastPointRef.current = coords;
    scratch(coords.x, coords.y);
    registerStroke();
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || cleared) return;
    if (e.cancelable && e.type === 'touchmove') e.preventDefault();
    const coords = getCoordinates(e);
    scratch(coords.x, coords.y);
    lastPointRef.current = coords;
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  return (
    <div className="scratch-card-box">
      <div className="scratch-card-badge">{badge}</div>

      <div className="scratch-card-canvas-wrapper" ref={containerRef}>
        {/* Hidden Reveal View */}
        <div className="scratch-hidden-content">
          {children}
        </div>

        {/* Scratchable Canvas Layer */}
        <canvas
          ref={canvasRef}
          className={`scratch-canvas ${cleared ? 'completed' : ''}`}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onTouchCancel={handlePointerUp}
        />

        {/* Scratch Instruction & Progress Overlay */}
        {!cleared && (
          <div className="scratch-prompt-overlay">
            <span className="scratch-coin-icon">🪙</span>
            <span className="scratch-prompt-text">
              {strokeCount === 0
                ? 'Swipe across to scratch (1/3)'
                : strokeCount === 1
                ? 'Great! Swipe again (2/3)'
                : '1 more swipe to unlock! (3/3)'}
            </span>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
            </div>
            <span className="progress-percent">{strokeCount}/3</span>
          </div>
        )}
      </div>
    </div>
  );
}
