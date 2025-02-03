import Timer from './Timer.js'
import Entity from './Entity.js'
import gameProperties from '../gameProperties.js'

/**
 * @typedef {Object} PositionalCoordinates
 * @property {number} x - The x coordinate
 * @property {number} y - The y coordinate
 */

/** Class representing a game engine */
class GameEngine {
	/**
	 * Create a new game engine
	 * @param {CanvasRenderingContext2D} ctx - The context of the canvas
	 * @param {AssetManager} assetManager - The asset manager of the game
	 */
	constructor(ctx) {
		/**
		 * The context of the canvas
		 * @type {CanvasRenderingContext2D}
		 */
		this.ctx = ctx

		/**
		 * Stores the coordinates of the mouse move event
		 * @type {PositionalCoordinates}
		 */
		this.mousemove = null

		/**
		 * Stores the coordinates of the mouse down event
		 * @type {PositionalCoordinates}
		 */
		this.mousedown = null

		/**
		 * Stores the coordinates of the mouse up event
		 * @type {PositionalCoordinates}
		 */
		this.mouseup = null

		/**
		 * The entities of the game
		 */
		this.entities = []

		// Initialize the input events and the timer of the game
		this.initInput()
	}

	/**
	 * Log a message to the console if debugging is enabled
	 * @param {string} message - The message to log
	 * @param {any} value - The debugging value to log
	 */
	debug(message = '', value) {
		if (!gameProperties.options.debugging) return

		if (value === undefined) {
			console.log(message)
		} else {
			console.log(message, value)
		}
	}

	/**
	 * Initializes the input events of the game
	 */
	initInput() {
		this.ctx.canvas.addEventListener('mousemove', e => {
			this.mousemove = this.getXY(e)
			this.debug('Mouse move event:', this.mousemove)
			this.updateEntities()
			this.draw()
		})

		this.ctx.canvas.addEventListener('mousedown', e => {
			this.mousedown = this.getXY(e)
			this.debug('Mouse down event:', this.mousedown)
			this.updateEntities()
			this.draw()
		})

		this.ctx.canvas.addEventListener('mouseup', e => {
			this.mousedown = null
			this.mouseup = this.getXY(e)
			this.debug('Mouse up event:', this.mouseup)
			this.updateEntities()
			this.draw()
			this.mouseup = null
		})
	}

	/**
	 * Get the coordinate position of the event
	 * @param {MouseEvent | WheelEvent | KeyboardEvent} e - The event
	 * @returns {PositionalCoordinates} The x and y coordinates of the event
	 */
	getXY(e) {
		if (!(
			e instanceof MouseEvent ||
			e instanceof WheelEvent ||
			e instanceof KeyboardEvent
		)) {
			throw new Error('The event must be an instance of MouseEvent, WheelEvent or KeyboardEvent', e)
		}

		const ratio = parseFloat(document.body.dataset.ratio)
		const { top, left } = this.ctx.canvas.getBoundingClientRect()
		const x = (e.clientX - left) / ratio
		const y = (e.clientY - top) / ratio
		return { x, y }
	}

	/**
	 * Add an entity to the game
	 * @param {Entity} entity - The entity to add
	 */
	addEntity(entity) {
		if (!(entity instanceof Entity)) {
			throw new Error('The entity must be an instance of Entity', entity)
		}

		this.entities.push(entity)
	}

	/**
	 * Remove an entity from the game
	 * @param {Entity} entity - The entity to remove
	 */
	removeEntity(entity) {
		if (!(entity instanceof Entity)) return

		this.entities = this.entities.filter(e => e !== entity)
	}

	/**
	 * Draw the entities of the game (starting from the last entity)
	 */
	draw() {
		// Clear the canvas
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)

		// Draw inactive entities first, in reverse order
		this.entities.slice().reverse().filter(entity => !entity.active && !entity.updateLast).forEach(entity => {
			entity.draw()
		})

		// Draw entities that should be updated last
		this.entities.filter(entity => entity.updateLast).forEach(entity => {
			entity.draw()
		})

		// Draw active entities last
		this.entities.filter(entity => entity.active).forEach(entity => {
			entity.draw()
		})
	}

	/**
	 * Update the entities of the game
	 */
	updateEntities() {
		this.entities.filter(entity => !entity.removeFromWorld && !entity.updateLast).forEach(entity => {
			entity.update()
		})


		this.entities.filter(entity => entity.updateLast).forEach(entity => {
			entity.update()
		})

		// Remove entities that should be removed
		this.entities = this.entities.filter(entity => !entity.removeFromWorld)
	}
}

export default GameEngine