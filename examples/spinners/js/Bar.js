var SpinnersDemo;
(function (SpinnersDemo) {
  'use strict';

  var Bar = (function () {

    function Bar(game, position, width, height, angle) {
      
      P2Pixi.GameObject.call(this, game);

      angle = angle || 0;

      var bar = new p2.Body({
        mass: 0.1,
        position: position
      });

      var barBox = new p2.Box({ width: width, height: height });

      bar.angle = angle;
      bar.gravityScale = 0;

      barBox.material = game.hardMaterial;

      var barTexture = PIXI.Texture.fromImage('img/tile-pink.png', false);

      this.addBody(bar)
        .addShape(bar,
          barBox,
          {
            textureOptions: {
              texture: barTexture
            }
          });
    }

    Bar.prototype = Object.create(P2Pixi.GameObject.prototype);

    return Bar;
  })();

  SpinnersDemo.Bar = Bar;
})(SpinnersDemo || (SpinnersDemo = {}));