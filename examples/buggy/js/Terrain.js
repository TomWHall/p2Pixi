var BuggyDemo;
(function (BuggyDemo) {
    'use strict';

    var Terrain = (function () {

        var zero = [0, 0];

        /**
         * Creates a new Terrain instance
         * @param  {Game} game
         */
        function Terrain(game) {

            var x
                , width
                , cliff
                , ground
                , box
                , angle
                , rectangle
                , even = true
                , terrainBodyOptions = {
                    collisionGroup: 1
                    , collisionMask: 1 | 2
                }
                , rockTexture = PIXI.Texture.fromImage('img/rock.jpg', false)

            P2Pixi.GameObject.call(this, game);

            this.rockMaterial = new p2.Material();


            // Ground

            cliff = new p2.Body({
                mass: 0
                , position: [0, -10]
            });

            this.addBody(cliff)
                .addShape(cliff
                   , new p2.Rectangle(60, 10)
                   , zero
                   , 0
                   , terrainBodyOptions
                   , null
                   , rockTexture);

            ground = new p2.Body({
                mass: 0
                , position: [0, -15]
            });

            this.addBody(ground)
                .addShape(ground
                   , new p2.Rectangle(1000, 10)
                   , zero
                   , 0
                   , terrainBodyOptions
                   , null
                   , rockTexture);

            x = -30;
            while (x < 28) {
                width = BuggyDemo.util.randomNumber(25, 100) / 25;
                x += width * 0.7;

                angle = (BuggyDemo.util.randomNumber(1, 15) / 100) * (even ? 1 : -1);

                box = new p2.Body({
                    mass: 0
                    , position: [x, -5]
                    , angle: angle
                });

                rectangle = new p2.Rectangle(width, 1);
                rectangle.material = this.rockMaterial;

                this.addBody(box)
                    .addShape(box
                        , rectangle
                        , zero
                        , 0
                        , terrainBodyOptions
                        , null
                        , rockTexture);

                even = !even;
            }
        }

        Terrain.prototype = Object.create(P2Pixi.GameObject.prototype);

        return Terrain;
    })();

    BuggyDemo.Terrain = Terrain;
})(BuggyDemo || (BuggyDemo = {}));
