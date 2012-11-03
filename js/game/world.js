define(function(require) {
    var DefaultWorld = require('flux/worlds/default');

    function BallWorld(rows, cols) {
        DefaultWorld.call(this);

        this.rows = rows-1;
        this.cols = cols;

        this.gameOver = false;
        this.colors = ['empty','red','green','yellow','blue','white'];

        this.balls = [];
        for(var i=0;i<this.rows;i++) {
            this.balls[i] = [];
            for(var j=0;j<this.cols;j++) {
                this.balls[i][j] = 0;
            }
        }

        this.tickcount = 0;
        this.show_match_count = 0;

        for (var k = 0; k < 3; k++) {
            this.generateRow();
        }
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

    BallWorld.prototype.getBlocks = function(col) {
        var ret = [];
        // From the bottom of the column, get all of the same color
        var lastGrabbed = 0;
        var color = 0;
        for(var i=this.rows-1; i>=0; i--) {
            // Skip past empty rows
            if (this.balls[i][col] == 0) {
                continue;
            }
            console.log(this.balls[i][col]);

            if (lastGrabbed == 0 || lastGrabbed == this.balls[i][col]) {
                // If the first color grabbed is white, bail out.
                if (lastGrabbed === 0 && this.balls[i][col] === 5) break;

                lastGrabbed = this.balls[i][col];
                ret.push(lastGrabbed);
                this.balls[i][col] = 0;
            } else {
                break;
            }
        }
        return ret;
    }

    BallWorld.prototype.pushBlocks = function(blocks, col) {
        // Find the bottom of the col
        var bottomRow = 0;
        for (var i=this.rows-1; i>=0; i--) {
            if (this.balls[i][col] != 0)
                break;
            bottomRow = i;
        }

        for (var i=0;i<blocks.length; i++) {
            if (bottomRow+i >= this.rows) {
                console.log("you lost");
                this.gameOver = true;
                return;
            }
            this.balls[bottomRow+i][col] = blocks[i];
        }

        var matches = this.resolveColumn(col);
        if (matches) {
            this.show_match_count = 32;
        }
    }

    BallWorld.prototype.tick = function() {
        DefaultWorld.prototype.tick.call(this);

        this.tickcount++;
        if (this.show_match_count > 0) {
            this.show_match_count--;
            if (this.show_match_count <= 0) {
                // Clear out white tiles
                for(var i=0;i<this.rows;i++) {
                    for(var j=0;j<this.cols;j++) {
                        if (this.balls[i][j] == 5) {
                            this.balls[i][j] = 0;
                        }
                    }
                }

                for (var k = 0; k < this.cols; k++) {
                    this.applyGravity(k);
                }
            }
        } else if (this.tickcount > 360 && !this.gameOver) {
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

        // Draw gameover if they lost
        if (this.gameOver) {
            ctx.strokeStyle = "white";
            ctx.strokeText("Game Over!", 20,20);
        }
    };

    BallWorld.prototype.resolveColumn = function(col) {
        var row = this.rows - 1;
        while (row >= 0 && this.balls[row][col] === 0) {
            row--;
        }

        // Must be at least 3 in this column.
        if (row < 2) {
            return null;
        }

        // Check for at least 3 of the same color.
        var color = this.balls[row][col];
        if (this.balls[row-1][col] != color || this.balls[row-2][col] != color) {
            return null;
        }

        var curmatches = [[row, col]];
        while (curmatches.length > 0) {
            var current = curmatches.pop();
            this.balls[current[0]][current[1]] = 5;

            if (current[0] + 1 < this.rows && this.balls[current[0] + 1][current[1]] === color) {
                curmatches.push([current[0] + 1, current[1]]);
            }
            if (current[0] - 1 >= 0 && this.balls[current[0] - 1][current[1]] === color) {
                curmatches.push([current[0] - 1, current[1]]);
            }
            if (current[1] + 1 < this.cols && this.balls[current[0]][current[1] + 1] === color) {
                curmatches.push([current[0], current[1] + 1]);
            }
            if (current[1] - 1 >= 0 && this.balls[current[0]][current[1] - 1] === color) {
                curmatches.push([current[0], current[1] - 1]);
            }
        }

        return true;
    };

    BallWorld.prototype.applyGravity = function(col) {
        var lastFilled = -1;
        for (var row = 0; row < this.rows; row++) {
            if (this.balls[row][col]) {
                if (lastFilled === row - 1) {
                    lastFilled = row;
                } else {
                    lastFilled++;
                    this.balls[lastFilled][col] = this.balls[row][col];
                    this.balls[row][col] = 0;
                }
            }
        }
    };

    return BallWorld;
});
