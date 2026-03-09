class GameLogic {
    constructor(engine) {
        this.initializePlayers();
        this.initializeGameState();
        this.initializeBalls();
        this.engine = engine;
    }

    initializePlayers() {
        this.player1 = new Player("Player 1");
        this.player2 = new Player("Player 2");
        this.currentPlayer = this.player1;
    }

    initializeGameState() {
        this.gameStateManager = new GameStateManager(); // Game state manager

        this.isValidShot = true;
        this.collisionWith = null;
        this.basket = [];
    }

    initializeBalls() {
        this.snookerBalls = [];    }

    // Split complex methods into smaller ones
    handleBallCollision(bodyA, bodyB) {
        if (this.isBallToBallCollision(bodyA, bodyB) && this.collisionWith === null) {
            this.collisionWith = bodyB.label;
            
            // Informative collision message
            const ballBName = bodyB.label.replace('_ball', '').toUpperCase();
            const targetBallName = this.gameStateManager.targetBallType.replace('_ball', '').toUpperCase();
            
            console.log(`💥 COLLISION: Cue ball → ${ballBName} ball`);
            
            // Check if the correct ball was hit
            if (this.gameStateManager.isRedPhase() && bodyB.label === BALL_TYPES.RED) {
                console.log(`✅ CORRECT! You hit the red ball.`);
            } else if (this.gameStateManager.isColoredPhase() && bodyB.label !== BALL_TYPES.RED) {
                console.log(`✅ CORRECT! You hit the correct colored ball: ${ballBName}.`);
            } else if (this.gameStateManager.isRedPhase() && bodyB.label !== BALL_TYPES.RED) {
                console.log(`❌ ERROR! You must hit the red ball, but you hit ${ballBName}.`);
            } else if (this.gameStateManager.isColoredPhase() && bodyB.label === BALL_TYPES.RED) {
                console.log(`❌ ERROR! You must hit the ${targetBallName} ball, but you hit ${ballBName}.`);
            }
    
            if (this.isInvalidShot(bodyB.label)) {
                this.markShotAsInvalid();
            }
        }

    }

    isBallToBallCollision(bodyA, bodyB) {
        const ballRegex = /_ball$/;
        return ballRegex.test(bodyA.label) && ballRegex.test(bodyB.label);
    }

    isInvalidShot(targetBallLabel) {
        const isRedPhase = this.gameStateManager.isRedPhase();
        const isColoredPhase = this.gameStateManager.isColoredPhase();
        const isWaitingPhase = this.gameStateManager.isWaitingPhase();

        return ((isRedPhase && targetBallLabel !== BALL_TYPES.RED) ||
            (isColoredPhase && targetBallLabel === BALL_TYPES.RED))
            && isWaitingPhase;
    }    markShotAsInvalid() {
        this.isValidShot = false;
        console.log('❌ INVALID SHOT! You hit the wrong ball.');
    }

3
    checkBasket() {

        let isInvalidPottedBall = this.basket.find(ball =>
            this.gameStateManager.isInvalidPottedBall(ball.label, this.collisionWith)
        );


        if (isInvalidPottedBall !== undefined && isInvalidPottedBall !== null || this.isValidShot === false) {
            if (isInvalidPottedBall.label === BALL_TYPES.CUE) {
                this.gameStateManager.resetToCuePlacement(); // Stop the game
                this.freezeAllBalls(); // Freeze all balls
            }
            else{
                this.gameStateManager.reset(); // Change game state
            }

            this.basket.forEach(ballObject => {
                Matter.Body.setVelocity(ballObject, { x: 0, y: 0 }); // Reset velocity
                let i = this.searchBallById(ballObject.id); // Find ball index in array
                this.snookerBalls[i].resetPosition(); // Return ball to initial position
                ballObject.render.visible = true; // Make ball visible
            });
             
            console.log("⚠️ FOUL! The wrong ball was potted - it returns to the table!");

            this.switchPlayerWithFoul(); // Switch player with foul
        } else {
            this.basket.forEach(ballObject => {
                let i = this.searchBallById(ballObject.id); // Find ball index in array
                if (this.gameStateManager.isRedPhase() || this.gameStateManager.areRedBallsFinished(ballObject.label)) {
                    this.snookerBalls.splice(i, 1); // Remove ball from array
                    World.remove(this.engine.world, ballObject);
                }
                else {
                    ballObject.render.visible = true; // Make ball visible
                    this.snookerBalls[i].resetPosition(); // Return ball to initial position
                }

                this.currentPlayer.potBall(ballObject.label); // Add point to player
                this.setCurrentPlayerNotStruck();

            });            const hasRedBalls = !this.snookerBalls.some(ball => ball.body.label === BALL_TYPES.RED) && !this.gameStateManager.redBallsFinished;
            if (hasRedBalls) {
                this.gameStateManager.setRedBallsFinished();
                console.log('🔴 All red balls are potted! Now you must pot the colored balls in order: YELLOW → GREEN → BROWN → BLUE → PINK → BLACK');
            };
            this.gameStateManager.toggleTargetBallType(); // Switch target ball type
        }
        this.basket = []; // Clear basket after processing
        this.isValidShot = true; // Reset valid shot flag
        this.collisionWith = null; // Reset after check
    }

    searchBallById(id) {
        for (let i = 0; i < this.snookerBalls.length; i++) {
            if (this.snookerBalls[i].getBodyId() === id) {
                return i; // Return ball if found
            }
        }
        return null; // Return null if ball not found
    }

    checkCollision = function () {
        const cueBall = this.snookerBalls[0]; // Cue ball
        if (!cueBall || !cueBall.body) return false;

        for (let i = 1; i < this.snookerBalls.length; i++) {
            const ball = this.snookerBalls[i];
            if (ball && ball.body) {
                const collision = Matter.Collision.collides(cueBall.body, ball.body); // Use Matter.Collision.collides
                if (collision && collision.collided) {
                    console.log(`Cue ball collided with ${ball.body.label}`);
                    return true; // Return true if collision
                }
            }
        }
        return false; // Return false if no collisions
    };

    unfreezeAllBalls() {
        this.snookerBalls.forEach(ball => {
            ball.unfreeze(); // Unfreeze each ball
        });
    }

    freezeAllBalls() {
        this.snookerBalls.forEach(ball => {
            ball.freeze(); // Freeze each ball
        });
    }    switchPlayer() {
        this.setCurrentPlayerNotStruck();
        if (this.currentPlayer === this.player1) {
            this.currentPlayer = this.player2;
        } else {
            this.currentPlayer = this.player1;
        }
        
        // Inform about player switch and current target
        const targetBallName = this.gameStateManager.targetBallType.replace('_ball', '').toUpperCase();
        console.log(`🔄 Player switch! Now it's: ${this.currentPlayer.name}`);
        console.log(`🎯 Target: ${this.gameStateManager.isRedPhase() ? 'RED ball' : targetBallName + ' ball'}`);
    }

    switchPlayerWithFoul() {
        this.switchPlayer();
        this.currentPlayer.applyFoul();
    }

    getCurrentPlayerStrikeState() {
        return this.currentPlayer.getStrikeState();
    }

    setCurrentPlayerStruck() {
        this.currentPlayer.setStruck();
    }
    setCurrentPlayerNotStruck() {
        this.currentPlayer.setNotStruck();
    }
    toggleCurrentPlayerStrike() {
        this.currentPlayer.toggleStrike();
    }

    isPlaingPhase() {
        return this.gameStateManager.isPlayingPhase();
    }

}
