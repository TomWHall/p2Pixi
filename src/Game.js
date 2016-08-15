var PixiAdapter = require('./PixiAdapter');

module.exports = (function () {

  /**
   * @constructor
   * @param  {Object} options
   */
  function Game(options) {

    options = options || {};
    options.pixiAdapterOptions = options.pixiAdapterOptions || {};
    options.pixiAdapter = options.pixiAdapter || new PixiAdapter(options.pixiAdapterOptions);
    options.worldOptions = options.worldOptions || {};
    options.worldOptions.gravity = options.worldOptions.gravity || [0, -9.8];
    options.trackedBodyOffset = options.trackedBodyOffset || [0, 0];

    this.options = options;
    this.pixiAdapter = options.pixiAdapter;
    this.world = new p2.World(options.worldOptions);

    this.gameObjects = [];
    this.trackedBody = null;

    this.paused = false;
    this.windowFocused = true;

    var self = this;
    window.addEventListener('blur', function (e) { self.windowBlur(e); });
    window.addEventListener('focus', function (e) { self.windowFocus(e); });

    this.lastTimeSeconds = null;

    this.assetsLoaded = false;

    if (options.assetUrls) {
      this.loadAssets(options.assetUrls);
    } else {
      this.runIfReady();
    }
  }

  /**
   * Loads the supplied assets asyncronously using PIXI.loader
   * @param  {String[]} assetUrls
   */
  Game.prototype.loadAssets = function (assetUrls) {
    var loader = PIXI.loader;

    for (var i = 0; i < assetUrls.length; i++) {
      loader.add(assetUrls[i], assetUrls[i]);
    }

    var self = this;
    loader.once('complete', function () {
      self.assetsLoaded = true;
      self.runIfReady();
    });

    loader.load();
  };

  /**
   * Returns true if all async setup functions are complete and the Game is ready to start.
   * Override this to implement multiple setup functions
   * @return {Boolean} 
   */
  Game.prototype.isReadyToRun = function () {
    return this.assetsLoaded;
  };

  /**
   * Checks if all assets are loaded and if so, runs the game
   */
  Game.prototype.runIfReady = function () {
    if (this.isReadyToRun()) {
      this.beforeRun();
      this.run();
    }
  };

  /**
   * Called before the game loop is started 
   */
  Game.prototype.beforeRun = function () { };

  /**
   * Begins the world step / render loop
   */
  Game.prototype.run = function () {
    this.lastTimeSeconds = null;

    var self = this;
    var timeSeconds;
    var lastTimeSeconds;
    var deltaTime;
    var fixedTimeStep = 1 / 60;

    function update(t) {
      if (self.windowFocused && !self.paused) {
        timeSeconds = t / 1000;
        deltaTime = timeSeconds - (self.lastTimeSeconds || timeSeconds);
        self.lastTimeSeconds = timeSeconds;

        self.world.step(fixedTimeStep, deltaTime, 10);
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
    var trackedBody = this.trackedBody;

    // Focus on tracked body, if set
    if (trackedBody !== null) {
      var pixiAdapter = this.pixiAdapter;
      var renderer = pixiAdapter.renderer;
      var ppu = pixiAdapter.pixelsPerLengthUnit;
      var containerPosition = pixiAdapter.container.position;
      var trackedBodyPosition = trackedBody.position;
      var trackedBodyOffset = this.options.trackedBodyOffset;

      containerPosition.x = ((trackedBodyOffset[0] + 1) * renderer.width * 0.5) - (trackedBodyPosition[0] * ppu);
      containerPosition.y = ((trackedBodyOffset[1] + 1) * renderer.height * 0.5) + (trackedBodyPosition[1] * ppu);
    }
  };

  /**
   * Updates the Pixi representation of the world
   */
  Game.prototype.render = function () {
    var gameObjects = this.gameObjects;
    var pixiAdapter = this.pixiAdapter;

    for (var i = 0; i < gameObjects.length; i++) {
      gameObjects[i].updateTransforms();
    }

    pixiAdapter.renderer.render(pixiAdapter.stage);
  };

  /**
   * Called after rendering
   */
  Game.prototype.afterRender = function () { };

  /**
   * Adds the supplied GameObject
   * @param  {GameObject} gameObject
   */
  Game.prototype.addGameObject = function (gameObject) {
    this.gameObjects.push(gameObject);
  };

  /**
   * Removes the supplied GameObject
   * @param  {GameObject} gameObject
   */
  Game.prototype.removeGameObject = function (gameObject) {
    gameObject.remove();
  };

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
      this.lastTimeSeconds = performance.now() / 1000;
    }
  };

  /**
   * Called when the window loses focus
   * @param  {Event} e
   */
  Game.prototype.windowBlur = function (e) {
    this.windowFocused = false;
  };

  /**
   * Called when the window gets focus
   * @param  {Event} e
   */
  Game.prototype.windowFocus = function (e) {
    this.windowFocused = true;

    if (!this.paused) {
      this.lastTimeSeconds = performance.now() / 1000;
    }
  };

  return Game;
})();