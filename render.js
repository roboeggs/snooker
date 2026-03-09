function drawCue() {
    let { directionToMouse, edgePosition } = calculateCueDirection(inputHandler.isDirectionModeActive());

    // Base cue length
    let baseLength = 400;
    
    // If we are in aiming mode, show the cue from its current position
    if (inputHandler.isAiming()) {
        let strikeForce = inputHandler.getCurrentStrikeForce();
        let cueDistance = inputHandler.getCueDistance();
        
        // Cue color depends on strike force (distance to the ball)
        let forceRatio = (GameConfig.CUE_CONTROL.CUE_AUTO_PULLBACK - cueDistance) / 
                        (GameConfig.CUE_CONTROL.CUE_AUTO_PULLBACK - GameConfig.CUE_CONTROL.CUE_MIN_DISTANCE);
        let forceIntensity = map(forceRatio, 0, 1, 0, 255);
        stroke(255, 255 - forceIntensity, 255 - forceIntensity); // From white to red
        
        // Cue is drawn from the current position backwards
        let cueVec = directionToMouse.copy().mult(baseLength);
        
        // Main line (cue)
        strokeWeight(6);
        line(
            edgePosition.x,
            edgePosition.y,
            edgePosition.x + cueVec.x,
            edgePosition.y + cueVec.y
        );
        
        // Additional force indicator - line from ball to cue
        stroke(255, 255, 255, 100);
        strokeWeight(2);
        let ball = snooker.snookerBalls[0];
        let ballPos = ball.body.position;
        line(ballPos.x, ballPos.y, edgePosition.x, edgePosition.y);
        
    } else {
        // Normal mode - cue follows the mouse
        stroke(GameConfig.COLORS.CUE);
        let cueVec = directionToMouse.copy().mult(baseLength);
        
        strokeWeight(5);
        line(
            edgePosition.x,
            edgePosition.y,
            edgePosition.x + cueVec.x,
            edgePosition.y + cueVec.y
        );
    }

    strokeWeight(0);
}

// Function to draw an arrow
function drawArrow(base, vec, len, myColor) {
    push();
    stroke(myColor);
    strokeWeight(2);
    fill(myColor);
    translate(base.x, base.y);
    let dir = vec.copy().normalize().mult(len);
    line(0, 0, dir.x, dir.y);
    // Draw arrowhead
    push();
    translate(dir.x, dir.y);
    rotate(dir.heading());
    let arrowSize = 10;
    triangle(0, 0, -arrowSize, arrowSize / 2, -arrowSize, -arrowSize / 2);
    pop();
    pop();
    
}

function getCollisionPoint(pos, dir, c) {
    let r = GameConfig.BALL.DIAMETER;
    let f = p5.Vector.sub(pos, c);
    let a = dir.dot(dir);
    let b = 2 * f.dot(dir);
    let c_val = f.dot(f) - r * r;
    let discriminant = b * b - 4 * a * c_val;
    if (discriminant < 0) return null;
    discriminant = sqrt(discriminant);
    let t1 = (-b - discriminant) / (2 * a);
    let t2 = (-b + discriminant) / (2 * a);
    let t = (t1 > 0) ? t1 : ((t2 > 0) ? t2 : null);
    if (t === null) return null;
    let point = p5.Vector.add(pos, p5.Vector.mult(dir, t));
    return { point: point, dist: t * dir.mag() };
}

function drawBallAndCheckMovement(ball, status) {
    ball.draw(); // Draw the ball
    if (ball.isMoving() && status) {
        status = false; // If at least one ball is moving, set status to false
    }
    return status;
}

