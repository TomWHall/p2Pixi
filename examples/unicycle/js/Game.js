var UnicycleDemo;
(function (UnicycleDemo) {
    'use strict';

    var Game = (function () {

        /**
         * Creates a new Unicycle Game instance
         */
        function Game() {

            var self = this
                , options = {
                    worldOptions: {
                        gravity: [0, -9.8]
                    }
                    , pixiOptions: {
                        view: document.getElementById('viewport')
                        , width: 1024
                        , height: 1024
                        , transparent: false
                    }
                    , assetUrls: [
                        'img/canvas.jpg'
                        , 'img/plank.png'
                        , 'img/fabric-striped-orange.png'
                        , 'img/fabric-checked-bw.png'
                        , 'img/fabric-patchwork.png'
                        , 'img/fabric-floral.png'
                        , 'img/skin-paint.png'
                        , 'img/leather-red.png'
                        , 'img/saw.png'
                    ]
                    , trackedBodyOffset: [0, -0.5]
                };

            P2Pixi.Game.call(this, options);

            self.background = new PIXI.Container();

            self.inputReceived = false;
            self.lastActiveTime = self.time();
            self.killed = false;

            self.tyreMaterial = new p2.Material();
            self.plankMaterial = new p2.Material();
            self.seesawMaterial = new p2.Material();

            self.world.addContactMaterial(new p2.ContactMaterial(self.tyreMaterial, self.plankMaterial, {
                restitution: 0.5
                , stiffness: Number.MAX_VALUE
                , friction: 0.75
            }));

            self.buildBackground();
        }

        Game.prototype = Object.create(P2Pixi.Game.prototype);

        /**
         * Adds the parallax background to the Pixi stage
         */
        Game.prototype.buildBackground = function() {

            var self = this
                , pixiAdapter = this.pixiAdapter
                , deviceScale = pixiAdapter.deviceScale
                , canvasTexture = PIXI.Texture.fromImage('img/canvas.jpg', false)
                , canvasSprite = new PIXI.Sprite(canvasTexture);

            canvasSprite.position.x = 0;
            canvasSprite.position.y = 0;
            canvasSprite.scale.x = deviceScale;
            canvasSprite.scale.y = deviceScale;
            self.background.addChild(canvasSprite);

            pixiAdapter.stage.addChildAt(self.background, 0);
        }

        Game.prototype.onPostStep = function (event) {
            var self = this;

            if (!self.paused) {
                if (self.inputReceived) {
                    self.lastActiveTime = self.time();
                }

                self.player.applyAcceleration();
            }
        };

        Game.prototype.beforeRun = function () {
            var self = this;

            this.player = new UnicycleDemo.Player(this, [2, -1]);
            this.trackedBody = this.player.primaryBody;
            
            // Hide the player until his constraints have resolved
            _.each(this.player.containers, function(doc) { doc.alpha = 0; });
            window.setTimeout(function() {
                _.each(self.player.containers, function(doc) { doc.alpha = 1; });
            }, 250);

            this.killed = false;

            this.terrain = new UnicycleDemo.Terrain(this);

            this.addWorldHandlers();
            this.addInputHandlers();

            document.getElementById('loading').style.display = 'none';
            document.getElementById('viewport').style.display = 'block';
        };

        Game.prototype.beforeRender = function () {
            var trackedBody = this.trackedBody
                , pixiAdapter = this.pixiAdapter
                , renderer = pixiAdapter.renderer
                , ppu = pixiAdapter.pixelsPerLengthUnit
                , containerPosition = pixiAdapter.container.position
                , trackedBodyPosition = trackedBody.position
                , trackedBodyOffset = this.options.trackedBodyOffset
                , deviceScale = pixiAdapter.deviceScale;

            // Focus vertically on player
            containerPosition.y = ((trackedBodyOffset[1] + 1) * renderer.height * 0.5) + (trackedBodyPosition[1] * ppu * deviceScale);

            // Position parallax background
            this.background.position.y = (pixiAdapter.container.position.y * 0.666) - (ppu * 2);
        }

        /**
         * Adds touch / mouse and keyboard handlers
         */
        Game.prototype.addInputHandlers = function () {
            var self = this
                , pixiAdapter = self.pixiAdapter
                , view = pixiAdapter.renderer.view;//, body = document.body

            document.addEventListener('keydown', function (e) {
                var keyID = window.event ? event.keyCode : (e.keyCode !== 0 ? e.keyCode : e.which);
                switch (keyID) {
                    case 37:
                        self.inputReceived = true;
                        self.player.accelerateLeft();
                        break;

                    case 39:
                        self.inputReceived = true;
                        self.player.accelerateRight();
                        break;
                }
            });

            document.addEventListener('keyup', function (e) {
                var keyID = window.event ? event.keyCode : (e.keyCode !== 0 ? e.keyCode : e.which);
                switch (keyID) {
                    case 37:
                    case 39:
                        self.inputReceived = false;
                        self.player.endAcceleration();
                        break;
                }
            });

            function onViewportTouchHold(e) {
                var touch = e.changedTouches ? e.changedTouches[0] : e;

                if (touch.clientX <= pixiAdapter.windowWidth / 2) {
                    self.inputReceived = true;
                    self.player.accelerateLeft();
                } else {
                    self.inputReceived = true;
                    self.player.accelerateRight();
                }
            }

            function onViewportRelease(e) {
                self.inputReceived = false;
                self.player.endAcceleration();
            }

            view.addEventListener('touchstart', onViewportTouchHold, false);
            view.addEventListener('touchend', onViewportRelease, false);

            view.addEventListener('mousedown', onViewportTouchHold, false);
            view.addEventListener('mouseup', onViewportRelease, false);
        };

        /**
         * Adds p2 world handlers
         */
        Game.prototype.addWorldHandlers = function () {
            var self = this
                , playerFleshBodies = null;

            self.world.on('postStep', self.onPostStep.bind(self));

            self.world.on('beginContact', function(event) {
                var bodyA = event.bodyA, bodyB = event.bodyB
                    , player = self.player
                    , playerFleshBodies = playerFleshBodies || [
                        player.headNeck, player.torso
                        , player.armBackTop, player.armBackBottom
                        , player.armFrontTop, player.armFrontBottom
                        , player.legBackTop, player.legBackBottom
                        , player.legFrontTop, player.legFrontBottom
                    ];

                // We may be in the process of restarting after being killed
                if (self.killed) { return; }

                if (bodyA.gameObjectType === 'saw' || bodyB.gameObjectType === 'saw') {
                    if (_.contains(playerFleshBodies, bodyA) || _.contains(playerFleshBodies, bodyB)) {
                        // Sliced by saw
                        _.each(player.constraints, function(constraint) {
                            if (constraint.bodyA === bodyA || constraint.bodyA === bodyB || constraint.bodyB === bodyA || constraint.bodyB === bodyB) {
                                constraint.bodyA.gravityScale = 1;
                                constraint.bodyB.gravityScale = 1;
                                self.world.removeConstraint(constraint);

                                if ((constraint.bodyA === player.headNeck && constraint.bodyB === player.torso)
                                    || (constraint.bodyB === player.headNeck && constraint.bodyA === player.torso)
                                    || (constraint.bodyA === player.torso && constraint.bodyB === player.shaft)
                                    || (constraint.bodyB === player.torso && constraint.bodyA === player.shaft)
                                    || (constraint.bodyA === player.legBackTop && constraint.bodyB === player.shaft)
                                    || (constraint.bodyB === player.legBackTop && constraint.bodyA === player.shaft)
                                    || (constraint.bodyA === player.legFrontTop && constraint.bodyB === player.shaft)
                                    || (constraint.bodyB === player.legFrontTop && constraint.bodyA === player.shaft)) {

                                    // Fatal injury, restart
                                    self.killed = true;
                                    window.setTimeout(function() { window.location.reload(); }, 1500);
                                }
                            }
                        });
                    }
                }
            });
        };

        return Game;
    })();

    UnicycleDemo.Game = Game;
})(UnicycleDemo || (UnicycleDemo = {}));
