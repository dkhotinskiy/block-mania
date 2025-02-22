import Entity from './Entity.js'
import Board from './Board.js'
import shapes from '../shapes.js'
import colors from '../colors.js'

const strokeWidth = 4
const strokeOffset = strokeWidth / 2

class Shape extends Entity {
	/**
	 * Creates a shape
	 * @param {GameEngine} gameEngine - The game engine of the shape
	 * @param {Board} board - The board of the game
	 * @param {'random' | number} type - Create a shape of a specific type (index from blockShapes.js) or a random shape
	 * @param {'random' | string} color - The color of the shape (hexadecimal) or a random color
	 * @param {number} x - The x coordinate of the shape
	 * @param {number} y - The y coordinate of the shape
	 * @param {number} blockSize - The size of the shape
	 * @param {number} scale - The scale of the shape
	 */
	constructor(gameEngine, board, type, color, x, y, blockSize, scale) {
		super(gameEngine, x, y, blockSize, scale)

		/**
		 * The board of the game
		 * @type {Board}
		 */
		this.board = board

		/**
		 * The shape construction
		 * @type {Array.<Array.<number>>}
		 */
		this.blockStructure = []

		/**
		 * The color of the shape
		 * @type {string}
		 */
		this.color = ''

		// If the type is a number, get the shape from the blockShapes array
		if (typeof type == 'number' && shapes[type] instanceof Array) {
			this.blockStructure = shapes[type]
		} else if (type == 'random') {
			this.generateRandomShape()
		}

		// If the type is a number, get the color from the blockColor array
		if (color[0] == '#') {
			this.color = color
			this.hintColor = color + '70'
		} else this.generateRandomColor()

		this.draw()
	}

	/**
	 * Draws a shadow for the shape
	 * @param {number} xPos - The x position of the shape
	 * @param {number} yPos - The y position of the shape
	 * @param {number} blockSize - The size of the block
	 * @param {number} shaddowOffset - The offset of the shadow
	 */
	static drawShadow(ctx, xPos, yPos, blockSize, shaddowOffset) {
		// Create a shadow effect for the shape by drawing a trapezoid on the top with a lighter tint
		ctx.fillStyle = '#ffffff60'
		ctx.beginPath()
		ctx.moveTo(xPos, yPos)
		ctx.lineTo(xPos + blockSize, yPos)
		ctx.lineTo(xPos + blockSize - shaddowOffset, yPos + shaddowOffset)
		ctx.lineTo(xPos + shaddowOffset, yPos + shaddowOffset)
		ctx.closePath()
		ctx.fill()

		// Create a shadow effect for the shape by drawing a trapezoid on the right with a darker tint
		ctx.fillStyle = '#00000030'
		ctx.beginPath()
		ctx.moveTo(xPos + blockSize, yPos)
		ctx.lineTo(xPos + blockSize, yPos + blockSize)
		ctx.lineTo(xPos + blockSize - shaddowOffset, yPos + blockSize - shaddowOffset)
		ctx.lineTo(xPos + blockSize - shaddowOffset, yPos + shaddowOffset)
		ctx.closePath()
		ctx.fill()

		// Create a shadow effect for the shape by drawing a trapezoid on the bottom with a darker tint
		ctx.fillStyle = '#00000050'
		ctx.beginPath()
		ctx.moveTo(xPos, yPos + blockSize)
		ctx.lineTo(xPos + blockSize, yPos + blockSize)
		ctx.lineTo(xPos + blockSize - shaddowOffset, yPos + blockSize - shaddowOffset)
		ctx.lineTo(xPos + shaddowOffset, yPos + blockSize - shaddowOffset)
		ctx.closePath()
		ctx.fill()

		// Create a shadow effect for the shape by drawing a trapezoid on the left with a lighter tint
		ctx.fillStyle = '#ffffff30'
		ctx.beginPath()
		ctx.moveTo(xPos, yPos)
		ctx.lineTo(xPos, yPos + blockSize)
		ctx.lineTo(xPos + shaddowOffset, yPos + blockSize - shaddowOffset)
		ctx.lineTo(xPos + shaddowOffset, yPos + shaddowOffset)
		ctx.closePath()
		ctx.fill()
	}

