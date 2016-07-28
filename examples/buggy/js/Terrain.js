var BuggyDemo;
(function (BuggyDemo) {
  'use strict';

  var Terrain = (function () {

    /**
     * Creates a new Terrain instance
     * @param  {Game} game
     */
    function Terrain(game) {

      var collisionOptions = {
        collisionGroup: 1,
        collisionMask: 1 | 2
      };

      var rockTexture = PIXI.Texture.fromImage('img/rock.jpg', false);

      P2Pixi.GameObject.call(this, game);

      this.rockMaterial = new p2.Material();


      // Ground HeightField

      var ground = new p2.Body({
        position: [0, -5]
      });

      var heights = [];
      for (var i = 0; i < 500; i++) {
        heights.push(0.2 * Math.cos(0.2 * i) * Math.sin(0.5 * i) + 0.2 * Math.sin(0.1 * i) * Math.sin(0.05 * i));
      }
      var heightfield = new p2.Heightfield({ heights: heights, elementWidth: 0.3 });
      heightfield.material = this.rockMaterial;

      this.addBody(ground)
        .addShape(ground, heightfield,
        {
          textureOptions: {
            texture: rockTexture
          },
          offset: [-75, 0],
          collisionOptions: collisionOptions
        });
    }

    Terrain.prototype = Object.create(P2Pixi.GameObject.prototype);

    return Terrain;
  })();

  BuggyDemo.Terrain = Terrain;
})(BuggyDemo || (BuggyDemo = {}));
