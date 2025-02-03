import Entity from './Entity.js'
import blockShapes from '../blockShapes.js'
import blockColors from '../blockColors.js'

const strokeWidth = 4
const strokeOffset = strokeWidth / 2

class Block extends Entity {
	/**
	 * Creates a block
	 * @param {GameEngine} gameEngine - The game engine of the block
	 * @param {Board} board - The board of the game
	 * @param {'random' | number} type - Create a block of a specific type (index from blockShapes.js) or a random block
	 * @param {'random' | string} color - The color of the block (hexadecimal) or a random color
	 * @param {number} x - The x coordinate of the block
	 * @param {number} y - The y coordinate of the block
	 * @param {number} size - The size of the block
	 * @param {number} scale - The scale of the block
	 */
	constructor(gameEngine, board, type, color, x, y, size, scale) {
		super(gameEngine, x, y, size, scale)

		/**
		 * The board of the game
		 * @type {Board}
		 */
		this.board = board

		/**
		 * The shape of the block
		 * @type {Array.<Array.<number>>}
		 */
		this.shape = []

		/**
		 * The color of the block
		 * @type {string}
		 */
		this.color = ''

		// If the type is a number, get the shape from the blockShapes array
		if (typeof type == 'number' && blockShapes[type] instanceof Array) {
			this.shape = blockShapes[type]
		} else if (type == 'random') {
			this.generateRandomShape()
		}

		// If the type is a number, get the shape from the blockShapes array
		if (color[0] == '#') {
			this.color = color
		} else this.generateRandomColor()

		this.draw()
	}

	/**
	 * Generates a random block
	 */
	generateRandomShape() {
		const randomIndex = Math.round(Math.random() * (blockShapes.length - 1))
		this.shape = blockShapes[randomIndex]
	}

	/**
	 * Generates a random color
	 */
	generateRandomColor() {
		const randomIndex = Math.round(Math.random() * (blockColors.length - 1))
		this.color = blockColors[randomIndex]
	}

	/**
	 * Updates the drawing of the block in the canvas
	 */
	update() {
		if (this.gameEngine.mousedown) {
			if (
				this.gameEngine.mousedown.x > this.x &&
				this.gameEngine.mousedown.x < this.x + this.size * this.scale * 5 &&
				this.gameEngine.mousedown.y > this.y &&
				this.gameEngine.mousedown.y < this.y + this.size * this.scale * 5
			) {
				this.active = true
				this.mouseX = this.gameEngine.mousedown.x
				this.mouseY = this.gameEngine.mousedown.y
				this.gameEngine.mousedown = null
			}
		}

		if (this.gameEngine.mousemove && this.active) {
			this.board.clearShadowBlocks()
			if (this.canInsertIntoBoard()) {
				this.insertShadowIntoBoard()
			}
		}

		if (this.gameEngine.mouseup && this.active) {
			if (this.canInsertIntoBoard()) {
				this.insertIntoBoard()
				this.removeFromWorld = true
			}

			this.active = false
			this.mouseX = null
			this.mouseY = null
		}
	}

	/**
	 * Draws the block in the canvas
	 */
	draw() {
		if (!this.active) {
			return this.bagDraw()
		}

		const ctx = this.gameEngine.ctx

		ctx.strokeStyle = '#000000ff'
		ctx.lineWidth = strokeWidth
		ctx.fillStyle = this.color

		const rowSize = this.shape.length
		const columnSize = this.shape[0].length
		const blockSize = this.size
		const offsetX = blockSize * 5 * (1 - this.scale) / 2
		const offsetY = blockSize * 5 * (1 - this.scale) / 2
		const mouseOffsetX = this.mouseX - this.gameEngine.mousemove.x
		const mouseOffsetY = this.mouseY - this.gameEngine.mousemove.y
		const x = this.x - offsetX + (blockSize * 5 - columnSize * blockSize) / 2 - mouseOffsetX
		const y = this.y - offsetY + (blockSize * 5 - rowSize * blockSize) / 2 - mouseOffsetY

		for (const row in this.shape) {
			for (const column in this.shape[row]) {
				if (this.shape[row][column]) {
					ctx.beginPath()
					ctx.strokeRect(
						x + column * blockSize - strokeOffset,
						y + row * blockSize - strokeOffset,
						blockSize + strokeOffset * 2,
						blockSize + strokeOffset * 2
					)
					ctx.fillRect(x + column * blockSize, y + row * blockSize, blockSize, blockSize)
				}
			}
		}
	}

