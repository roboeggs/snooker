const GameConfig = {
    TABLE: {
        WIDTH: 1200,
        HEIGHT: 600,
        BORDER_OFFSET_X: 30, // GameConfig.TABLE.WIDTH / 40
        BORDER_OFFSET_Y: 30, // GameConfig.TABLE.HEIGHT / 20
    },

    BALL: {
        DIAMETER: 33.33, // GameConfig.TABLE.WIDTH / 36
        get RADIUS() { return this.DIAMETER / 2; }
    },

    ARC: {
        DIAMETER: 150, // GameConfig.TABLE.HEIGHT / 4
        get RADIUS() { return this.DIAMETER / 2; }
    },

    POCKET: {
        get DIAMETER() { return GameConfig.BALL.DIAMETER * 1.3; }
    },

    PHYSICS: {
        RESTITUTION: 1.0, // Maximum bounce without energy loss
        FRICTION: 0.0,    // No friction for ideal sliding
        DENSITY: 0.001,     // No mass so it doesn't affect hits
        MOVEMENT_THRESHOLD: 0.10
    },    COLORS: {
        TABLE: '#006600',
        BORDER: '#014522',
        BOARD: '#875e04',
        CUE: '#fcba03',
        CUE_GUIDE: 'gray'
    },    CUE_CONTROL: {        BASE_SMOOTHING: 0.08,      // Base smoothing (slow cue response)
        SPEED_SENSITIVITY: 0.02,   // Mouse speed sensitivity
        MAX_SMOOTHING: 0.8,        // Maximum cue response speed
        VELOCITY_MULTIPLIER: 0.003, // Multiplier for converting mouse speed to force
        MAX_STRIKE_FORCE: 0.15,    // Maximum strike force
        MAX_CUE_DISTANCE: 300,     // Maximum cue pullback distance
        CUE_AUTO_PULLBACK: 250,    // Automatic cue pullback when held
        CUE_MIN_DISTANCE: 50       // Minimum cue distance from the ball
    },

    BALL_POINTS: {
        'red_ball': 1,
        'yellow_ball': 2,
        'green_ball': 3,
        'brown_ball': 4,
        'blue_ball': 5,
        'pink_ball': 6,
        'black_ball': 7
    }
};

const BALL_TYPES = {
    CUE: 'cue_ball',
    RED: 'red_ball',
    YELLOW: 'yellow_ball',
    GREEN: 'green_ball',
    BROWN: 'brown_ball',
    BLUE: 'blue_ball',
    PINK: 'pink_ball',
    BLACK: 'black_ball'
};

const COLORED_BALLS_ORDER = [
  'yellow_ball',
  'green_ball',
  'brown_ball',
  'blue_ball',
  'pink_ball',
  'black_ball'
];

const GAME_PHASES = {
    SETUP: 'setup',           // Initial game setup
    PLACING_CUE: 'placing_cue', // Placing the cue ball
    PLAYING: 'playing',       // Active gameplay
    WAITING: 'waiting',       // Waiting for player action
    ENDED: 'ended'           // Game ended
}

const FOUL_POINTS = 4;
const MIN_FORCE = 0;
const MAX_FORCE = 1;
const MAX_CUE_LENGTH = 100;