	/**
	 * Generates a random shape
	 */
	generateRandomShape() {
		const randomIndex = Math.round(Math.random() * (shapes.length - 1))
		this.blockStructure = shapes[randomIndex]
	}

	/**
	 * Generates a random color
	 */
	generateRandomColor() {
		const randomIndex = Math.round(Math.random() * (colors.length - 1))
		this.color = colors[randomIndex].main
		this.hintColor = colors[randomIndex].hint
	}

	/**
	 * Updates the drawing of the shape in the canvas
	 */
	update() {
		if (this.gameEngine.mousedown) {
			if (
				this.gameEngine.mousedown.x > this.x &&
				this.gameEngine.mousedown.x < this.x + this.blockSize * this.scale * 5 &&
				this.gameEngine.mousedown.y > this.y &&
				this.gameEngine.mousedown.y < this.y + this.blockSize * this.scale * 5
			) {
				this.active = true
				this.mouseX = this.gameEngine.mousedown.x
				this.mouseY = this.gameEngine.mousedown.y
				this.gameEngine.mousedown = null
			}
		}

		if (this.gameEngine.mousemove && this.active) {
			this.board.clearHintBlocks()
			this.board.clearSweepHint()
			if (this.canInsertIntoBoard()) {
				this.insertHintIntoBoard()
				this.board.sweepHint()
			}
		}

		if (this.gameEngine.mouseup && this.active) {
			this.board.clearSweepHint()
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
	 * Draws the shape in the canvas
	 */
	draw() {
		if (!this.active) {
			return this.bagDraw()
		}

		const ctx = this.gameEngine.ctx

		ctx.strokeStyle = '#000000ff'
		ctx.lineWidth = strokeWidth

		const rowSize = this.blockStructure.length
		const columnSize = this.blockStructure[0].length
		const offsetX = this.blockSize * 5 * (1 - this.scale) / 2
		const offsetY = this.blockSize * 5 * (1 - this.scale) / 2
		const mouseOffsetX = this.mouseX - this.gameEngine.mousemove.x
		const mouseOffsetY = this.mouseY - this.gameEngine.mousemove.y
		const touchOffset = this.gameEngine.mousemove.isTouch ? this.blockSize * 3 : 0
		const x = this.x - offsetX + (this.blockSize * 5 - columnSize * this.blockSize) / 2 - mouseOffsetX
		const y = this.y - offsetY + (this.blockSize * 5 - rowSize * this.blockSize) / 2 - mouseOffsetY - touchOffset

		for (const row in this.blockStructure) {
			for (const column in this.blockStructure[row]) {
				if (this.blockStructure[row][column]) {
					const xPos = x + column * this.blockSize
					const yPos = y + row * this.blockSize

					ctx.fillStyle = this.color
					ctx.beginPath()
					ctx.strokeRect(
						xPos - strokeOffset,
						yPos - strokeOffset,
						this.blockSize + strokeOffset * 2,
						this.blockSize + strokeOffset * 2
					)
					ctx.fillRect(x + column * this.blockSize, y + row * this.blockSize, this.blockSize, this.blockSize)

					Shape.drawShadow(ctx, xPos, yPos, this.blockSize, 15)
				}
			}
		}
	}

	/**
	 * Draws the shape in the bag
	 */
	bagDraw() {
		const ctx = this.gameEngine.ctx

		ctx.strokeStyle = '#000000ff'
		ctx.lineWidth = strokeWidth / 2

		const rowSize = this.blockStructure.length
		const columnSize = this.blockStructure[0].length
		const blockSize = this.blockSize * this.scale
		const x = this.x + (blockSize * 5 - columnSize * blockSize) / 2
		const y = this.y + (blockSize * 5 - rowSize * blockSize) / 2

		for (const row in this.blockStructure) {
			for (const column in this.blockStructure[row]) {
				if (this.blockStructure[row][column]) {
					const xPos = x + column * blockSize
					const yPos = y + row * blockSize

					ctx.fillStyle = this.color
					ctx.beginPath()
					ctx.strokeRect(
						xPos - strokeOffset / 2,
						yPos - strokeOffset / 2,
						blockSize + strokeOffset,
						blockSize + strokeOffset
					)
					ctx.fillRect(xPos, yPos, blockSize, blockSize)

					Shape.drawShadow(ctx, xPos, yPos, blockSize, 10)
				}
			}
		}
	}

	/**
	 * Checks if the shape can be inserted into the board
	 * @returns {boolean}
	 */
	canInsertIntoBoard() {
		const rowSize = this.blockStructure.length
		const columnSize = this.blockStructure[0].length
		const offsetX = this.blockSize * 5 * (1 - this.scale) / 2
		const offsetY = this.blockSize * 5 * (1 - this.scale) / 2
		const mouseOffsetX = this.mouseX - this.gameEngine.mousemove.x
		const mouseOffsetY = this.mouseY - this.gameEngine.mousemove.y
		const touchOffset = this.gameEngine.mousemove.isTouch ? this.blockSize * 3 : 0
		const x = this.x - offsetX + (this.blockSize * 5 - columnSize * this.blockSize) / 2 - mouseOffsetX
		const y = this.y - offsetY + (this.blockSize * 5 - rowSize * this.blockSize) / 2 - mouseOffsetY - touchOffset

		let canInsert = true

		for (const row in this.blockStructure) {
			for (const column in this.blockStructure[row]) {
				if (this.blockStructure[row][column]) {
					if (!this.board.empty(x + column * this.blockSize, y + row * this.blockSize)) {
						canInsert = false
					}
				}
			}
		}

		return canInsert
	}

	/**
	 * Inserts the shape into the board
	 */
	insertIntoBoard() {
		const rowSize = this.blockStructure.length
		const columnSize = this.blockStructure[0].length
		const offsetX = this.blockSize * 5 * (1 - this.scale) / 2
		const offsetY = this.blockSize * 5 * (1 - this.scale) / 2
		const mouseOffsetX = this.mouseX - this.gameEngine.mousemove.x
		const mouseOffsetY = this.mouseY - this.gameEngine.mousemove.y
		const touchOffset = this.gameEngine.mousemove.isTouch ? this.blockSize * 3 : 0
		const x = this.x - offsetX + (this.blockSize * 5 - columnSize * this.blockSize) / 2 - mouseOffsetX
		const y = this.y - offsetY + (this.blockSize * 5 - rowSize * this.blockSize) / 2 - mouseOffsetY - touchOffset

		for (const row in this.blockStructure) {
			for (const column in this.blockStructure[row]) {
				if (this.blockStructure[row][column]) {
					this.board.insertBlock(this.color, x + column * this.blockSize, y + row * this.blockSize)
				}
			}
		}
	}

	/**
	 * Inserts a hint into the board
	 */
	insertHintIntoBoard() {
		const rowSize = this.blockStructure.length
		const columnSize = this.blockStructure[0].length
		const offsetX = this.blockSize * 5 * (1 - this.scale) / 2
		const offsetY = this.blockSize * 5 * (1 - this.scale) / 2
		const mouseOffsetX = this.mouseX - this.gameEngine.mousemove.x
		const mouseOffsetY = this.mouseY - this.gameEngine.mousemove.y
		const touchOffset = this.gameEngine.mousemove.isTouch ? this.blockSize * 3 : 0
		const x = this.x - offsetX + (this.blockSize * 5 - columnSize * this.blockSize) / 2 - mouseOffsetX
		const y = this.y - offsetY + (this.blockSize * 5 - rowSize * this.blockSize) / 2 - mouseOffsetY - touchOffset

		for (const row in this.blockStructure) {
			for (const column in this.blockStructure[row]) {
				if (this.blockStructure[row][column]) {
					this.board.insertHintBlock(x + column * this.blockSize, y + row * this.blockSize, this.hintColor)
				}
			}
		}
	}
}

export default Shape