	/**
	 * Draws the block in the bag
	 */
	bagDraw() {
		const ctx = this.gameEngine.ctx

		ctx.strokeStyle = '#000000ff'
		ctx.lineWidth = strokeWidth / 2
		ctx.fillStyle = this.color

		const rowSize = this.shape.length
		const columnSize = this.shape[0].length
		const blockSize = this.size * this.scale
		const x = this.x + (blockSize * 5 - columnSize * blockSize) / 2
		const y = this.y + (blockSize * 5 - rowSize * blockSize) / 2

		for (const row in this.shape) {
			for (const column in this.shape[row]) {
				if (this.shape[row][column]) {
					ctx.beginPath()
					ctx.strokeRect(
						x + column * blockSize - strokeOffset / 2,
						y + row * blockSize - strokeOffset / 2,
						blockSize + strokeOffset,
						blockSize + strokeOffset
					)
					ctx.fillRect(x + column * blockSize, y + row * blockSize, blockSize, blockSize)
				}
			}
		}
	}

	canInsertIntoBoard() {
		const rowSize = this.shape.length
		const columnSize = this.shape[0].length
		const blockSize = this.size
		const offsetX = blockSize * 5 * (1 - this.scale) / 2
		const offsetY = blockSize * 5 * (1 - this.scale) / 2
		const mouseOffsetX = this.mouseX - this.gameEngine.mousemove.x
		const mouseOffsetY = this.mouseY - this.gameEngine.mousemove.y
		const x = this.x - offsetX + (blockSize * 5 - columnSize * blockSize) / 2 - mouseOffsetX
		const y = this.y - offsetY + (blockSize * 5 - rowSize * blockSize) / 2 - mouseOffsetY

		let canInsert = true

		for (const row in this.shape) {
			for (const column in this.shape[row]) {
				if (this.shape[row][column]) {
					if (!this.board.empty(x + column * blockSize, y + row * blockSize)) {
						canInsert = false
					}
				}
			}
		}

		return canInsert
	}

	insertIntoBoard() {
		const rowSize = this.shape.length
		const columnSize = this.shape[0].length
		const blockSize = this.size
		const offsetX = blockSize * 5 * (1 - this.scale) / 2
		const offsetY = blockSize * 5 * (1 - this.scale) / 2
		const mouseOffsetX = this.mouseX - this.gameEngine.mousemove.x
		const mouseOffsetY = this.mouseY - this.gameEngine.mousemove.y
		const x = this.x - offsetX + (blockSize * 5 - columnSize * blockSize) / 2 - mouseOffsetX
		const y = this.y - offsetY + (blockSize * 5 - rowSize * blockSize) / 2 - mouseOffsetY

		for (const row in this.shape) {
			for (const column in this.shape[row]) {
				if (this.shape[row][column]) {
					this.board.insertBlock(this.color, x + column * blockSize, y + row * blockSize)
				}
			}
		}
	}

	insertShadowIntoBoard() {
		const rowSize = this.shape.length
		const columnSize = this.shape[0].length
		const blockSize = this.size
		const offsetX = blockSize * 5 * (1 - this.scale) / 2
		const offsetY = blockSize * 5 * (1 - this.scale) / 2
		const mouseOffsetX = this.mouseX - this.gameEngine.mousemove.x
		const mouseOffsetY = this.mouseY - this.gameEngine.mousemove.y
		const x = this.x - offsetX + (blockSize * 5 - columnSize * blockSize) / 2 - mouseOffsetX
		const y = this.y - offsetY + (blockSize * 5 - rowSize * blockSize) / 2 - mouseOffsetY

		for (const row in this.shape) {
			for (const column in this.shape[row]) {
				if (this.shape[row][column]) {
					this.board.insertShadowBlock(x + column * blockSize, y + row * blockSize)
				}
			}
		}
	}
}

export default Block