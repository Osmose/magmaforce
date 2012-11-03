define(function(require) {
    var DefaultWorld = require('flux/worlds/default');

    function BallWorld(rows, cols) {
        DefaultWorld.call(this);

        this.rows = rows-1;
        this.cols = cols;

        this.colors = ['empty','red','green','yellow','blue'];

        this.balls = [];
        for(var i=0;i<this.rows;i++) {
            this.balls[i] = [];
            for(var j=0;j<this.cols;j++) {
                this.balls[i][j] = 0;
            }
        }

        this.tickcount = 0;
    }

    BallWorld.prototype = Object.create(DefaultWorld.prototype);

    BallWorld.prototype.generateRow = function() {
        var newRow = [];
        for (var i=0;i<this.cols;i++) {
            var prob = Math.random() * 10;
            if (prob > 8) {
                newRow[i] = this.balls[0][i];
            } else {
                newRow[i] = Math.floor(Math.random()*4) + 1;
            }
        }
        this.balls.unshift(newRow);
        this.balls.pop();
    };

    BallWorld.prototype.tick = function() {
        DefaultWorld.prototype.tick.call(this);

        this.tickcount++;
        if (this.tickcount > 120) {
            this.generateRow();
            this.tickcount = 0;
        }
    };

    BallWorld.prototype.render = function(ctx) {
        // This will draw the player
        DefaultWorld.prototype.render.call(this, ctx);

        // Draw the grid of balls
        for (var i=0; i<this.rows; i++) {
            for (var j=0;j<this.cols; j++) {
                if (this.balls[i][j] > 0) {
                    ctx.fillStyle = this.colors[this.balls[i][j]];
                    ctx.fillRect(j*8+1,i*8+1, 6, 6);
                }
            }
        }
    };

    return BallWorld;
});
