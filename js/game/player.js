define(function(require) {
    var Entity = require('flux/entity');

    function Player(x, y) {
        Entity.call(this, x, y);
        this.col = 0;

        this.keydown_delay = 0;
        this.keyheld = false;
        this.heldblocks = [];

        this.grabkey = true;
    }
    Player.prototype = Object.create(Entity.prototype);

    Player.prototype.tick = function() {
        Entity.prototype.tick.call(this);
        var kb = this.engine.kb;

        var dx = 0;
        if (kb.check(kb.RIGHT)) {
            dx += 1;
        }
        if (kb.check(kb.LEFT)) {
            dx += this.engine.cols - 1;
        }

        if (kb.check(kb.D) && !this.grabkey) {
            this.grabkey = true;
            if (this.heldblocks.length === 0) {
                this.heldblocks = this.engine.world.getBlocks(this.col);
            } else {
                this.engine.world.pushBlocks(this.heldblocks, this.col);
                this.heldblocks = [];
            }
        }
        if (!kb.check(kb.D)){
            this.grabkey = false;
        }


        var keydown = kb.check(kb.LEFT) || kb.check(kb.RIGHT);
        if (this.keydown_delay <= 0) {
            this.col += dx;
            this.col = this.col % this.engine.cols;
            this.x = this.col * 16;

            if (!this.keyheld) {
                this.keydown_delay = 16;
            } else {
                this.keydown_delay =  7;
            }
        }

        if (!keydown) {
            this.keyheld = false;
            this.keydown_delay = 0;
        } else {
            this.keyheld = true;
            this.keydown_delay--;
        }
    };

    Player.prototype.render = function(ctx) {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.x, this.y, 16, 16);

        var world = this.engine.world;
        var x = this.x + 7;

        for (var row = this.engine.rows - 2; row >= 0; row--) {
            if (world.balls[row][this.col] !== 0) break;

            var y = row * 16;
            ctx.fillRect(this.x + 7, y + 3, 2, 2);
            ctx.fillRect(this.x + 7, y + 11, 2, 2);
        }
    };

    return Player;
});
