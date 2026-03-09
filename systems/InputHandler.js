class InputHandler {
    constructor(gameLogic) {
        this.gameLogic = gameLogic;
        this.mouseStart = null;
        this.cueLineLength = 0;
        this.dKeyHeld = false;
        this.mouseVelocity = createVector(0, 0);
        this.previousMousePosition = createVector(0, 0);
        this.velocityHistory = []; // Velocity history for smoothing
        this.maxVelocityHistory = 5; // Number of frames for averaging
        this.cueDistance = 0; // Current cue distance from the ball
        this.isAimingMode = false; // Aiming mode
        this.aimingStartDirection = null; // Direction at the start of aiming
    } handleMousePressed() {
        if (this.gameLogic.gameStateManager.isPlayingPhase()) {
            this.mouseStart = createVector(mouseX, mouseY);
            this.previousMousePosition = createVector(mouseX, mouseY);
            this.velocityHistory = [];
            this.isAimingMode = true;

            // Automatically pull the cue back to a set distance
            this.cueDistance = GameConfig.CUE_CONTROL.CUE_AUTO_PULLBACK;

            // Remember the direction at the start of aiming
            const ball = this.gameLogic.snookerBalls[0];
            let cueBallPosition = ball.body.position;
            this.aimingStartDirection = createVector(mouseX - cueBallPosition.x, mouseY - cueBallPosition.y).normalize();
        }
    } handleMouseDragged() {
        if (this.gameLogic.gameStateManager.isPlayingPhase() && this.mouseStart && this.isAimingMode) {
            this.updateMouseVelocity();

            // Calculate the projection of mouse movement onto the cue direction vector
            const ball = this.gameLogic.snookerBalls[0];
            let cueBallPosition = ball.body.position;
            let currentMouse = createVector(mouseX, mouseY);

            // Vector from the ball to the current mouse position
            let ballToMouse = p5.Vector.sub(currentMouse, createVector(cueBallPosition.x, cueBallPosition.y));

            // Project onto the aiming direction
            let projectionLength = p5.Vector.dot(ballToMouse, this.aimingStartDirection);

            // Limit the cue distance
            this.cueDistance = constrain(
                projectionLength,
                GameConfig.CUE_CONTROL.CUE_MIN_DISTANCE,
                GameConfig.CUE_CONTROL.MAX_CUE_DISTANCE
            );

            // For compatibility with the old system
            this.cueLineLength = this.cueDistance;
        }
    }

    updateMouseVelocity() {
        let currentMouse = createVector(mouseX, mouseY);
        let velocity = p5.Vector.sub(currentMouse, this.previousMousePosition);

        // Add current velocity to history
        this.velocityHistory.push(velocity.mag());

        // Limit history size
        if (this.velocityHistory.length > this.maxVelocityHistory) {
            this.velocityHistory.shift();
        }

        // Calculate average velocity for smoothing
        let avgVelocity = this.velocityHistory.reduce((sum, vel) => sum + vel, 0) / this.velocityHistory.length;
        this.mouseVelocity = velocity.copy().normalize().mult(avgVelocity);

        this.previousMousePosition = currentMouse.copy();
    } handleMouseReleased() {
        if (this.gameLogic.gameStateManager.isPlacingCuePhase()) {
            this.handleCueBallPlacement();
        } else if (this.gameLogic.gameStateManager.isPlayingPhase()) {
            this.handleCueStrike();
            this.gameLogic.gameStateManager.shotMade(); // Switch to waiting phase

            // Reset aiming mode
            this.isAimingMode = false;
            this.cueDistance = 0;
            this.mouseStart = null;

        }

    }

    handleCueBallPlacement() {
        if (!this.gameLogic.checkCollision()) {
            this.gameLogic.gameStateManager.switchToNextPhase();
            console.log('✓ Cue ball placed! The game has started.');
            cursor(ARROW);
            this.gameLogic.unfreezeAllBalls();
        }
    }

    handleCueStrike() {
        const ball = this.gameLogic.snookerBalls[0];
        const { directionToMouse, cueBallPosition } = calculateCueDirection(this.dKeyHeld);

        const forceMagnitude = this.calculateStrikeForce();
        const force = {
            x: directionToMouse.x * forceMagnitude,
            y: directionToMouse.y * forceMagnitude
        };

        // Inform the player about the strike force
        const forcePercent = Math.min(Math.abs(forceMagnitude) / GameConfig.CUE_CONTROL.MAX_STRIKE_FORCE * 100, 100);
        let forceDescription = '';
        if (forcePercent < 25) forceDescription = 'very weak';
        else if (forcePercent < 50) forceDescription = 'weak';
        else if (forcePercent < 75) forceDescription = 'medium';
        else forceDescription = 'strong';

        console.log(`🎯 STRIKE! Force: ${forcePercent.toFixed(0)}% (${forceDescription})`);

        Matter.Body.applyForce(ball.body, cueBallPosition, force);
        this.cueLineLength = 0;
    } calculateStrikeForce() {
        // Force depends on how close the cue is to the ball (the closer, the stronger the strike)
        let distanceFromMax = GameConfig.CUE_CONTROL.CUE_AUTO_PULLBACK - this.cueDistance;
        let distanceRatio = distanceFromMax / (GameConfig.CUE_CONTROL.CUE_AUTO_PULLBACK - GameConfig.CUE_CONTROL.CUE_MIN_DISTANCE);

        // Also take into account the cue movement speed
        let velocityForce = this.mouseVelocity.mag() * GameConfig.CUE_CONTROL.VELOCITY_MULTIPLIER;
        let distanceForce = distanceRatio * 0.12; // Maximum force from position

        // Combine forces: cue position has higher priority
        let totalForce = distanceForce * 0.8 + velocityForce * 0.2;

        // Limit the maximum force
        totalForce = constrain(totalForce, 0, GameConfig.CUE_CONTROL.MAX_STRIKE_FORCE);

        return -1 * totalForce;
    }

    handleKeyPressed(key, keyCode) {
        const handlers = {
            '1': () => this.restartGame('1'),
            '2': () => this.restartGame('2'),
            '3': () => this.restartGame('3'),
            'd': () => this.toggleDirectionMode(),
            'D': () => this.toggleDirectionMode()
        };

        if (handlers[key]) {
            handlers[key]();
            return;
        }

    }

    restartGame(mode) {
        this.gameLogic.snookerBalls.forEach(ball => {
            World.remove(engine.world, ball.body);
        });

        this.gameLogic = new GameLogic(engine);
        this.gameLogic.gameStateManager.startGame();
        snooker = this.gameLogic; // Update global variable
        setupSnookerBalls(mode);

        console.log(`🔄 Game restarted in mode ${mode}!`);
    }

    toggleDirectionMode() {
        this.dKeyHeld = !this.dKeyHeld;
        console.log(`🎛️ Direction mode: ${this.dKeyHeld ? 'ON' : 'OFF'} ${this.dKeyHeld ? '(follows mouse)' : '(fixed direction)'}`);
    }

    isDirectionModeActive() {
        return this.dKeyHeld;
    }

    getCurrentStrikeForce() {
        if (this.isAimingMode && this.gameLogic.gameStateManager.isPlayingPhase()) {
            return Math.abs(this.calculateStrikeForce());
        }
        return 0;
    }

    isAiming() {
        return this.isAimingMode && this.gameLogic.gameStateManager.isPlayingPhase();
    }

    getCueDistance() {
        return this.cueDistance;
    }
}