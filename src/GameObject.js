/// <reference path="lib/pixi/pixi.min.js" />
/// <reference path="PixiAdapter.js" />

var P2Pixi;
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
            this.displayObjectContainers = []; // Pixi DisplayObjectContainers, one for each body. Each contains a child array of Graphics and / or Sprites.

            game.gameObjects.push(this);
        }

        /**
		 * Adds the supplied p2 body to the game's world and creates a corresponding null DisplayObjectContainer object for rendering
		 * @param  {Body} body
		 * @return {GameObject} gameObject
		 */
        GameObject.prototype.addBody = function (body) {
            this.bodies.push(body);
            this.displayObjectContainers.push(null);

            this.game.world.addBody(body);

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
         * @return {GameObject} gameObject
         */
        GameObject.prototype.addShape = function (body, shape, offset, angle, options, style, texture, alpha) {
            var displayObjectContainer
                , displayObject
                , graphics
                , i;

            offset = offset || [0, 0];
            angle = angle || 0;

            options = options || {};
            shape.collisionGroup = options.collisionGroup || 1;
            shape.collisionMask = options.collisionMask || 1;

            body.addShape(shape, offset, angle);

            displayObjectContainer = this.displayObjectContainers[this.bodies.indexOf(body)];
            if (displayObjectContainer === null) {
                displayObjectContainer = new PIXI.DisplayObjectContainer();
                this.displayObjectContainers[this.bodies.indexOf(body)] = displayObjectContainer;
                this.game.pixiAdapter.stage.addChild(displayObjectContainer);
            }

            this.game.pixiAdapter.addShape(displayObjectContainer
                , shape
                , offset
                , angle
                , style
                , texture
                , alpha);

            return this;
        }

        GameObject.prototype.time = function () {
            return new Date().getTime() / 1000;
        };

        return GameObject;
    })();

    P2Pixi.GameObject = GameObject;
})(P2Pixi || (P2Pixi = {}));
