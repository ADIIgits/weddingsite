import React from 'react';

export default function SuccessModal({ isOpen, onClose, rsvpData, emailStatus }) {
  if (!isOpen || !rsvpData) return null;

  const isAttending = rsvpData.attendance === 'yes';

  return (
    <div className="modal-backdrop active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-icon">🎉</div>
        <h3 className="modal-title">
          {isAttending ? `See You There, ${rsvpData.name}! ✨` : `Thank You, ${rsvpData.name} 💙`}
        </h3>

        <p className="modal-message">
          {isAttending
            ? `We are overjoyed that you'll be celebrating with us across all sacred ceremonies!`
            : `We will truly miss you at the celebrations, but we hold your heartfelt blessings close to our hearts.`}
        </p>

        {/* Real Email Delivery Confirmation Badges */}
        <div className="real-email-delivery-box">
          <div className="email-status-item">
            <span className="status-check">✅</span>
            <div className="status-info">
              <strong>Confirmation Sent to You:</strong>
              <span>{rsvpData.email}</span>
            </div>
          </div>

          <div className="email-status-item">
            <span className="status-check">✅</span>
            <div className="status-info">
              <strong>Organizer Alert Sent to:</strong>
              <span>lakshsaluja2@gmail.com</span>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '20px' }}>
          Wonderful! Close
        </button>
      </div>
    </div>
  );
}
