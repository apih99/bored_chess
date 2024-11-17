function MoveHistory({ moves }) {
  return (
    <div className="move-history">
      <h3>Move History</h3>
      <div className="moves-list">
        {moves.map((move, index) => (
          <div key={index} className="move-entry">
            <span className="move-number">{Math.floor(index / 2) + 1}.</span>
            <span className={`move ${index % 2 === 0 ? 'white' : 'black'}`}>
              {move}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MoveHistory 