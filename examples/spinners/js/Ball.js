var SpinnersDemo;
(function (SpinnersDemo) {
  'use strict';

  var Ball = (function () {

    function Ball(game, position) {

      P2Pixi.GameObject.call(this, game);

      var ball = new p2.Body({
        mass: 0.1,
        position: position
      });

      var ballCircle = new p2.Circle({ radius: 0.25 });
      ballCircle.material = game.ballMaterial;

      var ballTexture = PIXI.Texture.fromImage('img/tile-yellow.png', false);

      this.addBody(ball)
        .addShape(ball,
          ballCircle,
          {
            textureOptions: {
              texture: ballTexture,
              tile: false
            }
          });
    }

    Ball.prototype = Object.create(P2Pixi.GameObject.prototype);

    return Ball;
  })();

  SpinnersDemo.Ball = Ball;
})(SpinnersDemo || (SpinnersDemo = {}));
