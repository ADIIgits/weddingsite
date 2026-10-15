# 💍 Dr. Sonali & Dr. Sudev — Wedding Website

**"Balle-Balle Meets Ayyioo" • React Frontend & Express Backend Architecture**

---

## 📂 Project Structure

```
sonali-sudev-wedding/
├── backend/                  # Express REST API & Nodemailer Server
│   ├── package.json
│   ├── server.js             # Runs on http://localhost:5001
│   ├── data/
│   │   └── rsvps.json        # Persistent JSON storage for guest RSVPs
│   └── .env                  # Port & SMTP configuration
│
└── frontend/                 # React 18 + Vite Web Application
    ├── package.json
    ├── vite.config.js        # Configured with proxy to http://localhost:5001
    ├── index.html
    └── src/
        ├── App.jsx           # Main React App with state coordination
        ├── App.css           # Vanilla CSS, Light & Dark theme variables
        ├── components/
        │   ├── ScratchCard.jsx       # Interactive HTML5 Canvas Scratchcard
        │   ├── ScratchStation.jsx    # Date & Theme dedicated scratchcards
        │   ├── SimplifiedClock.jsx   # Sleek modern countdown clock
        │   ├── Navbar.jsx            # Theme toggle, sound & music controls
        │   ├── Hero.jsx              # Couple hero with cultural animations
        │   ├── EventsSection.jsx     # Four days of celebrations
        │   ├── RsvpSection.jsx       # Interactive RSVP form
        │   ├── GuestListModal.jsx    # Admin guestbook & statistics
        │   ├── SuccessModal.jsx      # Confirmation with email preview URL
        │   └── FloatingPetals.jsx    # Falling marigold & rose petals
        └── utils/
            └── audio.js              # Web Audio API synthesizer
```

---

## 🚀 How to Run

### Backend
```bash
cd backend
npm install
node server.js
```
The backend API runs on **http://localhost:5001**.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
The React frontend runs on **http://localhost:5173**.

---

## ✨ Features

1. **Two Interactive Canvas Scratchcards**:
   - **Card 1 (The Wedding Date)**: Scratch to reveal Friday, December 11, 2026 • 6:00 PM IST • The Grand Palace, New Delhi.
   - **Card 2 (The Wedding Theme)**: Scratch to reveal "Rainbow of Emotions" and color palettes for Mehendi (Lush Green), Sagan (Elegant Black), Haldi (Soft Lavender), and Shaadi (Rainbow Gold).
   - "🪄 Magic Reveal Both" and "🔄 Scratch Again" buttons included.
2. **Simplified Countdown Clock**: Minimal, modern capsule clock with live seconds pulse and "📅 Add to Calendar" button (Google Calendar + universal `.ics` download).
3. **Light & Dark Theme Toggle**: Sun/Moon toggle with persistent preference and luxury color transitions.
4. **Backend RSVP & Email Notifications**: Sends emails to wedding hosts and guests upon submission via Nodemailer with viewable test previews.
5. **Microinteractions**: Floating cultural instruments (Dhol 🥁 and Nadaswaram 🎺), 3D card tilt, floating petals, and confetti cannons.
