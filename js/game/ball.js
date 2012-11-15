define(function(require) {
    var Entity = require('flux/entity');
    var TiledGraphic = require('flux/graphics/tiled');

    var loader = require('game/loader');
    loader.register('balls','img/balls.png', 'image');

    var ballTiles = null;

    function Ball(x, y, color) {
        Entity.call(this, x, y);
        this.color = color;

        if (ballTiles === null) {
            ballTiles = new TiledGraphic(loader.get('balls'), 16, 16);
        }
    }
    Ball.prototype = Object.create(Entity.prototype);

    Ball.EMPTY = 0;
    Ball.WHITE = 1;
    Ball.RED = 2;
    Ball.GREEN = 3;
    Ball.YELLOW = 4;
    Ball.BLUE = 5;

    Ball.prototype.tick = function() {
        Entity.prototype.tick.call(this);
    };

    Ball.prototype.render = function(ctx) {
        ballTiles.renderTile(ctx, this.color, this.x, this.y);
    };

    return Ball;
});
