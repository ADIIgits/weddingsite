const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const DATA_FILE = path.join(__dirname, 'data', 'rsvps.json');
const HOST_EMAIL = process.env.HOST_EMAIL || 'lakshsaluja2@gmail.com';

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Mail transporter setup
let transporter = null;
let isRealSMTP = false;
let isEthereal = false;

async function initMailer() {
  const smtpUser = (process.env.SMTP_USER || 'lakshsaluja2@gmail.com').trim();
  const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim().replace(/\s+/g, '') : '';

  if (smtpPass) {
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Verify connection configuration
      await transporter.verify();
      isRealSMTP = true;
      console.log(`✅ Real Gmail SMTP connected & verified successfully for: ${smtpUser}`);
      console.log(`📬 Host alerts will be sent to: ${HOST_EMAIL}`);
      console.log(`💌 Guest confirmations will be sent to attendee email addresses`);
    } catch (err) {
      console.error(`❌ Gmail SMTP verify error: ${err.message}`);
      // Fallback if needed
      fallbackToEthereal();
    }
  } else {
    fallbackToEthereal();
  }
}

async function fallbackToEthereal() {
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
    console.log('⚠️ Running in test mailer mode until valid Gmail App Password is provided.');
  } catch (err) {
    console.error('Fallback mailer error:', err.message);
  }
}

initMailer();

function getRSVPs() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function saveRSVPs(rsvps) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(rsvps, null, 2));
}

