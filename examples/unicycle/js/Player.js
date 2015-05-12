var UnicycleDemo;
(function (UnicycleDemo) {
    'use strict';

    var Player = (function () {

        var playerBodyShapeOptions = {
            collisionGroup: 1
            , collisionMask: 2
        }
        , shirtTexture = PIXI.Texture.fromImage('img/fabric-patchwork.png', false)
        , hatTexture = PIXI.Texture.fromImage('img/fabric-floral.png', false)
        , socksTexture = PIXI.Texture.fromImage('img/fabric-striped-orange.png', false)
        , trousersTexture = PIXI.Texture.fromImage('img/fabric-checked-bw.png', false)
        , skinTexture = PIXI.Texture.fromImage('img/skin-paint.png', false)
        , shoeTexture = PIXI.Texture.fromImage('img/leather-red.png', false)
        , wheelStyle = { 
            lineColor: 0x666666,
            lineWidthUnits: 0.015625
        }
        , wheelRimStyle = { 
            lineColor: 0x666666,
            lineWidthUnits: 0.03125
        }
        , tyreStyle = { 
            lineColor: 0x222222,
            lineWidthUnits: 0.0625
        }
        , shaftStyle = { 
            lineColor: 0x444444,
            fillColor: 0x444444,
            lineWidthUnits: 0.0078125
        }
        , pedalStyle = { 
            lineColor: 0x444444,
            fillColor: 0x888888,
            lineWidthUnits: 0.0078125
        }
        , pedalShaftStyle = { 
            lineColor: 0x444444,
            lineWidthUnits: 0.03125
        }
        , seatStyle = { 
            lineColor: 0x442200,
            fillColor: 0x884400,
            lineWidthUnits: 0.0078125
        }
        , skinStyle = { 
            lineColor: 0x999999,
            lineWidthUnits: 0.0078125
        }
        , noseStyle = { 
            lineColor: 0x990000,
            fillColor: 0x990000,
            lineWidthUnits: 0.0078125
        }
        , eyeStyle = { 
            lineColor: 0x222222,
            lineWidthUnits: 0.015625
        }
        , mouthStyle = { 
            lineColor: 0xcc0000,
            lineWidthUnits: 0.03125
        }
        , mouthCrackStyle = { 
            lineColor: 0x222222,
            lineWidthUnits: 0.0078125
        }
        , earStyle = { 
            lineColor: 0x777777,
            lineWidthUnits: 0.0078125
        }
        , hatStyle = {
            lineColor: 0xff0000,
            fillColor: 0xff0000,
            lineWidthUnits: 0.0078125
        }
        , tyreMaterial = new p2.Material();

        /**
         * Creates a new Player instance
         * @param  {Game} game
         */
        function Player(game, position) {
            P2Pixi.GameObject.call(this, game);

            var wheel = new p2.Body({
                mass: 1
                , position: position
            })
            , tyreCircle
            , shaft = new p2.Body({
                mass: 0.075
                , position: [position[0], position[1] + 0.375]
            })
            , legFrontTop = new p2.Body({
                mass: 0.1
                , position: [position[0] - 0.2, position[1] + 0.2]
            })
            , legFrontBottom = new p2.Body({
                mass: 0.1
                , position: [position[0] - 0.2, position[1] - 0.2]
            })
            , legBackTop = new p2.Body({
                mass: 0.1
                , position: [position[0] + 0.2, position[1] + 0.2]
            })
            , legBackBottom = new p2.Body({
                mass: 0.1
                , position: [position[0] + 0.2, position[1] - 0.2]
            })
            , backPedalShaft = new p2.Body({
                mass: 0.01
                , position: [position[0] + 0.075, position[1]]
            })
            , frontPedalShaft = new p2.Body({
                mass: 0.01
                , position: [position[0] - 0.075, position[1]]
            })
            , torso = new p2.Body({
                mass: 0.5
                , position: [position[0], position[1] + 4]
            })
            , armBackTop = new p2.Body({
                mass: 0.02
                , position: [position[0], position[1] + 4]
            })
            , armBackBottom = new p2.Body({
                mass: 0.03
                , position: [position[0], position[1] + 2]
            })
            , armFrontTop = new p2.Body({
                mass: 0.03
                , position: [position[0], position[1] + 4]
            })
            , armFrontBottom = new p2.Body({
                mass: 0.02
                , position: [position[0], position[1] + 2]
            })
            , headNeck = new p2.Body({
                mass: 0.1
                , position: [position[0], position[1] + 5]
            })
            , hat = new p2.Body({
                mass: 0.01
                , position: [position[0], position[1] + 5.5]
            })
            , i;

            tyreCircle = new p2.Circle(0.3); 
            tyreCircle.material = game.tyreMaterial;

            this.addBody(armBackTop)
                .addShape(armBackTop
                    , new p2.Rectangle(0.1, 0.3)
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , shirtTexture
                    , 1)
                .addShape(armBackTop
                    , new p2.Circle(0.05)
                    , [0, 0.15]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , shirtTexture
                    , 1)
            .addBody(armBackBottom)
                .addShape(armBackBottom
                    , new p2.Circle(0.05)
                    , [0, -0.175]
                    , 0
                    , playerBodyShapeOptions
                    , skinStyle
                    , skinTexture
                    , 1)
                .addShape(armBackBottom
                    , new p2.Rectangle(0.1, 0.3)
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , shirtTexture
                    , 1)
                .addShape(armBackBottom
                    , new p2.Circle(0.05)
                    , [0, 0.15]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , shirtTexture
                    , 1)
            .addBody(legBackTop)
                .addShape(legBackTop
                    , new p2.Rectangle(0.15, 0.4)
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , trousersTexture
                    , 1)
                .addShape(legBackTop
                    , new p2.Circle(0.075)
                    , [0, -0.2]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , trousersTexture
                    , 1)
            .addBody(legBackBottom)
                .addShape(legBackBottom
                    , new p2.Convex([[0.075, 0.2], [-0.075, 0.2], [-0.05, -0.1], [0.05, -0.1]])
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , trousersTexture
                    , 1)
                .addShape(legBackBottom
                    , new p2.Rectangle(0.1, 0.1)
                    , [0, -0.1]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , socksTexture
                    , 1)
                .addShape(legBackBottom
                    , new p2.Convex([[0.05, -0.15], [-0.05, -0.15], [-0.25, -0.21], [-0.25, -0.2375], [0.05, -0.2375]])
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , shoeTexture
                    , 1)
                .addShape(legBackBottom
                    , new p2.Rectangle(0.1, 0.03)
                    , [-0.2, -0.2525]
                    , 0
                    , playerBodyShapeOptions
                    , pedalStyle
                    , null
                    , 1)
            .addBody(backPedalShaft)
                .addShape(backPedalShaft
                    , new p2.Line(0.15)
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , pedalShaftStyle
                    , null
                    , 1)
            .addBody(wheel)
                .addRadiusAdjustedCircle(wheel
                    , new p2.Circle(0.25)
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , wheelRimStyle
                    , null
                    , 1)
                .addShape(wheel
                    , new p2.Line(0.5)
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , wheelStyle
                    , null
                    , 1)
                .addShape(wheel
                    , new p2.Line(0.5)
                    , [0, 0]
                    , Math.PI / 6
                    , playerBodyShapeOptions
                    , wheelStyle
                    , null
                    , 1)
                .addShape(wheel
                    , new p2.Line(0.5)
                    , [0, 0]
                    , Math.PI / 3
                    , playerBodyShapeOptions
                    , wheelStyle
                    , null
                    , 1)
                .addShape(wheel
                    , new p2.Line(0.5)
                    , [0, 0]
                    , Math.PI / 2
                    , playerBodyShapeOptions
                    , wheelStyle
                    , null
                    , 1)
                .addShape(wheel
                    , new p2.Line(0.5)
                    , [0, 0]
                    , Math.PI * (2 / 3)
                    , playerBodyShapeOptions
                    , wheelStyle
                    , null
                    , 1)
                .addShape(wheel
                    , new p2.Line(0.5)
                    , [0, 0]
                    , Math.PI * (5 / 6)
                    , playerBodyShapeOptions
                    , wheelStyle
                    , null
                    , 1)
                .addRadiusAdjustedCircle(wheel
                    , tyreCircle
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , tyreStyle
                    , null
                    , 1)
            .addBody(shaft)
                .addShape(shaft
                    , new p2.Rectangle(0.05, 0.7)
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , shaftStyle
                    , null
                    , 1)
                .addShape(shaft
                    , new p2.Rectangle(0.3, 0.05)
                    , [0, 0.35]
                    , 0
                    , playerBodyShapeOptions
                    , seatStyle
                    , null
                    , 1)
                .addShape(shaft
                    , new p2.Rectangle(0.15, 0.1)
                    , [0, 0.425]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , trousersTexture
                    , 1)
            .addBody(frontPedalShaft)
                .addShape(frontPedalShaft
                    , new p2.Line(0.15)
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , pedalShaftStyle
                    , null
                    , 1)
            .addBody(legFrontTop)
                .addShape(legFrontTop
                    , new p2.Rectangle(0.15, 0.4)
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , trousersTexture
                    , 1)
                .addShape(legFrontTop
                    , new p2.Circle(0.075)
                    , [0, -0.2]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , trousersTexture
                    , 1)
            .addBody(legFrontBottom)
                .addShape(legFrontBottom
                    , new p2.Convex([[0.075, 0.2], [-0.075, 0.2], [-0.05, -0.1], [0.05, -0.1]])
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , trousersTexture
                    , 1)
                .addShape(legFrontBottom
                    , new p2.Rectangle(0.1, 0.1)
                    , [0, -0.1]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , socksTexture
                    , 1)
                .addShape(legFrontBottom
                    , new p2.Convex([[0.05, -0.15], [-0.05, -0.15], [-0.25, -0.21], [-0.25, -0.2375], [0.05, -0.2375]])
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , shoeTexture
                    , 1)
                .addShape(legFrontBottom
                    , new p2.Rectangle(0.1, 0.03)
                    , [-0.2, -0.2525]
                    , 0
                    , playerBodyShapeOptions
                    , pedalStyle
                    , null
                    , 1)
            .addBody(headNeck)
                .addShape(headNeck
                    , new p2.Rectangle(0.125, 0.2)
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , skinStyle
                    , skinTexture
                    , 1)
                .addShape(headNeck
                    , new p2.Circle(0.03)
                    , [-0.2, 0.13]
                    , 0
                    , playerBodyShapeOptions
                    , noseStyle
                    , null
                    , 1)
                .addShape(headNeck
                    , new p2.Circle(0.13)
                    , [-0.05, 0.15]
                    , 0
                    , playerBodyShapeOptions
                    , skinStyle
                    , skinTexture
                    , 1)
            .addBody(hat)
                .addShape(hat
                    , new p2.Convex([[0, 0.25], [-0.11, 0], [0.11, 0]])
                    , [0, 0]
                    , Math.PI * -0.25
                    , playerBodyShapeOptions
                    , null
                    , hatTexture
                    , 1)
            .addBody(torso)
                .addShape(torso
                    , new p2.Convex([[0.075, 0.2], [-0.075, 0.2], [-0.12, 0.1], [-0.12, 0], [-0.11, -0.1], [-0.11, -0.2], [0.09, -0.2]])
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , shirtTexture
                    , 1)
                .addShape(torso
                    , new p2.Circle(0.075)
                    , [0, 0.2]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , shirtTexture
                    , 1)
            .addBody(armFrontTop)
                .addShape(armFrontTop
                    , new p2.Rectangle(0.1, 0.3)
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , shirtTexture
                    , 1)
                .addShape(armFrontTop
                    , new p2.Circle(0.05)
                    , [0, 0.15]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , shirtTexture
                    , 1)
            .addBody(armFrontBottom)
                .addShape(armFrontBottom
                    , new p2.Circle(0.05)
                    , [0, -0.175]
                    , 0
                    , playerBodyShapeOptions
                    , skinStyle
                    , skinTexture
                    , 1)
                .addShape(armFrontBottom
                    , new p2.Rectangle(0.1, 0.3)
                    , [0, 0]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , shirtTexture
                    , 1)
                .addShape(armFrontBottom
                    , new p2.Circle(0.05)
                    , [0, 0.15]
                    , 0
                    , playerBodyShapeOptions
                    , null
                    , shirtTexture
                    , 1);

            for (var i = 0; i < this.bodies.length; i++) {
                this.bodies[i].gameObjectType = 'player';
            }

            var headNeckContainer = this.containers[this.bodies.indexOf(headNeck)];

            // Eye
            game.pixiAdapter.addShape(headNeckContainer, new p2.Line(0.03), [-0.12, 0.2], Math.PI / 2, eyeStyle, null, 1);
            game.pixiAdapter.addShape(headNeckContainer, new p2.Line(0.03), [-0.12, 0.12], Math.PI / 2, eyeStyle, null, 1);
            game.pixiAdapter.addShape(headNeckContainer, new p2.Circle(0.025), [-0.12, 0.16], 0, eyeStyle, null, 1);
            game.pixiAdapter.addShape(headNeckContainer, new p2.Circle(0.0025), [-0.12, 0.16], 0, eyeStyle, null, 1);

            // Mouth
            game.pixiAdapter.addShape(headNeckContainer, new p2.Line(0.085), [-0.105, 0.075], Math.PI * 1.2, mouthStyle, null, 1);
            game.pixiAdapter.addShape(headNeckContainer, new p2.Line(0.075), [-0.11, 0.075], Math.PI * 1.2, mouthCrackStyle, null, 1);

            // Ear
            game.pixiAdapter.addShape(headNeckContainer, new p2.Line(0.05), [-0.025, 0.175], Math.PI * 0.85, earStyle, null, 1);
            game.pixiAdapter.addShape(headNeckContainer, new p2.Line(0.05), [-0.02, 0.143], Math.PI * 1.35, earStyle, null, 1);


            this.shaft = shaft;
            this.torso = torso;
            this.headNeck = headNeck;
            this.armBackTop = armBackTop;
            this.armBackBottom = armBackBottom;
            this.armFrontTop = armFrontTop;
            this.armFrontBottom = armFrontBottom;
            this.legBackTop = legBackTop;
            this.legBackBottom = legBackBottom;
            this.legFrontTop = legFrontTop;
            this.legFrontBottom = legFrontBottom;
            this.wheel = wheel;

            headNeck.gravityScale = -1;
            torso.gravityScale = -1;

            // Connect shaft to wheel
            this.shaftWheelConstraint = new p2.RevoluteConstraint(shaft, wheel, { localPivotA: [0, -0.35], localPivotB: [0, 0] });
            this.shaftWheelConstraint.enableMotor();
            this.shaftWheelConstraint.setMotorSpeed(0);
            this.addConstraint(this.shaftWheelConstraint);

            // Lock back pedal shaft to wheel
            var backPedalShaftWheelConstraint = new p2.LockConstraint(backPedalShaft, wheel, { localOffsetB : [-0.075, 0] });
            this.addConstraint(backPedalShaftWheelConstraint);

            // Lock front pedal shaft to wheel
            var frontPedalShaftWheelConstraint = new p2.LockConstraint(frontPedalShaft, wheel, { localOffsetB : [0.075, 0] });
            this.addConstraint(frontPedalShaftWheelConstraint);
            

            // Connect back leg to shaft and wheel

            this.addConstraint(new p2.RevoluteConstraint(legBackTop, shaft, { localPivotA: [0, 0.2], localPivotB: [0, 0.425] }));
            this.addConstraint(new p2.RevoluteConstraint(legBackBottom, wheel, { localPivotA: [-0.2, -0.2525], localPivotB: [0.15, 0] }));

            var legBackTopLegBackBottomConstraint = new p2.RevoluteConstraint(legBackTop, legBackBottom, { localPivotA: [0, -0.2], localPivotB: [0, 0.2] });
            legBackTopLegBackBottomConstraint.lowerLimitEnabled = true;
            legBackTopLegBackBottomConstraint.lowerLimit = Math.PI * 0.2;
            this.addConstraint(legBackTopLegBackBottomConstraint);


            // Connect front leg to shaft and wheel

            this.addConstraint(new p2.RevoluteConstraint(legFrontTop, shaft, { localPivotA: [0, 0.2], localPivotB: [0, 0.425] }));
            this.addConstraint(new p2.RevoluteConstraint(legFrontBottom, wheel, { localPivotA: [-0.2, -0.2525], localPivotB: [-0.15, 0] }));

            var legFrontTopLegFrontBottomConstraint = new p2.RevoluteConstraint(legFrontTop, legFrontBottom, { localPivotA: [0, -0.2], localPivotB: [0, 0.2] });
            legFrontTopLegFrontBottomConstraint.lowerLimitEnabled = true;
            legFrontTopLegFrontBottomConstraint.lowerLimit = Math.PI * 0.2;
            this.addConstraint(legFrontTopLegFrontBottomConstraint);


            // Connect shaft to torso

            this.shaftTorsoConstraint = new p2.RevoluteConstraint(shaft, torso, { localPivotA: [0, 0.45], localPivotB: [0, -0.2] });
            this.shaftTorsoConstraint.upperLimitEnabled = true;
            this.shaftTorsoConstraint.upperLimit = Math.PI * 0.05;
            this.shaftTorsoConstraint.lowerLimitEnabled = true;
            this.shaftTorsoConstraint.lowerLimit = Math.PI * -0.2;
            this.addConstraint(this.shaftTorsoConstraint);


            // Connect back arm top to torso

            this.torsoArmBackTopConstraint = new p2.RevoluteConstraint(torso, armBackTop, { localPivotA: [0, 0.2], localPivotB: [0, 0.15] });
            this.torsoArmBackTopConstraint.upperLimitEnabled = true;
            this.torsoArmBackTopConstraint.upperLimit = Math.PI * 0.3;
            this.torsoArmBackTopConstraint.lowerLimitEnabled = true;
            this.torsoArmBackTopConstraint.lowerLimit = Math.PI * -0.2;
            this.addConstraint(this.torsoArmBackTopConstraint);


            // Connect back arm bottom to back arm top

            this.armBackBottomArmTopConstraint = new p2.RevoluteConstraint(armBackBottom, armBackTop, { localPivotA: [0, 0.15], localPivotB: [0, -0.15] });
            this.armBackBottomArmTopConstraint.upperLimitEnabled = true;
            this.armBackBottomArmTopConstraint.upperLimit = Math.PI * 0.8;
            this.armBackBottomArmTopConstraint.lowerLimitEnabled = true;
            this.armBackBottomArmTopConstraint.lowerLimit = Math.PI * 0.13;
            this.addConstraint(this.armBackBottomArmTopConstraint);


            // Connect front arm top to torso

            this.torsoArmFrontTopConstraint = new p2.RevoluteConstraint(torso, armFrontTop, { localPivotA: [0, 0.2], localPivotB: [0, 0.15] });
            this.torsoArmFrontTopConstraint.upperLimitEnabled = true;
            this.torsoArmFrontTopConstraint.upperLimit = Math.PI * 0.2;
            this.torsoArmFrontTopConstraint.lowerLimitEnabled = true;
            this.torsoArmFrontTopConstraint.lowerLimit = Math.PI * -0.3;
            this.addConstraint(this.torsoArmFrontTopConstraint);


            // Connect front arm bottom to front arm top

            this.armFrontBottomArmFrontTopConstraint = new p2.RevoluteConstraint(armFrontBottom, armFrontTop, { localPivotA: [0, 0.15], localPivotB: [0, -0.15] });
            this.armFrontBottomArmFrontTopConstraint.upperLimitEnabled = true;
            this.armFrontBottomArmFrontTopConstraint.upperLimit = Math.PI * 0.7;
            this.armFrontBottomArmFrontTopConstraint.lowerLimitEnabled = true;
            this.armFrontBottomArmFrontTopConstraint.lowerLimit = Math.PI * 0.12;
            this.addConstraint(this.armFrontBottomArmFrontTopConstraint);


            // Connect head / neck to torso

            this.headNeckTorsoConstraint = new p2.RevoluteConstraint(torso, headNeck, { localPivotA: [0, 0.2], localPivotB: [0, -0.1] });
            this.headNeckTorsoConstraint.upperLimitEnabled = true;
            this.headNeckTorsoConstraint.upperLimit = Math.PI * 0.1;
            this.headNeckTorsoConstraint.lowerLimitEnabled = true;
            this.headNeckTorsoConstraint.lowerLimit = Math.PI * -0.1;
            this.headNeckTorsoConstraint.maxForce = 0.5;
            this.addConstraint(this.headNeckTorsoConstraint);


            // Connect hat to head / neck
            var hatHeadConstraint = new p2.LockConstraint(hat, headNeck, { localOffsetB : [0, -0.21] });
            hatHeadConstraint.maxForce = 0.5;
            this.addConstraint(hatHeadConstraint);


            this.speed = 0; // Speed of the wheel motor, in p2 speed units
            this.maximumSpeed = 4; // Absolute maxiumum speed of the wheel motor in either direction, in p2 speed units
            this.accelerationRate = 8; // Rate at which player can accelerate, in p2 speed units per millisecond
            this.decelerationRate = 8; // Rate at which the player comes to rest, in p2 speed units per millisecond
            this.direction = 0; // Direction of the player. Negative = left, positive = right

            this.lastCallTime = this.game.time();

            this.lastShaftAngle = 0;
            this.isHoisting = false;
                
            this.primaryBody = wheel;
        }

        Player.prototype = Object.create(P2Pixi.GameObject.prototype);

        /**
         * Adds a circle shape whose outer edge is exactly on the outer edge of its line thickness 
         */
        Player.prototype.addRadiusAdjustedCircle = function (body, shape, offset, angle, options, style, texture, alpha) {
            var container
                , displayObject
                , graphics
                , i
                , adjustedCircle;

            offset = offset || [0, 0];
            angle = angle || 0;

            options = options || {};
            shape.collisionGroup = options.collisionGroup || 1;
            shape.collisionMask = options.collisionMask || 1;

            body.addShape(shape, offset, angle);

            container = this.containers[this.bodies.indexOf(body)];
            if (container === null) {
                container = new PIXI.Container();
                this.containers[this.bodies.indexOf(body)] = container;
                this.game.pixiAdapter.stage.addChild(container);
            }

            adjustedCircle = new p2.Circle(shape.radius - (style.lineWidthUnits / 2));

            this.game.pixiAdapter.addShape(container
                , adjustedCircle
                , offset
                , angle
                , style
                , texture
                , alpha);

            return this;
        }

        /**
         * Returns the motor speed of the unicycle's wheel
         * @return {Number} speed
         */
        Player.prototype.getSpeed = function () {
            return this.shaftWheelConstraint.getMotorSpeed();
        };

        /**
         * Sets the motor speed of the unicycle's wheel
         * @param  {Number} speed
         */
        Player.prototype.setSpeed = function (speed) {
            var headNeck = this.headNeck
                , torso = this.torso
                , shaft = this.shaft
                , wheel = this.wheel
                , shaftWheelConstraint = this.shaftWheelConstraint
                , shaftAngle = shaft.angle
                , absShaftAngle = Math.abs(shaftAngle)
                , directionMultiplier = (shaftAngle > 0 ? 1 : -1)
                , factor, pushFactor, mult, hForce, vForce, grav
                , direction = this.direction
                , timeInactive = this.game.time() - this.game.lastActiveTime
                , solidBodies
                , wheelOnSolid
                , canPush     
                , torsoBodies = [
                    this.torso
                    , this.armBackTop, this.armBackBottom
                    , this.armFrontTop, this.armFrontBottom
                ];

            shaftWheelConstraint.enableMotor();
            shaftWheelConstraint.setMotorSpeed(speed);

            factor = Math.min((absShaftAngle / (Math.PI * 0.75)), 1);
            this.shaftTorsoConstraint.upperLimit = Math.PI * 0.1 * factor;
            this.shaftTorsoConstraint.lowerLimit = Math.PI * -0.3 * factor;

            shaft.setZeroForce();
            torso.setZeroForce();
            headNeck.setZeroForce();

            shaft.gravityScale = 1;
            headNeck.gravityScale = 1;
            torso.gravityScale = 1;

            if (timeInactive < 1.5 && direction !== 0) {

                shaft.gravityScale = 0;
                headNeck.gravityScale = 0;
                torso.gravityScale = 0;

                hForce = Math.cos(absShaftAngle);
                vForce = Math.sin(absShaftAngle);

                solidBodies = _.filter(this.game.world.bodies, function(b) { return b.gameObjectType === 'solid' || b.gameObjectType === 'flimsy'; });
                wheelOnSolid = _.some(solidBodies, function(solidBody) { return wheel.overlaps(solidBody); });

                canPush = _.some(torsoBodies, function(torsoBody) { 
                    return _.some(solidBodies, function(solidBody) { return torsoBody.overlaps(solidBody); });
                });

                if (absShaftAngle >= Math.PI * 0.0625) {
                    shaftWheelConstraint.disableMotor();
                } else {
                    this.isHoisting = false;
                }

                if (absShaftAngle < Math.PI * 0.25) {

                    // Player has to make a correction

                    factor = (absShaftAngle / (Math.PI * 0.25));
                    pushFactor = canPush ? 3 : 1;
                    mult = factor * pushFactor * 1.25;

                    if (wheelOnSolid) {
                        grav = -factor * 0.5;
                        shaft.gravityScale = grav;
                        headNeck.gravityScale = grav;
                        torso.gravityScale = grav;
                    }

                    if (!this.isHoisting) {
                        shaft.applyForce([hForce * mult * directionMultiplier, vForce * mult], shaft.position);
                        torso.applyForce([2 * hForce * mult * directionMultiplier, 2 * vForce * mult], torso.position);
                        headNeck.applyForce([4 * hForce * mult * directionMultiplier, 4 * vForce * mult], headNeck.position);
                    }

                } else if (absShaftAngle < Math.PI * 0.75) {

                    // Player is trying to haul himself up

                    if (wheelOnSolid) {
                        this.isHoisting = true;

                        factor = ((absShaftAngle - (Math.PI * 0.25)) / (Math.PI * 0.5));
                        pushFactor = canPush ? 3 : 1;
                        mult = factor * pushFactor * 2;

                        grav = (1 - factor) * 0.75;
                        shaft.gravityScale = grav;
                        headNeck.gravityScale = grav;
                        torso.gravityScale = grav;

                        shaft.applyForce([hForce * mult * directionMultiplier, vForce * mult], shaft.position);
                        torso.applyForce([2 * hForce * mult * directionMultiplier, 2 * vForce * mult], torso.position);
                        headNeck.applyForce([4 * hForce * mult * directionMultiplier, 4 * vForce * mult], headNeck.position);
                    }
                }
            }

            this.lastShaftAngle = shaftAngle;
        };

        /**
         * Accelerates the unicycle to the left
         */
        Player.prototype.accelerateLeft = function () {
            this.direction = -1;
        };

        /**
         * Accelerates the unicycle to the right
         */
        Player.prototype.accelerateRight = function () {
            this.direction = 1;
        };

        /**
         * Removes acceleration from the unicycle
         */
        Player.prototype.endAcceleration = function () {
            this.direction = 0;
        };

        Player.prototype.applyAcceleration = function() {
            var self = this
                , time = self.game.time()
                , timeSinceLastCall = time - self.lastCallTime
                , speed = self.getSpeed();

            self.lastCallTime = time;

            if (self.direction < 0) {
                speed -= (timeSinceLastCall * self.accelerationRate);
            } else if (self.direction > 0) {
                speed += (timeSinceLastCall * self.accelerationRate);
            } else {
                if (speed < 0) {
                    speed += (timeSinceLastCall * self.decelerationRate)
                } else if (speed > 0) {
                    speed -= (timeSinceLastCall * self.decelerationRate);
                }
            }

            if (speed < -self.maximumSpeed) {
                speed = -self.maximumSpeed;
            } else if (speed > self.maximumSpeed) {
                speed = self.maximumSpeed;
            }

            self.setSpeed(speed);
        };

        return Player;
    })();

    UnicycleDemo.Player = Player;
})(UnicycleDemo || (UnicycleDemo = {}));
