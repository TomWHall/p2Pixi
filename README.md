#p2Pixi

A simple 2D vector game model framework using p2.js for physics and Pixi.js for rendering.

Live demos:

- http://booleanoperations.co.nz/experiments/p2/buggy/

- http://booleanoperations.co.nz/Experiments/p2/buggyHeightfield/


Here is a brief overview of the 3 classes and their key methods:

##Game
Serves as an abstract base class for your own game. Refer to the "space buggy" demos for example usage.

###addGameObject
Adds the supplied GameObject to the Game.

###removeGameObject
Removes the supplied GameObject from the Game, which results in the removal of its bodies from the p2 physics world and those bodies' shapes from the Pixi rendering stage.

###loadImages
Loads the supplied images asyncronously with a Pixi ImageLoader, for use in textures.

###assetsLoaded
Called when all images have been loaded.

###beforeRun
Called before the game loop is started.

###run
Begins the world step / render loop.

###beforeRender
Called before the render method. The base implementation of this method focuses the Pixi stage upon the Game's tracked p2 body, if one is set. Extend or override this method to customize scrolling behaviour.

###render
Updates the Pixi representation of the world by transforming each body's Pixi representation according to its p2 properties.

###afterRender
Called after the render method. Override this method to perform extra custom rendering.


##GameObject
Serves as an abstract base class for your own game's game objects such as a car or a portion of terrain. Each GameObject can comprise multiple p2 bodies.

###addBody
Adds the supplied p2 body to the GameObject and to the game's world, and creates a corresponding Pixi DisplayObjectContainer object for rendering.

###addShape
Adds the supplied p2 shape to the supplied p2 body.


##PixiAdapter
Handles rendering of p2 shapes into Pixi objects such as Graphics (for vector rendering) and / or TilingSprite (for bitmap rendering).


###addShape
Called by the GameObject.addShape method. Adds the supplied p2 shape to the supplied Pixi DisplayObjectContainer, using vectors and / or a texture.
