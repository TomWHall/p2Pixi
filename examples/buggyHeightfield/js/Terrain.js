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

            var ground
                , heightfield
                , terrainBodyOptions = {
                    collisionGroup: 1
                    , collisionMask: 1 | 2
                }
                , data = []
                , numDataPoints = 500
                , i
                , rockStyle = { lineColor: 0x00ff00, lineWidth: 1, fillColor: 0xff0000 }
                , rockTexture = PIXI.Texture.fromImage('img/rock.jpg', false);

            P2Pixi.GameObject.call(this, game);

            this.rockMaterial = new p2.Material();


            // Ground HeightField

            ground = new p2.Body({
                position:[-75, -5]
            });

            for (i = 0; i < numDataPoints; i++){
                data.push(0.2 * Math.cos(0.2 * i) * Math.sin(0.5 * i) + 0.2 * Math.sin(0.1 * i) * Math.sin(0.05 * i));
            }
            heightfield = new p2.Heightfield(data, {
                elementWidth: 0.3
            });
            heightfield.material = this.rockMaterial;

            this.addBody(ground)
                .addShape(ground
                   , heightfield
                   , zero
                   , 0
                   , terrainBodyOptions
                   , null
                   , rockTexture);
        }

        Terrain.prototype = Object.create(P2Pixi.GameObject.prototype);

        return Terrain;
    })();

    BuggyDemo.Terrain = Terrain;
})(BuggyDemo || (BuggyDemo = {}));
