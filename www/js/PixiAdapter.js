/// <reference path="lib/pixi/pixi.min.js" />

var BuggyDemo;
(function (BuggyDemo) {
	var PixiAdapter = (function () {

		var vec2 = p2.vec2
			, Body = p2.Body
			, Circle = p2.Circle
			, Capsule = p2.Capsule
			, Convex = p2.Convex
			, Plane = p2.Plane
			, Rectangle = p2.Rectangle
			, Particle = p2.Particle
			, Line = p2.Line
			, EventEmitter = p2.EventEmitter
			, init_stagePosition = vec2.create()
			, init_physicsPosition = vec2.create();

		/**
		 * Creates a new PixiAdapter instance
		 */
		function PixiAdapter(options) {

			var self = this
				, key;

			options = options || {};

			var settings = {
				pixelsPerLengthUnit: 128
				, width: 1280 // Pixi screen resolution
				, height: 720
				, useDeviceAspect: true
			};

			for (key in options) {
				settings[key] = options[key];
			}

			if (settings.useDeviceAspect) {
				settings.height = $(window).height() / $(window).width() * settings.width;
			}

			this.settings = settings;
			var ppu = this.pixelsPerLengthUnit = settings.pixelsPerLengthUnit;

			EventEmitter.call(this);

			this.renderer = PIXI.autoDetectRenderer(this.settings.width, this.settings.height, this.settings.viewport, this.settings.transparent, true);
			this.stage = new PIXI.DisplayObjectContainer();
			this.container = new PIXI.Stage(0xFFFFFF, true);
			this.container.addChild(this.stage);

			this.renderer.view.style.position = 'absolute';
			document.body.appendChild(this.renderer.view);

			// Center the stage at origin
			this.stage.position.x = this.renderer.width / 2;
			this.stage.position.y = -this.renderer.height / 2;

			this.windowWidth = $(window).width();
			this.windowHeight = $(window).height();
			this.resize(this.windowWidth, this.windowHeight);

			$(window).resize(function () {
				self.resize($(window).width(), $(window).height());
			});
		}

		PixiAdapter.prototype = new EventEmitter();

		/**
		 * Draws a circle onto a PIXI.Graphics object
		 * @method drawCircle
		 * @param  {PIXI.Graphics} g
		 * @param  {Number} x
		 * @param  {Number} y
		 * @param  {Number} radius
		 * @param  {object} style
		 */
		PixiAdapter.prototype.drawCircle = function (g, x, y, angle, radius, style) {
			style = style || {};
			var lineWidth = style.lineWidth || 0
				, lineColor = style.lineColor || 0x000000
				, fillColor = style.fillColor
				, opacity = style.opacity || 1;

			g.lineStyle(lineWidth, lineColor, 1);
			g.beginFill(fillColor, opacity);
			g.drawCircle(x, y, radius);
			g.endFill();
		};

		/**
		 * Draws a finite plane onto a PIXI.Graphics object
		 * @method drawPlane
		 * @param  {Graphics} g
		 * @param  {Number} x0
		 * @param  {Number} x1
		 * @param  {Number} color
		 * @param  {object} style
		 */
		PixiAdapter.prototype.drawPlane = function (g, x0, x1, color, style) {
			style = style || {};
			var lineWidth = style.lineWidth || 0
				, lineColor = style.lineColor || 0x000000
				, fillColor = style.fillColor || 0xcccccc
				, opacity = style.opacity || 1;

			g.lineStyle(lineWidth, lineColor, 1);

			g.beginFill(fillColor, opacity);
			var max = 1e6;
			g.moveTo(-max, 0);
			g.lineTo(max, 0);
			g.lineTo(max, max);
			g.lineTo(-max, max);
			g.endFill();

			// Draw the actual plane
			g.lineStyle(lineWidth, lineColor);
			g.moveTo(-max, 0);
			g.lineTo(max, 0);
		};

		/**
		 * Draws a line onto a PIXI.Graphics object
		 * @method drawLine
		 * @param  {Graphics} g
		 * @param  {Number} len
		 * @param  {object} style
		 */
		PixiAdapter.prototype.drawLine = function (g, len, style) {
			style = style || {};
			var lineWidth = style.lineWidth || 1
				, lineColor = style.lineColor || 0x000000
				, opacity = style.opacity || 1;

			g.lineStyle(lineWidth, lineColor, opacity);

			g.moveTo(-len / 2, 0);
			g.lineTo(len / 2, 0);
		};

		/**
		 * Draws a capsule onto a PIXI.Graphics object
		 * @method drawCapsule
		 */
		PixiAdapter.prototype.drawCapsule = function (g, x, y, angle, len, radius, style) {
			style = style || {};
			var lineWidth = style.lineWidth || 0
				, lineColor = style.lineColor || 0x000000
				, fillColor = style.fillColor || 0xcccccc
				, opacity = style.opacity || 1;

			g.lineStyle(lineWidth, lineColor, 1);

			// Draw circles at ends
			var c = Math.cos(angle);
			var s = Math.sin(angle);
			g.beginFill(fillColor, opacity);
			g.drawCircle(-len / 2 * c + x, -len / 2 * s + y, radius);
			g.drawCircle(len / 2 * c + x, len / 2 * s + y, radius);
			g.endFill();

			// Draw rectangle
			g.lineStyle(lineWidth, lineColor, 0);
			g.beginFill(fillColor, opacity);
			g.moveTo(-len / 2 * c + radius * s + x, -len / 2 * s + radius * c + y);
			g.lineTo(len / 2 * c + radius * s + x, len / 2 * s + radius * c + y);
			g.lineTo(len / 2 * c - radius * s + x, len / 2 * s - radius * c + y);
			g.lineTo(-len / 2 * c - radius * s + x, -len / 2 * s - radius * c + y);
			g.endFill();

			// Draw lines in between
			g.lineStyle(lineWidth, lineColor, 1);
			g.moveTo(-len / 2 * c + radius * s + x, -len / 2 * s + radius * c + y);
			g.lineTo(len / 2 * c + radius * s + x, len / 2 * s + radius * c + y);
			g.moveTo(-len / 2 * c - radius * s + x, -len / 2 * s - radius * c + y);
			g.lineTo(len / 2 * c - radius * s + x, len / 2 * s - radius * c + y);
		};

		/**
		 * Draws a rectangle onto a PIXI.Graphics object
		 * @method drawRectangle
		 */
		PixiAdapter.prototype.drawRectangle = function (g, x, y, angle, w, h, style) {
			style = style || {};
			var lineWidth = style.lineWidth || 0
				, lineColor = style.lineColor || 0x000000
				, fillColor = style.fillColor || 0xcccccc
				, opacity = style.opacity || 1;

			g.lineStyle(lineWidth, lineColor, 1);
			g.beginFill(fillColor, opacity);
			g.drawRect(x - w / 2, y - h / 2, w, h);
		};

		/**
		 * Draws a convex polygon onto a PIXI.Graphics object
		 * @method drawConvex
		 */
		PixiAdapter.prototype.drawConvex = function (g, verts, triangles, offset, style) {
			style = style || {};
			var lineWidth = style.lineWidth || 0
				, lineColor = style.lineColor || 0x000000
				, fillColor = style.fillColor || 0xcccccc
				, opacity = style.opacity || 1;

			g.lineStyle(lineWidth, lineColor, 1);

			g.beginFill(fillColor, opacity);
			for (var i = 0; i !== verts.length; i++) {
				var v = verts[i],
					x = v[0],
					y = v[1];
				if (i == 0) {
					g.moveTo(x, y);
				} else {
					g.lineTo(x, y);
				}
			}
			g.endFill();

			if (verts.length > 2) {
				g.moveTo(verts[verts.length - 1][0], verts[verts.length - 1][1]);
				g.lineTo(verts[0][0], verts[0][1]);
			}
		};

		/**
		 * Draws a path onto a PIXI.Graphics object
		 * @method drawPath
		 */
		PixiAdapter.prototype.drawPath = function (g, path, style) {
			style = style || {};

			var lineWidth = style.lineWidth || 0
				, lineColor = style.lineColor || 0x000000
				, fillColor = style.fillColor
				, opacity = style.opacity || 1;

			g.lineStyle(lineWidth, lineColor, 1);

			if (fillColor) {
				g.beginFill(fillColor, opacity);
			}

			var lastx = null,
				lasty = null;

			for (var i = 0; i < path.length; i++) {
				var v = path[i],
					x = v[0],
					y = v[1];

				if (x != lastx || y != lasty) {
					if (i == 0) {
						g.moveTo(x, y);
					} else {
						// Check if the lines are parallel
						var p1x = lastx,
							p1y = lasty,
							p2x = x,
							p2y = y,
							p3x = path[(i + 1) % path.length][0],
							p3y = path[(i + 1) % path.length][1];
						var area = ((p2x - p1x) * (p3y - p1y)) - ((p3x - p1x) * (p2y - p1y));
						if (area != 0)
							g.lineTo(x, y);
					}

					lastx = x;
					lasty = y;
				}
			}

			if (fillColor) {
				g.endFill();
			}

			// Close the path
			if (path.length > 2 && style.fillColor) {
				g.moveTo(path[path.length - 1][0], path[path.length - 1][1]);
				g.lineTo(path[0][0], path[0][1]);
			}
		};

		/**
		 * Renders the supplied p2 Shape onto the supplied PIXI.Graphics object using the supplied Pixi style properties
		 * @method drawPlane
		 * @param  {Graphics} sprite
		 * @param  {Shape} shape
		 * @param  {Object} style
		 * @param  {Vector} offset
		 * @param  {Number} angle
		 */
		PixiAdapter.prototype.renderShapeToSprite = function (sprite, shape, style, offset, angle) {
			var zero = [0, 0]
				, ppu = this.pixelsPerLengthUnit
				, verts
				, vrot
				, i
				, v;

			offset = offset || zero;
			angle = angle || 0;

			if (shape instanceof Circle) {
				this.drawCircle(sprite, offset[0] * ppu, offset[1] * ppu, angle, shape.radius * ppu, style);

			} else if (shape instanceof Particle) {
				this.drawCircle(sprite, offset[0] * ppu, offset[1] * ppu, angle, 2 * lw, style);

			} else if (shape instanceof Plane) {
				// TODO: use shape angle
				this.drawPlane(sprite, -10 * ppu, 10 * ppu, style);

			} else if (shape instanceof Line) {
				this.drawLine(sprite, child.length * ppu, style);

			} else if (shape instanceof Rectangle) {
				this.drawRectangle(sprite, offset[0] * ppu, offset[1] * ppu, angle, shape.width * ppu, shape.height * ppu, style);

			} else if (shape instanceof Capsule) {
				this.drawCapsule(sprite, offset[0] * ppu, offset[1] * ppu, angle, shape.length * ppu, shape.radius * ppu, style);

			} else if (shape instanceof Convex) {
				// Scale verts
				verts = [];
				vrot = vec2.create();

				for (i = 0; i < shape.vertices.length; i++) {
					v = shape.vertices[i];
					vec2.rotate(vrot, v, angle);
					verts.push([(vrot[0] + offset[0]) * ppu, -(vrot[1] + offset[1]) * ppu]);
				}

				this.drawConvex(sprite, verts, shape.triangles, [offset[0] * ppu, -offset[1] * ppu], style);
			}
		}

		/**
		 * Resizes the Pixi renderer's view to fit proportionally in the supplied window dimensions
		 * @param  {Number} w
		 * @param  {Number} h
		 */
		PixiAdapter.prototype.resize = function (w, h) {
			this.windowWidth = w;
			this.windowHeight = h;

			var renderer = this.renderer
				, view = renderer.view
				, ratio = w / h
				, pixiRatio = renderer.width / renderer.height;

			if (ratio > pixiRatio) { // Screen is wider than the renderer

				view.style.height = h + 'px';
				view.style.width = (h * pixiRatio) + 'px';
				view.style.left = ((w - h * pixiRatio) / 2) + 'px';

			} else { // Screen is narrower

				view.style.height = (w / pixiRatio) + 'px';
				view.style.width = w + 'px';
				view.style.top = ((h - w / pixiRatio) / 2) + 'px';

			}
		};

		return PixiAdapter;
	})();

	BuggyDemo.PixiAdapter = PixiAdapter;
})(BuggyDemo || (BuggyDemo = {}));