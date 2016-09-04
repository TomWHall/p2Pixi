/** 
 * p2Pixi v1.0.6 - 04-09-2016 
 * Copyright (c) Tom W Hall <tomshalls@gmail.com> 
 * A simple 2D vector game model framework using p2.js for physics and Pixi.js for rendering. 
 * License: MIT 
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.P2Pixi = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./PixiAdapter":3}],2:[function(require,module,exports){
module.exports = (function () {

  /**
   * @constructor
   * @param  {Object} game
   */
  function GameObject(game) {
    this.game = game;

    this.bodies = []; // p2 physics bodies
    this.constraints = []; // p2 constraints
    this.containers = []; // Pixi Containers, one for each body. Each contains a child array of Graphics and / or Sprites.
    this.children = []; // Child GameObjects
  }

  /**
   * Adds the supplied p2 body to the game's world and to this GameObject's bodies collection
   * Also creates a corresponding PIXI Container object for rendering.
   * @param  {p2.Body} body
   * @return {GameObject} gameObject
   */
  GameObject.prototype.addBody = function (body) {
    this.bodies.push(body);
    this.game.world.addBody(body);

    var container = new PIXI.Container();
    this.containers.push(container);
    this.game.pixiAdapter.container.addChild(container);

    return this;
  };

  /**
   * Removes the supplied p2 body from the game's world and from this GameObject's bodies collection
   * @param  {p2.Body} body
   * @return {GameObject} gameObject
   */
  GameObject.prototype.removeBody = function (body) {
    var index = this.bodies.indexOf(body);

    this.bodies.splice(index, 1);
    this.game.world.removeBody(body);

    this.containers.splice(index, 1);
    this.game.pixiAdapter.container.removeChildAt(index);

    return this;
  };

  /**
   * Adds the supplied p2 shape to the supplied p2 body
   * @param  {p2.Body} body
   * @param  {p2.Shape} shape
   * @param  {Object} options
   * @return {GameObject} gameObject
   */
  GameObject.prototype.addShape = function (body, shape, options) {
    var offset = options.offset || [0, 0];
    var angle = options.angle || 0;
    shape.collisionGroup = (options.collisionOptions && options.collisionOptions.collisionGroup) || 1;
    shape.collisionMask = (options.collisionOptions && options.collisionOptions.collisionMask) || 1;

    body.addShape(shape, offset, angle);

    var container = this.containers[this.bodies.indexOf(body)];

    this.game.pixiAdapter.addShape(container,
      shape,
      options);

    return this;
  };

  /**
   * Adds the supplied p2 constraint to the game's world and to this GameObject's constraints collection
   * @param  {p2.Constraint} constraint
   * @return {GameObject} gameObject
   */
  GameObject.prototype.addConstraint = function (constraint) {
    this.constraints.push(constraint);

    this.game.world.addConstraint(constraint);

    return this;
  };

  /**
   * Removes the supplied p2 constraint from the game's world and from this GameObject's constraints collection
   * @param  {p2.Constraint} constraint
   * @return {GameObject} gameObject
   */
  GameObject.prototype.removeConstraint = function (constraint) {
    this.game.world.removeConstraint(constraint);

    return this;
  };

  /**
   * Adds the supplied GameObject as a child of this GameObject
   * @param {GameObject} child
   */
  GameObject.prototype.addChild = function (child) {
    child.parent = this;
    this.children.push(child);
  };

  /**
   * Updates the PIXI container transforms for this GameObject and all children
   */
  GameObject.prototype.updateTransforms = function () {
    var ppu = this.game.pixiAdapter.pixelsPerLengthUnit;
    var bodies = this.bodies;
    var containers = this.containers;

    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      var container = containers[i];

      container.position.x = body.position[0] * ppu;
      container.position.y = -body.position[1] * ppu;
      container.rotation = -body.angle;
    }

    // Update children
    var children = this.children;
    for (var i = 0; i < children.length; i++) {
      children[i].updateTransforms();
    }
  };

  /**
   * Removes this GameObject and all of its children from the game
   */
  GameObject.prototype.remove = function () {
    var game = this.game;
    var world = game.world;
    var container = game.pixiAdapter.container;

    // Remove children 
    while (this.children.length > 0) {
      this.children[0].remove();
    }

    // Remove p2 constraints from the world
    for (var i = 0; i < this.constraints.length; i++) {
      world.removeConstraint(this.constraints[i]);
    }

    // Remove p2 bodies from the world and Pixi Containers from the stage
    for (var i = 0; i < this.bodies.length; i++) {
      world.removeBody(this.bodies[i]);
      container.removeChild(this.containers[i]);
    }

    if (this.parent) {
      var index = this.parent.children.indexOf(this);
      this.parent.children.splice(index, 1);
      this.parent = undefined;
    } else {
      var index = game.gameObjects.indexOf(this);
      game.gameObjects.splice(index, 1);
    }
  };

  return GameObject;
})();
},{}],3:[function(require,module,exports){
module.exports = (function () {

  var vec2 = p2.vec2;
  var Circle = p2.Circle;
  var Capsule = p2.Capsule;
  var Convex = p2.Convex;
  var Plane = p2.Plane;
  var Box = p2.Box;
  var Particle = p2.Particle;
  var Line = p2.Line;
  var Heightfield = p2.Heightfield;

  /**
   * @constructor
   * @param  {Object} options
   */
  function PixiAdapter(options) {

    var defaultOptions = {
      width: 1280,
      height: 720,
      pixelsPerLengthUnit: 128,
      useDeviceAspect: false
    };

    options = options || {};
    for (var key in options) {
      defaultOptions[key] = options[key];
    }

    if (defaultOptions.useDeviceAspect) {
      defaultOptions.height = (window.innerHeight / window.innerWidth) * defaultOptions.width;
    }

    this.options = defaultOptions;
    this.pixelsPerLengthUnit = this.options.pixelsPerLengthUnit;

    this.stage = new PIXI.Container();
    this.container = new PIXI.Container();
    this.stage.addChild(this.container);

    this.setupRenderer();
    this.setupView();
  }

  /**
   * Sets up the Pixi renderer
   */
  PixiAdapter.prototype.setupRenderer = function () {
    var options = this.options;
    this.renderer = PIXI.autoDetectRenderer(options.width, options.height, options.rendererOptions);
  };

  /**
   * Sets up the Pixi view
   */
  PixiAdapter.prototype.setupView = function () {
    var self = this;
    var renderer = this.renderer;
    var view = this.renderer.view;
    var container = this.container;

    view.style.position = 'absolute';

    if (!this.options.view) {
      document.body.appendChild(this.renderer.view);
    }

    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    container.position.x = renderer.width / 2;
    container.position.y = renderer.height / 2;

    this.viewCssWidth = 0;
    this.viewCssHeight = 0;
    this.resize(this.windowWidth, this.windowHeight);

    window.addEventListener('resize', resizeRenderer);
    window.addEventListener('orientationchange', resizeRenderer);

    function resizeRenderer() {
      self.resize(window.innerWidth, window.innerHeight);
    }
  };

  /**
   * Draws a circle onto a PIXI.Graphics object
   * @param  {PIXI.Graphics} graphics
   * @param  {Number} x
   * @param  {Number} y
   * @param  {Number} radius
   * @param  {Object} style
   */
  PixiAdapter.prototype.drawCircle = function (graphics, x, y, radius, style) {
    style = style || {};

    var lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 0;
    var lineColor = style.lineColor || 0x000000;
    var fillColor = style.fillColor;

    graphics.lineStyle(lineWidth, lineColor, 1);

    if (fillColor) {
      graphics.beginFill(fillColor, 1);
    }

    graphics.drawCircle(x, y, radius);

    if (fillColor) {
      graphics.endFill();
    }
  };

  /**
   * Draws a finite plane onto a PIXI.Graphics object
   * @param  {PIXI.Graphics} graphics
   * @param  {Number} x0
   * @param  {Number} x1
   * @param  {Object} style
   */
  PixiAdapter.prototype.drawPlane = function (graphics, x0, x1, style) {
    style = style || {};

    var max = 1e6;
    var lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 0;
    var lineColor = style.lineColor || 0x000000;
    var fillColor = style.fillColor;

    graphics.lineStyle(lineWidth, lineColor, 1);

    if (fillColor) {
      graphics.beginFill(fillColor, 1);
    }

    graphics.moveTo(-max, 0);
    graphics.lineTo(max, 0);
    graphics.lineTo(max, -max);
    graphics.lineTo(-max, -max);

    if (fillColor) {
      graphics.endFill();
    }

    // Draw the actual plane
    graphics.lineStyle(lineWidth, lineColor);
    graphics.moveTo(-max, 0);
    graphics.lineTo(max, 0);
  };

  /**
   * Draws a line onto a PIXI.Graphics object
   * @param  {PIXI.Graphics} graphics
   * @param  {Number} len
   * @param  {Object} style
   */
  PixiAdapter.prototype.drawLine = function (graphics, len, style) {
    style = style || {};

    var lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 1;
    var lineColor = style.lineColor || 0x000000;

    graphics.lineStyle(lineWidth, lineColor, 1);

    graphics.moveTo(-len / 2, 0);
    graphics.lineTo(len / 2, 0);
  };

  /**
   * Draws a capsule onto a PIXI.Graphics object
   * @param  {PIXI.Graphics} graphics
   * @param  {Number} x
   * @param  {Number} y
   * @param  {Number} angle
   * @param  {Number} len
   * @param  {Number} radius
   * @param  {Object} style
   */
  PixiAdapter.prototype.drawCapsule = function (graphics, x, y, angle, len, radius, style) {
    style = style || {};

    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 0;
    var lineColor = style.lineColor || 0x000000;
    var fillColor = style.fillColor;

    graphics.lineStyle(lineWidth, lineColor, 1);


    // Draw circles at ends

    if (fillColor) {
      graphics.beginFill(fillColor, 1);
    }

    graphics.drawCircle(-len / 2 * c + x, -len / 2 * s + y, radius);
    graphics.drawCircle(len / 2 * c + x, len / 2 * s + y, radius);

    if (fillColor) {
      graphics.endFill();
    }


    // Draw box

    graphics.lineStyle(lineWidth, lineColor, 0);

    if (fillColor) {
      graphics.beginFill(fillColor, 1);
    }

    graphics.moveTo(-len / 2 * c + radius * s + x, -len / 2 * s + radius * c + y);
    graphics.lineTo(len / 2 * c + radius * s + x, len / 2 * s + radius * c + y);
    graphics.lineTo(len / 2 * c - radius * s + x, len / 2 * s - radius * c + y);
    graphics.lineTo(-len / 2 * c - radius * s + x, -len / 2 * s - radius * c + y);

    if (fillColor) {
      graphics.endFill();
    }


    // Draw lines in between

    graphics.lineStyle(lineWidth, lineColor, 1);
    graphics.moveTo(-len / 2 * c + radius * s + x, -len / 2 * s + radius * c + y);
    graphics.lineTo(len / 2 * c + radius * s + x, len / 2 * s + radius * c + y);
    graphics.moveTo(-len / 2 * c - radius * s + x, -len / 2 * s - radius * c + y);
    graphics.lineTo(len / 2 * c - radius * s + x, len / 2 * s - radius * c + y);
  };

  /**
   * Draws a box onto a PIXI.Graphics object
   * @param  {PIXI.Graphics} graphics
   * @param  {Number} x
   * @param  {Number} y
   * @param  {Number} w
   * @param  {Number} h
   * @param  {Object} style
   */
  PixiAdapter.prototype.drawBox = function (graphics, x, y, w, h, style) {
    style = style || {};

    var lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 0;
    var lineColor = style.lineColor || 0x000000;
    var fillColor = style.fillColor;

    graphics.lineStyle(lineWidth, lineColor, 1);

    if (fillColor) {
      graphics.beginFill(fillColor, 1);
    }

    graphics.drawRect(x - w / 2, y - h / 2, w, h);

    if (fillColor) {
      graphics.endFill();
    }
  };

  /**
   * Draws a convex polygon onto a PIXI.Graphics object
   * @param  {PIXI.Graphics} graphics
   * @param  {Array} verts
   * @param  {Object} style
   */
  PixiAdapter.prototype.drawConvex = function (graphics, verts, style) {
    style = style || {};

    var lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 0;
    var lineColor = style.lineColor || 0x000000;
    var fillColor = style.fillColor;

    graphics.lineStyle(lineWidth, lineColor, 1);

    if (fillColor) {
      graphics.beginFill(fillColor, 1);
    }

    for (var i = 0; i !== verts.length; i++) {
      var v = verts[i];
      var x = v[0];
      var y = v[1];

      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }

    if (fillColor) {
      graphics.endFill();
    }

    if (verts.length > 2 && lineWidth !== 0) {
      graphics.moveTo(verts[verts.length - 1][0], verts[verts.length - 1][1]);
      graphics.lineTo(verts[0][0], verts[0][1]);
    }
  };

  /**
   * Draws a path onto a PIXI.Graphics object
   * @param  {PIXI.Graphics} graphics
   * @param  {Array} path
   * @param  {Object} style
   */
  PixiAdapter.prototype.drawPath = function (graphics, path, style) {
    style = style || {};

    var lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 0;
    var lineColor = style.lineColor || 0x000000;
    var fillColor = style.fillColor;

    graphics.lineStyle(lineWidth, lineColor, 1);

    if (fillColor) {
      graphics.beginFill(fillColor, 1);
    }

    var lastx = null;
    var lasty = null;

    for (var i = 0; i < path.length; i++) {
      var v = path[i];
      var x = v[0];
      var y = v[1];

      if (x !== lastx || y !== lasty) {
        if (i === 0) {
          graphics.moveTo(x, y);
        } else {
          // Check if the lines are parallel
          var p1x = lastx;
          var p1y = lasty;
          var p2x = x;
          var p2y = y;
          var p3x = path[(i + 1) % path.length][0];
          var p3y = path[(i + 1) % path.length][1];
          var area = ((p2x - p1x) * (p3y - p1y)) - ((p3x - p1x) * (p2y - p1y));
          if (area !== 0)
            graphics.lineTo(x, y);
        }

        lastx = x;
        lasty = y;
      }
    }

    if (fillColor) {
      graphics.endFill();
    }

    // Close the path
    if (path.length > 2 && style.fillColor) {
      graphics.moveTo(path[path.length - 1][0], path[path.length - 1][1]);
      graphics.lineTo(path[0][0], path[0][1]);
    }
  };

  /**
   * Renders a p2 Shape onto a Pixi Graphics object
   * @param  {PIXI.Graphics} graphics
   * @param  {p2.Shape} shape
   * @param  {p2.Vector} offset
   * @param  {Number} angle
   * @param  {Object} style
   */
  PixiAdapter.prototype.renderShapeToGraphics = function (graphics, shape, offset, angle, style) {
    var zero = [0, 0];
    var ppu = this.pixelsPerLengthUnit;

    offset = offset || zero;
    angle = angle || 0;

    if (shape instanceof Circle) {
      this.drawCircle(graphics, offset[0] * ppu, -offset[1] * ppu, shape.radius * ppu, style);

    } else if (shape instanceof Particle) {
      var radius = Math.max(1, Math.round(ppu / 100));
      this.drawCircle(graphics, offset[0] * ppu, -offset[1] * ppu, radius, style);

    } else if (shape instanceof Plane) {
      // TODO: use shape angle
      this.drawPlane(graphics, -10 * ppu, 10 * ppu, style);

    } else if (shape instanceof Line) {
      this.drawLine(graphics, shape.length * ppu, style);

    } else if (shape instanceof Box) {
      this.drawBox(graphics, offset[0] * ppu, -offset[1] * ppu, shape.width * ppu, shape.height * ppu, style);

    } else if (shape instanceof Capsule) {
      this.drawCapsule(graphics, offset[0] * ppu, -offset[1] * ppu, angle, shape.length * ppu, shape.radius * ppu, style);

    } else if (shape instanceof Convex) {
      // Scale verts
      var verts = [];
      var vrot = vec2.create();

      for (var i = 0; i < shape.vertices.length; i++) {
        var v = shape.vertices[i];
        vec2.rotate(vrot, v, angle);
        verts.push([(vrot[0] + offset[0]) * ppu, -(vrot[1] + offset[1]) * ppu]);
      }

      this.drawConvex(graphics, verts, style);
    } else if (shape instanceof Heightfield) {
      var heights = shape.heights;

      var path = [[0, 100 * ppu]]; // Left-hand edge
      for (var i = 0; i < heights.length; i++) {
        var h = heights[i];
        path.push([i * shape.elementWidth * ppu, -h * ppu]);
      }
      path.push([heights.length * shape.elementWidth * ppu, 100 * ppu]); // Right-hand edge

      this.drawPath(graphics, path, style);
    }
  };

  /**
   * Adds the supplied shape to the supplied Container, using vectors and / or a texture
   * @param  {Container} container
   * @param  {Shape} shape
   * @param  {Object} shapeOptions
   */
  PixiAdapter.prototype.addShape = function (container, shape, shapeOptions) {

    shapeOptions = shapeOptions || {};
    var offset = shapeOptions.offset || [0, 0];
    var angle = shapeOptions.angle || 0;
    var textureOptions = shapeOptions.textureOptions;
    var styleOptions = shapeOptions.styleOptions;
    var alpha = shapeOptions.alpha || 1;

    var zero = [0, 0];
    var ppu = this.pixelsPerLengthUnit;

    // If a Pixi texture has been specified...
    if (textureOptions) {
      var texture = textureOptions.texture;

      // Calculate the bounding box of the shape
      var aabb = new p2.AABB();
      shape.computeAABB(aabb, zero, 0);

      var left = aabb.lowerBound[0];
      var bottom = aabb.lowerBound[1];
      var right = aabb.upperBound[0];
      var top = aabb.upperBound[1];

      // Cater for Heightfield shapes 
      if (shape instanceof Heightfield) { 
        bottom = -(this.options.height / ppu); 
      } 

      // Get dimensions of the shape
      var width = right - left;
      var height = top - bottom;

      // Create a Sprite or TilingSprite to cover the entire shape
      var sprite;
      if (textureOptions.tile === false) {
        sprite = new PIXI.Sprite(texture);
      } else {
        sprite = new PIXI.extras.TilingSprite(texture, width * ppu, height * ppu);
      }

      sprite.alpha = alpha;

      // If the shape is anything other than a box, we need a mask for the texture.
      // We use the shape itself to create a new Graphics object.
      if (!(shape instanceof Box)) {
        var maskGraphics = new PIXI.Graphics();
        maskGraphics.renderable = false;
        maskGraphics.position.x = (offset[0] * ppu);
        maskGraphics.position.y = -(offset[1] * ppu);
        maskGraphics.rotation = -angle;

        this.renderShapeToGraphics(maskGraphics,
          shape,
          zero,
          0,
          {
            lineWidth: 0,
            fillColor: 0xffffff
          });

        container.addChild(maskGraphics);
        sprite.mask = maskGraphics;
      }

      // Sprite positions are the top-left corner of the Sprite, whereas Graphics objects
      // are positioned at their origin. Heightfields start at x = 0 
      if (shape instanceof Heightfield) {
        sprite.anchor = new PIXI.Point(0, 0.5);
      } else {
        sprite.anchor = new PIXI.Point(0.5, 0.5);
      }

      sprite.position.x = (offset[0] * ppu);
      sprite.position.y = -(offset[1] * ppu);
      sprite.rotation = -angle;

      container.addChild(sprite);
    }

    // If any Pixi vector styles have been specified...
    if (styleOptions) {
      var graphics = new PIXI.Graphics();
      graphics.alpha = alpha;
      graphics.position.x = (offset[0] * ppu);
      graphics.position.y = -(offset[1] * ppu);
      graphics.rotation = -angle;

      this.renderShapeToGraphics(graphics,
        shape,
        zero,
        0,
        styleOptions);

      container.addChild(graphics);
    }
  };

  /**
   * Resizes the Pixi renderer's view to fit proportionally in the supplied window dimensions
   * @param  {Number} width
   * @param  {Number} height
   */
  PixiAdapter.prototype.resize = function (width, height) {
    var renderer = this.renderer;
    var view = renderer.view;
    var ratio = width / height;
    var pixiRatio = renderer.width / renderer.height;

    this.windowWidth = width;
    this.windowHeight = height;

    if (ratio > pixiRatio) { // Screen is wider than the renderer

      this.viewCssWidth = height * pixiRatio;
      this.viewCssHeight = height;

      view.style.width = this.viewCssWidth + 'px';
      view.style.height = this.viewCssHeight + 'px';

      view.style.left = Math.round((width - this.viewCssWidth) / 2) + 'px';
      view.style.top = null;

    } else { // Screen is narrower

      this.viewCssWidth = width;
      this.viewCssHeight = Math.round(width / pixiRatio);

      view.style.width = this.viewCssWidth + 'px';
      view.style.height = this.viewCssHeight + 'px';

      view.style.left = null;
      view.style.top = Math.round((height - this.viewCssHeight) / 2) + 'px';
    }
  };

  return PixiAdapter;
})();
},{}],4:[function(require,module,exports){
var P2Pixi = module.exports = {
  Game: require('./Game'),
  GameObject: require('./GameObject'),
  PixiAdapter: require('./PixiAdapter')
};
},{"./Game":1,"./GameObject":2,"./PixiAdapter":3}]},{},[4])(4)
});