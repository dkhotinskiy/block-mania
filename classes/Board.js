import Block from './Block.js'
import Entity from './Entity.js'
import Shape from './Shape.js'
import ShapeBag from './ShapeBag.js'

/**
 * Represents a game board
 */
class Board extends Entity {
	constructor(gameEngine, boardSize) {
		super(gameEngine, 0, 0, 0, 0)

		/**
		 * The game engine
		 * @type {GameEngine}
		 */
		this.gameEngine = gameEngine

		/**
		 * The size of the board
		 * @type {number}
		 */
		this.boardSize = boardSize

		/**
		 * The board
		 * @type {Array.<Array.<null | Block>>}
		 */
		this.board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))

		const block = new Block('#ff0000')

		this.board = [
			[null, block, block, block, block, block, block, block],
			[block, null, null, block, block, null, block, block],
			[block, block, null, block, block, block, block, null],
			[block, block, block, null, block, block, null, block],
			[block, block, block, block, null, block, block, block],
			[block, block, null, block, block, block, null, block],
			[block, null, block, block, block, null, block, null],
			[block, block, null, block, block, block, null, block]
		]

		/**
		 * The block bag
		 * @type {ShapeBag}
		 */
		this.shapeBag = null

		/**
		 * Flag to update and draw this entity last
		 */
		this.updateLast = true

		this.draw()
	}

	/**
	 * Adds a block bag reference to the board
	 * @param {ShapeBag} shapeBag - The block bag
	 */
	addBag(shapeBag) {
		this.shapeBag = shapeBag
	}

	/**
	 * Check if the game is over
	 */
	checkGameOver() {
		// Loop through the board, checking if shapes can be placed
		for (const rowIndex in this.board) {
			for (const columnIndex in this.board[rowIndex]) {
				const block = this.board[rowIndex][columnIndex]

				if (!(block instanceof Block)) {
					for (const shape of this.shapeBag.bag) {
						if (this.canPlaceShape(shape, rowIndex, columnIndex)) {
							return false
						}
					}
				}
			}
		}

		return true
	}
	
	/**
	 * Check if a shape can be placed on the board
	 * @param {Shape} shape - The shape to check
	 * @param {string} rowIndex - The row index to check
	 * @param {string} columnIndex - The column index to check
	 */
	canPlaceShape(shape, rowIndex, columnIndex) {
		shape.blockStructure.every((blockRow, blockRowIndex) =>
			blockRow.every((blockCell, blockColumnIndex) => {
				const row = parseInt(rowIndex) + blockRowIndex
				const column = parseInt(columnIndex) + blockColumnIndex

				return blockCell == 0 || (
					row < this.boardSize &&
					column < this.boardSize &&
					!(this.board[row][column] instanceof Block)
				)
			})
		)
	}

	/**
	 * Updates the board
	 */
	update() {
		this.sweep()
	}

	/**
	 * Draws the board
	 */
	draw() {
		const ctx = this.gameEngine.ctx
		const strokeWidth = 2
		const strokeOffset = strokeWidth / 2

		// Draw the board background
		ctx.strokeStyle = '#000000ff'
		ctx.lineWidth = strokeWidth
		ctx.beginPath()
		ctx.strokeRect(
			90 - strokeOffset,
			90 - strokeOffset,
			ctx.canvas.width - 180 + strokeOffset * 2,
			ctx.canvas.width - 180 + strokeOffset * 2
		)

		// Draw the board grid
		ctx.lineWidth = strokeWidth
		for (const rowIndex in this.board) {
			for (const columnIndex in this.board[rowIndex]) {
				const block = this.board[rowIndex][columnIndex]
				const blockSize = this.getBlockSize()
				const xPos = 90 + blockSize * columnIndex
				const yPos = 90 + blockSize * rowIndex

				if (block instanceof Block) {
					ctx.fillStyle = block.color
				} else if (block == 'hint') {
					ctx.fillStyle = '#bbbbff22'
				} else {
					ctx.fillStyle = '#000055aa'
				}

				ctx.beginPath()
				ctx.fillRect(xPos, yPos, blockSize, blockSize)
				ctx.strokeRect(
					xPos + strokeOffset,
					yPos + strokeOffset,
					blockSize - strokeOffset * 2,
					blockSize - strokeOffset * 2
				)

				if (block instanceof Block) {
					Shape.drawShadow(ctx, xPos, yPos, blockSize, 15)
				}
			}
		}
	}

	/**
	 * Returns the size of a block on the board
	 * @returns {number}
	 */
	getBlockSize() {
		const ctx = this.gameEngine.ctx
		return (ctx.canvas.width - 180) / this.boardSize
	}

	/**
	 * Check if the given coordinates are within the board
	 * @param {number} x - The x-coordinate
	 * @param {number} y - The y-coordinate
	 */
	within(x, y) {
		return (
			x > 90 - this.getBlockSize() / 2 &&
			x < 90 + this.getBlockSize() * (this.boardSize + 0.5) &&
			y > 90 - this.getBlockSize() / 2 &&
			y < 90 + this.getBlockSize() * (this.boardSize + 0.5)
		)
	}

	/**
	 * Check if the given coordinates are within the board and empty
	 * @param {number} x - The x-coordinate
	 * @param {number} y - The y-coordinate
	 */
	empty(x, y) {
		const row = Math.round((y - 90) / this.getBlockSize())
		const column = Math.round((x - 90) / this.getBlockSize())

		if (row >= 0 && row < this.boardSize && column >= 0 && column < this.boardSize) {
			return this.within(x, y) && !(this.board[row][column] instanceof Block)
		}

		return false
	}

	/**
	 * Adds a block to the board
	 * @param {string} color - The color of the block (hexadecimal)
	 * @param {number} x - The x-coordinate
	 * @param {number} y - The y-coordinate
	 */
	insertBlock(color, x, y) {
		const row = Math.round((y - 90) / this.getBlockSize())
		const column = Math.round((x - 90) / this.getBlockSize())

		if (row >= 0 && row < this.boardSize && column >= 0 && column < this.boardSize) {
			this.board[row][column] = new Block(color)
		}
	}

	/**
	 * Clear all hint blocks from the board
	 */
	clearHintBlocks() {
		for (const row of this.board) {
			for (let i = 0; i < row.length; i++) {
				if (row[i] == 'hint') {
					row[i] = null
				}
			}
		}
	}

	/**
	 * Adds a hint block to the board
	 * @param {number} x - The x-coordinate
	 * @param {number} y - The y-coordinate
	*/
	insertHintBlock(x, y) {
		const row = Math.round((y - 90) / this.getBlockSize())
		const column = Math.round((x - 90) / this.getBlockSize())
		this.board[row][column] = 'hint'
	}

	/**
	 * Sweep the row or column of the board if it is full
	 */
	sweep() {
		const rowsToSweep = []
		const columnsToSweep = []

		// Check if any row is full
		for (const rowIndex in this.board) {
			if (this.board[rowIndex].every(cell => cell instanceof Block)) {
				rowsToSweep.push(rowIndex)
			}
		}

		// Check if any column is full
		for (let columnIndex = 0; columnIndex < this.boardSize; columnIndex++) {
			if (this.board.every(row => row[columnIndex] instanceof Block)) {
				columnsToSweep.push(columnIndex)
			}
		}

		// Sweep the rows and columns
		for (const rowIndex of rowsToSweep) {
			this.board[rowIndex] = Array(this.boardSize).fill(null)
		}

		for (const columnIndex of columnsToSweep) {
			for (const row of this.board) {
				row[columnIndex] = null
			}
		}
	}
}

export default Board