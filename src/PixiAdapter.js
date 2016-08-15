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