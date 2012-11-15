define(function(require) {
    var TiledGraphic = require('flux/graphics/tiled');
    var Tilemap = require('flux/tilemap');

    var loader = require('game/loader');

    var Ball = require('game/ball');

    function BallGrid(rows, cols) {
        var grid = [];
        for (var y = 0; y < rows; y++) {
            grid.push([]);
            for (var x = 0; x < cols; x++) {
                grid[y].push(Ball.EMPTY);
            }
        }
        Tilemap.call(this, grid, 0, 0);

        this.graphic = new TiledGraphic(loader.get('balls'), 16, 16);
        this.solid = {
            'ball': [Ball.WHITE, Ball.RED, Ball.GREEN, Ball.YELLOW, Ball.BLUE]
        };

        // The drop progression defines how the balls accelerate as they fall.
        this.curDrop = 0;
        this.dropProgression = [0, 0, 0, 0, 0, 0, 0, 0,
                                4, 3, 2, 2, 1, 1, 1, 0.5, 0.5, 0.5, 0.5];
        this.dropProgLen = this.dropProgression.length;
    }
    BallGrid.prototype = Object.create(Tilemap.prototype);

    BallGrid.prototype.tick = function() {
        if (this.curDrop > 0) {
            this.curDrop--;
            this.y += this.dropProgression[this.curDrop % this.dropProgLen];

            // Realign to avoid floating point issues.
            if (this.curDrop % this.dropProgLen === 0) {
                this.y = Math.round(this.y);
            }
        }
    };

    BallGrid.prototype.addRow = function(shift) {
        var lastRow = this.grid.pop();
        this.grid.unshift([]);

        for (var x = 0; x < this.widthTiles; x++) {
            this.grid[0][x] = Math.floor((Math.random() * 4) + 2);
        }

        if (shift) {
            this.y -= 16;
            this.curDrop += this.dropProgLen;
        }
    };

    return BallGrid;
});