function drawSnookerBalls() {
    // Check intersections with balls
    let hitInfo = null;
    let minDist = Infinity;
    let collisionPoint;
    let hitBallIdx = -1;
    let vectorLen = 400; // increased vector length


    let { directionToMouse, edgePosition } = calculateCueDirection(inputHandler.isDirectionModeActive());


    let v = createVector(directionToMouse.x, directionToMouse.y).mult(-1);
    const mainBallPos = snooker.snookerBalls[0].body.position;
    const mainBall = createVector(mainBallPos.x, mainBallPos.y);

    let vectorLength = 400;

    let status = drawBallAndCheckMovement(snooker.snookerBalls[0], true); // Draw the main ball and check its movement


    for (let i = 1; i < snooker.snookerBalls.length; i++) {
        if (snooker.isPlaingPhase()) {
            let ballPos = snooker.snookerBalls[i].body.position;
            let ballVec = createVector(ballPos.x, ballPos.y);
            let b = ballVec;
            let res = getCollisionPoint(mainBall, v, b);
            if (res && res.dist < minDist && res.dist > 0) {
                minDist = res.dist;
                collisionPoint = res.point;
                hitBallIdx = i;
            }
        }

        status = drawBallAndCheckMovement(snooker.snookerBalls[i], status); // Draw other balls and check their movement
    }    if (status && snooker.getCurrentPlayerStrikeState()) {
        snooker.gameStateManager.switchToNextPhase(); // Set game phase if all balls have stopped
        console.log('✅ All balls have stopped. Analyzing the result of the shot...');
    }



    // Draw vector and trajectories
    // Backward line
    stroke(GameConfig.COLORS.CUE_GUIDE);
    strokeWeight(2);

    let vecEnd;
    if (collisionPoint) {
        // Up to collision
        vecEnd = collisionPoint;
        line(mainBall.x, mainBall.y, vecEnd.x, vecEnd.y);

        // After collision — calculate reflection
        let hitBallPos = snooker.snookerBalls[hitBallIdx].body.position;
        let hitBall = createVector(hitBallPos.x, hitBallPos.y);
        let n = p5.Vector.sub(hitBall, collisionPoint).normalize(); // normal
        let incoming = p5.Vector.sub(collisionPoint, mainBall).normalize();



        // Show collision point
        noStroke();
        fill('rgb(253, 253, 253)');
        ellipse(collisionPoint.x, collisionPoint.y, 10, 10);

        noFill();
        stroke(255);
        strokeWeight(2);
        ellipse(hitBall.x, hitBall.y, GameConfig.BALL.DIAMETER * 2, GameConfig.BALL.DIAMETER * 2);

        // Visualize the normal as an arrow
        drawArrow(hitBall, n, 200, color('rgb(255, 255, 255)'));
    }


    strokeWeight(0);
}

function drawTable() {
    background(GameConfig.COLORS.TABLE);

    noFill();
    stroke(255);
    strokeWeight(2);
    arc(arcCenter.x, arcCenter.y, GameConfig.ARC.DIAMETER, GameConfig.ARC.DIAMETER, PI / 2, -PI / 2);
    line(arcCenter.x, GameConfig.TABLE.BORDER_OFFSET_Y + GameConfig.BALL.DIAMETER, arcCenter.x, height - GameConfig.TABLE.BORDER_OFFSET_Y - GameConfig.BALL.DIAMETER); // The line passes through the center of the semicircle
    strokeWeight(0);
}


function drawHoles() {
    fill('rgb(255, 196, 4)'); // Pocket color
    rect(0, 0, GameConfig.POCKET.DIAMETER, GameConfig.POCKET.DIAMETER); // Semicircle in the center of the table
    rect(0, height - GameConfig.TABLE.BORDER_OFFSET_Y - GameConfig.BALL.DIAMETER / 2 + 3, GameConfig.POCKET.DIAMETER, GameConfig.POCKET.DIAMETER); // Semicircle in the center of the table
    rect(width - GameConfig.TABLE.BORDER_OFFSET_X - GameConfig.BALL.DIAMETER / 2 + 3, 0, GameConfig.POCKET.DIAMETER, GameConfig.POCKET.DIAMETER); // Semicircle in the center of the table
    rect(width - GameConfig.TABLE.BORDER_OFFSET_X - GameConfig.BALL.DIAMETER / 2 + 3, height - GameConfig.TABLE.BORDER_OFFSET_Y - GameConfig.BALL.DIAMETER / 2 + 3, GameConfig.POCKET.DIAMETER, GameConfig.POCKET.DIAMETER); // Semicircle in the center of the table
    rect(width / 2 - GameConfig.POCKET.DIAMETER / 2, 0, GameConfig.POCKET.DIAMETER, GameConfig.POCKET.DIAMETER / 2); // Semicircle in the center of the table
    rect(width / 2 - GameConfig.POCKET.DIAMETER / 2, height - GameConfig.TABLE.BORDER_OFFSET_Y , GameConfig.POCKET.DIAMETER, GameConfig.POCKET.DIAMETER); // Semicircle in the center of the table
    

    // pockets
    fill(0);

    ellipse(GameConfig.TABLE.BORDER_OFFSET_X + GameConfig.BALL.DIAMETER / 2, GameConfig.TABLE.BORDER_OFFSET_Y + GameConfig.BALL.DIAMETER / 2, GameConfig.POCKET.DIAMETER, GameConfig.POCKET.DIAMETER); // Semicircle in the center of the table
    ellipse(GameConfig.TABLE.BORDER_OFFSET_X + GameConfig.BALL.DIAMETER / 2, height - GameConfig.TABLE.BORDER_OFFSET_Y - GameConfig.BALL.DIAMETER / 2, GameConfig.POCKET.DIAMETER, GameConfig.POCKET.DIAMETER); // Semicircle in the center of the table
    ellipse(width - GameConfig.TABLE.BORDER_OFFSET_X - GameConfig.BALL.DIAMETER / 2, GameConfig.TABLE.BORDER_OFFSET_Y + GameConfig.BALL.DIAMETER / 2, GameConfig.POCKET.DIAMETER, GameConfig.POCKET.DIAMETER); // Semicircle in the center of the table
    ellipse(width - GameConfig.TABLE.BORDER_OFFSET_X - GameConfig.BALL.DIAMETER / 2, height - GameConfig.TABLE.BORDER_OFFSET_Y - GameConfig.BALL.DIAMETER / 2, GameConfig.POCKET.DIAMETER, GameConfig.POCKET.DIAMETER); // Semicircle in the center of the table

    ellipse(width / 2, GameConfig.TABLE.BORDER_OFFSET_Y, GameConfig.POCKET.DIAMETER, GameConfig.POCKET.DIAMETER); // Semicircle in the center of the table
    ellipse(width / 2, height - GameConfig.TABLE.BORDER_OFFSET_Y, GameConfig.POCKET.DIAMETER, GameConfig.POCKET.DIAMETER); // Semicircle in the center of the table
    
    
}

