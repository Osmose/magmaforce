define(function(require) {
    var Entity = require('flux/entity');

    function Player(x, y) {
        Entity.call(this, x, y);
        this.col = 0;
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

        this.col += dx;
        this.col = this.col % this.engine.cols;
        this.x = this.col * 8;
    };

    Player.prototype.render = function(ctx) {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.x, this.y, 8, 8);
    };

    return Player;
});
