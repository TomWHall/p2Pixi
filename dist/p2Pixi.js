/** 
 * p2Pixi v0.8.6 - 22-05-2016 
 * Copyright (c) Tom W Hall <tomshalls@gmail.com> 
 * A simple 2D vector game model framework using p2.js for physics and Pixi.js for rendering. 
 * License: MIT 
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.P2Pixi = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    this.windowFocused = true;
    
    var self = this;
    window.addEventListener("blur", function(e) { self.windowBlur(e); })
    window.addEventListener("focus", function(e) { self.windowFocus(e); })

    this.lastWorldStepTime = null;

    this.assetsLoaded = false;

    if (options.assetUrls) {
      this.loadAssets(options.assetUrls);
    } else {
      this.runIfReady();
    }
  }

  /**
   * Loads the supplied assets asyncronously using PIXI.loader
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
   * Returns the current time in seconds
   */
  Game.prototype.time = function () {
    return new Date().getTime() / 1000;
  };

  /**
   * Called before the game loop is started 
   */
  Game.prototype.beforeRun = function () { };

  /**
   * Begins the world step / render loop
   */
  Game.prototype.run = function () {
    this.lastWorldStepTime = this.time();

    var self = this;
    function update() {
      if (self.windowFocused && !self.paused) {
        var timeSinceLastCall = self.time() - self.lastWorldStepTime;
        self.lastWorldStepTime = self.time();
        self.world.step(1 / 60, timeSinceLastCall, 10);
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
      var deviceScale = pixiAdapter.deviceScale;

      containerPosition.x = ((trackedBodyOffset[0] + 1) * renderer.width * 0.5) - (trackedBodyPosition[0] * ppu * deviceScale);
      containerPosition.y = ((trackedBodyOffset[1] + 1) * renderer.height * 0.5) + (trackedBodyPosition[1] * ppu * deviceScale);
    }
  };

  /**
   * Updates the Pixi representation of the world
   */
  Game.prototype.render = function () {
    var gameObjects = this.gameObjects;
    var pixiAdapter = this.pixiAdapter;

    for (var i = 0; i < gameObjects.length; i++) {
      gameObjects[i].render();
    }

    pixiAdapter.renderer.render(pixiAdapter.stage);
  };

  /**
   * Called after rendering
   */
  Game.prototype.afterRender = function () { };

  /**
   * Adds the supplied GameObject
   */
  Game.prototype.addGameObject = function (gameObject) {
    this.gameObjects.push(gameObject);
  };

  /**
   * Removes the supplied GameObject
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
      this.lastWorldStepTime = this.time();
    }
  };
  
  /**
   * Called when the window loses focus
   */
  Game.prototype.windowBlur = function (e) {
    this.windowFocused = false;
  };

  /**
   * Called when the window gets focus
   */
  Game.prototype.windowFocus = function (e) {
    this.windowFocused = true;
    
    if (!this.paused) {
      this.lastWorldStepTime = this.time();
    }
  };

  return Game;
})();
},{}],2:[function(require,module,exports){
module.exports = (function () {

  /**
   * Creates a new GameObject instance
   * @param  {Game} game
   */
  function GameObject(game) {
    this.game = game;

    this.bodies = []; // p2 physics bodies
    this.constraints = []; // p2 constraints
    this.containers = []; // Pixi Containers, one for each body. Each contains a child array of Graphics and / or Sprites.
    this.children = []; // Child GameObjects
  }

  /**
   * Adds the supplied p2 body to the game's world and creates a corresponding null Container object for rendering.
   * Also adds the body to this GameObject's bodies collection
   * @param  {Body} body
   * @return {GameObject} gameObject
   */
  GameObject.prototype.addBody = function (body) {
    var container = new PIXI.Container();

    this.bodies.push(body);
    this.game.world.addBody(body);

    this.containers.push(container);
    this.game.pixiAdapter.container.addChild(container);

    return this;
  };

  /**
   * Adds the supplied p2 shape to the supplied p2 body
   * @param  {Body} body
   * @param  {Shape} shape
   * @param  {Vector} offset
   * @param  {Number} angle
   * @param  {Object} options
   * @param  {Object} style
   * @param  {Texture} texture
   * @param  {Number} alpha
   * @param  {Object} textureOptions
   * @return {GameObject} gameObject
   */
  GameObject.prototype.addShape = function (body, shape, offset, angle, options, style, texture, alpha, textureOptions) {
    offset = offset || [0, 0];
    angle = angle || 0;

    options = options || {};
    shape.collisionGroup = options.collisionGroup || 1;
    shape.collisionMask = options.collisionMask || 1;

    body.addShape(shape, offset, angle);

    var container = this.containers[this.bodies.indexOf(body)];

    this.game.pixiAdapter.addShape(container,
      shape,
      offset,
      angle,
      style,
      texture,
      alpha,
      textureOptions);

    return this;
  };

  /**
   * Adds the supplied p2 constraint to the game's world and to this GameObject's constraints collection
   * @param  {Constraint} constraint
   * @return {GameObject} gameObject
   */
  GameObject.prototype.addConstraint = function (constraint) {
    this.constraints.push(constraint);

    this.game.world.addConstraint(constraint);

    return this;
  };

  /**
   * Adds the supplied GameObject as a child of this GameObject
   * @param {GameObject} child
   */
  GameObject.prototype.addChild = function (child) {
    child.parent = this;
    this.children.push(child);
  }

  /**
   * Renders this GameObject and all children
   */
  GameObject.prototype.render = function () {
    // Update Container transforms
    var pixiAdapter = this.game.pixiAdapter;
    var ppu = pixiAdapter.pixelsPerLengthUnit;
    var bodies = this.bodies;
    var containers = this.containers;

    for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      var container = containers[i];

      container.position.x = body.position[0] * ppu;
      container.position.y = -body.position[1] * ppu;
      container.rotation = -body.angle;
    }

    // Render children
    var children = this.children;
    for (var i = 0; i < children.length; i++) {
      children[i].render();
    }
  }

  /**
   * Removes this GameObject and all of its children from the game
   */
  GameObject.prototype.remove = function () {
    var game = this.game;
    var world = game.world;
    var container = game.pixiAdapter.container;

    for (var i = 0; i < this.children.length; i++) {
      this.children[i].remove();
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
  var Body = p2.Body;
  var Circle = p2.Circle;
  var Capsule = p2.Capsule;
  var Convex = p2.Convex;
  var Plane = p2.Plane;
  var Box = p2.Box;
  var Particle = p2.Particle;
  var Line = p2.Line;
  var Heightfield = p2.Heightfield;
  var EventEmitter = p2.EventEmitter;

  /**
   * Creates a new PixiAdapter instance
   */
  function PixiAdapter(options) {

    var settings = {
      pixelsPerLengthUnit: 128,
      width: 1280,
      height: 720,
      transparent: false,
      antialias: true,
      useDeviceAspect: false,
      webGLEnabled: true,
      useDevicePixels: true
    };

    options = options || {};

    for (var key in options) {
      settings[key] = options[key];
    }

    if (settings.useDeviceAspect) {
      settings.height = (window.innerHeight / window.innerWidth) * settings.width;
    }

    this.settings = settings;
    this.pixelsPerLengthUnit = settings.pixelsPerLengthUnit;

    EventEmitter.call(this);

    this.stage = new PIXI.Container();
    this.container = new PIXI.Container();
    this.stage.addChild(this.container);

    this.setDeviceProperties();
    this.setupRenderer();
    this.setupView();
  }

  PixiAdapter.prototype = new EventEmitter();

  /**
   * Reads and stores device properties
   */
  PixiAdapter.prototype.setDeviceProperties = function () {
    var settings = this.settings;

    this.devicePixelRatio = settings.useDevicePixels ? (window.devicePixelRatio || 1) : 1;
    this.deviceScale = (this.devicePixelRatio !== 1 ? (Math.round(Math.max(screen.width, screen.height) * this.devicePixelRatio) / Math.max(settings.width, settings.height)) : 1);
  };

  /**
   * Sets up the Pixi renderer
   */
  PixiAdapter.prototype.setupRenderer = function () {
    var settings = this.settings;
    var deviceScale = this.deviceScale;

    this.renderer = settings.webGLEnabled
      ? PIXI.autoDetectRenderer(settings.width * deviceScale, settings.height * deviceScale, settings)
      : new PIXI.CanvasRenderer(settings.width * deviceScale, settings.height * deviceScale, settings);
  };

  /**
   * Sets up the Pixi view
   */
  PixiAdapter.prototype.setupView = function () {
    var self = this;
    var renderer = this.renderer;
    var view = this.renderer.view;
    var container = this.container;
    var deviceScale = this.deviceScale;

    view.style.position = 'absolute';

    document.body.appendChild(this.renderer.view);

    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    container.position.x = renderer.width / 2;
    container.position.y = renderer.height / 2;

    container.scale.x = deviceScale;
    container.scale.y = deviceScale;

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
   * @param  {PIXI.Graphics} g
   * @param  {Number} x
   * @param  {Number} y
   * @param  {Number} radius
   * @param  {object} style
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
   * @param  {Graphics} graphics
   * @param  {Number} x0
   * @param  {Number} x1
   * @param  {Number} color
   * @param  {object} style
   */
  PixiAdapter.prototype.drawPlane = function (graphics, x0, x1, color, style) {
    style = style || {};

    var max = 1e6
    var lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 0;
    var lineColor = style.lineColor || 0x000000;
    var fillColor = style.fillColor;

    graphics.lineStyle(lineWidth, lineColor, 1);

    if (fillColor) {
      graphics.beginFill(fillColor, 1);
    }

    graphics.moveTo(-max, 0);
    graphics.lineTo(max, 0);
    graphics.lineTo(max, max);
    graphics.lineTo(-max, max);

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
   * @param  {Graphics} graphics
   * @param  {Number} len
   * @param  {object} style
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
   * @param  {Graphics} graphics
   * @param  {Number} x
   * @param  {Number} y
   * @param  {Number} angle
   * @param  {Number} len
   * @param  {Number} radius
   * @param  {object} style
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
   * @param  {Graphics} graphics
   * @param  {Number} x
   * @param  {Number} y
   * @param  {Number} w
   * @param  {Number} h
   * @param  {object} style
   */
  PixiAdapter.prototype.drawRectangle = function (graphics, x, y, w, h, style) {
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
   * @param  {Graphics} graphics
   * @param  {Array} verts
   * @param  {object} style
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
   * @param  {Graphics} graphics
   * @param  {Array} path
   * @param  {object} style
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
   * Renders the supplied p2 Shape onto the supplied Pixi Graphics object using the supplied Pixi style properties
   * @param  {Graphics} graphics
   * @param  {Shape} shape
   * @param  {Vector} offset
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
      this.drawCircle(graphics, offset[0] * ppu, -offset[1] * ppu, 2 * lw, style);

    } else if (shape instanceof Plane) {
      // TODO: use shape angle
      this.drawPlane(graphics, -10 * ppu, 10 * ppu, style);

    } else if (shape instanceof Line) {
      this.drawLine(graphics, shape.length * ppu, style);

    } else if (shape instanceof Box) {
      this.drawRectangle(graphics, offset[0] * ppu, -offset[1] * ppu, shape.width * ppu, shape.height * ppu, style);

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
      var path = [[0, 100 * ppu]];
      var heights = shape.heights;

      for (var i = 0; i < heights.length; i++) {
        var h = heights[i];
        path.push([i * shape.elementWidth * ppu, -h * ppu]);
      }

      path.push([heights.length * shape.elementWidth * ppu, 100 * ppu]);
      this.drawPath(graphics, path, style);
    }
  };

  /**
   * Adds the supplied shape to the supplied Container, using vectors and / or a texture
   * @param  {Container} container
   * @param  {Shape} shape
   * @param  {Vector} offset
   * @param  {Number} angle
   * @param  {Object} style
   * @param  {Texture} texture
   * @param  {Number} alpha
   */
  PixiAdapter.prototype.addShape = function (container, shape, offset, angle, style, texture, alpha, textureOptions) {

    var zero = [0, 0];
    var ppu = this.pixelsPerLengthUnit;
    var textureOptions = textureOptions || {};

    // If a Pixi texture has been specified...
    if (texture) {
      // Calculate the bounding box of the shape when at zero offset and 0 angle
      var aabb = new p2.AABB();
      shape.computeAABB(aabb, zero, 0);

      // Get world coordinates of shape boundaries
      var left = aabb.lowerBound[0];
      var bottom = aabb.lowerBound[1];
      var right = aabb.upperBound[0];
      var top = aabb.upperBound[1];

      // Cater for Heightfield shapes
      if (shape instanceof Heightfield) {
        bottom = -(this.settings.height / ppu);
      }

      var width = right - left;
      var height = top - bottom;

      // Create a Sprite or TilingSprite to cover the entire shape
      var sprite;
      if (textureOptions.tile === false) {
        sprite = new PIXI.Sprite(texture);
      } else {
        sprite = new PIXI.extras.TilingSprite(texture, width * ppu, height * ppu);
      }

      sprite.alpha = alpha || 1;

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
      // are positioned at their origin
      if (angle === 0) {
        sprite.position.x = (left * ppu) + (offset[0] * ppu);
        sprite.position.y = -(top * ppu) - (offset[1] * ppu);
        sprite.rotation = -angle;

        container.addChild(sprite);
      } else {
        sprite.position.x = (left * ppu);
        sprite.position.y = -(top * ppu);

        var doc = new PIXI.Container();
        doc.addChild(sprite);
        doc.position.x = (offset[0] * ppu);
        doc.position.y = -(offset[1] * ppu);
        doc.rotation = -angle;

        doc.addChild(sprite);
        container.addChild(doc);
      }
    }

    // If any Pixi vector styles have been specified...
    if (style) {
      var graphics = new PIXI.Graphics();
      graphics.alpha = alpha || 1;
      graphics.position.x = (offset[0] * ppu);
      graphics.position.y = -(offset[1] * ppu);
      graphics.rotation = -angle;

      this.renderShapeToGraphics(graphics,
        shape,
        zero,
        0,
        style);

      container.addChild(graphics);
    }
  };

  /**
   * Resizes the Pixi renderer's view to fit proportionally in the supplied window dimensions
   * @param  {Number} w
   * @param  {Number} h
   */
  PixiAdapter.prototype.resize = function (w, h) {
    var renderer = this.renderer;
    var view = renderer.view;
    var ratio = w / h;
    var pixiRatio = renderer.width / renderer.height;

    this.windowWidth = w;
    this.windowHeight = h;

    if (ratio > pixiRatio) { // Screen is wider than the renderer

      this.viewCssWidth = h * pixiRatio;
      this.viewCssHeight = h;

      view.style.width = this.viewCssWidth + 'px';
      view.style.height = this.viewCssHeight + 'px';

      view.style.left = Math.round((w - this.viewCssWidth) / 2) + 'px';
      view.style.top = null;

    } else { // Screen is narrower

      this.viewCssWidth = w;
      this.viewCssHeight = Math.round(w / pixiRatio);

      view.style.width = this.viewCssWidth + 'px';
      view.style.height = this.viewCssHeight + 'px';

      view.style.left = null;
      view.style.top = Math.round((h - this.viewCssHeight) / 2) + 'px';
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