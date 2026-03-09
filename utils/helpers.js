function drawVertices(vertices) {
    beginShape();
    for (var i = 0; i < vertices.length; i++) {
        vertex(vertices[i].x, vertices[i].y);
    }
    endShape(CLOSE);
}

let mousePosition = { x: 0, y: 0 }; // Mouse position
let previousMousePosition = { x: 0, y: 0 }; // Previous mouse position
let currentCueDirection = null; // Current cue direction
let mouseSpeed = 0; // Mouse movement speed

// Function to calculate direction and position at the edge of the ball
function calculateCueDirection(dKeyHeld) {
    const ball = snooker.snookerBalls[0];
    let cueBallPosition = ball.body.position; // Ball position
    
    // Calculate mouse movement speed
    let currentMousePos = createVector(mouseX, mouseY);
    let prevMousePos = createVector(previousMousePosition.x, previousMousePosition.y);
    mouseSpeed = p5.Vector.dist(currentMousePos, prevMousePos);
      let targetDirection;
    
    // If we are in aiming mode, use the fixed direction
    if (inputHandler.isAiming() && inputHandler.aimingStartDirection) {
        targetDirection = inputHandler.aimingStartDirection.copy();
        mousePosition = createVector(
            cueBallPosition.x + targetDirection.x * 200,
            cueBallPosition.y + targetDirection.y * 200
        );
    } else {
        if (dKeyHeld) {
            mousePosition = currentMousePos;
        }
        
        // Calculate the target cue direction
        targetDirection = createVector(mousePosition.x - cueBallPosition.x, mousePosition.y - cueBallPosition.y);
        targetDirection.normalize();
    }
    
    // If this is the first frame, initialize the current direction
    if (currentCueDirection === null) {
        currentCueDirection = targetDirection.copy();
    }
      // Calculate smoothing coefficient based on mouse speed
    // The faster the mouse moves, the faster the cue follows
    let baseSmoothing = GameConfig.CUE_CONTROL.BASE_SMOOTHING;
    let speedMultiplier = mouseSpeed * GameConfig.CUE_CONTROL.SPEED_SENSITIVITY;
    let dynamicSmoothing = Math.min(baseSmoothing + speedMultiplier, GameConfig.CUE_CONTROL.MAX_SMOOTHING);
    
    // Apply smoothing taking speed into account
    currentCueDirection.lerp(targetDirection, dynamicSmoothing);
      // Calculate cue position based on distance
    let cueDistance = inputHandler.isAiming() ? inputHandler.getCueDistance() : getCueLineLength();
    let edgePosition = createVector(
        cueBallPosition.x + currentCueDirection.x * (GameConfig.BALL.DIAMETER + cueDistance),
        cueBallPosition.y + currentCueDirection.y * (GameConfig.BALL.DIAMETER + cueDistance)
    );
    
    // Save current mouse position for the next frame
    previousMousePosition.x = currentMousePos.x;
    previousMousePosition.y = currentMousePos.y;

    return { directionToMouse: currentCueDirection, edgePosition, cueBallPosition };
}