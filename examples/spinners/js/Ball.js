var SpinnersDemo;
(function (SpinnersDemo) {
  'use strict';

  var Ball = (function () {

    var ballTexture = PIXI.Texture.fromImage('img/tile-yellow.png', false)
      , reflectionTexture = PIXI.Texture.fromImage('img/reflection.png', false);

    function Ball(game, position) {

      P2Pixi.GameObject.call(this, game);

      var ball = new p2.Body({
        mass: 0.1
        , position: position
      })
      , ballCircle = new p2.Circle(0.25);

      ballCircle.material = game.ballMaterial;

      this.addBody(ball)
        .addShape(ball
        , ballCircle
        , [0, 0]
        , 0
        , game.terrainBodyShapeOptions
        , null
        , ballTexture
        , 1
        , { tile: false });
    }

    Ball.prototype = Object.create(P2Pixi.GameObject.prototype);

    return Ball;
  })();

  SpinnersDemo.Ball = Ball;
})(SpinnersDemo || (SpinnersDemo = {}));
