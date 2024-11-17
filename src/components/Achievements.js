export const achievements = {
  firstWin: {
    id: 'firstWin',
    title: 'First Victory',
    description: 'Win your first chess game',
    icon: '🏆',
    rarity: 'common',
    condition: (stats) => (stats?.wins || 0) >= 1
  },
  tenWins: {
    id: 'tenWins',
    title: 'Rising Star',
    description: 'Win 10 games',
    icon: '⭐',
    rarity: 'uncommon',
    condition: (stats) => (stats?.wins || 0) >= 10
  },
  grandMaster: {
    id: 'grandMaster',
    title: 'Grand Master',
    description: 'Win 50 games',
    icon: '👑',
    rarity: 'legendary',
    condition: (stats) => (stats?.wins || 0) >= 50
  },
  persistent: {
    id: 'persistent',
    title: 'Persistent Player',
    description: 'Play 100 games',
    icon: '🎮',
    rarity: 'rare',
    condition: (stats) => (stats?.gamesPlayed || 0) >= 100
  },
  drawMaster: {
    id: 'drawMaster',
    title: 'Draw Master',
    description: 'Achieve 10 draws',
    icon: '🤝',
    rarity: 'uncommon',
    condition: (stats) => (stats?.draws || 0) >= 10
  },
  winStreak: {
    id: 'winStreak',
    title: 'Win Streak',
    description: 'Win 5 games in a row',
    icon: '🔥',
    rarity: 'rare',
    condition: (stats) => (stats?.currentStreak || 0) >= 5
  },
  nightOwl: {
    id: 'nightOwl',
    title: 'Night Owl',
    description: 'Win a game after midnight',
    icon: '🦉',
    rarity: 'rare',
    condition: (_, metrics) => (metrics?.nightGames || 0) > 0
  },
  quickWin: {
    id: 'quickWin',
    title: 'Lightning Fast',
    description: 'Win a game in under 2 minutes',
    icon: '⚡',
    rarity: 'epic',
    condition: (_, metrics) => (metrics?.fastestWin || Infinity) < 120
  }
}

export function AchievementsModal({ profile, onClose }) {
  const stats = profile?.stats || {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0
  }
  
  const metrics = profile?.metrics || {
    nightGames: 0,
    fastestWin: Infinity,
    currentStreak: 0
  }

  const earnedAchievements = Object.values(achievements).filter(a => 
    a.condition(stats, metrics))

  return (
    <div className="achievements-modal">
      <div className="achievements-content">
        <h2>Achievements</h2>
        <div className="achievements-progress">
          <span>{earnedAchievements.length} / {Object.keys(achievements).length}</span>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ 
                width: `${(earnedAchievements.length / Object.keys(achievements).length) * 100}%` 
              }}
            />
          </div>
        </div>
        <div className="achievements-grid">
          {Object.values(achievements).map(achievement => {
            const isEarned = earnedAchievements.includes(achievement)
            return (
              <div 
                key={achievement.id} 
                className={`achievement-card ${isEarned ? 'earned' : 'locked'} ${achievement.rarity}`}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-info">
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                  <span className="rarity-badge">{achievement.rarity}</span>
                </div>
              </div>
            )
          })}
        </div>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export function AchievementPopup({ achievement }) {
  return (
    <div className="achievement-popup">
      <div className="achievement-popup-content">
        <div className="achievement-icon">{achievement.icon}</div>
        <div className="achievement-info">
          <h3>Achievement Unlocked!</h3>
          <h4>{achievement.title}</h4>
          <p>{achievement.description}</p>
        </div>
      </div>
    </div>
  )
} 