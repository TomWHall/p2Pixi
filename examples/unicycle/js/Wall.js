var UnicycleDemo;
(function (UnicycleDemo) {
    'use strict';

    var Wall = (function () {

        var wallBodyShapeOptions = {
            collisionGroup: 2
            , collisionMask: 1 | 2
        }
        , wallTexture = PIXI.Texture.fromImage('img/plank.png', false);

        /**
         * Creates a new Wall instance
         * @param  {Game} game
         */
        function Wall(game, topLeft, height) {

            P2Pixi.GameObject.call(this, game);

            var wall = new p2.Body({
                    mass: Number.MAX_VALUE
                    , position: [topLeft[0] + 0.05, topLeft[1] - (height / 2)]
                })
                , wallRectangle = new p2.Rectangle(height, 0.1);

            wall.gravityScale = 0;
            wallRectangle.material = game.plankMaterial;

            this.addBody(wall)
                .addShape(wall
                    , wallRectangle
                    , [0, 0]
                    , Math.PI / 2
                    , wallBodyShapeOptions
                    , null
                    , wallTexture
                    , 1);

            _.each(this.bodies, function(b) { b.gameObjectType = 'solid'; });
        }

        Wall.prototype = Object.create(P2Pixi.GameObject.prototype);

        return Wall;
    })();

    UnicycleDemo.Wall = Wall;
})(UnicycleDemo || (UnicycleDemo = {}));
