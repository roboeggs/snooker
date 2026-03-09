function followMouseWithCueBall() {
    const mousePosition = createVector(mouseX, mouseY);
    const arcRadius = GameConfig.ARC.DIAMETER / 2; // Arc radius
    let ballPosition;
    // Calculate distance from mouse to arc center
    let distance = dist(mousePosition.x, mousePosition.y, arcCenter.x, arcCenter.y);

    // Check if mouse is inside the restricted area
    if (distance < arcRadius && mousePosition.x < arcCenter.x + arcRadius) {
        ballPosition = mousePosition.copy(); // Update ball position
    } else {
        // Restrict the ball by boundaries
        if (distance >= arcRadius) {
            let direction = p5.Vector.sub(mousePosition, arcCenter).normalize(); // Direction vector
            ballPosition = p5.Vector.add(arcCenter, direction.mult(arcRadius));
        }
    }
    if (mousePosition.x >= arcCenter.x) {
        ballPosition.x = arcCenter.x; // Limit line on the right
    }
    const cueBall = snooker.snookerBalls[0];
    Matter.Body.setPosition(cueBall.body, ballPosition);

}

function checkBallsOutOfBounds() {
    snooker.snookerBalls.forEach(ball => {
        const pos = ball.body.position;
        // Check if the ball is out of canvas bounds (taking ball radius into account)
        if (
            pos.x - GameConfig.BALL.RADIUS < 0 ||
            pos.x + GameConfig.BALL.RADIUS > GameConfig.TABLE.WIDTH + borderIndentX ||
            pos.y - GameConfig.BALL.RADIUS < 0 ||
            pos.y + GameConfig.BALL.RADIUS > GameConfig.TABLE.HEIGHT + borderIndentY
        ) {
            Matter.Body.setVelocity(ball.body, { x: 0, y: 0 });
        }
    });
}

// Function to process collision pairs
function processCollisionPairs(pairs) {
    const ballRegex = /_ball$/;

    pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        snooker.handleBallCollision(bodyA, bodyB);
        
        // Check collision of cue ball with cushion
        if ((bodyA.label === 'cue_ball' && bodyB.label === 'cushion') || 
            (bodyA.label === 'cushion' && bodyB.label === 'cue_ball')) {
            console.log('The cue ball touched the cushion!');
            // You can add a visual notification or sound
            if (typeof showNotification === 'function') {
                showNotification('The cue ball touched the cushion!', 'warning');
            }
        }
        
        if ((ballRegex.test(bodyA.label) && bodyB.label === 'hole') || 
            (bodyA.label === 'hole' && ballRegex.test(bodyB.label))) {
            const ballObject = ballRegex.test(bodyA.label) ? bodyA : bodyB;

            snooker.basket.push(ballObject);
            // Hide the ball: make it invisible
            ballObject.render.visible = false;
            // const minVelovocity = 0.01; // Minimum velocity to reset the ball
            Matter.Body.setPosition(ballObject, { x: -100, y: -100 });
            
            Matter.Body.setVelocity(ballObject, { x: 0, y: 0 }); // Reset velocity

        }
    });
}

// Main setupPhysics function
function setupPhysics() {
    Matter.Events.on(engine, 'collisionStart', function (event) {
        const pairs = event.pairs; // Array of colliding pairs
        processCollisionPairs(pairs);
    });
}