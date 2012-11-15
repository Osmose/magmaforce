define(function(require) {
    var Entity = require('flux/entity');
    var Sound = require('flux/sound');
    var TiledGraphic = require('flux/graphics/tiled');

    var loader = require('game/loader');
    loader.register('get_blocks', 'audio/get_blocks.ogg', 'audio');
    loader.register('push_blocks', 'audio/push_blocks.ogg', 'audio');

    function Player(x, y) {
        Entity.call(this, x, y);
        this.col = 6;

        this.playertiles = new TiledGraphic(loader.get('player'),16,24);
        this.currentSprite = 0;

        this.keydown_delay = 0;
        this.keyheld = false;
        this.heldblocks = [];

        this.grabkey = true;
        this.throwkey = true;

        this.get_blocks_sound = new Sound(loader.get('get_blocks'));
        this.push_blocks_sound = new Sound(loader.get('push_blocks'));

        this.get_blocks_sound.audio.volume = 0.1;
        this.push_blocks_sound.audio.volume = 0.1;
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
            var addblocks;
            if (this.heldblocks.length === 0) {
                addblocks = this.world.getBlocks(this.col);
                this.heldblocks = this.heldblocks.concat(addblocks);
            } else {
                // Let them pick up more of the same color if they want
                addblocks = this.world.getBlocks(this.col, this.heldblocks[0]);
                this.heldblocks = this.heldblocks.concat(addblocks);
            }

            if (addblocks.length > 0) {
                this.get_blocks_sound.stop();
                this.get_blocks_sound.play();
            }
        }
        if (!kb.check(kb.D)){
            this.grabkey = false;
        }

        if (this.heldblocks.length > 0) {
            this.currentSprite = (this.heldblocks[0]-2)%4+1;
        } else {
            this.currentSprite = 0;
        }

        if (kb.check(kb.F) && !this.throwkey) {
            this.throwkey = true;
            if (this.heldblocks.length > 0) {
                this.world.pushBlocks(this.heldblocks, this.col);
                this.heldblocks = [];

                this.push_blocks_sound.stop();
                this.push_blocks_sound.play();
            }
        }
        if (!kb.check(kb.F)) {
            this.throwkey = false;
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

        this.playertiles.renderTile(ctx, this.currentSprite, this.x, this.y);

        var world = this.world;
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
