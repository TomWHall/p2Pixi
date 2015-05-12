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
