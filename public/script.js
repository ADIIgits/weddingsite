/**
 * Dr. Sonali & Dr. Sudev — Wedding Celebration Interactive Web App
 * Interactive Canvas Scratch Cards, Simplified Clock, Audio Synthesizer,
 * Microinteractions, Light/Dark Theme, Confetti, and Backend RSVP Integration.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. Web Audio Synthesizer & Sound FX System
    // -------------------------------------------------------------------------
    let audioCtx = null;
    let sfxEnabled = true;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Synthesized scratch texture sound (delicate friction effect)
    let lastScratchSoundTime = 0;
    function playScratchSound() {
        if (!sfxEnabled) return;
        const now = Date.now();
        if (now - lastScratchSoundTime < 60) return; // throttle sound
        lastScratchSoundTime = now;

        const ctx = getAudioContext();
        if (!ctx) return;

        try {
            const bufferSize = ctx.sampleRate * 0.04; // 40ms burst
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400 + Math.random() * 600, ctx.currentTime);
            filter.Q.setValueAtTime(3, ctx.currentTime);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start();
        } catch (e) {
            // Audio error suppression
        }
    }

    // Synthesized celebratory chime chord
    function playChimeSound() {
        if (!sfxEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C Major Chord
        frequencies.forEach((freq, idx) => {
            try {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

                gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.06 + 0.9);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + idx * 0.06);
                osc.stop(ctx.currentTime + idx * 0.06 + 1.0);
            } catch (e) {}
        });
    }

    // SFX Toggle Handler
    const sfxToggle = document.getElementById('sfxToggle');
    const sfxIcon = document.getElementById('sfxIcon');
    if (sfxToggle) {
        sfxToggle.addEventListener('click', () => {
            sfxEnabled = !sfxEnabled;
            sfxToggle.classList.toggle('active', sfxEnabled);
            sfxIcon.textContent = sfxEnabled ? '🔔' : '🔕';
            if (sfxEnabled) playChimeSound();
        });
    }

    // -------------------------------------------------------------------------
    // 2. Background Wedding Music Player Toggle
    // -------------------------------------------------------------------------
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    let isMusicPlaying = false;

    if (musicToggle && bgMusic) {
        musicToggle.addEventListener('click', () => {
            getAudioContext();
            if (isMusicPlaying) {
                bgMusic.pause();
                musicToggle.classList.remove('playing');
                isMusicPlaying = false;
            } else {
                bgMusic.volume = 0.25;
                bgMusic.play().then(() => {
                    musicToggle.classList.add('playing');
                    isMusicPlaying = true;
                }).catch(() => {
                    console.log('Background music requires user gesture');
                });
            }
        });
    }

    // -------------------------------------------------------------------------
    // 3. Theme Toggle (Light & Dark Mode)
    // -------------------------------------------------------------------------
    const themeToggle = document.getElementById('themeToggle');
    const htmlEl = document.documentElement;

    function applyTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        localStorage.setItem('sonali_sudev_theme', theme);
        // Refresh canvas foils if not yet revealed
        if (dateScratchCard && !dateScratchCard.isRevealed) dateScratchCard.drawFoil();
        if (themeScratchCard && !themeScratchCard.isRevealed) themeScratchCard.drawFoil();
    }

    const savedTheme = localStorage.getItem('sonali_sudev_theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = htmlEl.getAttribute('data-theme') || 'light';
            const next = current === 'light' ? 'dark' : 'light';
            applyTheme(next);
            playChimeSound();
        });
    }

    // -------------------------------------------------------------------------
    // 4. Confetti Fireworks Particle System
    // -------------------------------------------------------------------------
    const confettiCanvas = document.getElementById('confettiCanvas');
    const confettiCtx = confettiCanvas.getContext('2d');
    let confettiParticles = [];
    let confettiAnimId = null;

    function resizeConfetti() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeConfetti);
    resizeConfetti();

    function fireConfetti(originX = window.innerWidth / 2, originY = window.innerHeight / 2, count = 80) {
        const colors = ['#d46b85', '#c69255', '#2d6a4f', '#dab8d8', '#f5c57a', '#ffffff', '#e26a8d'];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 8 + 4;
            confettiParticles.push({
                x: originX,
                y: originY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 3,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                alpha: 1,
                decay: Math.random() * 0.015 + 0.008,
                shape: Math.random() > 0.5 ? 'circle' : 'rect'
            });
        }
        if (!confettiAnimId) {
            animateConfetti();
        }
    }

    function animateConfetti() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        for (let i = confettiParticles.length - 1; i >= 0; i--) {
            const p = confettiParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.18; // gravity
            p.vx *= 0.98; // air resistance
            p.rotation += p.rotationSpeed;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                confettiParticles.splice(i, 1);
                continue;
            }

            confettiCtx.save();
            confettiCtx.globalAlpha = Math.max(0, p.alpha);
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate((p.rotation * Math.PI) / 180);
            confettiCtx.fillStyle = p.color;

            if (p.shape === 'circle') {
                confettiCtx.beginPath();
                confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                confettiCtx.fill();
            } else {
                confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            }
            confettiCtx.restore();
        }

        if (confettiParticles.length > 0) {
            confettiAnimId = requestAnimationFrame(animateConfetti);
        } else {
            confettiAnimId = null;
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }

    // -------------------------------------------------------------------------
    // 5. Floating Petals Microinteraction
    // -------------------------------------------------------------------------
    const petalsContainer = document.getElementById('petalsContainer');
    const petalEmojis = ['🌸', '🌺', '🏵️', '🪷', '✨'];

    function createPetal() {
        if (!petalsContainer) return;
        const petal = document.createElement('div');
        petal.className = 'floating-petal';
        petal.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
        petal.style.left = Math.random() * 100 + 'vw';
        const duration = Math.random() * 4 + 7; // 7s to 11s
        petal.style.animationDuration = duration + 's';
        petal.style.fontSize = (Math.random() * 0.7 + 0.9) + 'rem';
        petalsContainer.appendChild(petal);

        setTimeout(() => {
            petal.remove();
        }, duration * 1000);
    }
    setInterval(createPetal, 1400);

    // -------------------------------------------------------------------------
    // 6. Interactive Scratch Card Engine
    // -------------------------------------------------------------------------
    class ScratchCard {
        constructor(options) {
            this.canvas = document.getElementById(options.canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.wrapper = this.canvas.parentElement;
            this.progressBar = document.getElementById(options.progressBarId);
            this.progressText = document.getElementById(options.progressTextId);
            this.prompt = document.getElementById(options.promptId);
            this.foilType = options.foilType || 'gold';
            this.threshold = options.threshold || 38; // Reveal when 38% cleared
            this.onComplete = options.onComplete || (() => {});

            this.isDrawing = false;
            this.isRevealed = false;
            this.scratchedPercent = 0;
            this.lastPoint = null;

            this.init();
        }

        init() {
            this.resize();
            this.drawFoil();
            this.bindEvents();
            window.addEventListener('resize', () => {
                if (!this.isRevealed) {
                    this.resize();
                    this.drawFoil();
                }
            });
        }

        resize() {
            const rect = this.wrapper.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        }

        drawFoil() {
            const w = this.canvas.width;
            const h = this.canvas.height;
            if (w === 0 || h === 0) return;

            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.clearRect(0, 0, w, h);

            // Shimmering Metallic Foil Gradient
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const grad = this.ctx.createLinearGradient(0, 0, w, h);

            if (this.foilType === 'gold') {
                if (isDark) {
                    grad.addColorStop(0, '#e5b36a');
                    grad.addColorStop(0.3, '#fff0c7');
                    grad.addColorStop(0.6, '#b58338');
                    grad.addColorStop(1, '#f7d899');
                } else {
                    grad.addColorStop(0, '#d4a870');
                    grad.addColorStop(0.35, '#fae6c2');
                    grad.addColorStop(0.7, '#c89556');
                    grad.addColorStop(1, '#edd6ad');
                }
            } else {
                // Rose Gold foil
                if (isDark) {
                    grad.addColorStop(0, '#eb839a');
                    grad.addColorStop(0.3, '#ffd6e1');
                    grad.addColorStop(0.6, '#b8546b');
                    grad.addColorStop(1, '#ffc9d6');
                } else {
                    grad.addColorStop(0, '#e38da1');
                    grad.addColorStop(0.35, '#fde3ea');
                    grad.addColorStop(0.7, '#c96b82');
                    grad.addColorStop(1, '#fad7e2');
                }
            }

            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, 0, w, h);

            // Metallic Stipple Texture
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            for (let i = 0; i < 600; i++) {
                const rx = Math.random() * w;
                const ry = Math.random() * h;
                const rsize = Math.random() * 2 + 1;
                this.ctx.beginPath();
                this.ctx.arc(rx, ry, rsize, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Decorative Embossed Border
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            this.ctx.lineWidth = 2.5;
            this.ctx.strokeRect(12, 12, w - 24, h - 24);

            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(16, 16, w - 32, h - 32);

            // Embossed Monogram & Text
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Ornamental Emblems
            this.ctx.font = '32px sans-serif';
            this.ctx.fillText(this.foilType === 'gold' ? '💍' : '🎨', w / 2, h / 2 - 45);

            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.font = 'bold 15px "Outfit", sans-serif';
            this.ctx.fillText('✨ S & S • ROYAL WEDDING ✨', w / 2 + 1, h / 2 + 1);

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 15px "Outfit", sans-serif';
            this.ctx.fillText('✨ S & S • ROYAL WEDDING ✨', w / 2, h / 2);

            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.font = 'italic 18px "Cormorant Garamond", serif';
            this.ctx.fillText('Scratch to Reveal', w / 2, h / 2 + 34);

            this.ctx.font = '12px "Outfit", sans-serif';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            this.ctx.fillText('🪙 Drag mouse or finger to scratch 🪙', w / 2, h / 2 + 65);
        }

        bindEvents() {
            const start = (e) => {
                if (this.isRevealed) return;
                this.isDrawing = true;
                const pos = this.getPos(e);
                this.lastPoint = pos;
                this.scratch(pos.x, pos.y);
            };

            const move = (e) => {
                if (!this.isDrawing || this.isRevealed) return;
                e.preventDefault();
                const pos = this.getPos(e);
                this.scratch(pos.x, pos.y);
                this.lastPoint = pos;
                playScratchSound();
            };

            const end = () => {
                this.isDrawing = false;
                this.lastPoint = null;
                this.checkProgress();
            };

            // Mouse Events
            this.canvas.addEventListener('mousedown', start);
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', end);

            // Touch Events (Mobile)
            this.canvas.addEventListener('touchstart', start, { passive: true });
            this.canvas.addEventListener('touchmove', move, { passive: false });
            this.canvas.addEventListener('touchend', end);
            this.canvas.addEventListener('touchcancel', end);
        }

        getPos(e) {
            const rect = this.canvas.getBoundingClientRect();
            let clientX = e.clientX;
            let clientY = e.clientY;

            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }

            return {
                x: clientX - rect.left,
                y: clientY - rect.top,
                screenX: clientX,
                screenY: clientY
            };
        }

        scratch(x, y) {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.lineWidth = 48;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            this.ctx.beginPath();
            if (this.lastPoint) {
                this.ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
                this.ctx.lineTo(x, y);
            } else {
                this.ctx.arc(x, y, 24, 0, Math.PI * 2);
            }
            this.ctx.stroke();

            // Periodic progress calculation
            if (Math.random() > 0.65) {
                this.checkProgress();
            }
        }

        checkProgress() {
            if (this.isRevealed) return;
            const w = this.canvas.width;
            const h = this.canvas.height;
            if (w === 0 || h === 0) return;

            // Sample pixels on a step grid for 60fps performance
            const imgData = this.ctx.getImageData(0, 0, w, h);
            const pixels = imgData.data;
            const step = 16;
            let clearCount = 0;
            let totalSampled = 0;

            for (let i = 3; i < pixels.length; i += 4 * step) {
                totalSampled++;
                if (pixels[i] === 0) {
                    clearCount++;
                }
            }

            const pct = Math.round((clearCount / totalSampled) * 100);
            this.scratchedPercent = pct;

            if (this.progressBar) this.progressBar.style.width = pct + '%';
            if (this.progressText) this.progressText.textContent = pct + '% Scratched';

            if (pct >= this.threshold) {
                this.reveal();
            }
        }

        reveal() {
            if (this.isRevealed) return;
            this.isRevealed = true;
            this.canvas.classList.add('completed');
            if (this.prompt) this.prompt.classList.add('hidden');

            const rect = this.canvas.getBoundingClientRect();
            fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);
            playChimeSound();

            if (this.onComplete) {
                this.onComplete();
            }
        }

        reset() {
            this.isRevealed = false;
            this.scratchedPercent = 0;
            this.canvas.classList.remove('completed');
            if (this.prompt) this.prompt.classList.remove('hidden');
            if (this.progressBar) this.progressBar.style.width = '0%';
            if (this.progressText) this.progressText.textContent = '0% Scratched';
            this.drawFoil();
        }
    }

    // Initialize Card 1: The Wedding Date
    const dateScratchCard = new ScratchCard({
        canvasId: 'dateScratchCanvas',
        progressBarId: 'dateProgressBar',
        progressTextId: 'dateProgressText',
        promptId: 'datePrompt',
        foilType: 'gold',
        threshold: 35,
        onComplete: () => {
            // Highlight clock
            const clock = document.getElementById('weddingClock');
            if (clock) {
                clock.style.borderColor = 'var(--shaadi-pink)';
                clock.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    clock.style.transform = 'scale(1)';
                }, 800);
            }
        }
    });

    // Initialize Card 2: The Wedding Theme
    const themeScratchCard = new ScratchCard({
        canvasId: 'themeScratchCanvas',
        progressBarId: 'themeProgressBar',
        progressTextId: 'themeProgressText',
        promptId: 'themePrompt',
        foilType: 'rose',
        threshold: 35,
        onComplete: () => {
            console.log('Wedding theme unveiled: Rainbow of Emotions');
        }
    });

    // Magic Reveal Button
    const magicRevealBtn = document.getElementById('magicRevealBtn');
    if (magicRevealBtn) {
        magicRevealBtn.addEventListener('click', () => {
            getAudioContext();
            dateScratchCard.reveal();
            themeScratchCard.reveal();
            fireConfetti(window.innerWidth / 2, window.innerHeight / 3, 120);
        });
    }

    // Reset Scratch Cards Button
    const resetScratchBtn = document.getElementById('resetScratchBtn');
    if (resetScratchBtn) {
        resetScratchBtn.addEventListener('click', () => {
            dateScratchCard.reset();
            themeScratchCard.reset();
            playChimeSound();
        });
    }

    // -------------------------------------------------------------------------
    // 7. Simplified, Elegant Wedding Countdown Clock
    // -------------------------------------------------------------------------
    const weddingDate = new Date('December 11, 2026 18:00:00 GMT+0530').getTime();

    const daysEl = document.getElementById('clockDays');
    const hoursEl = document.getElementById('clockHours');
    const minsEl = document.getElementById('clockMinutes');
    const secsEl = document.getElementById('clockSeconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = weddingDate - now;

        if (difference <= 0) {
            if (daysEl) daysEl.textContent = '00';
            if (hoursEl) hoursEl.textContent = '00';
            if (minsEl) minsEl.textContent = '00';
            if (secsEl) secsEl.textContent = '00';
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
        if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // Add to Calendar Generator (.ics file & Google Calendar)
    const addCalendarBtn = document.getElementById('addCalendarBtn');
    if (addCalendarBtn) {
        addCalendarBtn.addEventListener('click', () => {
            const title = encodeURIComponent("Dr. Sonali & Dr. Sudev's Wedding Celebration");
            const details = encodeURIComponent("Balle-Balle Meets Ayyioo! Celebrating the wedding of Dr. Sonali & Dr. Sudev. Auspicious Muhurtham at 6:00 PM IST.");
            const location = encodeURIComponent("The Grand Heritage Palace, New Delhi, India");
            const start = "20261211T123000Z"; // 18:00 IST = 12:30 UTC
            const end = "20261211T183000Z";

            // Google Calendar URL
            const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;

            // Create download of .ics file as universal calendar format
            const icsData = [
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

            const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
            const icsUrl = URL.createObjectURL(blob);

            // Open Google Calendar in new tab and offer .ics download
            window.open(gcalUrl, '_blank');
            const dlLink = document.createElement('a');
            dlLink.href = icsUrl;
            dlLink.download = 'Sonali_and_Sudev_Wedding.ics';
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
            URL.revokeObjectURL(icsUrl);
        });
    }

    // -------------------------------------------------------------------------
    // 8. Event Theme Badges (Interactive Tap to Reveal)
    // -------------------------------------------------------------------------
    window.toggleEventTheme = function(el) {
        getAudioContext();
        el.classList.toggle('revealed');
        playChimeSound();
        const rect = el.getBoundingClientRect();
        fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
    };

    // -------------------------------------------------------------------------
    // 9. 3D Card Hover Tilt Microinteraction
    // -------------------------------------------------------------------------
    const tiltCards = document.querySelectorAll('[data-tilt]');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    });

    // -------------------------------------------------------------------------
    // 10. RSVP Form Handling & Backend Email Dispatch
    // -------------------------------------------------------------------------
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpSubmitBtn = document.getElementById('rsvpSubmitBtn');
    const rsvpAlert = document.getElementById('rsvpAlert');
    const successModal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const emailPreviewBadge = document.getElementById('emailPreviewBadge');
    const emailPreviewLink = document.getElementById('emailPreviewLink');

    // Dynamic field toggle based on Attendance
    const rsvpAttendance = document.getElementById('rsvpAttendance');
    const guestsCountGroup = document.getElementById('guestsCountGroup');
    const foodRow = document.getElementById('foodRow');
    const eventsGroup = document.getElementById('eventsGroup');

    if (rsvpAttendance) {
        rsvpAttendance.addEventListener('change', () => {
            const isAttending = rsvpAttendance.value === 'yes';
            if (guestsCountGroup) guestsCountGroup.style.display = isAttending ? 'flex' : 'none';
            if (foodRow) foodRow.style.display = isAttending ? 'grid' : 'none';
            if (eventsGroup) eventsGroup.style.display = isAttending ? 'flex' : 'none';
        });
    }

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            getAudioContext();

            // Clear previous errors
            document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
            if (rsvpAlert) rsvpAlert.style.display = 'none';

            const name = document.getElementById('rsvpName').value.trim();
            const email = document.getElementById('rsvpEmail').value.trim();
            const attendance = document.getElementById('rsvpAttendance').value;
            const food = document.getElementById('rsvpFood').value;
            const phone = document.getElementById('rsvpPhone').value.trim();
            const guestsCount = document.getElementById('rsvpGuests').value;
            const message = document.getElementById('rsvpMessage').value.trim();

            // Selected Events
            const checkedEvents = [];
            document.querySelectorAll('input[name="events"]:checked').forEach(cb => {
                checkedEvents.push(cb.value);
            });

            // Validation
            let hasError = false;
            if (!name) {
                document.getElementById('nameError').textContent = 'Please enter your name.';
                hasError = true;
            }
            if (!email || !email.includes('@')) {
                document.getElementById('emailError').textContent = 'Please enter a valid email for confirmation.';
                hasError = true;
            }
            if (!attendance) {
                document.getElementById('attendanceError').textContent = 'Please select whether you will attend.';
                hasError = true;
            }

            if (hasError) return;

            // Submit loading state
            const btnText = rsvpSubmitBtn.querySelector('.btn-text');
            const btnLoader = rsvpSubmitBtn.querySelector('.btn-loader');
            rsvpSubmitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'inline-block';

            try {
                const response = await fetch('/api/rsvp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        attendance,
                        food,
                        guestsCount: Number(guestsCount) || 1,
                        events: checkedEvents,
                        message,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    // Celebrate
                    fireConfetti(window.innerWidth / 2, window.innerHeight / 2, 120);
                    playChimeSound();

                    // Show Modal
                    const modalTitle = document.getElementById('modalTitle');
                    const modalMsg = document.getElementById('modalMessage');

                    if (attendance === 'yes') {
                        modalTitle.textContent = `See You There, ${name}! ✨`;
                        modalMsg.textContent = `We are overjoyed that you'll be celebrating with us! A confirmation email has been dispatched to ${email}.`;
                    } else {
                        modalTitle.textContent = `Thank You, ${name} 💙`;
                        modalMsg.textContent = `We will truly miss you at the celebrations, but we hold your warm blessings close to our hearts.`;
                    }

                    // Email Preview Link (if on Ethereal or test preview available)
                    if (data.emailStatus && data.emailStatus.previewUrl) {
                        emailPreviewBadge.style.display = 'flex';
                        emailPreviewLink.href = data.emailStatus.previewUrl;
                    } else {
                        emailPreviewBadge.style.display = 'none';
                    }

                    successModal.classList.add('active');
                    rsvpForm.reset();
                } else {
                    if (rsvpAlert) {
                        rsvpAlert.className = 'alert-box error';
                        rsvpAlert.textContent = data.error || 'Failed to record RSVP. Please try again.';
                        rsvpAlert.style.display = 'block';
                    }
                }
            } catch (err) {
                console.error('RSVP submit error:', err);
                if (rsvpAlert) {
                    rsvpAlert.className = 'alert-box error';
                    rsvpAlert.textContent = 'Could not reach server. Please check connection and try again.';
                    rsvpAlert.style.display = 'block';
                }
            } finally {
                rsvpSubmitBtn.disabled = false;
                if (btnText) btnText.style.display = 'inline-block';
                if (btnLoader) btnLoader.style.display = 'none';
            }
        });
    }

    if (closeModalBtn && successModal) {
        closeModalBtn.addEventListener('click', () => {
            successModal.classList.remove('active');
        });
    }

    // -------------------------------------------------------------------------
    // 11. Admin Guest List Drawer & Stats Modal
    // -------------------------------------------------------------------------
    const adminToggle = document.getElementById('adminToggle');
    const adminModal = document.getElementById('adminModal');
    const closeAdminBtn = document.getElementById('closeAdminBtn');
    const refreshAdminBtn = document.getElementById('refreshAdminBtn');
    const adminTableBody = document.getElementById('adminTableBody');

    async function loadAdminRSVPs() {
        if (!adminTableBody) return;
        adminTableBody.innerHTML = '<tr><td colspan="7" class="loading-cell">Loading guest list...</td></tr>';

        try {
            const res = await fetch('/api/rsvps');
            const data = await res.json();

            if (data.success) {
                // Update stats
                document.getElementById('statTotalRSVPs').textContent = data.stats.total;
                document.getElementById('statAttending').textContent = data.stats.attending;
                document.getElementById('statTotalGuests').textContent = data.stats.totalGuests;
                document.getElementById('statDeclined').textContent = data.stats.declined;

                // Render table rows
                if (data.rsvps.length === 0) {
                    adminTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 25px;">No RSVPs submitted yet.</td></tr>';
                    return;
                }

                adminTableBody.innerHTML = data.rsvps.map(r => `
                    <tr>
                        <td><strong>${escapeHtml(r.name)}</strong></td>
                        <td>
                            <span class="status-badge ${r.attendance}">
                                ${r.attendance === 'yes' ? 'Attending ✨' : 'Declined'}
                            </span>
                        </td>
                        <td>${r.guestsCount || 1}</td>
                        <td style="text-transform: capitalize;">${escapeHtml(r.food || '-')}</td>
                        <td><a href="mailto:${escapeHtml(r.email)}">${escapeHtml(r.email || '-')}</a></td>
                        <td>${new Date(r.createdAt).toLocaleDateString()}</td>
                        <td>
                            <button class="del-btn" onclick="deleteRSVP('${r.id}')" title="Delete RSVP">🗑️</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            adminTableBody.innerHTML = '<tr><td colspan="7" style="color: red; padding: 20px;">Failed to load guest list.</td></tr>';
        }
    }

    window.deleteRSVP = async function(id) {
        if (!confirm('Are you sure you want to remove this RSVP entry?')) return;
        try {
            await fetch(`/api/rsvps/${id}`, { method: 'DELETE' });
            loadAdminRSVPs();
        } catch (e) {
            alert('Failed to delete RSVP');
        }
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    if (adminToggle && adminModal) {
        adminToggle.addEventListener('click', () => {
            adminModal.classList.add('active');
            loadAdminRSVPs();
        });
    }

    if (closeAdminBtn && adminModal) {
        closeAdminBtn.addEventListener('click', () => {
            adminModal.classList.remove('active');
        });
    }

    if (refreshAdminBtn) {
        refreshAdminBtn.addEventListener('click', () => {
            loadAdminRSVPs();
        });
    }

    // Close modals on clicking backdrop
    window.addEventListener('click', (e) => {
        if (e.target === successModal) successModal.classList.remove('active');
        if (e.target === adminModal) adminModal.classList.remove('active');
    });
});
