define(function(require) {
    var Engine = require('flux/engine');
    var Entity = require('flux/entity');
    var Graphic = require('flux/graphics/graphic');
    var Loader = require('flux/resources/loader');

    var Player = require('game/player');
    var BallWorld = require('game/world');

    // Initialize engine.
    var COLS = 12;
    var ROWS = 12;
    var engine = new Engine(COLS * 8, ROWS * 8, 4, new BallWorld(ROWS,COLS));
    engine.bg_color = '#000';
    engine.cols = COLS;
    engine.rows = ROWS;

    engine.addEntity(new Player(0, 11 * 8));

    // Append canvas to screen and start the engine!
    document.querySelector('#game').appendChild(engine.canvas);
    engine.start();
});
