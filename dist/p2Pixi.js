/** 
 * p2Pixi v0.8 - 12-05-2015 
 * Copyright (c) Tom W Hall <tomshalls@gmail.com> 
 * A simple 2D vector game model framework using p2.js for physics and Pixi.js for rendering. 
 * License: MIT 
 */
var P2Pixi;
(function (P2Pixi) {
    'use strict';

    var Game = (function () {

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

    P2Pixi.Game = Game;
})(P2Pixi || (P2Pixi = {}));
;var P2Pixi;
(function (P2Pixi) {
    'use strict';

    var GameObject = (function () {

        /**
         * Creates a new GameObject instance
         * @param  {Game} game
         */
        function GameObject(game) {
            this.game = game;

            this.bodies = []; // p2 physics bodies
            this.constraints = []; // p2 constraints
            this.containers = []; // Pixi Containers, one for each body. Each contains a child array of Graphics and / or Sprites.

            game.addGameObject(this);
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
            var container;

            offset = offset || [0, 0];
            angle = angle || 0;

            options = options || {};
            shape.collisionGroup = options.collisionGroup || 1;
            shape.collisionMask = options.collisionMask || 1;

            body.addShape(shape, offset, angle);

            container = this.containers[this.bodies.indexOf(body)];

            this.game.pixiAdapter.addShape(container
                , shape
                , offset
                , angle
                , style
                , texture
                , alpha
                , textureOptions);

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
         * Clears bodies, Containers and constraints. Called when the GameObject is removed from the game
         */
        GameObject.prototype.clear = function () {
            var i
                , game = this.game
                , world = game.world
                , container = game.pixiAdapter.container;

            // Remove p2 constraints from the world
            for (i = 0; i < this.constraints.length; i++) {
                world.removeConstraint(this.constraints[i]);
            }

            // Remove p2 bodies from the world and Pixi Containers from the stage
            for (i = 0; i < this.bodies.length; i++) {
                world.removeBody(this.bodies[i]);
                container.removeChild(this.containers[i]);
            }
        };

        return GameObject;
    })();

    P2Pixi.GameObject = GameObject;
})(P2Pixi || (P2Pixi = {}));
;var P2Pixi;
(function (P2Pixi) {
    'use strict';

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
            , Heightfield = p2.Heightfield
            , EventEmitter = p2.EventEmitter;

        /**
         * Creates a new PixiAdapter instance
         */
        function PixiAdapter(options) {

            var key
                , settings = {
                    pixelsPerLengthUnit: 128
                    , width: 1280
                    , height: 720
                    , transparent: false
                    , antialias: true
                    , useDeviceAspect: false
                    , webGLEnabled: true
                    , useDevicePixels: true
                };

            options = options || {};

            for (key in options) {
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
            var settings = this.settings
                , deviceScale = this.deviceScale;

            this.renderer = settings.webGLEnabled
                ? PIXI.autoDetectRenderer(settings.width * deviceScale, settings.height * deviceScale, settings)
                : new PIXI.CanvasRenderer(settings.width * deviceScale, settings.height * deviceScale, settings);
        };

        /**
         * Sets up the Pixi view
         */
        PixiAdapter.prototype.setupView = function () {
            var self = this
                , renderer = this.renderer
                , view = this.renderer.view
                , container = this.container
                , deviceScale = this.deviceScale;

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
            var lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 0
                , lineColor = style.lineColor || 0x000000
                , fillColor = style.fillColor;

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
                , lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 0
                , lineColor = style.lineColor || 0x000000
                , fillColor = style.fillColor;

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
            var lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 1
                , lineColor = style.lineColor || 0x000000;

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
            var c = Math.cos(angle)
                , s = Math.sin(angle)
                , lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 0
                , lineColor = style.lineColor || 0x000000
                , fillColor = style.fillColor;

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


            // Draw rectangle

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
         * Draws a rectangle onto a PIXI.Graphics object
         * @param  {Graphics} graphics
         * @param  {Number} x
         * @param  {Number} y
         * @param  {Number} w
         * @param  {Number} h
         * @param  {object} style
         */
        PixiAdapter.prototype.drawRectangle = function (graphics, x, y, w, h, style) {
            style = style || {};
            var lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 0
                , lineColor = style.lineColor || 0x000000
                , fillColor = style.fillColor;

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
            var lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 0
                , lineColor = style.lineColor || 0x000000
                , fillColor = style.fillColor;

            graphics.lineStyle(lineWidth, lineColor, 1);

            if (fillColor) {
                graphics.beginFill(fillColor, 1);
            }

            for (var i = 0; i !== verts.length; i++) {
                var v = verts[i],
                    x = v[0],
                    y = v[1];
                if (i == 0) {
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

            var lineWidth = style.lineWidthUnits ? style.lineWidthUnits * this.pixelsPerLengthUnit : style.lineWidth || 0
                , lineColor = style.lineColor || 0x000000
                , fillColor = style.fillColor;

            graphics.lineStyle(lineWidth, lineColor, 1);

            if (fillColor) {
                graphics.beginFill(fillColor, 1);
            }

            var lastx = null,
                lasty = null;

            for (var i = 0; i < path.length; i++) {
                var v = path[i],
                    x = v[0],
                    y = v[1];

                if (x != lastx || y != lasty) {
                    if (i == 0) {
                        graphics.moveTo(x, y);
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
            var zero = [0, 0]
                , ppu = this.pixelsPerLengthUnit
                , verts
                , vrot
                , path
                , data
                , i
                , v;

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

            } else if (shape instanceof Rectangle) {
                this.drawRectangle(graphics, offset[0] * ppu, -offset[1] * ppu, shape.width * ppu, shape.height * ppu, style);

            } else if (shape instanceof Capsule) {
                this.drawCapsule(graphics, offset[0] * ppu, -offset[1] * ppu, angle, shape.length * ppu, shape.radius * ppu, style);

            } else if (shape instanceof Convex) {
                // Scale verts
                verts = [];
                vrot = vec2.create();

                for (i = 0; i < shape.vertices.length; i++) {
                    v = shape.vertices[i];
                    vec2.rotate(vrot, v, angle);
                    verts.push([(vrot[0] + offset[0]) * ppu, -(vrot[1] + offset[1]) * ppu]);
                }

                this.drawConvex(graphics, verts, style);
            } else if(shape instanceof Heightfield){
                path = [[0, 100 * ppu]];
                data = shape.data;

                for (i = 0; i < data.length; i++){
                    v = data[i];
                    path.push([i * shape.elementWidth * ppu, -v * ppu]);
                }

                path.push([data.length * shape.elementWidth * ppu, 100 * ppu]);
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

            var zero = [0, 0]
                , graphics
                , sprite
                , doc
                , ppu = this.pixelsPerLengthUnit
                , aabb
                , width
                , height
                , left 
                , top
                , right
                , bottom
                , maskGraphics
                , textureOptions = textureOptions || {};

            // If a Pixi texture has been specified...
            if (texture) {
                // Calculate the bounding box of the shape when at zero offset and 0 angle
                aabb = new p2.AABB();
                shape.computeAABB(aabb, zero, 0);

                // Get world coordinates of shape boundaries
                left = aabb.lowerBound[0];
                bottom = aabb.lowerBound[1];
                right = aabb.upperBound[0];
                top = aabb.upperBound[1];

                // Cater for Heightfield shapes, which have a lower bound of negative infinity
                if (bottom === Number.NEGATIVE_INFINITY) {
                    bottom = -(this.settings.height / ppu);
                }

                width = right - left;
                height = top - bottom;

                // Create a Sprite or TilingSprite to cover the entire shape
                if (textureOptions.tile === false) {
                    sprite = new PIXI.Sprite(texture);
                } else {
                    sprite = new PIXI.extras.TilingSprite(texture, width * ppu, height * ppu);
                }

                sprite.alpha = alpha || 1;

                // If the shape is anything other than a rectangle, we need a mask for the texture.
                // We use the shape itself to create a new Graphics object.
                if (!(shape instanceof Rectangle)) {
                    maskGraphics = new PIXI.Graphics();
                    maskGraphics.renderable = false;
                    maskGraphics.position.x = (offset[0] * ppu);
                    maskGraphics.position.y = -(offset[1] * ppu);
                    maskGraphics.rotation = -angle;

                    this.renderShapeToGraphics(maskGraphics
                        , shape
                        , zero
                        , 0
                        , { lineWidth: 0, fillColor: 0xffffff });

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

                    doc = new PIXI.Container();
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
                graphics = new PIXI.Graphics();
                graphics.alpha = alpha || 1;
                graphics.position.x = (offset[0] * ppu);
                graphics.position.y = -(offset[1] * ppu);
                graphics.rotation = -angle;

                this.renderShapeToGraphics(graphics
                    , shape
                    , zero
                    , 0
                    , style);

                container.addChild(graphics);
            }
        };

        /**
         * Resizes the Pixi renderer's view to fit proportionally in the supplied window dimensions
         * @param  {Number} w
         * @param  {Number} h
         */
        PixiAdapter.prototype.resize = function (w, h) {
            var renderer = this.renderer
                , view = renderer.view
                , ratio = w / h
                , pixiRatio = renderer.width / renderer.height;

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

    P2Pixi.PixiAdapter = PixiAdapter;
})(P2Pixi || (P2Pixi = {}));