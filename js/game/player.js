define(function(require) {
    var Entity = require('flux/entity');

    function Player(x, y) {
        Entity.call(this, x, y);
        this.col = 0;

        this.keydown_delay = 0;
        this.keyheld = false;
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
            dx -= 1;
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
