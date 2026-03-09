var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Composites = Matter.Composites;

var engine;

let snooker; // main class responsible for all game logic
let inputHandler; // class for handling user input

// Game field configuration
let arcCenter;

const borderIndentX = 2 * (GameConfig.TABLE.BORDER_OFFSET_X + GameConfig.BALL.RADIUS);
const borderIndentY = 2 * (GameConfig.TABLE.BORDER_OFFSET_Y + GameConfig.BALL.RADIUS);

const distanceToSide = GameConfig.ARC.RADIUS + GameConfig.TABLE.BORDER_OFFSET_X + GameConfig.BALL.DIAMETER + GameConfig.TABLE.WIDTH / 8;



function setup() {
    // create an engine
    engine = Engine.create();
    // disable gravity
    engine.world.gravity.x = 0;
    engine.world.gravity.y = 0;
    createCanvas(GameConfig.TABLE.WIDTH + borderIndentX, GameConfig.TABLE.HEIGHT + borderIndentY);
    arcCenter = createVector(distanceToSide, height / 2);


    snooker = new GameLogic(engine);
    snooker.gameStateManager.startGame();
    
    console.log('🎮 Snooker game started!');
    console.log('📋 CONTROLS:');
    console.log('   • 1, 2, 3 - select ball arrangement mode');
    console.log('   • D - toggle aiming mode');
    console.log('   • Mouse - aim and set strike force');
    console.log('🎯 GOAL: Pot the red balls, then the colored balls in order!');


    inputHandler = new InputHandler(snooker); // Create InputHandler instance

    setupPhysics();
    setupBorders();
    setupHoles();
    setupSnookerBalls('1'); // Default to mode 1
}


function mouseReleased() {
    inputHandler.handleMouseReleased();
}

function mousePressed() {
    inputHandler.handleMousePressed();
}

function mouseDragged() {
    inputHandler.handleMouseDragged();
}

function keyPressed() {
    inputHandler.handleKeyPressed(key, keyCode);
}

// Add function to access direction mode state
function isDirectionModeActive() {
    return inputHandler.dKeyHeld;
}

// Add function to access cue line length
function getCueLineLength() {
    return inputHandler.cueLineLength;
}