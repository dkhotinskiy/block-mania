import BoardBlock from './BoardBlock.js'
import Entity from './Entity.js'

/**
 * Represents a game board
 */
class Board extends Entity {
	constructor(gameEngine, size) {
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
		this.size = size

		/**
		 * The board
		 * @type {Array.<Array.<null | BoardBlock>>}
		 */
		this.board = Array(size).fill(null).map(() => Array(size).fill(null))

		/**
		 * Flag to update and draw this entity last
		 */
		this.updateLast = true

		this.draw()
	}

	/**
	 * Updates the board (no need to update the board)
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

				if (block instanceof BoardBlock) {
					ctx.fillStyle = block.color
				} else if (block == 'shadow') {
					ctx.fillStyle = '#bbbbff22'
				} else {
					ctx.fillStyle = '#000055aa'
				}

				ctx.beginPath()
				ctx.fillRect(
					90 + this.blockSize() * columnIndex,
					90 + this.blockSize() * rowIndex,
					this.blockSize(),
					this.blockSize()
				)
				ctx.strokeRect(
					90 + strokeOffset + this.blockSize() * columnIndex,
					90 + strokeOffset + this.blockSize() * rowIndex,
					this.blockSize() - strokeOffset * 2,
					this.blockSize() - strokeOffset * 2
				)
			}
		}
	}

	/**
	 * Returns the size of a block on the board
	 * @returns {number}
	 */
	blockSize() {
		const ctx = this.gameEngine.ctx
		return (ctx.canvas.width - 180) / this.size
	}

	/**
	 * Check if the given coordinates are within the board
	 * @param {number} x - The x-coordinate
	 * @param {number} y - The y-coordinate
	 */
	within(x, y) {
		return x > 90 && x < this.gameEngine.ctx.canvas.width - 90 && y > 90 && y < this.gameEngine.ctx.canvas.width - 90
	}

	/**
	 * Check if the given coordinates are within the board and empty
	 * @param {number} x - The x-coordinate
	 * @param {number} y - The y-coordinate
	 */
	empty(x, y) {
		const row = Math.round((y - 90) / this.blockSize())
		const column = Math.round((x - 90) / this.blockSize())

		if (row >= 0 && row < this.size && column >= 0 && column < this.size) {
			return this.within(x, y) && !(this.board[row][column] instanceof BoardBlock)
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
		const row = Math.round((y - 90) / this.blockSize())
		const column = Math.round((x - 90) / this.blockSize())

		if (row >= 0 && row < this.size && column >= 0 && column < this.size) {
			this.board[row][column] = new BoardBlock(color)
		}
	}

	/**
	 * Clear all shadow blocks from the board
	 */
	clearShadowBlocks() {
		for (const row of this.board) {
			for (let i = 0; i < row.length; i++) {
				if (row[i] == 'shadow') {
					row[i] = null
				}
			}
		}
	}

	/**
	 * Adds a shadow block to the board
	 * @param {number} x - The x-coordinate
	 * @param {number} y - The y-coordinate
	*/
	insertShadowBlock(x, y) {
		const row = Math.round((y - 90) / this.blockSize())
		const column = Math.round((x - 90) / this.blockSize())
		this.board[row][column] = 'shadow'
	}

	/**
	 * Sweep the row or column of the board if it is full
	 */
	sweep() {
		const rowsToSweep = []
		const columnsToSweep = []

		// Check if any row is full
		for (const rowIndex in this.board) {
			if (this.board[rowIndex].every(cell => cell instanceof BoardBlock)) {
				rowsToSweep.push(rowIndex)
			}
		}

		// Check if any column is full
		for (let columnIndex = 0; columnIndex < this.size; columnIndex++) {
			if (this.board.every(row => row[columnIndex] instanceof BoardBlock)) {
				columnsToSweep.push(columnIndex)
			}
		}

		// Sweep the rows and columns
		for (const rowIndex of rowsToSweep) {
			this.board[rowIndex] = Array(this.size).fill(null)
		}

		for (const columnIndex of columnsToSweep) {
			for (const row of this.board) {
				row[columnIndex] = null
			}
		}
	}
}

export default Board