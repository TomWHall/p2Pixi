var UnicycleDemo;
(function (UnicycleDemo) {
    'use strict';

    var Plank = (function () {

        var plankBodyShapeOptions = {
            collisionGroup: 2
            , collisionMask: 1 | 2
        }
        , plankTexture = PIXI.Texture.fromImage('img/plank.png', false);

        /**
         * Creates a new Plank instance
         * @param  {Game} game
         */
        function Plank(game, topLeft, width) {
            
            P2Pixi.GameObject.call(this, game);

            var plank = new p2.Body({
                    mass: Number.MAX_VALUE
                    , position: [topLeft[0] + (width / 2), topLeft[1] + 0.05]
                })
                , plankRectangle = new p2.Rectangle(width, 0.1);

            plank.gravityScale = 0;
            plankRectangle.material = game.plankMaterial;

            this.addBody(plank)
                .addShape(plank
                    , plankRectangle
                    , [0, 0]
                    , 0
                    , plankBodyShapeOptions
                    , null
                    , plankTexture
                    , 1);

            _.each(this.bodies, function(b) { b.gameObjectType = 'solid'; });
        }

        Plank.prototype = Object.create(P2Pixi.GameObject.prototype);

        return Plank;
    })();

    UnicycleDemo.Plank = Plank;
})(UnicycleDemo || (UnicycleDemo = {}));
