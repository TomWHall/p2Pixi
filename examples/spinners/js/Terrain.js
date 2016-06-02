var SpinnersDemo;
(function (SpinnersDemo) {
  'use strict';

  var Terrain = (function () {

    /**
     * Creates a new Terrain instance
     * @param  {Game} game
     */
    function Terrain(game) {

      P2Pixi.GameObject.call(this, game);

      function addWall(position, width, height) {
        var wall = new p2.Body({
          mass: Number.MAX_VALUE,
          position: position
        });

        var wallBox = new p2.Box({ width: width, height: height });

        wallBox.material = game.hardMaterial;

        var wallTexture = PIXI.Texture.fromImage('img/tile-blue.png', false);

        this.addBody(wall)
          .addShape(wall,
          wallBox,
          {
            textureOptions: {
              texture: wallTexture
            }
          });
      }

      addWall.call(this, [-3, 0], 0.25, 6);
      addWall.call(this, [3, 0], 0.25, 6);
      addWall.call(this, [0, 2.75], 5.75, 0.25);
      addWall.call(this, [0, -2.75], 5.75, 0.25);
    }

    Terrain.prototype = Object.create(P2Pixi.GameObject.prototype);

    return Terrain;
  })();

  SpinnersDemo.Terrain = Terrain;
})(SpinnersDemo || (SpinnersDemo = {}));
