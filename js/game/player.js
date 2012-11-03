define(function(require) {
    var Entity = require('flux/entity');

    function Player(x, y) {
        Entity.call(this, x, y);
        this.col = 0;

        this.keydown_delay = 0;
        this.keyheld = false;
        this.heldblocks = [];

        this.grabflag = 0;
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

        if (kb.check(kb.D) && this.grabflag === 0) {
            this.grabflag = 16;
            if (this.heldblocks.length === 0) {
                this.heldblocks = this.engine.world.getBlocks(this.col);
            } else {
                this.engine.world.pushBlocks(this.heldblocks, this.col);
                this.heldblocks = [];
            }
        } else {
            if (this.grabflag > 0)
                this.grabflag--;
        }


        var keydown = kb.check(kb.LEFT) || kb.check(kb.RIGHT);
        if (this.keydown_delay <= 0) {
            this.col += dx;
            this.col = this.col % this.engine.cols;
            this.x = this.col * 8;

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
        ctx.fillRect(this.x, this.y, 8, 8);
    };

    return Player;
});
