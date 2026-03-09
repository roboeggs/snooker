let borderTrapezoidLeft,
    borderTrapezoidRight,
    borderTrapezoidTopLeft,
    borderTrapezoidTopRight,
    borderTrapezoidBottomLeft,
    borderTrapezoidBottomRight;

let holes;

function setupBorders() {
    const borderPhysicsParams = {
        label: 'cushion',
        isStatic: true, // Borders remain static
        restitution: 1.0, // Increase elasticity for stiffness
        friction: 0.5, // Add friction
        frictionStatic: 0.5, // Add static friction
        density: 10 // Increase density for more stability
    };

    const slopeTD = 0.06;
    const slopeLR = 0.08;


    const borderSize = GameConfig.BALL.DIAMETER / 2;
    // changed
    borderTrapezoidLeft = Bodies.trapezoid(
        GameConfig.TABLE.BORDER_OFFSET_X - 7,
        height / 2,
        GameConfig.TABLE.HEIGHT,
        GameConfig.TABLE.BORDER_OFFSET_X + borderSize,
        slopeLR,
        { ...borderPhysicsParams, angle: Math.PI * 0.5 }
    );

    borderTrapezoidRight = Bodies.trapezoid(
        width - GameConfig.TABLE.BORDER_OFFSET_X + 7,
        height / 2,
        GameConfig.TABLE.HEIGHT,
        GameConfig.TABLE.BORDER_OFFSET_X + borderSize,
        slopeLR,
        { ...borderPhysicsParams, angle: -Math.PI * 0.5 }
    );

    borderTrapezoidTopLeft = Bodies.trapezoid(
        GameConfig.TABLE.WIDTH / 4 + GameConfig.TABLE.BORDER_OFFSET_X + borderSize - 2,
        GameConfig.TABLE.BORDER_OFFSET_Y - 7,
        GameConfig.TABLE.WIDTH / 2 - borderSize,
        GameConfig.TABLE.BORDER_OFFSET_Y + borderSize,
        slopeTD,
        { ...borderPhysicsParams, angle: -Math.PI }
    );

    borderTrapezoidTopRight = Bodies.trapezoid(
        3 * GameConfig.TABLE.WIDTH / 4 + GameConfig.TABLE.BORDER_OFFSET_X + borderSize + 2,
        GameConfig.TABLE.BORDER_OFFSET_Y - 7,
        GameConfig.TABLE.WIDTH / 2 - borderSize,
        GameConfig.TABLE.BORDER_OFFSET_Y + borderSize,
        slopeTD,
        { ...borderPhysicsParams, angle: -Math.PI }
    );

    borderTrapezoidBottomLeft = Bodies.trapezoid(
        GameConfig.TABLE.WIDTH / 4 + GameConfig.TABLE.BORDER_OFFSET_X + borderSize - 2,
        height - GameConfig.TABLE.BORDER_OFFSET_Y + 7,
        GameConfig.TABLE.WIDTH / 2 - borderSize,
        GameConfig.TABLE.BORDER_OFFSET_Y + borderSize,
        slopeTD,
        { ...borderPhysicsParams }
    );

    borderTrapezoidBottomRight = Bodies.trapezoid(
        3 * GameConfig.TABLE.WIDTH / 4 + GameConfig.TABLE.BORDER_OFFSET_X + borderSize + 2,
        height - GameConfig.TABLE.BORDER_OFFSET_Y + 7,
        GameConfig.TABLE.WIDTH / 2 - borderSize,
        GameConfig.TABLE.BORDER_OFFSET_Y + borderSize,
        slopeTD,
        { ...borderPhysicsParams }
    );

    World.add(
        engine.world,
        [
            borderTrapezoidLeft,
            borderTrapezoidRight,
            borderTrapezoidTopLeft,
            borderTrapezoidTopRight,
            borderTrapezoidBottomLeft,
            borderTrapezoidBottomRight
        ]
    );
}

function setupHoles() {
    const holeRadius = GameConfig.POCKET.DIAMETER / 6; // Pocket radius
    const holesPhysicsParams = {
        label: 'hole',
        isStatic: true,
        isSensor: true // Sensor does not affect physics
    };

    // Create an array of pockets with Matter.js
    holes = [
        Matter.Bodies.circle(GameConfig.TABLE.BORDER_OFFSET_X + GameConfig.BALL.DIAMETER / 2, GameConfig.TABLE.BORDER_OFFSET_Y + GameConfig.BALL.DIAMETER / 2, holeRadius, holesPhysicsParams),
        Matter.Bodies.circle(GameConfig.TABLE.BORDER_OFFSET_X + GameConfig.BALL.DIAMETER / 2, height - GameConfig.TABLE.BORDER_OFFSET_Y - GameConfig.BALL.DIAMETER / 2, holeRadius, holesPhysicsParams),
        Matter.Bodies.circle(width - GameConfig.TABLE.BORDER_OFFSET_X - GameConfig.BALL.DIAMETER / 2, GameConfig.TABLE.BORDER_OFFSET_Y + GameConfig.BALL.DIAMETER / 2, holeRadius, holesPhysicsParams),
        Matter.Bodies.circle(width - GameConfig.TABLE.BORDER_OFFSET_X - GameConfig.BALL.DIAMETER / 2, height - GameConfig.TABLE.BORDER_OFFSET_Y - GameConfig.BALL.DIAMETER / 2, holeRadius, holesPhysicsParams),
        Matter.Bodies.circle(width / 2, GameConfig.TABLE.BORDER_OFFSET_Y, holeRadius, holesPhysicsParams),
        Matter.Bodies.circle(width / 2, height - GameConfig.TABLE.BORDER_OFFSET_Y, holeRadius, holesPhysicsParams)
    ];

    // Add pockets to the physics world
    holes.forEach(hole => Matter.World.add(engine.world, hole));
}


