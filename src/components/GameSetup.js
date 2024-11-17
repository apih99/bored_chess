function GameSetup({ onSelectMode, onSelectTime, onStartGame, selectedMode, selectedTime }) {
  return (
    <div className="game-setup">
      <div className="setup-section">
        <h3>Select Opponent</h3>
        <div className="button-group">
          <button 
            className={selectedMode === 'human' ? 'active' : ''}
            onClick={() => onSelectMode('human')}
          >
            Human
          </button>
          <button 
            className={selectedMode === 'computer' ? 'active' : ''}
            onClick={() => onSelectMode('computer')}
          >
            Computer
          </button>
        </div>
      </div>

      <div className="setup-section">
        <h3>Select Time Control</h3>
        <div className="button-group">
          <button 
            className={selectedTime === 180 ? 'active' : ''}
            onClick={() => onSelectTime(180)}
          >
            3 min
          </button>
          <button 
            className={selectedTime === 300 ? 'active' : ''}
            onClick={() => onSelectTime(300)}
          >
            5 min
          </button>
          <button 
            className={selectedTime === 600 ? 'active' : ''}
            onClick={() => onSelectTime(600)}
          >
            10 min
          </button>
        </div>
      </div>

      <button className="start-button" onClick={onStartGame}>
        Start Game
      </button>
    </div>
  )
}

export default GameSetup 