import { getLegalMoves } from '../checkDetection'

// Piece values for evaluation
const PIECE_VALUES = {
    '♙': 100,  // White pawn
    '♖': 500,  // White rook
    '♘': 300,  // White knight
    '♗': 300,  // White bishop
    '♕': 900,  // White queen
    '♔': 10000, // White king
    '♟': -100,  // Black pawn
    '♜': -500,  // Black rook
    '♞': -300,  // Black knight
    '♝': -300,  // Black bishop
    '♛': -900,  // Black queen
    '♚': -10000 // Black king
  }
  
  // Position bonus for piece placement
  const POSITION_BONUS = {
    pawn: [
      [0,  0,  0,  0,  0,  0,  0,  0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5,  5, 10, 25, 25, 10,  5,  5],
      [0,  0,  0, 20, 20,  0,  0,  0],
      [5, -5,-10,  0,  0,-10, -5,  5],
      [5, 10, 10,-20,-20, 10, 10,  5],
      [0,  0,  0,  0,  0,  0,  0,  0]
    ],
    // Add more position tables for other pieces...
  }
  
  function evaluateBoard(board) {
    let score = 0
    
    // Material evaluation
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece) {
          score += PIECE_VALUES[piece.symbol]
          
          // Add position bonus
          if (piece.symbol === '♙' || piece.symbol === '♟') {
            score += POSITION_BONUS.pawn[row][col] * (piece.color === 'white' ? 1 : -1)
          }
        }
      }
    }
    
    return score
  }
  
  function getAllPossibleMoves(board, color) {
    const moves = []
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece && piece.color === color) {
          const validMoves = getLegalMoves(board, row, col)
          validMoves.forEach(([toRow, toCol]) => {
            moves.push({
              from: { row, col },
              to: { row: toRow, col: toCol }
            })
          })
        }
      }
    }
    
    return moves
  }
  
  function makeMove(board, move) {
    const newBoard = board.map(row => [...row])
    const piece = newBoard[move.from.row][move.from.col]
    newBoard[move.to.row][move.to.col] = piece
    newBoard[move.from.row][move.from.col] = null
    return newBoard
  }
  
  function minimax(board, depth, alpha, beta, isMaximizing, color) {
    if (depth === 0) {
      return evaluateBoard(board)
    }
  
    const moves = getAllPossibleMoves(board, color)
    
    if (isMaximizing) {
      let maxEval = -Infinity
      for (const move of moves) {
        const newBoard = makeMove(board, move)
        const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, color === 'white' ? 'black' : 'white')
        maxEval = Math.max(maxEval, evaluation)
        alpha = Math.max(alpha, evaluation)
        if (beta <= alpha) break
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (const move of moves) {
        const newBoard = makeMove(board, move)
        const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, color === 'white' ? 'black' : 'white')
        minEval = Math.min(minEval, evaluation)
        beta = Math.min(beta, evaluation)
        if (beta <= alpha) break
      }
      return minEval
    }
  }
  
  export function getBestMove(board, difficulty, color) {
    // Set depth based on difficulty
    const depth = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4
    }[difficulty]
  
    // For beginner level, sometimes make random moves
    if (difficulty === 'beginner' && Math.random() < 0.3) {
      const moves = getAllPossibleMoves(board, color)
      return moves[Math.floor(Math.random() * moves.length)]
    }
  
    const moves = getAllPossibleMoves(board, color)
    let bestMove = null
    let bestEval = color === 'white' ? -Infinity : Infinity
    
    for (const move of moves) {
      const newBoard = makeMove(board, move)
      const evaluation = minimax(
        newBoard,
        depth - 1,
        -Infinity,
        Infinity,
        color === 'black',
        color === 'white' ? 'black' : 'white'
      )
      
      if (color === 'white' && evaluation > bestEval) {
        bestEval = evaluation
        bestMove = move
      } else if (color === 'black' && evaluation < bestEval) {
        bestEval = evaluation
        bestMove = move
      }
    }
    
    return bestMove
  }