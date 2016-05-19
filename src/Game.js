module.exports = (function () {

    /**
     * Creates a new Game instance
     */
    function Game(options) {

        options = options || {};
        options.trackedBodyOffset = options.trackedBodyOffset || [0, 0];
        this.options = options;

        this.world = new p2.World(options.worldOptions || {});
        this.pixiAdapter = new P2Pixi.PixiAdapter(options.pixiOptions || {});

        this.gameObjects = [];
        this.trackedBody = null;
        this.paused = false;

        this.lastWorldStepTime = null;

        this.assetsLoaded = false;

        if (options.assetUrls) {
            this.loadAssets(options.assetUrls);
        } else {
            this.assetsLoaded = true;
        }

        this.runIfAssetsLoaded();
    }

    /**
     * Adds the supplied GameObject
     */
    Game.prototype.addGameObject = function(gameObject) {
        this.gameObjects.push(gameObject);
    };

    /**
     * Removes the supplied GameObject
     */
    Game.prototype.removeGameObject = function(gameObject) {     
        var index = this.gameObjects.indexOf(gameObject);

        if (index !== -1) {
            gameObject.clear();

            this.gameObjects.splice(index, 1);
        }
    };

    /**
     * Loads the supplied assets asyncronously
     */
    Game.prototype.loadAssets = function (assetUrls) {
        var self = this
            , loader = PIXI.loader
            , i;

        for (i = 0; i < assetUrls.length; i++) {
            loader.add(assetUrls[i], assetUrls[i]);
        }

        loader.once('complete', function() {
            self.assetsLoaded = true;
            self.runIfAssetsLoaded();
        });

        loader.load();
    };

    /**
     * Called before the game loop is started 
     */
    Game.prototype.beforeRun = function () { };

    /**
     * Checks if all assets are loaded and if so, runs the game
     */
    Game.prototype.runIfAssetsLoaded = function () {
        if (this.assetsLoaded) {
            this.beforeRun();
            this.run();
        }
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
            , maxSubSteps = 10;

        self.lastWorldStepTime = self.time();

        function update() {
            var timeSinceLastCall;

            if (!self.paused) {
                timeSinceLastCall = self.time() - self.lastWorldStepTime;
                self.lastWorldStepTime = self.time();
                self.world.step(1 / 60, timeSinceLastCall, maxSubSteps);
            }

            self.beforeRender();
            self.render();
            self.afterRender();
            
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
            , containerPosition 
            , trackedBodyPosition
            , trackedBodyOffset
            , deviceScale;

        // Focus tracked body, if set
        if (trackedBody !== null) {
            pixiAdapter = this.pixiAdapter;
            renderer = pixiAdapter.renderer;
            ppu = pixiAdapter.pixelsPerLengthUnit;
            containerPosition = pixiAdapter.container.position;
            trackedBodyPosition = trackedBody.position;
            trackedBodyOffset = this.options.trackedBodyOffset;
            deviceScale = pixiAdapter.deviceScale;

            containerPosition.x = ((trackedBodyOffset[0] + 1) * renderer.width * 0.5) - (trackedBodyPosition[0] * ppu * deviceScale);
            containerPosition.y = ((trackedBodyOffset[1] + 1) * renderer.height * 0.5) + (trackedBodyPosition[1] * ppu * deviceScale);
        }
    };

    /**
     * Updates the Pixi representation of the world
     */
    Game.prototype.render = function () {
        var pixiAdapter = this.pixiAdapter
            , ppu = pixiAdapter.pixelsPerLengthUnit
            , gameObjects = this.gameObjects
            , gameObjectCount = gameObjects.length
            , gameObject
            , gameObjectBodyCount
            , i, j
            , body
            , container;

        for (i = 0; i < gameObjectCount; i++) {
            gameObject = gameObjects[i];
            gameObjectBodyCount = gameObject.bodies.length;

            // Update Container transforms
            for (j = 0; j < gameObjectBodyCount; j++) {
                body = gameObject.bodies[j];
                container = gameObject.containers[j];

                container.position.x = body.position[0] * ppu;
                container.position.y = -body.position[1] * ppu;
                container.rotation = -body.angle;
            }
        }

        pixiAdapter.renderer.render(pixiAdapter.stage);
    };

    /**
     * Called after rendering
     */
    Game.prototype.afterRender = function () { };

    /**
     * Removes all GameObjects
     */
    Game.prototype.clear = function () {
        while (this.gameObjects.length > 0) {
            this.removeGameObject(this.gameObjects[0]);
        }
    };

    /**
     * Toggles pause state
     */
    Game.prototype.pauseToggle = function () {
        this.paused = !this.paused;

        if (!this.paused) {
            this.lastWorldStepTime = this.time();
        }
    };

    return Game;
})();