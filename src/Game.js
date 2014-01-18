/// <reference path="PixiAdapter.js" />

var P2Pixi;
(function (P2Pixi) {
    'use strict';

    var Game = (function () {

        /**
		 * Creates a new Game instance
		 */
        function Game(options) {

            options = options || {};

            this.world = new p2.World(options.worldOptions || {});
            this.pixiAdapter = new P2Pixi.PixiAdapter(options.pixiOptions || {});

            this.gameObjects = [];
            this.trackedBody = null;
            this.paused = false;

            if (options.imageUrls) {
                this.loadImages(options.imageUrls);
            } else {
                this.assetsLoaded();
            }
        }

        /**
         * Loads the supplied images asyncronously
         */
        Game.prototype.loadImages = function (imageUrls) {
            var self = this
		        , imagesCount = imageUrls.length
                , imagesLoadedCount = 0
		        , i
                , imageLoader;

            for (i = 0; i < imagesCount; i++) {
                imageLoader = new PIXI.ImageLoader(imageUrls[i], false);
                imageLoader.addEventListener('loaded', function (e) {
                    imagesLoadedCount++;
                    if (imagesLoadedCount === imagesCount) {
                        self.assetsLoaded();
                    }
                });
                imageLoader.load();
            }
        };

        /**
         * Called before the game loop is started 
         */
        Game.prototype.beforeRun = function () { };

        /**
         * Called when all assets are loaded
         */
        Game.prototype.assetsLoaded = function () {
            this.beforeRun();
            this.run();
        };

        /**
         * Returns the milliseconds of the current time
         */
        Game.prototype.time = function () {
            return new Date().getTime() / 1000;
        };

        /**
		 * Begins the world step / render loop
		 */
        Game.prototype.run = function () {
            var self = this
		        , lastCallTime = self.time()
                , maxSubSteps = 10;

            function update() {
                var timeSinceLastCall;

                if (!self.paused) {
                    timeSinceLastCall = self.time() - lastCallTime;
                    lastCallTime = self.time();
                    self.world.step(1 / 60, timeSinceLastCall, maxSubSteps);
                }

                self.render();
                requestAnimationFrame(update);
            }

            requestAnimationFrame(update);
        };

        /**
         * Updates the Pixi representation of the world
         */
        Game.prototype.render = function () {
            var pixiAdapter = this.pixiAdapter
				, w = pixiAdapter.renderer.width
				, h = pixiAdapter.renderer.height
				, ppu = pixiAdapter.pixelsPerLengthUnit
				, gameObjects = this.gameObjects
				, gameObjectCount = gameObjects.length
				, gameObject
                , gameObjectBodyCount
				, i
				, j
                , body
                , displayObjectContainer
                , trackedBody = this.trackedBody
				, trackedBodyPosition;

            for (i = 0; i < gameObjectCount; i++) {
                gameObject = gameObjects[i];
                gameObjectBodyCount = gameObject.bodies.length;

                // Update DisplayObjectContainer transforms
                for (j = 0; j < gameObjectBodyCount; j++) {
                    body = gameObject.bodies[j];
                    displayObjectContainer = gameObject.displayObjectContainers[j];

                    displayObjectContainer.position.x = body.position[0] * ppu;
                    displayObjectContainer.position.y = h - body.position[1] * ppu;
                    displayObjectContainer.rotation = -body.angle;
                }
            }

            // Scroll viewport to track focused body if set
            if (trackedBody !== null) {
                trackedBodyPosition = trackedBody.position;
                pixiAdapter.stage.position.x = (pixiAdapter.renderer.width / 2) - (trackedBodyPosition[0] * ppu);
                pixiAdapter.stage.position.y = -(pixiAdapter.renderer.height / 2) + (trackedBodyPosition[1] * ppu);
            }

            pixiAdapter.renderer.render(pixiAdapter.container);
        }

        return Game;
    })();

    P2Pixi.Game = Game;
})(P2Pixi || (P2Pixi = {}));
