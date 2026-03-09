class SnookerBall {
    constructor(x, y, radius, color, label) {
        this.body = Bodies.circle(x, y, radius, {
            restitution: GameConfig.PHYSICS.RESTITUTION,
            friction: GameConfig.PHYSICS.FRICTION,
            density: GameConfig.PHYSICS.DENSITY,
            label: label
        });
        this.color = color;
        this.initialPosition = { x, y }; // Save initial position
        Matter.Body.setStatic(this.body, true); // Ball is static by default
        World.add(engine.world, this.body);
    }

    draw() {
        if (!this.body.render.visible) return; // If render is off, draw nothing
        stroke(0, 0, 0, 100); // Black shadow with transparency
        strokeWeight(2); // Stroke thickness
        fill(this.color);
        drawVertices(this.body.vertices);
        fill(255);
        strokeWeight(0);
        ellipse(this.body.position.x - 2, this.body.position.y - 3, this.body.circleRadius / 3); // Draw shadow


    }

    isMoving() {
        const velocity = this.body.velocity; // Get velocity from Matter.js
        const speed = createVector(velocity.x, velocity.y).mag(); // Use p5.Vector.mag() to calculate vector length
        return speed > 0.01; // Threshold for determining movement
    }


    freeze() {
        // Make the ball static (immovable)
        Matter.Body.setStatic(this.body, true);
    }

    unfreeze() {
        // Make the ball movable again
        Matter.Body.setStatic(this.body, false);
    }

    getBodyId() {
        return this.body.id; // Return Matter.js body for physics interaction
    }

    resetPosition() {
        // Return the ball to its initial position
        Matter.Body.setPosition(this.body, this.initialPosition);
        Matter.Body.setVelocity(this.body, { x: 0, y: 0 }); // Reset velocity
    }
}