// 1. Email Template for Organizer (lakshsaluja2@gmail.com)
function buildHostEmailHtml(rsvp) {
  const isAttending = rsvp.attendance === 'yes';
  const statusColor = isAttending ? '#2d6a4f' : '#b23b3b';
  const statusText = isAttending ? 'Joyfully Attending All Celebrations ✨' : 'Regretfully Declining 💔';

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
      .events-pill { background: #fdf2f4; color: #d46b85; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; margin-right: 4px; }
      .blessing-box { background: #fdf6ec; border-left: 4px solid #d4a574; padding: 15px; border-radius: 6px; margin-top: 20px; font-style: italic; color: #6b4d24; }
      .footer { text-align: center; font-size: 12px; color: #999; padding: 20px; background: #fbf9f6; border-top: 1px solid #f0e6dc; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Dr. Sonali & Dr. Sudev</h1>
        <p>New Wedding RSVP Alert</p>
      </div>
      <div class="content">
        <div class="badge">${statusText}</div>
        <p style="font-size: 16px; margin-top: 0;">A new wedding attendance response has been submitted:</p>
        <table class="data-table">
          <tr><td class="label">Guest Name</td><td class="val"><strong>${rsvp.name}</strong></td></tr>
          <tr><td class="label">Email Address</td><td class="val"><a href="mailto:${rsvp.email}">${rsvp.email || 'Not provided'}</a></td></tr>
          <tr><td class="label">Phone Number</td><td class="val">${rsvp.phone || 'Not provided'}</td></tr>
          <tr><td class="label">Response</td><td class="val" style="color: ${statusColor}; font-weight: bold;">${statusText}</td></tr>
          <tr>
            <td class="label">Events</td>
            <td class="val">
              ${isAttending ? `
                <span class="events-pill">🌺 Mehendi</span>
                <span class="events-pill">🎭 Sagan</span>
                <span class="events-pill">✨ Haldi</span>
                <span class="events-pill">💍 Wedding</span>
              ` : 'None'}
            </td>
          </tr>
          <tr><td class="label">Submitted Date</td><td class="val">${new Date(rsvp.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</td></tr>
        </table>
        ${rsvp.message ? `
          <div class="blessing-box">
            <strong>Personal Message / Wishes:</strong><br/>
            "${rsvp.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"
          </div>
        ` : ''}
      </div>
      <div class="footer">✨ Dr. Sonali & Dr. Sudev • Balle-Balle Meets Ayyioo • Dec 10-11, 2026 ✨</div>
    </div>
  </body>
  </html>
  `;
}

// 2. Email Template for Guest/User Confirmation
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
      .events-grid { margin: 20px 0; padding: 15px; background: #fdfaf7; border-radius: 10px; border: 1px solid #f2e6d8; }
      .event-item { padding: 6px 0; border-bottom: 1px dashed #eeddcc; font-size: 14px; display: flex; justify-content: space-between; }
      .event-item:last-child { border-bottom: none; }
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
          <p>Thank you with all our hearts for confirming your attendance! We are overjoyed to celebrate our special union with you across all four sacred celebrations.</p>
          <div class="highlight-card">
            <div class="highlight-date">December 10 - 11, 2026</div>
            <div class="highlight-sub">The Grand Palace • Bina, Madhya Pradesh, India</div>
            <p style="margin: 10px 0 0; font-size: 14px; color: #555;">Wedding Muhurtham: Dec 11, 2026 at 6:00 PM IST</p>
          </div>
          <div class="events-grid">
            <div class="event-item"><strong>🌺 Mehendi</strong> <span>Dec 10 • Afternoon (🟢 Lush Green)</span></div>
            <div class="event-item"><strong>🎭 Sagan</strong> <span>Dec 10 • Evening (🖤 Elegant Black)</span></div>
            <div class="event-item"><strong>✨ Haldi</strong> <span>Dec 11 • Afternoon (💜 Soft Lavender)</span></div>
            <div class="event-item"><strong>💍 Wedding</strong> <span>Dec 11 • Evening (🎨 Rainbow of Emotions)</span></div>
          </div>
          <p>Get ready for high-energy Bhangra dhol beats, authentic South Indian feasts, and unforgettable memories!</p>
        ` : `
          <p>Thank you for letting us know. While we will dearly miss your presence in person, your warm blessings and love will be deeply felt across every moment of our celebration.</p>
        `}
        <p style="margin-top: 25px;">With warmest love and blessings,<br><strong>Sonali & Sudev</strong><br><span style="font-size: 13px; color: #888;">& The Families</span></p>
      </div>
      <div class="footer">🌸 Dr. Sonali & Dr. Sudev's Wedding • One Love Story 🌺</div>
    </div>
  </body>
  </html>
  `;
}

// POST: Add new RSVP and trigger both emails
app.post('/api/rsvp', async (req, res) => {
  try {
    const { name, email, phone, attendance, message } = req.body;

    if (!name || !attendance) {
      return res.status(400).json({ success: false, error: 'Name and Attendance are required.' });
    }

    const rsvps = getRSVPs();

    const newRsvp = {
      id: 'rsvp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      attendance: attendance, // 'yes' or 'no'
      events: attendance === 'yes' ? ['Mehendi', 'Sagan', 'Haldi', 'Wedding'] : [],
      message: message ? message.trim() : '',
      createdAt: new Date().toISOString(),
    };

    rsvps.unshift(newRsvp);
    saveRSVPs(rsvps);

    // Prepare email sending
    let hostEmailStatus = { sent: false, error: null };
    let guestEmailStatus = { sent: false, error: null };

    if (transporter) {
      const senderMail = `"Dr. Sonali & Dr. Sudev Wedding" <${process.env.SMTP_USER || HOST_EMAIL}>`;

      // 1. Send Notification Email to Organizer (lakshsaluja2@gmail.com)
      try {
        const hostInfo = await transporter.sendMail({
          from: senderMail,
          to: HOST_EMAIL,
          subject: `✨ New Wedding RSVP: ${newRsvp.name} (${newRsvp.attendance === 'yes' ? 'Attending All Celebrations 🎉' : 'Regretfully Declining 💔'})`,
          html: buildHostEmailHtml(newRsvp),
        });
        hostEmailStatus.sent = true;
        console.log(`✉️ [1/2] Organizer alert email successfully delivered to ${HOST_EMAIL}! MsgID: ${hostInfo.messageId}`);
      } catch (hostErr) {
        console.error(`❌ Error sending organizer email to ${HOST_EMAIL}:`, hostErr.message);
        hostEmailStatus.error = hostErr.message;
      }

      // 2. Send Confirmation Email to the Guest (newRsvp.email)
      if (newRsvp.email && newRsvp.email.includes('@')) {
        try {
          const guestInfo = await transporter.sendMail({
            from: senderMail,
            to: newRsvp.email,
            subject: `🌸 RSVP Confirmation: Dr. Sonali & Dr. Sudev's Wedding`,
            html: buildGuestEmailHtml(newRsvp),
          });
          guestEmailStatus.sent = true;
          console.log(`✉️ [2/2] Guest confirmation email successfully delivered to ${newRsvp.email}! MsgID: ${guestInfo.messageId}`);
        } catch (guestErr) {
          console.error(`❌ Error sending guest email to ${newRsvp.email}:`, guestErr.message);
          guestEmailStatus.error = guestErr.message;
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: `RSVP recorded! Emails dispatched to ${HOST_EMAIL} and ${newRsvp.email}`,
      rsvp: newRsvp,
      emailStatus: {
        realSent: isRealSMTP,
        hostEmailSent: hostEmailStatus.sent,
        guestEmailSent: guestEmailStatus.sent,
        organizer: HOST_EMAIL,
        guest: newRsvp.email,
      },
    });
  } catch (error) {
    console.error('RSVP server error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while saving RSVP.' });
  }
});

// GET: Fetch all RSVPs
app.get('/api/rsvps', (req, res) => {
  try {
    const rsvps = getRSVPs();
    const stats = {
      total: rsvps.length,
      attending: rsvps.filter(r => r.attendance === 'yes').length,
      declined: rsvps.filter(r => r.attendance === 'no').length,
    };

    res.json({ success: true, stats, rsvps });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE: Remove an RSVP
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
    isRealSMTP,
    hostEmail: HOST_EMAIL,
  });
});

app.listen(PORT, () => {
  console.log(`🌸 Wedding Backend API running on http://localhost:${PORT}`);
  console.log(`📬 RSVP alerts destination: ${HOST_EMAIL}`);
});
