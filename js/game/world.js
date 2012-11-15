define(function(require) {
    var DefaultWorld = require('flux/worlds/default');
    var Graphic = require('flux/graphics/graphic');
    var Sound = require('flux/sound');
    var TiledGraphic = require('flux/graphics/tiled');

    var Ball = require('game/ball');
    var BallGrid = require('game/ballgrid');

    var loader = require('game/loader');
    loader.register('stage_music', 'audio/show_no_tears.ogg', 'audio');
    loader.register('ball_sound', 'audio/st2_die.ogg', 'audio');

    var GRID_SIZE = 16;

    var STATE_NORMAL = 0;
    var STATE_ADDING_ROW = 1;

    function BallWorld(rows, cols) {
        DefaultWorld.call(this);

        this.rows = rows;
        this.cols = cols;

        this.ground = new Graphic(loader.get('ground'), 16, 8);

        this.inactive_balls = [];

        this.music = new Sound(loader.get('stage_music'));
        this.music.audio.volume = 0.06; // wtf I hate volume control
        this.running = false;

        this.ball_sound = new Sound(loader.get('ball_sound'));
        this.ball_sound.audio.volume = 0.06;

        this.state = STATE_NORMAL;
        this.tickCount = 0;

        this.ballgrid = new BallGrid(rows, cols);
    }
    BallWorld.prototype = Object.create(DefaultWorld.prototype);

    BallWorld.prototype.newBall = function(x, y, color) {
        var ball;
        if (this.inactive_balls.length === 0) {
            ball = new Ball(x, y, color);
        } else {
            ball = this.inactive_balls.pop();
            ball.x = x;
            ball.y = y;
            ball.color = color;
        }

        this.addEntity(ball);
        return ball;
    };

    BallWorld.prototype.removeBall = function(ball) {
        this.removeEntity(ball);
        this.inactive_balls.push(ball);
    };

    BallWorld.prototype.tick = function() {
        this.ballgrid.tick();
        DefaultWorld.prototype.tick.call(this);
    };

    BallWorld.prototype.render = function(ctx) {
        this.ballgrid.render(ctx);
        DefaultWorld.prototype.render.call(this, ctx);

        // Draw the ground
        for (var k = 0; k < this.rows + 1; k++) {
            this.ground.render(ctx, k * 16, this.engine.height - 8);
        }
    };

    BallWorld.prototype.start = function() {
        if (this.running) {
            this.music.loop();
        }
    };

    BallWorld.prototype.stop = function() {
        this.music.pause();
    };

    return BallWorld;
});
