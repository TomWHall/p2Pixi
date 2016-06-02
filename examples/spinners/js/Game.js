var SpinnersDemo;
(function (SpinnersDemo) {
  'use strict';

  var Game = (function () {

    /**
     * Creates a new spinners Game instance
     */
    function Game() {

      var options = {
        worldOptions: {
          gravity: [0, 0]
        },
        pixiAdapterOptions: {
          rendererOptions: {
            view: document.getElementById('viewport'),
            transparent: true
          }
        },
        assetUrls: [
          'img/tile-pink.png',
          'img/tile-green.png',
          'img/tile-blue.png',
          'img/tile-yellow.png'
        ]
      };

      P2Pixi.Game.call(this, options);
    }

    Game.prototype = Object.create(P2Pixi.Game.prototype);

    Game.prototype.beforeRun = function () {
      this.ballMaterial = new p2.Material();
      this.hardMaterial = new p2.Material();

      this.world.addContactMaterial(new p2.ContactMaterial(this.ballMaterial, this.hardMaterial, {
        restitution: 0.5,
        stiffness: Number.MAX_VALUE,
        friction: 1
      }));

      this.terrain = new SpinnersDemo.Terrain(this, [0, 0], 2);
      this.addGameObject(this.terrain);

      this.spinner = new SpinnersDemo.Spinner(this, [0, 0], 2);
      this.addGameObject(this.spinner);

      function addBall(position) {
        var ball = new SpinnersDemo.Ball(this, position);
        this.addGameObject(ball);
      }

      addBall.call(this, [-1, 1]);
      addBall.call(this, [1, 1]);
      addBall.call(this, [-1, -1]);
      addBall.call(this, [1, -1]);

      document.getElementById('loading').style.display = 'none';
      document.getElementById('viewport').style.display = 'block';
    };

    return Game;
  })();

  SpinnersDemo.Game = Game;
})(SpinnersDemo || (SpinnersDemo = {}));
