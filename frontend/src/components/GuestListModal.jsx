import React, { useState, useEffect } from 'react';

export default function GuestListModal({ isOpen, onClose }) {
  const [data, setData] = useState({ stats: null, rsvps: [] });
  const [loading, setLoading] = useState(false);

  const fetchRSVPs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rsvps');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching RSVPs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRSVPs();
    }
  }, [isOpen]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this RSVP entry?')) return;
    try {
      await fetch(`/api/rsvps/${id}`, { method: 'DELETE' });
      fetchRSVPs();
    } catch (e) {
      alert('Failed to delete RSVP');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card admin-modal-card">
        <div className="modal-header-row">
          <h3>📋 Wedding RSVP Guestbook & Stats</h3>
          <button className="close-icon-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="admin-stats-grid">
          <div className="admin-stat-box">
            <span className="stat-number">{data.stats?.total || 0}</span>
            <span className="stat-label">Total Submissions</span>
          </div>
          <div className="admin-stat-box green">
            <span className="stat-number">{data.stats?.attending || 0}</span>
            <span className="stat-label">Attending</span>
          </div>
          <div className="admin-stat-box gold">
            <span className="stat-number">{data.stats?.attending || 0}</span>
            <span className="stat-label">Confirmed Guests</span>
          </div>
          <div className="admin-stat-box red">
            <span className="stat-number">{data.stats?.declined || 0}</span>
            <span className="stat-label">Declined</span>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Status</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Wishes / Notes</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="loading-cell">
                    Loading guest list...
                  </td>
                </tr>
              ) : data.rsvps.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '25px' }}>
                    No RSVPs submitted yet.
                  </td>
                </tr>
              ) : (
                data.rsvps.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.name}</strong>
                    </td>
                    <td>
                      <span className={`status-badge ${r.attendance}`}>
                        {r.attendance === 'yes' ? 'Attending ✨' : 'Declined'}
                      </span>
                    </td>
                    <td>{r.phone || '-'}</td>
                    <td>
                      <a href={`mailto:${r.email}`}>{r.email || '-'}</a>
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.message || '-'}
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="del-btn"
                        onClick={() => handleDelete(r.id)}
                        title="Delete RSVP"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-modal-footer">
          <button className="btn-micro" onClick={fetchRSVPs}>
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
