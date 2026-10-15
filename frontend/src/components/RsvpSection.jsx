import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { playChimeSound } from '../utils/audio';

export default function RsvpSection({ onRsvpSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    attendance: 'yes',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your full name.';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        attendance: formData.attendance,
        events: formData.attendance === 'yes' ? ['Mehendi', 'Sagan', 'Haldi', 'Wedding'] : [],
        message: formData.message.trim(),
      };

      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d46b85', '#c69255', '#2d6a4f', '#dab8d8', '#ffd700'],
        });
        playChimeSound();

        if (onRsvpSuccess) {
          onRsvpSuccess(data.rsvp, data.emailStatus);
        }

        setFormData({
          name: '',
          email: '',
          phone: '',
          attendance: 'yes',
          message: '',
        });
      } else {
        setErrorMsg(data.error || 'Failed to submit RSVP. Please try again.');
      }
    } catch (err) {
      console.error('RSVP submission error:', err);
      setErrorMsg('Could not reach wedding backend server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rsvp-section" id="rsvp">
      <div className="section-container">
        <div className="rsvp-card">
          <div className="rsvp-ornament">🕊️</div>
          <h2 className="rsvp-title">Join Us In Celebration</h2>
          <p className="rsvp-subtitle">
            We would be honored by your presence as we celebrate this beautiful union of love, culture, and togetherness.
          </p>

          {errorMsg && <div className="alert-box error">{errorMsg}</div>}

          <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rsvpName">
                  Your Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="rsvpName"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dr. / Mr. / Ms. Your Name"
                  required
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="rsvpEmail">
                  Your Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="rsvpEmail"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rsvpAttendance">
                  Will You Join Us? <span className="required">*</span>
                </label>
                <select
                  id="rsvpAttendance"
                  name="attendance"
                  value={formData.attendance}
                  onChange={handleChange}
                >
                  <option value="yes">✨ Yes, I'll joyfully be there for all celebrations!</option>
                  <option value="no">💙 Unable to attend (Sending warm blessings)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="rsvpPhone">Phone Number (Optional)</label>
                <input
                  type="tel"
                  id="rsvpPhone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="rsvpMessage">Warm Wishes or Special Notes</label>
              <textarea
                id="rsvpMessage"
                name="message"
                rows="3"
                value={formData.message}
                onChange={handleChange}
                placeholder="Share your heartfelt blessing or note for Dr. Sonali & Dr. Sudev..."
              ></textarea>
            </div>

            <button type="submit" className="btn-rsvp-submit" disabled={loading}>
              {loading ? (
                <span>Sending confirmation & email... ⏳</span>
              ) : (
                <span>Confirm Attendance ✨</span>
              )}
            </button>

            <p className="email-notice">
              📧 <em>A confirmation email will be sent to lakshsaluja2@gmail.com and your inbox.</em>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
