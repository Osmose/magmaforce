define(function(require) {
    var DefaultWorld = require('flux/worlds/default');
    var Graphic = require('flux/graphics/graphic');
    var Sound = require('flux/sound');
    var TiledGraphic = require('flux/graphics/tiled');

    var loader = require('game/loader');
    loader.register('stage_music', 'audio/show_no_tears.ogg', 'audio');
    loader.register('ball_sound', 'audio/st2_die.ogg', 'audio');

    var SHOW_MATCH_LENGTH = 32;

    function BallWorld(rows, cols) {
        DefaultWorld.call(this);

        this.rows = rows-1;
        this.cols = cols;

        this.gameOver = false;
        this.colors = ['empty','white','red','green','yellow','blue','red-special','green-special','yellow-special','blue-special'];

        this.balltiles = new TiledGraphic(loader.get('balls'),16,16);
        this.ground = new Graphic(loader.get('ground'), 16, 8);
        this.nonspecialrows = 0;

        this.balls = [];
        // there are an extra 2 undisplayed rows
        for(var i=0;i<this.rows+2;i++) {
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

        this.music = new Sound(loader.get('stage_music'));
        this.music.audio.volume = 0.04; // wtf I hate volume control
        this.running = false;

        this.ball_sound = new Sound(loader.get('ball_sound'));
        this.ball_sound.audio.volume = 0.06;
        this.play_ball_sound = false;
    }

    BallWorld.prototype = Object.create(DefaultWorld.prototype);

    BallWorld.prototype.checkGameOver = function() {
        for (var i=0;i<this.cols; i++) {
            if (this.balls[this.rows][i] === 0 || this.balls[this.rows][i]===1) {
                continue;
            }
            this.gameOver = true;
            break;
        }
    }

    BallWorld.prototype.generateRow = function() {
        var newRow = [];
        for (var i=0;i<this.cols;i++) {
            var prob = Math.random() * 10;
            if (prob > 9 && this.balls[0][i]>=2) {
                newRow[i] = this.balls[0][i];
            } else {
                newRow[i] = Math.floor(Math.random()*4) + 2;
            }
        }

        // Some probability to upgrade a ball ot a special ball
        for (var i=0;i<this.cols; i++) {
            var prob = Math.random();
            if (prob>0.9825) {
                if (newRow[i] >=2 && newRow[i] <=5) {
                    newRow[i] += 4;
                    this.nonspecialrows = 0;
                }
            }
        }

        // if it's been 9 rows without a special ball, make one
        if (this.nonspecialrows > 10) {
            newRow[Math.random() * this.cols] +=4;
            this.nonspecialrows = 0;
        }

        this.nonspecialrows += 1;

        this.balls.unshift(newRow);
        this.balls.pop();
        this.checkGameOver();
    };

    BallWorld.prototype.getBlocks = function(col, color) {
        if (typeof color == 'undefined') {
            color = 0;
        }

        var ret = [];
        // From the bottom of the column, get all of the same color
        var lastGrabbed = 0;
        for(var i=this.rows-1; i>=0; i--) {
            // Skip past empty rows
            if (this.balls[i][col] == 0) {
                continue;
            }

            if ((lastGrabbed == 0 || lastGrabbed == this.balls[i][col]) && // Must match what we've been picking
               (color == 0 || color == this.balls[i][col])) { // must match what the player already holds
                // If the first color grabbed is white, or special, bail out.
                if ((lastGrabbed === 0 && this.balls[i][col] === 1) || this.balls[i][col]>5) break;

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
            if (bottomRow+i >= this.balls.length) {
                break; // can't add blocks outside of row
            }
            this.balls[bottomRow+i][col] = blocks[i];
        }

        var matches = this.resolveColumn(col);
        if (matches) {
            this.show_match_count = SHOW_MATCH_LENGTH;
            this.play_ball_sound = true;
        }

        this.checkGameOver();
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
                        if (this.balls[i][j] == 1) {
                            this.balls[i][j] = 0;
                        }
                    }
                }

                var affected = {};
                for (var k = 0; k < this.cols; k++) {
                    affected[k] = this.applyGravity(k);
                }

                for (var k = 0; k < this.cols; k++) {
                    if (affected[k]) {
                        if (this.resolveColumn(k)) {
                            this.show_match_count = SHOW_MATCH_LENGTH;
                            this.play_ball_sound = true;
                        }
                    }
                }
            }
        } else if (this.tickcount > 360 && !this.gameOver) {
            this.generateRow();
            this.tickcount = 0;
        } else if (this.show_match_count <= 0) { // check if we should dump more rows on them
            var ballcount = 0;
            // Check how many balls are on the field
            for(var i=0; i<this.rows; i++) {
                for (var j=0; j<this.cols; j++) {
                    if (this.balls[i][j] > 0)
                        ballcount++;
                }
            }
            if (ballcount < 2.5*this.cols) {
                this.generateRow();
            }
        }

        if (this.play_ball_sound) {
            this.play_ball_sound = false;
            this.ball_sound.stop();
            this.ball_sound.play();
        }
    };

    BallWorld.prototype.render = function(ctx) {
        // This will draw the player
        DefaultWorld.prototype.render.call(this, ctx);

        // Draw the ground
        for (var k = 0; k < this.rows + 1; k++) {
            this.ground.render(ctx, k * 16, this.engine.height - 8);
        }

        // Draw the grid of balls
        for (var i=0; i<this.rows; i++) {
            for (var j=0;j<this.cols; j++) {
                if (this.balls[i][j] > 0) {
                    this.balltiles.renderTile(ctx, this.balls[i][j], j*16,i*16);
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
        var row = this.balls.length - 1;
        while (row >= 0 && this.balls[row][col] === 0) {
            row--;
        }

        // Must be at least 3 in this column.
        if (row < 2) {
            return false;
        }

        // Check for at least 3 of the same color.
        var color = this.balls[row][col];
        if ((this.balls[row-1][col]-2)%4 != (color-2)%4 || (this.balls[row-2][col]-2)%4 != (color-2)%4) {
            return false;
        }

        var clearall = false;
        var curmatches = [[row, col]];
        while (curmatches.length > 0) {
            var current = curmatches.pop();
            // Is it a special ball?
            if (this.balls[current[0]][current[1]] > 5) {
                clearall = true;
                break;
            }
            this.balls[current[0]][current[1]] = 1; // turn it white

            if (current[0] + 1 < this.rows && (this.balls[current[0] + 1][current[1]]-2)%4 === (color-2)%4) {
                curmatches.push([current[0] + 1, current[1]]);
            }
            if (current[0] - 1 >= 0 && (this.balls[current[0] - 1][current[1]]-2)%4 === (color-2)%4) {
                curmatches.push([current[0] - 1, current[1]]);
            }
            if (current[1] + 1 < this.cols && (this.balls[current[0]][current[1] + 1]-2)%4 === (color-2)%4) {
                curmatches.push([current[0], current[1] + 1]);
            }
            if (current[1] - 1 >= 0 && (this.balls[current[0]][current[1] - 1]-2)%4 === (color-2)%4) {
                curmatches.push([current[0], current[1] - 1]);
            }
        }

        if (clearall) {
            for(var i=0; i<this.rows; i++) {
                for (var j=0;j<this.cols; j++) {
                    if ((this.balls[i][j]-2)%4 == (color-2)%4) {
                        this.balls[i][j] = 1; // make it white
                    }
                }
            }
        }
        
        return true;
    };

    BallWorld.prototype.applyGravity = function(col) {
        var lastFilled = -1;
        var affected = false;
        for (var row = 0; row < this.rows; row++) {
            if (this.balls[row][col]) {
                if (lastFilled === row - 1) {
                    lastFilled = row;
                } else {
                    affected = true;
                    lastFilled++;
                    this.balls[lastFilled][col] = this.balls[row][col];
                    this.balls[row][col] = 0;
                }
            }
        }

        return affected;
    };

    BallWorld.prototype.start = function() {
        if (this.running) {
            this.music.loop();
        }
    };

    BallWorld.prototype.stop = function() {
        this.music.pause();
    }

    return BallWorld;
});
