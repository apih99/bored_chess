import { useState, useCallback, useEffect } from 'react'
import Timer from './components/Timer'
import { getLegalMoves, isInCheck, isInCheckmate } from './checkDetection'
import { getBestMove } from './ai/chessAI'
import './App.css'
import { achievements, AchievementsModal, AchievementPopup } from './components/Achievements'

// Add theme options
const BOARD_THEMES = {
  'Classic': {
    light: '#F0D9B5',
    dark: '#B58863'
  },
  'Midnight Blue': {
    light: '#DEE3E6',
    dark: '#315991'
  },
  'Emerald': {
    light: '#FFFFDD',
    dark: '#86A666'
  },
  'Coral': {
    light: '#FCD7BD',
    dark: '#D08B75'
  },
  'Tournament': {
    light: '#E8EBF0',
    dark: '#7FA650'
  }
}

function App() {
  const [board, setBoard] = useState(initializeBoard())
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [currentPlayer, setCurrentPlayer] = useState('white')
  const [validMoves, setValidMoves] = useState([])
  const [isCheck, setIsCheck] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [promotionSquare, setPromotionSquare] = useState(null)
  const [moveHistory, setMoveHistory] = useState([])
  const [boardHistory, setBoardHistory] = useState([initializeBoard()])
  const [currentMove, setCurrentMove] = useState(0)
  const [timeControl, setTimeControl] = useState(600)
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [timerKey, setTimerKey] = useState(0)
  const [gameMode, setGameMode] = useState('human')
  const [difficulty, setDifficulty] = useState('beginner')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [animatingFrom, setAnimatingFrom] = useState(null)
  const [animatingTo, setAnimatingTo] = useState(null)
  const [animatingPiece, setAnimatingPiece] = useState(null)
  const [currentTheme, setCurrentTheme] = useState('Classic')
  const [showMenu, setShowMenu] = useState(true)
  const [showSetup, setShowSetup] = useState(true)
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('chessProfile')
    return savedProfile ? JSON.parse(savedProfile) : null
  })
  const [showAchievements, setShowAchievements] = useState(false)
  const [newAchievement, setNewAchievement] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  const makeAIMove = useCallback(async () => {
    setIsAIThinking(true)
    
    try {
      const aiMove = getBestMove(board, difficulty, 'black')
      
      const minThinkingTime = {
        beginner: 2000,
        intermediate: 2500,
        advanced: 3000,
        expert: 3500
      }[difficulty]

      await new Promise(resolve => setTimeout(resolve, minThinkingTime))
      
      if (aiMove) {
        const piece = board[aiMove.from.row][aiMove.from.col]
        
        await handleMove(
          aiMove.from.row,
          aiMove.from.col,
          aiMove.to.row,
          aiMove.to.col,
          piece
        )

        const isWhiteInCheck = isInCheck(board, 'white')
        setIsCheck(isWhiteInCheck)
        
        if (isWhiteInCheck && isInCheckmate(board, 'white')) {
          setIsGameOver(true)
        }

        setCurrentPlayer('white')
      }
    } catch (error) {
      console.error('AI move error:', error)
    } finally {
      setIsAIThinking(false)
    }
  }, [board, difficulty])

  useEffect(() => {
    if (isGameStarted && 
        gameMode === 'computer' && 
        currentPlayer === 'black' && 
        !isGameOver && 
        !promotionSquare) {
      makeAIMove()
    }
  }, [currentPlayer, isGameStarted, gameMode, isGameOver, promotionSquare, makeAIMove])

  const handleTimeUp = useCallback(() => {
    setIsGameOver(true)
    // The player whose time ran out loses
    setCurrentPlayer(prev => prev === 'white' ? 'black' : 'white')
  }, [])

  function handleStartGame() {
    if (!timeControl) {
      alert('Please select a time control')
      return
    }

    setIsGameStarted(true)
    setShowSetup(false)
    // Reset the timer key to ensure timer starts fresh
    setTimerKey(prev => prev + 1)
    // Initialize the game state
    setBoard(initializeBoard())
    setCurrentPlayer('white')
    setMoveHistory([])
    setBoardHistory([initializeBoard()])
    setCurrentMove(0)
  }

  function handleTimeControlChange(minutes) {
    setTimeControl(minutes * 60)
    setTimerKey(prev => prev + 1)
  }

  function getSquareNotation(row, col) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1']
    return files[col] + ranks[row]
  }

  function getPieceNotation(piece) {
    const notations = {
      '♔': 'K', '♚': 'K',
      '♕': 'Q', '♛': 'Q',
      '♖': 'R', '♜': 'R',
      '♗': 'B', '♝': 'B',
      '♘': 'N', '♞': 'N',
      // Pawns don't have a letter notation
    }
    return notations[piece.symbol] || ''
  }

  function handlePromotion(pieceSymbol) {
    if (!promotionSquare) return

    const newBoard = [...board.map(row => [...row])]
    const { row, col, color } = promotionSquare
    const newPiece = { color, symbol: pieceSymbol }
    newBoard[row][col] = newPiece
    
    setBoard(newBoard)
    
    const promotionNotation = `=${getPieceNotation(newPiece)}`
    setMoveHistory(prevHistory => {
      const newHistory = [...prevHistory]
      newHistory[newHistory.length - 1] += promotionNotation
      return newHistory
    })

    setPromotionSquare(null)
    
    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white'
    const isNextPlayerInCheck = isInCheck(newBoard, nextPlayer)
    setIsCheck(isNextPlayerInCheck)
    
    if (isNextPlayerInCheck && isInCheckmate(newBoard, nextPlayer)) {
      setIsGameOver(true)
    }
  }

  const handleMove = async (fromRow, fromCol, toRow, toCol, piece) => {
    // Start animation
    setAnimatingFrom({ row: fromRow, col: fromCol })
    setAnimatingTo({ row: toRow, col: toCol })
    setAnimatingPiece(piece)

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 300))

    // Update board
    const newBoard = [...board.map(row => [...row])]
    newBoard[toRow][toCol] = board[fromRow][fromCol]
    newBoard[fromRow][fromCol] = null
    setBoard(newBoard)

    // Clear animation states
    setAnimatingFrom(null)
    setAnimatingTo(null)
    setAnimatingPiece(null)
  }

  async function handleSquareClick(row, col) {
    if (isGameOver || promotionSquare || isAIThinking || 
       (gameMode === 'computer' && currentPlayer === 'black')) return

    if (selectedPiece) {
      const isValidMove = validMoves.some(([r, c]) => r === row && c === col)
      
      if (isValidMove) {
        const fromSquare = `${selectedPiece.row}-${selectedPiece.col}`
        const toSquare = `${row}-${col}`
        const piece = board[selectedPiece.row][selectedPiece.col]
        
        // Animate the piece movement
        handlePieceMove(fromSquare, toSquare)
        
        // If there's a capture, add capture animation
        const targetPiece = board[row][col]
        if (targetPiece) {
          const targetElement = document.querySelector(`[data-square="${toSquare}"] .piece`)
          if (targetElement) {
            targetElement.classList.add('captured')
          }
        }
        
        await handleMove(selectedPiece.row, selectedPiece.col, row, col, piece)
        
        // Add last move highlight
        document.querySelector(`[data-square="${fromSquare}"]`)?.classList.add('last-move')
        document.querySelector(`[data-square="${toSquare}"]`)?.classList.add('last-move')
        
        // Update game state
        setSelectedPiece(null)
        setValidMoves([])
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white')
      } else {
        setSelectedPiece(null)
        setValidMoves([])
      }
    } else {
      const piece = board[row][col]
      if (piece && piece.color === currentPlayer) {
        setSelectedPiece({ row, col })
        setValidMoves(getLegalMoves(board, row, col))
      }
    }
  }

  function handleRestart() {
    // Reset game states but keep the game running
    setBoard(initializeBoard())
    setBoardHistory([initializeBoard()])
    setCurrentMove(0)
    setMoveHistory([])
    setSelectedPiece(null)
    setValidMoves([])
    setCurrentPlayer('white')
    setIsCheck(false)
    setIsGameOver(false)
    setPromotionSquare(null)
    
    // Reset timer
    setTimerKey(prev => prev + 1)
    
    // Keep the game started and setup hidden
    setIsGameStarted(true)
    setShowSetup(false)
  }

  function handleUndo() {
    if (currentMove === 0) return // Can't undo past initial position
    
    // Remove last move from history
    const newMoveHistory = [...moveHistory]
    newMoveHistory.pop()
    setMoveHistory(newMoveHistory)
    
    // Go back one move in board history
    const newCurrentMove = currentMove - 1
    setCurrentMove(newCurrentMove)
    setBoard(boardHistory[newCurrentMove])
    
    // Update current player
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white')
    
    // Reset game state
    setSelectedPiece(null)
    setValidMoves([])
    setIsGameOver(false)
    setPromotionSquare(null)
    
    // Check if the position is a check
    const isPlayerInCheck = isInCheck(boardHistory[newCurrentMove], currentPlayer === 'white' ? 'black' : 'white')
    setIsCheck(isPlayerInCheck)
  }

  const isSelected = (row, col) => {
    return selectedPiece && 
           selectedPiece.row === row && 
           selectedPiece.col === col
  }

  const isValidMove = (row, col) => {
    return validMoves.some(([r, c]) => r === row && c === col)
  }

  // Add theme selector component
  function ThemeSelector() {
    return (
      <div className="theme-selector">
        <h3>Board Theme</h3>
        <div className="theme-options">
          {Object.entries(BOARD_THEMES).map(([themeId, theme]) => (
            <button
              key={themeId}
              className={`theme-button ${currentTheme === themeId ? 'active' : ''}`}
              onClick={() => setCurrentTheme(themeId)}
            >
              <div className="theme-preview">
                <div className="preview-square" style={{ background: theme.light }}></div>
                <div className="preview-square" style={{ background: theme.dark }}></div>
              </div>
              <span>{theme.name}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  function renderPiece(piece) {
    if (!piece) return null
    return (
      <div className={`piece ${piece.color}`}>
        {piece.symbol}
      </div>
    )
  }

  // Add to your piece movement handler
  const handlePieceMove = (from, to) => {
    const piece = document.querySelector(`[data-square="${from}"] .piece`)
    if (piece) {
      const movingPiece = piece.cloneNode(true)
      movingPiece.classList.add('moving-piece')
      document.body.appendChild(movingPiece)
      
      // Calculate positions
      const fromRect = piece.getBoundingClientRect()
      const toSquare = document.querySelector(`[data-square="${to}"]`)
      const toRect = toSquare.getBoundingClientRect()
      
      // Set initial position
      movingPiece.style.top = `${fromRect.top}px`
      movingPiece.style.left = `${fromRect.left}px`
      
      // Trigger animation
      requestAnimationFrame(() => {
        movingPiece.style.top = `${toRect.top}px`
        movingPiece.style.left = `${toRect.left}px`
      })
      
      // Clean up after animation
      setTimeout(() => {
        document.body.removeChild(movingPiece)
      }, 300)
    }
  }

  // Add ChessLogo component
  function ChessLogo() {
    return (
      <div className="chess-logo">
        <div className="crown">
          <div className="crown-point left"></div>
          <div className="crown-point center"></div>
          <div className="crown-point right"></div>
          <div className="crown-base"></div>
        </div>
        <div className="logo-text">
          <span className="primary">Per</span>
          <span className="secondary">Catur</span>
          <span className="primary">An</span>
        </div>
      </div>
    )
  }

  // Update Menu component
  function Menu() {
    return (
      <div className="menu-container">
        <div className="menu-content">
          <ChessLogo />
          
          <div className="menu-buttons">
            <button 
              className="menu-button"
              onClick={() => {
                setShowMenu(false)
                setShowSetup(true)
              }}
            >
              <span className="icon">♟</span>
              New Game
            </button>
            
            <button 
              className="menu-button"
              onClick={() => setShowHowToPlay(true)}
            >
              <span className="icon">📖</span>
              How to Play
            </button>
            
            
            <button 
              className="menu-button"
              onClick={() => setShowAchievements(true)}
            >
              <span className="icon">🏆</span>
              Achievements
            </button>
            <button 
              className="menu-button"
              onClick={() => setShowProfile(true)}
            >
              <span className="icon">👤</span>
              Profile
            </button>

            <button 
              className="menu-button"
              onClick={() => setShowSettings(true)}
            >
              <span className="icon">⚙️</span>
              Settings
            </button>

            <button 
              className="menu-button"
              onClick={() => setShowAbout(true)}
            >
              <span className="icon">ℹ️</span>
              About
            </button>

          </div>


          <div className="menu-footer">
            <p className="version">Version 1.0.0</p>
            <p className="creator">Created by Apih99</p>
          </div>
        </div>

        {/* Add How to Play modal */}
        {showHowToPlay && (
          <HowToPlay onClose={() => setShowHowToPlay(false)} />
        )}

        {showSettings && (
          <Settings 
            onClose={() => setShowSettings(false)}
            currentTheme={currentTheme}
            setCurrentTheme={setCurrentTheme}
          />
        )}

        {showAbout && (
          <About onClose={() => setShowAbout(false)} />
        )}
        
        {showAchievements && (
          <AchievementsModal 
            profile={userProfile}
            onClose={() => setShowAchievements(false)}
          />
        )}
        
        {newAchievement && (
          <AchievementPopup achievement={newAchievement} />
        )}
        
        {showProfile && (
          <Profile 
            profile={userProfile}
            onUpdate={handleProfileUpdate}
            onClose={() => setShowProfile(false)}
          />
        )}
      </div>
    )
  }

  // Add handleExit function
  function handleExit() {
    // Reset game states
    setBoard(initializeBoard())
    setBoardHistory([initializeBoard()])
    setCurrentMove(0)
    setMoveHistory([])
    setSelectedPiece(null)
    setValidMoves([])
    setCurrentPlayer('white')
    setIsCheck(false)
    setIsGameOver(false)
    setPromotionSquare(null)
    
    // Return to menu
    setIsGameStarted(false)
    setShowMenu(true)
    setShowSetup(false)
  }

  // Apply the selected theme to your board
  const theme = BOARD_THEMES[currentTheme]
  
  const updateGameStats = (result) => {
    if (!userProfile) return

    const newStats = {
      ...userProfile.stats,
      gamesPlayed: userProfile.stats.gamesPlayed + 1
    }

    if (result === 'win') newStats.wins++
    else if (result === 'loss') newStats.losses++
    else newStats.draws++

    const updatedProfile = {
      ...userProfile,
      stats: newStats
    }

    setUserProfile(updatedProfile)
    localStorage.setItem('chessProfile', JSON.stringify(updatedProfile))
  }

  // Add this function to check for new achievements
  const checkAchievements = useCallback(() => {
    if (!userProfile) return

    const earnedAchievements = userProfile.achievements || []
    const metrics = userProfile.metrics || {
      nightGames: 0,
      fastestWin: Infinity,
      currentStreak: 0
    }

    Object.values(achievements).forEach(achievement => {
      if (!earnedAchievements.includes(achievement.id) && 
          achievement.condition(userProfile.stats, metrics)) {
        // Achievement unlocked!
        const updatedProfile = {
          ...userProfile,
          achievements: [...earnedAchievements, achievement.id]
        }
        setUserProfile(updatedProfile)
        localStorage.setItem('chessProfile', JSON.stringify(updatedProfile))
        setNewAchievement(achievement)
        
        // Hide achievement popup after 3 seconds
        setTimeout(() => setNewAchievement(null), 3000)
      }
    })
  }, [userProfile])

  // Call checkAchievements after game ends
  useEffect(() => {
    if (isGameOver) {
      checkAchievements()
    }
  }, [isGameOver, checkAchievements])

  // Add this function to handle profile updates
  const handleProfileUpdate = (profileData) => {
    setUserProfile(profileData)
    localStorage.setItem('chessProfile', JSON.stringify(profileData))
    setShowProfile(false)
  }

  useEffect(() => {
    if (isGameOver && userProfile) {
      const result = currentPlayer === 'white' ? 'loss' : 'win'
      updateGameStats(result)
    }
  }, [isGameOver])

  return (
    <div className="App" style={{
      '--light-square': theme.light,
      '--dark-square': theme.dark
    }}>
      {showMenu && <Menu />}
      
      {!showMenu && showSetup && (
        <div className="game-container">
          <div className="game-setup">
            <h2>Game Setup</h2>
            
            <div className="mode-selection">
              <h3>Select Opponent</h3>
              <div className="mode-buttons">
                <button 
                  className={`mode-button ${gameMode === 'human' ? 'active' : ''}`}
                  onClick={() => setGameMode('human')}
                >
                  Human
                </button>
                <button 
                  className={`mode-button ${gameMode === 'computer' ? 'active' : ''}`}
                  onClick={() => setGameMode('computer')}
                >
                  Computer
                </button>
              </div>
            </div>

            {gameMode === 'computer' && (
              <div className="difficulty-selection">
                <h3>Select Difficulty</h3>
                <div className="difficulty-buttons">
                  {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                    <button
                      key={level}
                      className={`difficulty-button ${difficulty === level ? 'active' : ''} ${level}`}
                      onClick={() => setDifficulty(level)}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="time-selection">
              <h3>Select Time Control</h3>
              <div className="time-buttons">
                <button 
                  className={`time-button ${timeControl === 180 ? 'active' : ''}`}
                  onClick={() => handleTimeControlChange(3)}
                >
                  3 min
                </button>
                <button 
                  className={`time-button ${timeControl === 300 ? 'active' : ''}`}
                  onClick={() => handleTimeControlChange(5)}
                >
                  5 min
                </button>
                <button 
                  className={`time-button ${timeControl === 600 ? 'active' : ''}`}
                  onClick={() => handleTimeControlChange(10)}
                >
                  10 min
                </button>
              </div>
            </div>

            <button 
              className="start-button"
              onClick={handleStartGame}
            >
              Start Game
            </button>
          </div>
          <ThemeSelector />
        </div>
      )}
      
      {!showMenu && !showSetup && isGameStarted && (
        <div className="game-container">
          <div className="timers-container">
            <Timer 
              initialTime={timeControl}
              isActive={isGameStarted && currentPlayer === 'black'}
              onTimeUp={handleTimeUp}
              color="black"
              key={`black-${timerKey}`}
            />
            <Timer
              initialTime={timeControl}
              isActive={isGameStarted && currentPlayer === 'white'}
              onTimeUp={handleTimeUp}
              color="white"
              key={`white-${timerKey}`}
            />
          </div>
          
          <div className="board">
            {/* Add animated piece layer */}
            {animatingPiece && animatingFrom && animatingTo && (
              <div 
                className="animated-piece"
                style={{
                  '--from-row': animatingFrom.row,
                  '--from-col': animatingFrom.col,
                  '--to-row': animatingTo.row,
                  '--to-col': animatingTo.col,
                  fontSize: '40px'
                }}
              >
                {animatingPiece.symbol}
              </div>
            )}
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="row">
                {row.map((piece, colIndex) => (
                  <div
                    key={colIndex}
                    className={`
                      square 
                      ${(rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark'}
                      ${isSelected(rowIndex, colIndex) ? 'selected' : ''}
                      ${isValidMove(rowIndex, colIndex) ? 'valid-move' : ''}
                    `}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                  >
                    {renderPiece(piece)}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="game-controls">
            <button 
              className="control-button restart"
              onClick={handleRestart}
            >
              <span className="icon">🔄</span>
              Restart
            </button>
            <button 
              className="control-button undo"
              onClick={handleUndo}
              disabled={currentMove === 0 || isGameOver}
            >
              <span className="icon">↩️</span>
              Undo Move
            </button>
            <button 
              className="control-button exit"
              onClick={handleExit}
            >
              <span className="icon">🚪</span>
              Exit
            </button>
          </div>
        </div>
      )}

      {promotionSquare && (
        <div className="promotion-modal">
          <div className="promotion-pieces">
            {promotionSquare.color === 'white' ? (
              <>
                <div onClick={() => handlePromotion('♕')}>♕</div>
                <div onClick={() => handlePromotion('♖')}>♖</div>
                <div onClick={() => handlePromotion('♗')}>♗</div>
                <div onClick={() => handlePromotion('♘')}>♘</div>
              </>
            ) : (
              <>
                <div onClick={() => handlePromotion('♛')}>♛</div>
                <div onClick={() => handlePromotion('♜')}>♜</div>
                <div onClick={() => handlePromotion('♝')}>♝</div>
                <div onClick={() => handlePromotion('♞')}>♞</div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="status">
        {isGameOver ? (
          <div className="game-over">
            Checkmate! {currentPlayer === 'white' ? 'Black' : 'White'} wins!
          </div>
        ) : (
          <>
            <div>Current Player: {currentPlayer}</div>
            {isCheck && <div className="check-status">Check!</div>}
          </>
        )}
      </div>

      {/* Add the footer */}
      <footer className="footer">
        <p>Chess Game by <span className="trademark">Apih99</span> © 2024</p>
      </footer>

      {isGameOver && (
        <div className="game-over-message">
          Game Over! {currentPlayer === 'white' ? 'Black' : 'White'} wins 
          {moveHistory.length > 0 ? ' by checkmate!' : ' on time!'}
        </div>
      )}

      {/* Add How to Play modal here as well for access from anywhere */}
      {showHowToPlay && (
        <HowToPlay onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  )
}

function initializeBoard() {
  const board = Array(8).fill(null).map(() => Array(8).fill(null))
  
  // Set up pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { color: 'black', symbol: '♟' }
    board[6][i] = { color: 'white', symbol: '♙' }
  }

  // Set up other pieces
  const backRow = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜']
  const frontRow = ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']

  for (let i = 0; i < 8; i++) {
    board[0][i] = { color: 'black', symbol: backRow[i] }
    board[7][i] = { color: 'white', symbol: frontRow[i] }
  }

  return board
}

function HowToPlay({ onClose }) {
  return (
    <div className="how-to-play-container">
      <div className="how-to-play-content">
        <h2>How to Play Chess</h2>
        
        <div className="section">
          <h3>Basic Rules</h3>
          <ul>
            <li>Chess is played between two players: White and Black</li>
            <li>White always moves first</li>
            <li>Players take turns moving one piece at a time</li>
            <li>A piece cannot move through other pieces (except the Knight)</li>
            <li>Pieces capture by moving to an opponent's piece's square</li>
          </ul>
        </div>

        <div className="section">
          <h3>Piece Movements</h3>
          <div className="piece-guide">
            <div className="piece-item">
              <span className="piece">♟</span>
              <div className="piece-info">
                <h4>Pawn</h4>
                <p>Moves forward one square at a time. Can move two squares on first move. Captures diagonally.</p>
              </div>
            </div>
            <div className="piece-item">
              <span className="piece">♜</span>
              <div className="piece-info">
                <h4>Rook</h4>
                <p>Moves any number of squares horizontally or vertically.</p>
              </div>
            </div>
            <div className="piece-item">
              <span className="piece">♞</span>
              <div className="piece-info">
                <h4>Knight</h4>
                <p>Moves in an L-shape: two squares in one direction and one square perpendicular.</p>
              </div>
            </div>
            <div className="piece-item">
              <span className="piece">♝</span>
              <div className="piece-info">
                <h4>Bishop</h4>
                <p>Moves any number of squares diagonally.</p>
              </div>
            </div>
            <div className="piece-item">
              <span className="piece">♛</span>
              <div className="piece-info">
                <h4>Queen</h4>
                <p>Moves any number of squares in any direction (horizontal, vertical, or diagonal).</p>
              </div>
            </div>
            <div className="piece-item">
              <span className="piece">♚</span>
              <div className="piece-info">
                <h4>King</h4>
                <p>Moves one square in any direction. Must be protected from check.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Special Moves</h3>
          <ul>
            <li><strong>Castling:</strong> King moves two squares toward a rook, and the rook moves to the other side of the king.</li>
            <li><strong>En Passant:</strong> Pawn captures an opponent's pawn that has just moved two squares.</li>
            <li><strong>Pawn Promotion:</strong> When a pawn reaches the opposite end, it can be promoted to any other piece (except king).</li>
          </ul>
        </div>

        <div className="section">
          <h3>Game End</h3>
          <ul>
            <li><strong>Checkmate:</strong> King is in check and has no legal moves.</li>
            <li><strong>Stalemate:</strong> No legal moves but king is not in check.</li>
            <li><strong>Draw:</strong> By agreement, repetition, or insufficient material.</li>
          </ul>
        </div>

        <button className="close-button" onClick={onClose}>
          <span className="icon">✕</span>
          Close
        </button>
      </div>
    </div>
  )
}

function Settings({ onClose, currentTheme, setCurrentTheme }) {
  const [volume, setVolume] = useState(50)
  const [notifications, setNotifications] = useState(true)
  const [showMoves, setShowMoves] = useState(true)
  const [showCoordinates, setShowCoordinates] = useState(true)

  return (
    <div className="settings-container">
      <div className="settings-content">
        <h2>Settings</h2>

        <div className="settings-section">
          <h3>Board Theme</h3>
          <div className="theme-grid">
            {Object.entries(BOARD_THEMES).map(([name, colors]) => (
              <button
                key={name}
                className={`theme-button ${currentTheme === name ? 'active' : ''}`}
                onClick={() => setCurrentTheme(name)}
              >
                <div className="theme-preview">
                  <div style={{ background: colors.light }}></div>
                  <div style={{ background: colors.dark }}></div>
                </div>
                <span>{name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3>Sound & Notifications</h3>
          <div className="setting-item">
            <label>Sound Volume</label>
            <div className="volume-control">
              <span className="icon">🔈</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
              />
              <span>{volume}%</span>
            </div>
          </div>
          <div className="setting-item">
            <label>Move Notifications</label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Game Display</h3>
          <div className="setting-item">
            <label>Show Legal Moves</label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={showMoves}
                onChange={(e) => setShowMoves(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <label>Show Coordinates</label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={showCoordinates}
                onChange={(e) => setShowCoordinates(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-footer">
          <button className="close-button" onClick={onClose}>
            <span className="icon">✕</span>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}


function Profile({ profile, onUpdate, onClose }) {
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

function About({ onClose }) {
  return (
    <div className="about-container">
      <div className="about-content">
        <h2>About PerCaturAn</h2>
        
        <div className="about-section">
          <div className="app-info">
            <div className="logo-section">
              <div className="chess-crown">♔</div>
              <h3>PerCaturAn</h3>
              <p className="version">Version 1.0.0</p>
            </div>
            
            <p className="description">
              A modern chess game built with React, featuring multiple game modes,
              customizable themes, and an intuitive interface.
            </p>
          </div>
        </div>

        <div className="about-section">
          <h3>Features</h3>
          <ul className="feature-list">
            <li>
              <span className="icon">🎮</span>
              <span>Play against computer or human opponent</span>
            </li>
            <li>
              <span className="icon">⚡</span>
              <span>Multiple difficulty levels</span>
            </li>
            <li>
              <span className="icon">🎨</span>
              <span>Customizable board themes</span>
            </li>
            <li>
              <span className="icon">⏱️</span>
              <span>Time control options</span>
            </li>
            <li>
              <span className="icon">↩️</span>
              <span>Move history and undo functionality</span>
            </li>
          </ul>
        </div>

        <div className="about-section">
          <h3>Developer</h3>
          <div className="developer-info">
            <div className="dev-details">
              <p><strong>Created by:</strong> Apih99</p>
              <p><strong>Contact:</strong> hafizcr716@gmail.com</p>
            </div>
            <div className="social-links">
              <a href="https://github.com/apih99" target="_blank" rel="noopener noreferrer">
                <span className="icon">📱</span> GitHub
              </a>
              <a href="https://linkedin.com/in/shahrul-hafiz-882362277" target="_blank" rel="noopener noreferrer">
                <span className="icon">💼</span> LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h3>Technologies Used</h3>
          <div className="tech-stack">
            <span className="tech-item">React</span>
            <span className="tech-item">JavaScript</span>
            <span className="tech-item">CSS3</span>
            <span className="tech-item">HTML5</span>
          </div>
        </div>

        <button className="close-button" onClick={onClose}>
          <span className="icon">✕</span>
          Close
        </button>
      </div>
    </div>
  )
}
export default App