define(function(require) {
    var DefaultWorld = require('flux/worlds/default');

    function BallWorld(rows, cols) {
        DefaultWorld.call(this);

        this.rows = rows-1;
        this.cols = cols;

        this.colors = ['red','green','blue','black','purple'];

        this.balls = [];
        for(var i=0;i<this.cols;i++) {
            this.balls[i] = [];
            for(var j=0;j<this.rows;j++) {
                this.balls[i][j] = (i+i*j)%this.colors.length;
            }
        }
    }

    BallWorld.prototype = Object.create(DefaultWorld.prototype);

    BallWorld.prototype.tick = function() {
        DefaultWorld.prototype.tick.call(this);
    };

    BallWorld.prototype.render = function(ctx) {
        // This will draw the player
        DefaultWorld.prototype.render.call(this, ctx);

        // Draw the grid of balls
        for (var i=0; i<this.cols; i++) {
            for (var j=0;j<this.rows; j++) {
                ctx.fillStyle = this.colors[this.balls[i][j]];
                ctx.fillRect(i*8,j*8, 6, 6);
            }
        }
    };

    return BallWorld;
});
