var UnicycleDemo;
(function (UnicycleDemo) {
    'use strict';

    var Terrain = (function () {

        /**
         * Creates a new Terrain instance
         * @param  {Game} game
         */
        function Terrain(game) {

            P2Pixi.GameObject.call(this, game);

            var self = this
                , x
                , y
                , height
                , angle
                , even = false
                , random;

            function addLeftWall(startUnits, heightUnits) {
                var x1 = -4;
                var y1 = -((startUnits - 1) / 2);
                var height = heightUnits / 2;

                new UnicycleDemo.Wall(self.game, [x1, y1], height);
            };

            function addRightWall(startUnits, heightUnits) {
                var x1 = 3.9;
                var y1 = -((startUnits - 1) / 2);
                var height = heightUnits / 2;

                new UnicycleDemo.Wall(self.game, [x1, y1], height);
            };

            function addPlank(topLeftUnits, widthUnits) {
                var x1 = -4 + ((topLeftUnits[0] - 1) / 2);
                var y1 = -((topLeftUnits[1] - 1) / 2);
                var width = widthUnits / 2;

                new UnicycleDemo.Plank(self.game, [x1, y1], width);
            };

            function addFlimsyPlank(topLeftUnits, widthUnits) {
                var x1 = -4 + ((topLeftUnits[0] - 1) / 2);
                var y1 = -((topLeftUnits[1] - 1) / 2);
                var width = widthUnits / 2;

                new UnicycleDemo.FlimsyPlank(self.game, [x1, y1], width);
            };

            function addSaw(xUnit, yUnit) {
                var x = -4 + ((xUnit - 0.5) / 2);
                var y = -((yUnit - 0.5) / 2);

                new UnicycleDemo.Saw(self.game, [x, y]);
            };

            addLeftWall(-10, 50);
            addRightWall(-10, 50);

            addPlank([9, 5], 8);
            addPlank([9, 5.75], 1);
            addPlank([6, 6.5], 3);

            addPlank([3.5, 11], 2.5);

            addSaw(4, 14);

            addPlank([7, 14], 3);

            addSaw(14, 17);

            addPlank([1, 20], 16);
        }

        Terrain.prototype = Object.create(P2Pixi.GameObject.prototype);

        return Terrain;
    })();

    UnicycleDemo.Terrain = Terrain;
})(UnicycleDemo || (UnicycleDemo = {}));
