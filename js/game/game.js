define(function(require) {
    var Engine = require('flux/engine');
    var Entity = require('flux/entity');
    var Graphic = require('flux/graphics/graphic');
    var Loader = require('flux/resources/loader');

    var Player = require('game/player');
    var BallWorld = require('game/world');

    var loader = require('game/loader');
    loader.register('balls','img/balls.png', 'image');
    loader.register('player','img/player.png', 'image');
    loader.register('ground','img/ground.png', 'image');

    function rgba_glow(r, g, b, a_base, a_vary, glow) {
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (a_base + (a_vary * glow)) + ')';
    }

    function pos_glow(low, high, glow) {
        return low - ((low - high) * glow);
    }

    // Courtesy of Robert Penner. Covered under BSD License, see LICENSE for
    // details.
    function easyInOutQuad(time, begin, change, duration) {
        time /= duration / 2;
        if (time < 1) {
            return change / 2 * time * time + begin;
        }
        time--;
        return -change / 2 * (time * (time - 2) - 1) + begin;
    }

    function gradient_fade(initial, series) {
        var indexes = [];
        var last_index = initial;
        indexes.push(initial);
        for (var k = 0; k < series.length; k++) {
            var new_index = series[k][0];
            var duration = series[k][1];
            var difference = new_index - last_index;
            for (var i = 0; i < duration; i++) {
                indexes.push(Math.floor(easyInOutQuad(i, last_index, difference, duration)));
            }
            last_index = new_index;
        }
        console.log(indexes);
        return indexes;
    }

    function MagmaEngine(width, height, scale, world) {
        Engine.call(this, width, height, scale, world);

        this.bg_gradients = []; 
        this.gradient_count = 0;
        for (var k = 0; k < 32; k++) {
            var glow = 1 - (k / 32);
            var gradient = this.ctx.createLinearGradient(0, 0, 0, this.height - 8);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
            gradient.addColorStop(pos_glow(0.8, 0.6, glow), rgba_glow(32, 0, 0, 0.2, 0.3, glow));
            gradient.addColorStop(pos_glow(0.95, 0.85, glow), rgba_glow(128, 41, 0, 0.1, 0.2, glow));
            gradient.addColorStop(0.97, rgba_glow(160, 51, 0, 0.2, 0.3, glow));
            gradient.addColorStop(1, rgba_glow(255, 255, 64, 0.4, 0.2, glow));
            this.bg_gradients.push(gradient);
        }

        this.gradient_indexes = gradient_fade(0, [[0, 32], [31, 196], [31, 32], [0, 196]]);
    }
    MagmaEngine.prototype = Object.create(Engine.prototype);

    MagmaEngine.prototype.tick = function() {
        Engine.prototype.tick.call(this);
        this.bg_color = this.bg_gradients[this.gradient_indexes[this.gradient_count++ % this.gradient_indexes.length]];
    }


    loader.loadAll().done(function() {
        // Initialize engine.
        var COLS = 12;
        var ROWS = 12;
        var engine = new MagmaEngine(COLS * 16, ROWS * 16+16, 3, new BallWorld(ROWS,COLS));
        engine.cols = COLS;
        engine.rows = ROWS;
        engine.addEntity(new Player(0, 11 * 16));

        // Append canvas to screen and start the engine!
        document.querySelector('#game').appendChild(engine.canvas);
        engine.start();
    })

});