function drawBorders() {
    fill(GameConfig.COLORS.BORDER);
    drawVertices(borderTrapezoidLeft.vertices);
    drawVertices(borderTrapezoidRight.vertices);

    drawVertices(borderTrapezoidTopLeft.vertices);
    drawVertices(borderTrapezoidTopRight.vertices);

    drawVertices(borderTrapezoidBottomLeft.vertices);
    drawVertices(borderTrapezoidBottomRight.vertices);

}

function drawBoard() {
    fill(GameConfig.COLORS.BOARD);
    rect(0, 0, GameConfig.TABLE.BORDER_OFFSET_X, height);
    rect(width - GameConfig.TABLE.BORDER_OFFSET_X, 0, GameConfig.TABLE.BORDER_OFFSET_X, height);
    rect(0, 0, width, GameConfig.TABLE.BORDER_OFFSET_Y);
    rect(0, height - GameConfig.TABLE.BORDER_OFFSET_Y, width, GameConfig.TABLE.BORDER_OFFSET_Y);
}


function draw() {

    drawTable();
    drawBorders();
    drawBoard();
    drawHoles();
    
    
    drawSnookerBalls();
    

    if (snooker.gameStateManager.isPlacingCuePhase()) {
        followMouseWithCueBall(); // Make the cue ball follow the mouse
        cursor(HAND);
    } else {
        if (snooker.gameStateManager.isPlayingPhase()) {
            if (snooker.basket.length > 0) {
                snooker.checkBasket();
            }
            else { // if the basket is empty, check for a valid shot                // check if cueball touched another ball
                if (snooker.isValidShot === false) {
                    snooker.gameStateManager.reset(); // Reset game state
                    console.log('❌ FOUL! Cue ball did not touch any ball!');
                    snooker.switchPlayerWithFoul(); // Switch player with foul
                    changeStatusLoc = false; // Reset state change flag
                    snooker.isValidShot = true; // Reset valid shot flag
                }                else // player just missed, switch to the other
                {
                    if (snooker.getCurrentPlayerStrikeState()) {
                        console.log('💭 Miss! No ball was potted. Turn passes to the opponent.');
                        snooker.gameStateManager.reset();
                        snooker.switchPlayer();
                    }
                }
            }


            snooker.collisionWith = null; // Reset after check
            drawCue();
        } else // means the player has struck
        {
            // snooker.setCurrentPlayerStruck();
            // snooker.gameStateManager.shotMade();
            snooker.setCurrentPlayerStruck();
            // snooker.setCurrentPlayerStruck(); // Set that the current player has struck
        }
    }
    textSize(22);
    fill("rgb(245, 245, 245)");
    text("Current player: " + snooker.currentPlayer.name, 80, 22);
    const id = snooker.gameStateManager.targetBallType;
    const color = id.replace(/_ball$/, '').toUpperCase();
    // fill(180, 50, 50);
    text("Target: " + color, 350, 22);

    // Display player scores
    fill(255, 255, 100); // Yellow color for scores
    text("(" + snooker.player1.name + ")" + " " + snooker.player1.score +
        " : " + snooker.player2.score + " (" + snooker.player2.name + ")", 700, 22);

    checkBallsOutOfBounds();

    Engine.update(engine, 1000 / 60);
}