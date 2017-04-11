# p2Pixi

A simple 2D vector game model framework using p2.js for physics and Pixi.js for rendering.

Live demos:

[Buggy](http://booleanoperations.com/experiments/p2pixi/buggy)
[Spinners](http://booleanoperations.com/experiments/p2pixi/spinners)


Below is a brief overview of the 3 classes and their key methods. Refer to the TypeScript definitions for further details.

## Game
Serves as an abstract base class for your own game. Refer to the demo Game classes for example usage.

### addGameObject
Adds the supplied GameObject to the Game.

### removeGameObject
Defers to the remove function of the supplied GameObject

### loadAssets
Loads the supplied assets asyncronously with a Pixi AssetLoader.

### runIfReady
Runs the Game if the isReadyToRun function returns true. Override isReadyToRun to perform custom loading checks, for example if you are also loading sounds.

### beforeRun
Called before the game loop is started.

### run
Begins the world step / render loop.

### beforeRender
Called before the render method. The base implementation of this method focuses the Pixi stage upon the Game's tracked p2 body, if one is set. Extend or override this method to customize scrolling behaviour.

### render
Updates the Pixi representation of the world by transforming each body's Pixi representation according to its p2 properties.

### afterRender
Called after the render method. Override this method to perform extra custom rendering.


## GameObject
Serves as an abstract base class for your own game's game objects such as a car or a portion of terrain. Each GameObject can comprise multiple p2 bodies.

### addBody
Adds the supplied p2 body to the GameObject and to the game's world, and creates a corresponding Pixi DisplayObjectContainer object for rendering.

### addShape
Adds the supplied p2 shape to the supplied p2 body.

When specifying styles via options.styleOptions, lineWidth can either be specified as a Pixi line width, for example:

```
{ 
    lineWidth: 1
}
```

Or in p2 units, which take precedence, like so:

```
{ 
    lineWidthUnits: 0.0078125
}
```

Using Pixi's lineWidth means that regardless of your pixelsPerLengthUnit value, any shape outlines (if defined) will have a fixed pixel width.
Using p2 units means that if you decide to change your pixelsPerLengthUnit value then all line thicknesses will scale accordingly.

### addConstraint
Adds the supplied p2 constraint to the GameObject and to the game's world.

### addChild
Adds the supplied GameObject as a child of this GameObject. A child is simply a logically linked GameObject.

### updateTransforms
Updates the PIXI position and rotation transforms for each of this GameObject's p2 bodies. Recursively calls updateTransforms on child GameObjects.

### remove
Removes the GameObject from the Game, which results in the removal of its bodies and constraints from the p2 physics world and the bodies' shapes from the Pixi rendering stage.
Also removes all child GameObjects.


## PixiAdapter
Handles rendering of p2 shapes into Pixi objects such as Graphics (for vector rendering) and / or Sprite / TilingSprite (for bitmap rendering).


### addShape
Called by the GameObject.addShape method. Adds the supplied p2 shape to the supplied Pixi DisplayObjectContainer, using vectors and / or a texture.
