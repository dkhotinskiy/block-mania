import gameProperties from './gameProperties.js'
import Board from './classes/Board.js'
import ShapeBag from './classes/ShapeBag.js'
import GameEngine from './classes/GameEngine.js'

// Initialize function for dinamically scalling the canvas to fit the window
const resizeCanvas = () => {
	const windowBounds = document.body.getBoundingClientRect()
	const verticalRatio = windowBounds.height / gameProperties.height
	const horizontalRatio = windowBounds.width / gameProperties.width
	const ratio = verticalRatio < horizontalRatio ? verticalRatio : horizontalRatio
	canvas.style.transform = `scale(${ratio})`
	document.body.dataset.ratio = ratio
}

const initGame = () => {
	// Set the size of the canvas
	canvas.height = gameProperties.height
	canvas.width = gameProperties.width

	// Initilize function to fit canvas to window and set it to run on page's resize
	resizeCanvas()
	document.body.onresize = resizeCanvas

	// Set image smoothing for the context
	ctx.imageSmoothingEnabled = gameProperties.imageSmoothing

	const gameEngine = new GameEngine(ctx)
	
	// Create a new board
	const board = new Board(gameEngine, gameProperties.boardSize)
	gameEngine.addEntity(board)

	// Create a new block bag
	const shapeBag = new ShapeBag(gameEngine, board, 90, 1530)
	gameEngine.addEntity(shapeBag)
	board.addBag(shapeBag)
}

// Set canvas and its context to variable
const canvas = document.querySelector('canvas')
const ctx = canvas?.getContext('2d')

// If the context is a CanvasRenderingContext2D, initialize the game
if (ctx instanceof CanvasRenderingContext2D) {
	initGame()
}