function setupSnookerBalls(key) {
    let ballsPos = [];
    const startX = 3 * distanceToSide + GameConfig.ARC.DIAMETER / 2; // Starting X position
    const startY = height / 2; // Starting Y position
    const spacing = GameConfig.BALL.DIAMETER + 5; // Distance between balls

    // Separate x and y values for colored balls
    const coloredBallXPositions = [
        distanceToSide, // Yellow
        distanceToSide, // Green
        distanceToSide, // Brown
        width / 2,      // Blue
        startX - spacing, // Pink
        startX + spacing * 7 // Black
    ];

    const coloredBallYPositions = [
        startY + GameConfig.ARC.DIAMETER / 2, // Yellow
        startY - GameConfig.ARC.DIAMETER / 2, // Green
        startY,                   // Brown
        startY,                   // Blue
        startY,                   // Pink
        startY                    // Black
    ];

    const coloredBallLabels = [
        'yellow_ball', 'green_ball', 'brown_ball', 'blue_ball', 'pink_ball', 'black_ball'
    ];

    const ballColors = [
        '#e3e3e3', // Cue ball
        '#b00505',  // 15 red balls
        '#e6e600', 'green', '#7a4b09', 'blue', '#ff8cc6', 'black' // Colored balls
    ];

    if (key === '1' || key === '2') {
        for (let i = 0; i < coloredBallLabels.length; i++) {
            ballsPos.push({ x: coloredBallXPositions[i], y: coloredBallYPositions[i] });
        }
        if (key === '1') {
            for (let row = 4; row >= 0; row--) {
                for (let col = 0; col <= row; col++) {
                    let x = startX + row * spacing;
                    let y = startY + col * spacing - (row * spacing) / 2;
                    ballsPos.push({x, y});
                }
            }            console.log('🎱 Mode 1: Classic starting ball positions');
        }else {
            ballsPos = myRandom(ballsPos);
            console.log('🎲 Mode 2: Random positions for red balls only');
        }
    } else if (key === '3') {1
        console.log('🎯 Mode 3: Random positions for all balls');
        ballsPos = myRandom(ballsPos);
    }


    // Add cue ball properties
    snooker.snookerBalls.push(
        new SnookerBall(200, height / 2,GameConfig.BALL.RADIUS, ballColors[0],  'cue_ball' )
    );
    
    // Add colored ball properties
    for (let i = 0; i < coloredBallLabels.length; i++) {
        const x = ballsPos[i].x;
        const y = ballsPos[i].y;
        const label = coloredBallLabels[i];
        snooker.snookerBalls.push(
            new SnookerBall(x, y, GameConfig.BALL.RADIUS, ballColors[2 + i],  label )
        );
    }

    // Add red ball properties
    for (let i = coloredBallLabels.length; i < 21; i++) {
        const x = ballsPos[i].x;
        const y = ballsPos[i].y;
        snooker.snookerBalls.push(
            new SnookerBall(x, y, GameConfig.BALL.RADIUS, ballColors[1],  'red_ball' )
        );
    }

    // Unfreeze the cue ball
    snooker.snookerBalls[0].unfreeze();
}


function myRandom(ballArray) {
    let numBalls = 21;
    const minX = GameConfig.TABLE.BORDER_OFFSET_X + GameConfig.BALL.DIAMETER, maxX = GameConfig.TABLE.WIDTH;
    const minY = GameConfig.TABLE.BORDER_OFFSET_Y + GameConfig.BALL.DIAMETER, maxY = GameConfig.TABLE.HEIGHT;
    for (let i = ballArray.length; i < numBalls; i++) {
        let valid = false;
        let tries = 0;
        let x, y;
        while (!valid && tries < 2000) {
            x = random(minX, maxX);
            y = random(minY, maxY);
            valid = true;
            for (let j = 0; j < ballArray.length; j++) {
                let dx = x - ballArray[j].x;
                let dy = y - ballArray[j].y;
                let dist = sqrt(dx * dx + dy * dy);
                if (dist < GameConfig.BALL.DIAMETER) { // if the distance is less than the sum of the radii, there is an overlap
                    valid = false;
                    break;
                }
            }
            tries++;
        }
        if (!valid) {
            // Could not place without overlaps
            break;
        }
        ballArray.push({ x: x, y: y });
    }
    return ballArray;
}