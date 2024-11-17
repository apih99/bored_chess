// At the top of the file, make sure this is the only export
export function getValidMoves(board, row, col) {
  const piece = board[row][col]
  if (!piece) return []

  switch (piece.symbol) {
    case '♙': // White Pawn
    case '♟': // Black Pawn
      return getPawnMoves(board, row, col)
    case '♖': // White Rook
    case '♜': // Black Rook
      return getRookMoves(board, row, col)
    case '♘': // White Knight
    case '♞': // Black Knight
      return getKnightMoves(board, row, col)
    case '♗': // White Bishop
    case '♝': // Black Bishop
      return getBishopMoves(board, row, col)
    case '♕': // White Queen
    case '♛': // Black Queen
      return getQueenMoves(board, row, col)
    case '♔': // White King
    case '♚': // Black King
      return getKingMoves(board, row, col)
    default:
      return []
  }
}

function isWithinBoard(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8
}

function canMoveToSquare(board, fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol]
  const targetSquare = board[toRow][toCol]
  
  return !targetSquare || targetSquare.color !== piece.color
}

function getPawnMoves(board, row, col) {
  const piece = board[row][col]
  const moves = []
  const direction = piece.color === 'white' ? -1 : 1
  const startRow = piece.color === 'white' ? 6 : 1

  // Forward move
  if (isWithinBoard(row + direction, col) && !board[row + direction][col]) {
    moves.push([row + direction, col])
    // Double move from starting position
    if (row === startRow && !board[row + 2 * direction][col]) {
      moves.push([row + 2 * direction, col])
    }
  }

  // Capture moves
  const captureSquares = [[row + direction, col - 1], [row + direction, col + 1]]
  captureSquares.forEach(([r, c]) => {
    if (isWithinBoard(r, c) && board[r][c] && board[r][c].color !== piece.color) {
      moves.push([r, c])
    }
  })

  return moves
}

function getRookMoves(board, row, col) {
  const moves = []
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
  
  directions.forEach(([dRow, dCol]) => {
    let newRow = row + dRow
    let newCol = col + dCol
    
    while (isWithinBoard(newRow, newCol)) {
      if (canMoveToSquare(board, row, col, newRow, newCol)) {
        moves.push([newRow, newCol])
        if (board[newRow][newCol]) break // Stop if we hit a piece
      } else {
        break
      }
      newRow += dRow
      newCol += dCol
    }
  })

  return moves
}

function getKnightMoves(board, row, col) {
  const moves = []
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ]

  knightMoves.forEach(([dRow, dCol]) => {
    const newRow = row + dRow
    const newCol = col + dCol
    if (isWithinBoard(newRow, newCol) && canMoveToSquare(board, row, col, newRow, newCol)) {
      moves.push([newRow, newCol])
    }
  })

  return moves
}

function getBishopMoves(board, row, col) {
  const moves = []
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
  
  directions.forEach(([dRow, dCol]) => {
    let newRow = row + dRow
    let newCol = col + dCol
    
    while (isWithinBoard(newRow, newCol)) {
      if (canMoveToSquare(board, row, col, newRow, newCol)) {
        moves.push([newRow, newCol])
        if (board[newRow][newCol]) break // Stop if we hit a piece
      } else {
        break
      }
      newRow += dRow
      newCol += dCol
    }
  })

  return moves
}

function getQueenMoves(board, row, col) {
  return [...getRookMoves(board, row, col), ...getBishopMoves(board, row, col)]
}

function getKingMoves(board, row, col) {
  const moves = []
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]

  directions.forEach(([dRow, dCol]) => {
    const newRow = row + dRow
    const newCol = col + dCol
    if (isWithinBoard(newRow, newCol) && canMoveToSquare(board, row, col, newRow, newCol)) {
      moves.push([newRow, newCol])
    }
  })

  return moves
}
