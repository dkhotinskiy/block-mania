import { darkenColor, lightenColor } from '../util.js'
import Block from './Block.js'
import Entity from './Entity.js'
import Shape from './Shape.js'
import ShapeBag from './ShapeBag.js'
import gameProperties from '../gameProperties.js'

const topPadding = 270
const leftPadding = 90

/**
 * Represents a game board
 */
class Board extends Entity {
	constructor(gameEngine, boardSize, targetScore) {
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

		/**
		 * The toggle to sweep the blocks
		 * @type {boolean}
		 */
		this.elementsToSweep = []

		/**
		 * The block bag
		 * @type {ShapeBag}
		 */
		this.shapeBag = null

		/**
		 * Flag to update and draw this entity last
		 */
		this.updateLast = true

		/**
		 * Hint the rows to sweep
		 * @type {Array.<number>}
		 */
		this.rowsSweepHint = []

		/**
		 * Hint the columns to sweep
		 * @type {Array.<number>}
		 */
		this.columnsSweepHint = []

		/**
		 * The current hint color
		 * @type {string}
		 */
		this.currentHintColor = null

		/**
		 * The width of the block border
		 * @type {number}
		 */
		this.blockBorderWidth = 2

		/**
		 * The score of the game
		 * @type {number}
		 */
		this.score = 0

		/**
		 * The target score of the game
		 * @type {number}
		 */
		this.targetScore = targetScore

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
	isGameLost() {
		// Loop through the board, checking if shapes can be placed
		for (const rowIndex in this.board) {
			for (const columnIndex in this.board[rowIndex]) {
				const block = this.board[rowIndex][columnIndex]

				if (block === null || block.hint) {
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
		return shape.blockStructure.every((blockRow, blockRowIndex) =>
			blockRow.every((blockCell, blockColumnIndex) => {
				const row = parseInt(rowIndex) + blockRowIndex
				const column = parseInt(columnIndex) + blockColumnIndex

				return blockCell == 0 || (
					row < this.boardSize &&
					column < this.boardSize &&
					(
						this.board[row][column] === null ||
						this.board[row][column].hint
					)
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

		// Draw the board background
		ctx.strokeStyle = '#000000ff'
		ctx.lineWidth = this.blockBorderWidth
		ctx.beginPath()
		ctx.strokeRect(
			leftPadding - this.blockBorderWidth / 2,
			topPadding - this.blockBorderWidth / 2,
			ctx.canvas.width - leftPadding * 2 + this.blockBorderWidth,
			ctx.canvas.width - leftPadding * 2 + this.blockBorderWidth
		)

		// Draw the board grid
		ctx.lineWidth = this.blockBorderWidth
		for (const rowIndex in this.board) {
			for (const columnIndex in this.board[rowIndex]) {
				const blockSize = this.getBlockSize()
				const xPos = leftPadding + blockSize * columnIndex
				const yPos = topPadding + blockSize * rowIndex
				this.drawBlock(ctx, null, blockSize, xPos, yPos)
			}
		}
		for (const rowIndex in this.board) {
			for (const columnIndex in this.board[rowIndex]) {
				const block = this.board[rowIndex][columnIndex]

				if (block instanceof Block && block.sweepStage === null) {
					const blockSize = this.getBlockSize()
					const xPos = leftPadding + blockSize * columnIndex
					const yPos = topPadding + blockSize * rowIndex
					this.drawBlock(ctx, block, blockSize, xPos, yPos)
				}
			}
		}

		if (this.rowsSweepHint.length > 0) {
			for (const rowIndex of this.rowsSweepHint) {
				this.drawSweepHint(ctx, 'row', rowIndex)
			}
		}

		if (this.columnsSweepHint.length > 0) {
			for (const columnIndex of this.columnsSweepHint) {
				this.drawSweepHint(ctx, 'column', columnIndex)
			}
		}

		if (this.elementsToSweep.length > 0) {
			for (const block of this.elementsToSweep) {
				this.drawBlockSweep(ctx, block)
			}

			setTimeout(() => {
				this.gameEngine.draw()
			}, 5)
		}

		this.drawScore(ctx)

		if (this.isGameWon()) {
			this.gameEngine.gameWon()
		}

		// Check if the game is lost
		if (
			this.elementsToSweep.length == 0 &&
			this.shapeBag instanceof ShapeBag &&
			this.isGameLost()
		) {
			this.gameEngine.gameLost()
		}
	}

	/**
	 * Draws a block on the board
	 * @param {CanvasRenderingContext2D} ctx - The canvas context
	 * @param {Block} block - The block to draw
	 * @param {number} blockSize - The size of the block
	 * @param {number} xPos - The x position of the block
	 * @param {number} yPos - The y position of the block
	 */
	drawBlock(ctx, block, blockSize, xPos, yPos, shaddowOffsetScale = 1) {
		if (block instanceof Block) {
			ctx.fillStyle = block.color
		} else {
			ctx.fillStyle = '#000055aa'
		}

		ctx.beginPath()
		ctx.fillRect(xPos, yPos, blockSize, blockSize)
		ctx.strokeRect(
			xPos + this.blockBorderWidth / 2,
			yPos + this.blockBorderWidth / 2,
			blockSize - this.blockBorderWidth,
			blockSize - this.blockBorderWidth
		)

		if (block instanceof Block) {
			Shape.drawShadow(ctx, xPos, yPos, blockSize, shaddowOffsetScale * 15)
		}
	}

	/**
	 * Draw the sweep hint
	 * @param {CanvasRenderingContext2D} ctx - The canvas context
	 * @param {'row' | 'column'} mode - The mode of the hint
	 * @param {number} index - The index of the row or column
	 */
	drawSweepHint(ctx, mode, index) {
		const blockSize = this.getBlockSize()
		const xPos = mode == 'row' ? leftPadding : leftPadding + blockSize * index
		const yPos = mode == 'row' ? topPadding + blockSize * index : topPadding
		const width = mode == 'row' ? blockSize * this.boardSize : blockSize
		const height = mode == 'row' ? blockSize : blockSize * this.boardSize

		// Set line and shadow properties
		ctx.lineWidth = 5
		ctx.strokeStyle = lightenColor(this.currentHintColor, 5)
		ctx.shadowBlur = 40
		ctx.shadowColor = lightenColor(this.currentHintColor, 40)

		// Draw the stroke with shadow
		ctx.beginPath()
		ctx.roundRect(xPos, yPos, width, height, 5)
		ctx.stroke()
		ctx.stroke()
		ctx.stroke()

		// Reset shadow properties
		ctx.shadowBlur = 0
		ctx.shadowColor = 'transparent'
	}

	/**
	 * Draw the sweep block
	 * @param {CanvasRenderingContext2D} ctx - The canvas context
	 * @param {Block} block - The block to draw
	 */
	drawBlockSweep(ctx, block) {
		if (block.sweepStage < 0) {
			const blockSize = this.getBlockSize()
			const xPos = leftPadding + blockSize * block.columnIndex
			const yPos = topPadding + blockSize * block.rowIndex
			this.drawBlock(ctx, block, blockSize, xPos, yPos)
			block.sweepStage += 0.85
		} else if (block.sweepStage < 30) {
			const blockSize = this.getBlockSize()
			const xPos = leftPadding + blockSize * block.columnIndex - block.sweepStage / 2
			const yPos = topPadding + blockSize * block.rowIndex - block.sweepStage / 2
			const newBlockSize = blockSize + block.sweepStage
			const shaddowOffsetScale = newBlockSize / blockSize * 1.2
			this.drawBlock(ctx, block, newBlockSize, xPos, yPos, shaddowOffsetScale)
			block.sweepStage += 0.85
		} else if (block.sweepStage < 60 + this.getBlockSize()) {
			const blockSize = this.getBlockSize()
			const xPos = leftPadding + blockSize * block.columnIndex - 30 + block.sweepStage / 2
			const yPos = topPadding + blockSize * block.rowIndex - 30 + block.sweepStage / 2
			const newBlockSize = blockSize + 60 - block.sweepStage
			const shaddowOffsetScale = newBlockSize / blockSize
			this.drawBlock(ctx, block, newBlockSize, xPos, yPos, shaddowOffsetScale)
			block.sweepStage += 2.1
		} else {
			this.elementsToSweep = this.elementsToSweep.filter(b => b !== block)
			this.board[block.rowIndex][block.columnIndex] = null
		}
	}

	/**
	 * Draw the score
	 * @param {CanvasRenderingContext2D} ctx - The canvas context
	 */
	drawScore(ctx) {
		// Draw current score text
		ctx.fillStyle = gameProperties.textColor
		ctx.font = '5rem Arial'
		ctx.textAlign = 'center'
		ctx.fillText(this.score, ctx.canvas.width / 2, 110)

		// Initialize the progress bar properties
		const progressBarWidth = 450
		const progressBarHeight = 40
		const progressBarX = (ctx.canvas.width - progressBarWidth) / 2
		const progressBarY = 170
		const progress = Math.max(progressBarHeight / progressBarWidth, this.score / this.targetScore)
		const radius = progressBarHeight / 2

		// Draw the background of the progress bar
		ctx.fillStyle = darkenColor(gameProperties.backgroundColor, 40)
		ctx.beginPath()
		ctx.moveTo(progressBarX + radius, progressBarY)
		ctx.arcTo(progressBarX + progressBarWidth, progressBarY, progressBarX + progressBarWidth, progressBarY + progressBarHeight, radius)
		ctx.arcTo(progressBarX + progressBarWidth, progressBarY + progressBarHeight, progressBarX, progressBarY + progressBarHeight, radius)
		ctx.arcTo(progressBarX, progressBarY + progressBarHeight, progressBarX, progressBarY, radius)
		ctx.arcTo(progressBarX, progressBarY, progressBarX + progressBarWidth, progressBarY, radius)
		ctx.closePath()
		ctx.fill()

		if (this.score > 0) {
			// Draw the progress
			ctx.fillStyle = gameProperties.progressColor
			ctx.beginPath()
			ctx.moveTo(progressBarX + radius, progressBarY)
			ctx.arcTo(progressBarX + progressBarWidth * progress, progressBarY, progressBarX + progressBarWidth * progress, progressBarY + progressBarHeight, radius)
			ctx.arcTo(progressBarX + progressBarWidth * progress, progressBarY + progressBarHeight, progressBarX, progressBarY + progressBarHeight, radius)
			ctx.arcTo(progressBarX, progressBarY + progressBarHeight, progressBarX, progressBarY, radius)
			ctx.arcTo(progressBarX, progressBarY, progressBarX + progressBarWidth * progress, progressBarY, radius)
			ctx.closePath()
			ctx.fill()
		}
	
		// Draw the border of the progress bar
		ctx.strokeStyle = lightenColor(gameProperties.backgroundColor, 10)
		ctx.lineWidth = 2
		ctx.beginPath()
		ctx.moveTo(progressBarX + radius, progressBarY)
		ctx.arcTo(progressBarX + progressBarWidth, progressBarY, progressBarX + progressBarWidth, progressBarY + progressBarHeight, radius)
		ctx.arcTo(progressBarX + progressBarWidth, progressBarY + progressBarHeight, progressBarX, progressBarY + progressBarHeight, radius)
		ctx.arcTo(progressBarX, progressBarY + progressBarHeight, progressBarX, progressBarY, radius)
		ctx.arcTo(progressBarX, progressBarY, progressBarX + progressBarWidth, progressBarY, radius)
		ctx.closePath()
		ctx.stroke()
	}

	/**
	 * Returns the size of a block on the board
	 * @returns {number}
	 */
	getBlockSize() {
		const ctx = this.gameEngine.ctx
		return (ctx.canvas.width - leftPadding * 2) / this.boardSize
	}

	/**
	 * Check if the given coordinates are within the board
	 * @param {number} x - The x-coordinate
	 * @param {number} y - The y-coordinate
	 */
	within(x, y) {
		return (
			x > leftPadding - this.getBlockSize() / 2 &&
			x < leftPadding + this.getBlockSize() * (this.boardSize + 0.5) &&
			y > topPadding - this.getBlockSize() / 2 &&
			y < topPadding + this.getBlockSize() * (this.boardSize + 0.5)
		)
	}

	/**
	 * Check if the given coordinates are within the board and empty
	 * @param {number} x - The x-coordinate
	 * @param {number} y - The y-coordinate
	 */
	empty(x, y) {
		const row = Math.round((y - topPadding) / this.getBlockSize())
		const column = Math.round((x - leftPadding) / this.getBlockSize())

		if (row >= 0 && row < this.boardSize && column >= 0 && column < this.boardSize) {
			return this.within(x, y) && !(this.board[row][column] instanceof Block && !this.board[row][column].hint)
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
		const rowIndex = Math.round((y - topPadding) / this.getBlockSize())
		const columnIndex = Math.round((x - leftPadding) / this.getBlockSize())

		if (rowIndex >= 0 && rowIndex < this.boardSize && columnIndex >= 0 && columnIndex < this.boardSize) {
			this.board[rowIndex][columnIndex] = new Block(color, false, rowIndex, columnIndex)
		}
	}

	/**
	 * Clear all hint blocks from the board
	 */
	clearHintBlocks() {
		for (const row of this.board) {
			for (let i = 0; i < row.length; i++) {
				if (row[i] instanceof Block && row[i].hint) {
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
	insertHintBlock(x, y, color) {
		const row = Math.round((y - topPadding) / this.getBlockSize())
		const column = Math.round((x - leftPadding) / this.getBlockSize())
		this.board[row][column] = new Block(color, true)
		this.currentHintColor = color
	}

	/**
	 * Sweep the row or column of the board if it is full
	 */
	sweep() {
		const rowsToSweep = []
		const columnsToSweep = []

		// Check if any row is full
		for (const rowIndex in this.board) {
			if (
				this.board[rowIndex].every(cell => cell instanceof Block && !cell.hint) &&
				!rowsToSweep.includes(rowIndex)
			) {
				rowsToSweep.push(rowIndex)
			}
		}

		// Check if any column is full
		for (let columnIndex = 0; columnIndex < this.boardSize; columnIndex++) {
			if (
				this.board.every(row => row[columnIndex] instanceof Block && !row[columnIndex].hint) &&
				!columnsToSweep.includes(columnIndex)
			) {
				columnsToSweep.push(columnIndex)
			}
		}

		// Set the blocks to sweep
		for (const rowIndex of rowsToSweep) {
			for (const columnIndex in this.board[rowIndex]) {
				const cell = this.board[rowIndex][columnIndex]
				cell.sweepOut(this, -1 * Math.pow(columnIndex, 1.5))
			}
		}
		
		for (const columnIndex of columnsToSweep) {
			for (const rowIndex in this.board) {
				const cell = this.board[rowIndex][columnIndex]
				cell.sweepOut(this, -1 * Math.pow(rowIndex, 1.5))
			}
		}

		// Add score based on the rows and columns swept
		this.addSweepScore(rowsToSweep.length, columnsToSweep.length)
	}

	/**
	 * Hint the row or column sweep of the board if it is full
	 */
	sweepHint() {
		this.rowsSweepHint = []
		this.columnsSweepHint = []

		// Check if any row is full
		for (const rowIndex in this.board) {
			if (this.board[rowIndex].every(cell => cell instanceof Block)) {
				this.rowsSweepHint.push(rowIndex)
			}
		}

		// Check if any column is full
		for (let columnIndex = 0; columnIndex < this.boardSize; columnIndex++) {
			if (this.board.every(row => row[columnIndex] instanceof Block)) {
				this.columnsSweepHint.push(columnIndex)
			}
		}
	}

	/**
	 * Clears the sweep hint
	 */
	clearSweepHint() {
		this.rowsSweepHint = []
		this.columnsSweepHint = []
	}

	/**
	 * Adds score to the game based on the shape inserted
	 * @param {Shape} shape - The shape that was placed
	 */
	addShapeScore(shape) {
		for (const row of shape) {
			for (const block of row) {
				if (block == 1) {
					this.score++
				}
			}
		}
	}

	/**
	 * Adds score to the game based on the rows and columns swept
	 * @param {number} rows - The number of rows swept
	 * @param {number} columns - The number of columns swept
	 */
	addSweepScore(rows, columns) {
		this.score += (rows + columns) * 10
	}

	/**
	 * Checks if the game is won
	 * @returns {boolean}
	 */
	isGameWon() {
		return this.score >= this.targetScore
	}
}

export default Board