import { getValidMoves } from './moveValidation'

// Find the king's position for a given color
function findKing(board, color) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && 
          piece.color === color && 
          (piece.symbol === '♔' || piece.symbol === '♚')) {
        return { row, col }
      }
    }
  }
  return null
}

// Check if a square is under attack by the opponent
function isSquareUnderAttack(board, row, col, attackingColor) {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j]
      if (piece && piece.color === attackingColor) {
        const validMoves = getValidMoves(board, i, j)
        if (validMoves.some(([r, c]) => r === row && c === col)) {
          return true
        }
      }
    }
  }
  return false
}

// Check if the given color is in check
export function isInCheck(board, color) {
  const king = findKing(board, color)
  if (!king) return false
  
  const opponentColor = color === 'white' ? 'black' : 'white'
  return isSquareUnderAttack(board, king.row, king.col, opponentColor)
}

// Simulate a move and check if it's legal (doesn't put/leave own king in check)
function isMoveLegal(board, fromRow, fromCol, toRow, toCol) {
  const newBoard = board.map(row => [...row])
  const movingPiece = newBoard[fromRow][fromCol]
  
  // Make the move
  newBoard[toRow][toCol] = movingPiece
  newBoard[fromRow][fromCol] = null
  
  // Check if the move puts/leaves own king in check
  return !isInCheck(newBoard, movingPiece.color)
}

// Get all legal moves for a piece (considering check)
export function getLegalMoves(board, row, col) {
  const piece = board[row][col]
  if (!piece) return []
  
  const validMoves = getValidMoves(board, row, col)
  return validMoves.filter(([toRow, toCol]) => 
    isMoveLegal(board, row, col, toRow, toCol)
  )
}

// Check if the given color is in checkmate
export function isInCheckmate(board, color) {
  // If not in check, can't be checkmate
  if (!isInCheck(board, color)) return false
  
  // Check if any piece has any legal moves
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.color === color) {
        const legalMoves = getLegalMoves(board, row, col)
        if (legalMoves.length > 0) {
          return false
        }
      }
    }
  }
  
  // No legal moves found while in check = checkmate
  return true
}

// First, let's update the checkDetection.js file to include isStalemate
export function isStalemate(board, color, getLegalMoves) {
  if (isInCheck(board, color)) return false
  
  // Check if any piece can make a legal move
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece?.color === color) {
        const moves = getLegalMoves(board, row, col)
        if (moves.length > 0) return false
      }
    }
  }
  
  return true
}

// Add isCheckmate if it's missing
export function isCheckmate(board, color, getLegalMoves) {
  if (!isInCheck(board, color)) return false
  
  // Check if any piece can make a legal move
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece?.color === color) {
        const moves = getLegalMoves(board, row, col)
        if (moves.length > 0) return false
      }
    }
  }
  
  return true
}