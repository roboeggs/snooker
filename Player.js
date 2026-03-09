class Player {
    constructor(name) {
        this.name = name || 'player ' + random(0,10); // Player name, default is "Player"
        this.score = 0;
        this.pottedBalls = []; // History of potted balls
        this.hasStruck = false; // State: has the player struck

    }

    // Add points for a potted ball
    addScore(ballType, points) {
        this.score += points;
        this.pottedBalls.push({
            type: ballType,
            points: points
        });
    }    // Apply a 4-point foul (points are added to this player)
    applyFoul() {
        this.score += 4;
        this.pottedBalls.push({
            type: 'foul',
            points: 4
        });
        console.log('⚠️ FOUL! Cue ball did not touch the target ball. Penalty: +4 points to the opponent.');
    }
    // Get points for a ball type
    getPointsForBall(ballLabel) {
        return GameConfig.BALL_POINTS[ballLabel] || 0;
    }    // Pot a ball
    potBall(ballLabel) {
        const points = this.getPointsForBall(ballLabel);
        const ballType = ballLabel.replace('_ball', '');
        
        if (points > 0) {
            this.addScore(ballType, points);
        }
        console.log(`🎱 POTTED! Ball: ${ballType.toUpperCase()} (+${points} ${points === 1 ? 'point' : points < 5 ? 'points' : 'points'})`);
        console.log(`📊 Current score: ${this.name} - ${this.score} points`);
    }

    // Get current strike state
    getStrikeState() {
        return this.hasStruck;
    }

    // Set state to "struck"
    setStruck() {
        this.hasStruck = true;
        
    }    // Set state to "not struck"
    setNotStruck() {
        this.hasStruck = false;
        console.log(`🎯 ${this.name} is preparing to strike...`);
    }    // Toggle strike state
    toggleStrike() {
        this.hasStruck = !this.hasStruck;
        console.log(`🔄 ${this.name}: ${this.hasStruck ? 'Strike made' : 'Ready to strike'}`);
    }// Reset for a new game
    reset() {
        this.score = 0;
        this.pottedBalls = [];
        this.hasStruck = false;
    }
}