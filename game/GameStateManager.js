class GameStateManager {
    constructor() {
        this.currentPhase = GAME_PHASES.SETUP;
        this.targetBallType = BALL_TYPES.RED;
        this.turnNumber = 1;
        this.redBallsFinished = false;
    }

    // Phase checks
    isSetupPhase() {
        return this.currentPhase === GAME_PHASES.SETUP;
    }

    isPlacingCuePhase() {
        return this.currentPhase === GAME_PHASES.PLACING_CUE;
    }

    isPlayingPhase() {
        return this.currentPhase === GAME_PHASES.PLAYING;
    }

    isWaitingPhase() {
        return this.currentPhase === GAME_PHASES.WAITING;
    }

    isEndedPhase() {
        return this.currentPhase === GAME_PHASES.ENDED;
    }    
    // Check if red balls are finished
    areRedBallsFinished(ballLabel) {
        const status = this.redBallsFinished && this.targetBallType === ballLabel;
        if(status) {
            this.targetBallType = this.switchToNextColoredBall(ballLabel);
            if (!this.targetBallType) {
                console.log('🏁 GAME OVER! All balls are potted.');
                this.endGame(); // End the game if there are no colored balls left
            } else {
                const nextBallName = this.targetBallType.replace('_ball', '').toUpperCase();
                console.log(`🎯 Switching to colored balls! Next target: ${nextBallName}`);
            }
        }
        return status;
    }    
    // Set that red balls are finished
    setRedBallsFinished() {
        this.redBallsFinished = true;
        this.targetBallType = 'colored';
        console.log('🔴 All red balls are potted! Switching to colored balls in order.');
        this.targetBallType = BALL_TYPES.YELLOW;
    }    
    // Phase transitions
    startGame() {
        if (this.isSetupPhase()) {
            this.currentPhase = GAME_PHASES.PLACING_CUE;
            console.log('🎮 GAME STARTED! Place the cue ball in a convenient spot.');
        }
    }    cueBallPlaced() {
        if (this.isPlacingCuePhase()) {
            this.currentPhase = GAME_PHASES.PLAYING;
            console.log('✓ Cue ball placed! You can start your shot.');
        }
    }  
    // Switch to waiting after a shot
    shotMade() {
        if (this.isPlayingPhase()) {
            this.currentPhase = GAME_PHASES.WAITING;
            console.log('⏳ Waiting for balls to stop...');
        }
    }    
    // All balls have stopped
    ballsStopped() {
        if (this.isWaitingPhase()) {
            this.currentPhase = GAME_PHASES.PLAYING;
            console.log('✅ Balls have stopped. Ready for the next shot.');
        }
    }    
    // Switch to cue placement after a foul
    requireCuePlacement() {
        this.currentPhase = GAME_PHASES.PLACING_CUE;
        console.log('⚠️ After a foul: place the cue ball again!');
    }    endGame() {
        this.currentPhase = GAME_PHASES.ENDED;
        console.log('🏁 GAME OVER!');
    }

    // Methods for working with ball types
    switchToNextPhase() {
        const phaseTransitions = {
            [GAME_PHASES.SETUP]: GAME_PHASES.PLACING_CUE,
            [GAME_PHASES.PLACING_CUE]: GAME_PHASES.PLAYING,
            [GAME_PHASES.PLAYING]: GAME_PHASES.WAITING,
            [GAME_PHASES.WAITING]: GAME_PHASES.PLAYING
        };
        
        const nextPhase = phaseTransitions[this.currentPhase];
        if (nextPhase) {
            this.currentPhase = nextPhase;
            console.log(`Phase switched to: ${this.currentPhase}`);
        }
    }

    // Takes into account the state of red balls
    toggleTargetBallType() {
        // If red balls are finished, always stay on colored
        if (this.redBallsFinished) {
            // this.targetBallType = 'colored';
            console.log(`Red balls finished - staying on colored balls, Turn: ${this.turnNumber}`);
            return;
        }

        // Normal switching only if red balls are still present
        if (this.targetBallType === BALL_TYPES.RED) {
            this.targetBallType = 'colored';
        } else {
            this.targetBallType = BALL_TYPES.RED;
        }
        this.turnNumber += 1;
        console.log(`Target ball type: ${this.targetBallType}, Turn: ${this.turnNumber}`);
    }

    isRedPhase() {
        return this.targetBallType === BALL_TYPES.RED && !this.redBallsFinished;
    }

    isColoredPhase() {
        return this.targetBallType !== BALL_TYPES.RED || this.redBallsFinished;
    }

    reset() {
        this.currentPhase = GAME_PHASES.PLAYING;
        this.targetBallType = this.redBallsFinished ? this.targetBallType : BALL_TYPES.RED;
        this.turnNumber = 1;
        console.log('GameStateManager reset');
    }

    // Reset with cue placement
    resetToCuePlacement() {
        this.currentPhase = GAME_PHASES.PLACING_CUE;
        this.targetBallType = this.redBallsFinished ? this.targetBallType : BALL_TYPES.RED;
        this.turnNumber = 1;
        console.log('GameStateManager reset to cue placement');
    }

    getCurrentPhaseInfo() {
        return {
            phase: this.currentPhase,
            targetBallType: this.targetBallType,
            turnNumber: this.turnNumber,
            redBallsFinished: this.redBallsFinished
        };
    }

    getCurrentPhase() {
        return this.currentPhase;
    }

    setPhase(phase) {
        this.currentPhase = phase;
        console.log(`Phase changed to: ${phase}`);
    }

    switchToNextColoredBall(currentBall) {
        const idx = COLORED_BALLS_ORDER.indexOf(currentBall);
        if (idx === -1 || idx === COLORED_BALLS_ORDER.length - 1) {
            return undefined; // no more colored balls
        }
        return COLORED_BALLS_ORDER[idx + 1];
    }
    isInvalidPottedBall(ballLabel, collisionWith) {
        return ballLabel === BALL_TYPES.CUE || ballLabel !== collisionWith ||
            (this.isRedPhase() && ballLabel !== BALL_TYPES.RED) ||
            (this.isColoredPhase() && ballLabel === BALL_TYPES.RED)
    }
}33