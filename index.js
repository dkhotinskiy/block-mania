import gameProperties from './gameProperties.js'
import Board from './classes/Board.js'
import ShapeBag from './classes/ShapeBag.js'
import GameEngine from './classes/GameEngine.js'

// Initialize function for dinamically scalling the canvas to fit the window
const resizeCanvas = () => {
	const windowBounds = document.body.getBoundingClientRect()
	const computedStyle = getComputedStyle(document.body)
	const height = windowBounds.height - parseFloat(computedStyle.paddingTop) - parseFloat(computedStyle.paddingBottom)
	const width = windowBounds.width - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight)

	const verticalRatio = height / gameProperties.height
	const horizontalRatio = width / gameProperties.width
	const ratio = verticalRatio < horizontalRatio ? verticalRatio : horizontalRatio
	canvas.style.transform = `scale(${ratio})`
	document.body.dataset.ratio = ratio
}

const initGame = () => {
	// Set the background color of the body and canvas
	document.body.style.backgroundColor = gameProperties.backgroundColor
	canvas.style.backgroundColor = gameProperties.backgroundColor

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
	const board = new Board(gameEngine, gameProperties.boardSize, 500)
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