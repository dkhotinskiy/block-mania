import Board from './Board.js'

class Block {
	/**
	 * Creates a block
	 * @param {string} color - The color of the block
	 * @param {boolean} shaddow - Whether it is a shaddow
	 */
	constructor(color, hint = false, rowIndex = null, columnIndex = null) {
		/**
		 * The color of the block
		 * @type {string}
		 */
		this.color = color

		/**
		 * Whether the block is a hint
		 * @type {boolean}
		 */
		this.hint = hint

		/**
		 * The y position of the block
		 * @type {number}
		 */
		this.rowIndex = rowIndex

		/**
		 * The x position of the block
		 * @type {number}
		 */
		this.columnIndex = columnIndex

		/**
		 * Stage of the sweep
		 * @type {number}
		 */
		this.sweepStage = null
	}

	/**
	 * Sweeps the block out
	 * @param {Board} board - The board of the game
	 * @param {number} order - The order of the sweep
	 */
	sweepOut(board, order) {
		if (this.sweepStage === null) {
			board.elementsToSweep.push(this)
			this.sweepStage = order
		} else if (this.sweepStage < order) {
			this.sweepStage = order
		}
	}
}

export default Block