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
   * Updates the PIXI container transforms for this GameObject and all children
   */
  GameObject.prototype.updateTransforms = function () {
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

    // Update children
    var children = this.children;
    for (var i = 0; i < children.length; i++) {
      children[i].updateTransforms();
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