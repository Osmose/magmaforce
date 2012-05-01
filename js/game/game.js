define(function(require) {
    var Engine = require('flux/engine');
    var Entity = require('flux/entity');
    var Graphic = require('flux/graphics/graphic');
    var Loader = require('flux/resources/loader');

    // Create a new resource loader.
    var loader = new Loader();

    // REGISTER RESOURCES TO LOAD HERE
    loader.register('firefox', 'img/firefox.png', 'image');

    // Callback run once all resources have been loaded.
    loader.loadAll().done(function() {
        // Initialize engine.
        var engine = new Engine(160, 144, 3);
        engine.bg_color = '#FFFF8B';

        // ADD INITIAL STATE (entities, worlds, etc) HERE
        function Player(x, y) {
            Entity.call(this, x, y);
            this.graphic = new Graphic(loader.get('firefox'));
        }
        Player.prototype = Object.create(Entity.prototype);
        engine.addEntity(new Player(10, 10));

        // Append canvas to screen and start the engine!
        document.querySelector('#game').appendChild(engine.canvas);
        engine.start();
    });
});
