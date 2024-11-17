import { useState } from 'react'

export function Profile({ profile, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    email: profile?.email || '',
    preferredColor: profile?.preferredColor || 'white',
    experience: profile?.experience || 'beginner',
    avatar: profile?.avatar || '👤'
  })

  const avatarOptions = ['👤', '👨', '👩', '🧑', '👶', '👴', '👵', '🧔']

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpdate({
      ...formData,
      stats: profile?.stats || {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0
      }
    })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <h2>Player Profile</h2>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="avatar-selection">
            <label>Select Avatar</label>
            <div className="avatar-options">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  className={`avatar-option ${formData.avatar === avatar ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, avatar })}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Preferred Color</label>
            <select
              name="preferredColor"
              value={formData.preferredColor}
              onChange={handleChange}
            >
              <option value="white">White</option>
              <option value="black">Black</option>
              <option value="random">Random</option>
            </select>
          </div>

          <div className="form-group">
            <label>Experience Level</label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {profile && (
            <div className="stats-section">
              <h3>Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Games Played</span>
                  <span className="stat-value">{profile.stats.gamesPlayed}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Wins</span>
                  <span className="stat-value">{profile.stats.wins}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Losses</span>
                  <span className="stat-value">{profile.stats.losses}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Draws</span>
                  <span className="stat-value">{profile.stats.draws}</span>
                </div>
              </div>
            </div>
          )}

          <div className="profile-actions">
            <button type="submit" className="save-button">
              Save Profile
            </button>
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 