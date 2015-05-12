var UnicycleDemo;
(function (UnicycleDemo) {
    'use strict';

    var Saw = (function () {

        var sawBodyShapeOptions = {
            collisionGroup: 2
            , collisionMask: 1 | 2
        }
        , sawStyle = { 
            lineColor: 0x777777
            , fillColor: 0x777777
            , lineWidth: 2
        }
        , sawTexture = PIXI.Texture.fromImage('img/saw.png', false);

        /**
         * Creates a new Saw instance
         * @param  {Game} game
         */
        function Saw(game, position) {

            P2Pixi.GameObject.call(this, game);

            var saw = new p2.Body({
                    mass: 100
                    , position: position
                })
                , anchor = new p2.Body({
                    mass: 0
                    , position: position
                })
                , revoluteConstraint;

            this.addBody(saw)
                .addShape(saw
                    , new p2.Circle(1)
                    , [0, 0]
                    , 0
                    , sawBodyShapeOptions
                    , null
                    , sawTexture
                    , 1)
            .addBody(anchor);

            _.each(this.bodies, function(b) { b.gameObjectType = 'saw'; });

            revoluteConstraint = new p2.RevoluteConstraint(saw, anchor, { worldPivot: position });
            revoluteConstraint.enableMotor();
            revoluteConstraint.setMotorSpeed(-2.5);

            this.addConstraint(revoluteConstraint);
        }

        Saw.prototype = Object.create(P2Pixi.GameObject.prototype);

        return Saw;
    })();

    UnicycleDemo.Saw = Saw;
})(UnicycleDemo || (UnicycleDemo = {}));
