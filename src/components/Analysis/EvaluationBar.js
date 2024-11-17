export function EvaluationBar({ evaluation }) {
  const getEvalHeight = (evalScore) => {
    const percentage = (50 + (Math.min(Math.max(evalScore, -5), 5) * 10))
    return `${percentage}%`
  }

  const formatEvaluation = (evalScore) => {
    if (evalScore === 0) return '0.0'
    return evalScore > 0 ? `+${evalScore.toFixed(1)}` : evalScore.toFixed(1)
  }

  return (
    <div className="evaluation-bar-container">
      <div className="evaluation-bar">
        <div 
          className="white-eval"
          style={{ height: getEvalHeight(evaluation) }}
        >
          {Math.abs(evaluation) >= 0.3 && (
            <span className="eval-number">
              {formatEvaluation(evaluation)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
} 