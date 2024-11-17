export function BestMoves({ moves, currentPlayer }) {
  return (
    <div className="best-moves">
      <h4>Best Moves</h4>
      {moves.map((move, index) => (
        <div key={index} className="move-suggestion">
          <div className="move-header">
            <span className="move-number">{index + 1}.</span>
            <span className="move-notation">{move.notation}</span>
            <span className="move-evaluation">
              {move.evaluation > 0 ? '+' : ''}{move.evaluation.toFixed(1)}
            </span>
          </div>
          <div className="move-explanation">
            {move.explanation}
          </div>
        </div>
      ))}
    </div>
  )
} 