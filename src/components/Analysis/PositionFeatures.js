export function PositionFeatures({ features }) {
  const getFeatureIcon = (feature) => {
    const icons = {
      kingSafety: '👑',
      pawnStructure: '♟',
      pieceActivity: '⚔️',
      centerControl: '🎯'
    }
    return icons[feature] || '•'
  }

  return (
    <div className="position-features">
      <h4>Position Analysis</h4>
      {Object.entries(features).map(([feature, values]) => (
        <div key={feature} className="feature-row">
          <div className="feature-header">
            <span className="feature-icon">{getFeatureIcon(feature)}</span>
            <span className="feature-name">
              {feature.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </div>
          <div className="feature-values">
            <div className="white-feature">
              <span className="color-indicator">White:</span>
              <span className="value">{values.white}</span>
            </div>
            <div className="black-feature">
              <span className="color-indicator">Black:</span>
              <span className="value">{values.black}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 