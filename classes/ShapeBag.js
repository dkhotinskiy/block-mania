import Shape from './Shape.js'
import Entity from './Entity.js'

class ShapeBag extends Entity {
	constructor(gameEngine, board, x, y) {
		super(gameEngine, x, y, 0, 0)

		/**
		 * The game engine
		 * @type {GameEngine}
		 */
		this.gameEngine = gameEngine

		/**
		 * The x-coordinate of the block bag
		 * @type {number}
		 */
		this.x = x

		/**
		 * The y-coordinate of the block bag
		 * @type {number}
		 */
		this.y = y

		/**
		 * The board
		 * @type {Board}
		 */
		this.board = board

		/**
		 * Flag to update and draw this entity last
		 */
		this.updateLast = true

		/**
		 * The bag of blocks
		 * @type {Array.<Shape>}
		 */
		this.bag = []

		this.fillBag()
	}

	/**
	 * Updates the block bag
	 */
	update() {
		// Remove blocks that should be removed
		this.bag = this.bag.filter(block => !block.removeFromWorld)

		// Fill the bag if it is empty
		if (this.bag.length == 0) {
			this.fillBag()
		}
	}

	/**
	 * Draws the block bag
	 */
	draw() {}

	/**
	 * Fills the bag with blocks
	 */
	fillBag() {
		if (this.bag.length > 0) return

		// Fill the bag with 3 random blocks
		for (let i = 0; i < 3; i++) {
			const shape = new Shape(
				this.gameEngine,
				this.board,
				'random',
				'random',
				this.x + 312.5 * i,
				this.y + 25,
				this.board.getBlockSize(),
				275 / 5 / this.board.getBlockSize()
			)

			this.bag.push(shape)
			this.gameEngine.addEntity(shape)
		}
	}
}

export default ShapeBag