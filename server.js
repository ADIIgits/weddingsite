const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'rsvps.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Mail transporter setup
let transporter = null;
let isEthereal = false;

async function initMailer() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('Using configured SMTP provider:', process.env.SMTP_HOST);
  } else {
    // Generate automatic Ethereal test account for out-of-the-box working email delivery & instant web previews
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isEthereal = true;
      console.log('Generated test Ethereal email account:', testAccount.user);
      console.log('Emails will be sent and viewable via instant test preview links!');
    } catch (err) {
      console.error('Failed to create test email account:', err.message);
    }
  }
}

initMailer();

// Read RSVPs helper
function getRSVPs() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

// Save RSVPs helper
function saveRSVPs(rsvps) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(rsvps, null, 2));
}

// Helper to construct luxury HTML email
function buildHostEmailHtml(rsvp) {
  const isAttending = rsvp.attendance === 'yes';
  const statusColor = isAttending ? '#2d6a4f' : '#b23b3b';
  const statusText = isAttending ? 'Joyfully Attending ✨' : 'Regretfully Declining 💔';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #faf7f2; margin: 0; padding: 20px; color: #333; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #f0e6dc; }
      .header { background: linear-gradient(135deg, #d4788f 0%, #d4a574 100%); color: #ffffff; text-align: center; padding: 36px 20px; }
      .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px; }
      .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; text-transform: uppercase; letter-spacing: 2px; }
      .content { padding: 30px; }
      .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; color: #fff; background: ${statusColor}; margin-bottom: 20px; }
      .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      .data-table td { padding: 12px 14px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
      .data-table td.label { font-weight: 600; color: #777; width: 35%; }
      .data-table td.val { color: #222; font-weight: 500; }
      .blessing-box { background: #fdf6ec; border-left: 4px solid #d4a574; padding: 15px; border-radius: 6px; margin-top: 20px; font-style: italic; color: #6b4d24; }
      .footer { text-align: center; font-size: 12px; color: #999; padding: 20px; background: #fbf9f6; border-top: 1px solid #f0e6dc; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Dr. Sonali & Dr. Sudev</h1>
        <p>New Wedding RSVP Received</p>
      </div>
      <div class="content">
        <div class="badge">${statusText}</div>
        <p style="font-size: 16px; margin-top: 0;">A new response has been submitted on the wedding portal:</p>
        <table class="data-table">
          <tr>
            <td class="label">Guest Name</td>
            <td class="val"><strong>${rsvp.name}</strong></td>
          </tr>
          <tr>
            <td class="label">Email Address</td>
            <td class="val"><a href="mailto:${rsvp.email}">${rsvp.email || 'Not provided'}</a></td>
          </tr>
          <tr>
            <td class="label">Phone</td>
            <td class="val">${rsvp.phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td class="label">Attendance Status</td>
            <td class="val" style="color: ${statusColor}; font-weight: bold;">${statusText}</td>
          </tr>
          <tr>
            <td class="label">Guests Count</td>
            <td class="val">${rsvp.guestsCount || 1} Person(s)</td>
          </tr>
          <tr>
            <td class="label">Food Preference</td>
            <td class="val" style="text-transform: capitalize;">${rsvp.food || 'Vegetarian'}</td>
          </tr>
          <tr>
            <td class="label">Events Attending</td>
            <td class="val">${Array.isArray(rsvp.events) && rsvp.events.length > 0 ? rsvp.events.join(', ') : 'All Celebrations'}</td>
          </tr>
          <tr>
            <td class="label">Submitted At</td>
            <td class="val">${new Date(rsvp.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</td>
          </tr>
        </table>

        ${rsvp.message ? `
          <div class="blessing-box">
            <strong>Personal Message & Blessings:</strong><br/>
            "${rsvp.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"
          </div>
        ` : ''}
      </div>
      <div class="footer">
        ✨ Balle-Balle Meets Ayyioo • Sonali & Sudev • Dec 10-11, 2026 ✨
      </div>
    </div>
  </body>
  </html>
  `;
}

function buildGuestEmailHtml(rsvp) {
  const isAttending = rsvp.attendance === 'yes';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #faf7f2; margin: 0; padding: 20px; color: #333; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #f0e6dc; }
      .header { background: linear-gradient(135deg, #d4788f 0%, #d4a574 100%); color: #ffffff; text-align: center; padding: 40px 20px; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; font-family: Georgia, serif; }
      .header p { margin: 10px 0 0; font-size: 14px; opacity: 0.95; letter-spacing: 2px; text-transform: uppercase; }
      .content { padding: 32px 28px; line-height: 1.7; font-size: 15px; }
      .greeting { font-size: 20px; font-weight: 700; color: #d4788f; margin-bottom: 16px; font-family: Georgia, serif; }
      .highlight-card { background: #fffaf3; border: 1px solid #f2e2cb; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center; }
      .highlight-date { font-size: 22px; font-weight: bold; color: #b7793d; font-family: Georgia, serif; }
      .highlight-sub { font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 5px; }
      .timeline { margin: 20px 0; border-top: 1px solid #eee; padding-top: 15px; }
      .event-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #f0f0f0; font-size: 14px; }
      .event-title { font-weight: 600; color: #444; }
      .event-theme { color: #d4788f; font-weight: 500; }
      .footer { text-align: center; font-size: 13px; color: #999; padding: 24px; background: #fbf9f6; border-top: 1px solid #f0e6dc; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Dr. Sonali & Dr. Sudev</h1>
        <p>Balle-Balle Meets Ayyioo</p>
      </div>
      <div class="content">
        <div class="greeting">Dear ${rsvp.name},</div>
        ${isAttending ? `
          <p>Thank you with all our hearts for confirming your attendance! Your presence means the world to us as we celebrate the sacred union of two souls and the joyful coming together of our families.</p>
          <div class="highlight-card">
            <div class="highlight-date">December 10 - 11, 2026</div>
            <div class="highlight-sub">New Delhi • India</div>
            <p style="margin: 10px 0 0; font-size: 14px; color: #555;">Wedding Muhurtham: Dec 11, 2026 at 6:00 PM</p>
          </div>
          <div class="timeline">
            <h4 style="margin: 0 0 10px; color: #333;">Celebration Schedule & Themes:</h4>
            <div class="event-row"><span class="event-title">🌺 Mehendi (Dec 10, Afternoon)</span> <span class="event-theme">🟢 Lush Green</span></div>
            <div class="event-row"><span class="event-title">🎭 Sagan (Dec 10, Evening)</span> <span class="event-theme">🖤 Elegant Black</span></div>
            <div class="event-row"><span class="event-title">✨ Haldi (Dec 11, Afternoon)</span> <span class="event-theme">💜 Soft Lavender</span></div>
            <div class="event-row"><span class="event-title">💍 Wedding (Dec 11, Evening)</span> <span class="event-theme">🎨 Rainbow of Emotions</span></div>
          </div>
          <p>We have noted your preferences: <strong>${rsvp.food || 'Vegetarian'}</strong> for <strong>${rsvp.guestsCount || 1} guest(s)</strong>.</p>
          <p>Get ready for non-stop dhol beats, delicious South Indian & Punjabi feasts, and memorable moments!</p>
        ` : `
          <p>Thank you for letting us know. While we will truly miss your warm smile and presence in person, your blessings and love will be felt across every moment of our celebration.</p>
        `}
        <p style="margin-top: 25px;">With warmest love and blessings,<br><strong>Sonali & Sudev</strong><br><span style="font-size: 13px; color: #888;">& The Families</span></p>
      </div>
      <div class="footer">
        🌸 Dr. Sonali & Dr. Sudev's Wedding • One Love Story 🌺
      </div>
    </div>
  </body>
  </html>
  `;
}

// POST: Add new RSVP and trigger email
app.post('/api/rsvp', async (req, res) => {
  try {
    const { name, email, phone, attendance, food, guestsCount, events, message } = req.body;

    if (!name || !attendance) {
      return res.status(400).json({ success: false, error: 'Name and Attendance are required fields.' });
    }

    const rsvps = getRSVPs();

    const newRsvp = {
      id: 'rsvp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      attendance: attendance, // 'yes' or 'no'
      food: food || 'vegetarian',
      guestsCount: Number(guestsCount) || 1,
      events: Array.isArray(events) ? events : (events ? [events] : ['Mehendi', 'Sagan', 'Haldi', 'Wedding']),
      message: message ? message.trim() : '',
      createdAt: new Date().toISOString(),
    };

    rsvps.unshift(newRsvp);
    saveRSVPs(rsvps);

    // Prepare email sending
    let emailStatus = { sent: false, previewUrl: null, error: null };

    if (transporter) {
      try {
        const hostMail = process.env.HOST_EMAIL || 'wedding.sonali.sudev@gmail.com';
        const senderMail = process.env.SMTP_FROM || '"Sonali & Sudev Wedding" <wedding@sonali-sudev.com>';

        // 1. Send Host Notification
        const hostInfo = await transporter.sendMail({
          from: senderMail,
          to: hostMail,
          subject: `✨ New Wedding RSVP: ${newRsvp.name} (${newRsvp.attendance === 'yes' ? 'Attending 🎉' : 'Regrets'})`,
          html: buildHostEmailHtml(newRsvp),
        });

        // 2. If guest has valid email, send guest confirmation
        let guestInfo = null;
        if (newRsvp.email && newRsvp.email.includes('@')) {
          guestInfo = await transporter.sendMail({
            from: senderMail,
            to: newRsvp.email,
            subject: `🌸 RSVP Confirmation: Dr. Sonali & Dr. Sudev's Wedding`,
            html: buildGuestEmailHtml(newRsvp),
          });
        }

        const previewUrl = nodemailer.getTestMessageUrl(hostInfo) || (guestInfo ? nodemailer.getTestMessageUrl(guestInfo) : null);

        emailStatus = {
          sent: true,
          previewUrl: previewUrl || null,
          isEthereal: isEthereal,
          messageId: hostInfo.messageId,
        };

        if (previewUrl) {
          console.log('----------------------------------------------------');
          console.log('📧 WEDDING RSVP EMAIL PREVIEW URL:');
          console.log(previewUrl);
          console.log('----------------------------------------------------');
        }
      } catch (mailErr) {
        console.error('Email dispatch error:', mailErr);
        emailStatus = { sent: false, error: mailErr.message };
      }
    } else {
      emailStatus = { sent: false, error: 'Transporter not initialized' };
    }

    return res.status(201).json({
      success: true,
      message: 'RSVP recorded successfully!',
      rsvp: newRsvp,
      emailStatus,
    });
  } catch (error) {
    console.error('RSVP submission error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while saving RSVP.' });
  }
});

// GET: Fetch all RSVPs + summary statistics
app.get('/api/rsvps', (req, res) => {
  try {
    const rsvps = getRSVPs();
    const stats = {
      total: rsvps.length,
      attending: rsvps.filter(r => r.attendance === 'yes').length,
      declined: rsvps.filter(r => r.attendance === 'no').length,
      totalGuests: rsvps.filter(r => r.attendance === 'yes').reduce((sum, r) => sum + (Number(r.guestsCount) || 1), 0),
      foodBreakdown: {
        vegetarian: rsvps.filter(r => r.attendance === 'yes' && r.food === 'vegetarian').length,
        north: rsvps.filter(r => r.attendance === 'yes' && r.food === 'north').length,
        south: rsvps.filter(r => r.attendance === 'yes' && r.food === 'south').length,
      },
    };

    res.json({ success: true, stats, rsvps });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE: Remove an RSVP (for admin cleanup)
app.delete('/api/rsvps/:id', (req, res) => {
  try {
    let rsvps = getRSVPs();
    const initialLen = rsvps.length;
    rsvps = rsvps.filter(r => r.id !== req.params.id);
    if (rsvps.length === initialLen) {
      return res.status(404).json({ success: false, error: 'RSVP not found' });
    }
    saveRSVPs(rsvps);
    res.json({ success: true, message: 'RSVP deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mailerReady: !!transporter,
    isEthereal,
  });
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🌸 Wedding Portal & API Server running at http://localhost:${PORT}`);
});
