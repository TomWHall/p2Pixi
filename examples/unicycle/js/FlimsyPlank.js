var UnicycleDemo;
(function (UnicycleDemo) {
    'use strict';

    var FlimsyPlank = (function () {

        var plankBodyShapeOptions = {
            collisionGroup: 2
            , collisionMask: 1 | 2
        }
        , plankTexture = PIXI.Texture.fromImage('img/plank.png', false);

        /**
         * Creates a new FlimsyPlank instance
         * @param  {Game} game
         */
        function FlimsyPlank(game, topLeft, width) {
            
            P2Pixi.GameObject.call(this, game);

            var position = [topLeft[0] + (width / 2), topLeft[1] + 0.025]
                , plank = new p2.Body({
                    mass: 2
                    , position: position
                })
                , plankRectangle = new p2.Rectangle(width, 0.05)
                , anchor = new p2.Body({
                    mass: 0
                    , position: position
                })
                , lockConstraint1
                , lockConstraint2
                , random = UnicycleDemo.util.randomNumber(1, 2);

            plankRectangle.material = game.plankMaterial;

            this.addBody(plank)
                .addShape(plank
                    , plankRectangle
                    , [0, 0]
                    , 0
                    , plankBodyShapeOptions
                    , null
                    , plankTexture
                    , 1)
            .addBody(anchor);

            _.each(this.bodies, function(b) { b.gameObjectType = 'flimsy'; });

            lockConstraint1 = new p2.LockConstraint(anchor, plank, { localOffsetB: [-width / 3, 0], maxForce: random == 1 ? 1000 : 985 });
            lockConstraint2 = new p2.LockConstraint(anchor, plank, { localOffsetB: [width / 3, 0], maxForce: random == 1 ? 985 : 1000 });
            this.addConstraint(lockConstraint1);
            this.addConstraint(lockConstraint2);
        }

        FlimsyPlank.prototype = Object.create(P2Pixi.GameObject.prototype);

        return FlimsyPlank;
    })();

    UnicycleDemo.FlimsyPlank = FlimsyPlank;
})(UnicycleDemo || (UnicycleDemo = {}));
