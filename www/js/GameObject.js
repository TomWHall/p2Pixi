/// <reference path="lib/pixi/pixi.min.js" />
/// <reference path="PixiAdapter.js" />

var BuggyDemo;
(function (BuggyDemo) {
	'use strict';

	var GameObject = (function () {

		/**
		 * Creates a new GameObject instance
		 * @param  {Game} game
		 */
		function GameObject(game) {
			this.game = game;

			this.bodies = []; // p2 physics bodies
			this.sprites = []; // Pixi sprites, one for each body

			game.gameObjects.push(this);
		}

		/**
		 * Adds the supplied p2 body to the game's world and adds a corresponding empty sprite to the Pixi stage
		 * @param  {Body} body
		 * @return {GameObject} gameObject
		 */
		GameObject.prototype.addBody = function (body) {
			var sprite;

			this.bodies.push(body);

			this.game.world.addBody(body);

			sprite = new PIXI.Graphics();
			this.sprites.push(sprite);
			this.game.pixiAdapter.stage.addChild(sprite);

			return this;
		};

		/**
		 * Adds the supplied p2 shape to the supplied p2 body
		 * @param  {Body} body
		 * @param  {Shape} shape
		 * @param  {Object} style
		 * @param  {Object} options
		 * @return {GameObject} gameObject
		 */
		GameObject.prototype.addShape = function (body, shape, offset, angle, style, options) {
			var sprite;

			offset = offset || [0, 0];
			angle = angle || 0;

			options = options || {};
			shape.collisionGroup = options.collisionGroup || 1;
			shape.collisionMask = options.collisionMask || 1;

			body.addShape(shape, offset, angle);

			sprite = this.sprites[this.bodies.indexOf(body)];

			this.game.pixiAdapter.renderShapeToSprite(sprite
				, shape
                , offset
                , angle
				, style);

			return this;
		};

		return GameObject;
	})();

	BuggyDemo.GameObject = GameObject;
})(BuggyDemo || (BuggyDemo = {}));
