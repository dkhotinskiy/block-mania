import Block from './Block.js'
import Entity from './Entity.js'

class BlockBag extends Entity {
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
		 * @type {Array.<Block>}
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
		this.bag = []
		for (let i = 0; i < 3; i++) {
			const block = new Block(
				this.gameEngine,
				this.board,
				'random',
				'random',
				this.x + 312.5 * i,
				this.y + 25,
				this.board.blockSize(),
				275 / 5 / this.board.blockSize()
			)

			this.bag.push(block)
			this.gameEngine.addEntity(block)
		}
	}
}

export default BlockBag