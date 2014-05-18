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
            this.trackedBodyOffset = [0.5, 0.5];
            this.paused = false;

            if (options.imageUrls) {
                this.loadImages(options.imageUrls);
            } else {
                this.assetsLoaded();
            }
        }

        /**
         * Adds the supplied GameObject
         */
        Game.prototype.addGameObject = function(gameObject) {
            this.gameObjects.push(gameObject);
        }

        /**
         * Removes the supplied GameObject
         */
        Game.prototype.removeGameObject = function(gameObject) {     
            var index = this.gameObjects.indexOf(gameObject)
                , i
                , body
                , constraint
                , doc;

            if (index !== -1) {
                // Remove p2 constraints from the world
                for (i = 0; i < gameObject.constraints.length; i++) {
                    constraint = gameObject.constraints[i];

                    this.world.removeConstraint(constraint);
                }

                // Remove p2 bodies from the world and Pixi DisplayObjectContainers from the stage
                for (i = 0; i < gameObject.bodies.length; i++) {
                    body = gameObject.bodies[i];
                    doc = gameObject.displayObjectContainers[i];

                    this.world.removeBody(body);
                    this.pixiAdapter.stage.removeChild(doc);
                }

                this.gameObjects.splice(index, 1);
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
         * Returns the current time in seconds
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

                    self.beforeRender();
                    self.render();
                    self.afterRender();
                }

                requestAnimationFrame(update);
            }

            requestAnimationFrame(update);
        };

        /**
         * Called before rendering
         */
        Game.prototype.beforeRender = function () {
            var trackedBody = this.trackedBody
                , pixiAdapter
                , renderer
                , ppu
                , stagePosition 
                , trackedBodyPosition
                , trackedBodyOffset;

            // Focus tracked body, if set
            if (trackedBody !== null) {
                pixiAdapter = this.pixiAdapter;
                renderer = pixiAdapter.renderer;
                ppu = pixiAdapter.pixelsPerLengthUnit;
                stagePosition = pixiAdapter.stage.position;
                trackedBodyPosition = trackedBody.position;
                trackedBodyOffset = this.trackedBodyOffset;

                stagePosition.x = (renderer.width * trackedBodyOffset[0]) - (trackedBodyPosition[0] * ppu);
                stagePosition.y = -(renderer.height * (1 - trackedBodyOffset[1])) + (trackedBodyPosition[1] * ppu);
            }
        }

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
                , displayObjectContainer;

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

            pixiAdapter.renderer.render(pixiAdapter.container);
        }

        /**
         * Called after rendering
         */
        Game.prototype.afterRender = function () { };

        return Game;
    })();

    P2Pixi.Game = Game;
})(P2Pixi || (P2Pixi = {}));
