import GameEngine from './GameEngine.js'

class Entity {
	/**
	 * Create a new obstacle
	 * @param {CanvasRenderingContext2D} gameEngine - The context of the canvas
	 * @param {number} x - The x coordinate of the entity
	 * @param {number} y - The y coordinate of the entity
	 * @param {number} size - The size of the entity
	 * @param {number} scale - The scale of the entity
	 */
	constructor(gameEngine, x = 0, y = 0, size = 80, scale = 1) {
		/**
		 * The game engine of the entity
		 * @type {GameEngine}
		 */
		this.gameEngine = gameEngine

		/**
		 * The x coordinate of the entity
		 * @type {number}
		 */
		this.x = x

		/**
		 * The y coordinate of the entity
		 * @type {number}
		 */
		this.y = y

		/**
		 * The size of the entity
		 * @type {number}
		 */
		this.size = size

		/**
		 * The scale of the entity
		 * @type {number}
		 */
		this.scale = scale

		/**
		 * The boolean to check if the entity should be removed from the world
		 * @type {boolean}
		 */
		this.removeFromWorld = false
	}
}

export default Entity