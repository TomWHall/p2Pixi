var SpinnersDemo;
(function (SpinnersDemo) {
  'use strict';

  var Spinner = (function () {

    function Spinner(game, position, speed) {

      P2Pixi.GameObject.call(this, game);

      this.barLength = 4;
      this.barWidth = 0.25;

      var spinner = new p2.Body({
        mass: 10,
        position: position
      });

      var spinnerBoxHor = new p2.Box({ width: this.barLength, height: this.barWidth });
      var spinnerBoxVert = new p2.Box({ width: this.barWidth, height: this.barLength });

      var anchor = new p2.Body({
        mass: 0,
        position: position
      });

      spinnerBoxHor.material = game.hardMaterial;
      spinnerBoxVert.material = game.hardMaterial;

      var spinnerTexture = PIXI.Texture.fromImage('img/tile-green.png', false);

      this.addBody(spinner)
        .addShape(spinner,
          spinnerBoxHor,
          {
            textureOptions: {
              texture: spinnerTexture
            }
          })
        .addShape(spinner,
          spinnerBoxVert,
          {
            textureOptions: {
              texture: spinnerTexture
            }
          })
        .addBody(anchor);

      var revoluteConstraint = new p2.RevoluteConstraint(spinner, anchor, { localPivotA: [0, 0], localPivotB: [0, 0] });
      revoluteConstraint.enableMotor();
      revoluteConstraint.setMotorSpeed(speed);
      this.addConstraint(revoluteConstraint);

      // Add bars

      function addBar(localOffset) {
        function randomNumber(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        var angle = (randomNumber(1, 100) / 100) * (2 * Math.PI);

        var bar = new SpinnersDemo.Bar(this.game, [position[0] + localOffset[0], position[1] + localOffset[1]], 0.125, 1.5, angle);
        this.addChild(bar);

        var revoluteConstraint = new p2.RevoluteConstraint(spinner, bar.bodies[0], { localPivotA: localOffset, localPivotB: [0, 0] });
        revoluteConstraint.enableMotor();
        revoluteConstraint.setMotorSpeed(speed * 4);
        this.addConstraint(revoluteConstraint);
      }

      var offset = (this.barLength / 2) - 0.25;

      addBar.call(this, [0, offset]);
      addBar.call(this, [0, -offset]);
      addBar.call(this, [-offset, 0]);
      addBar.call(this, [offset, 0]);
    }

    Spinner.prototype = Object.create(P2Pixi.GameObject.prototype);

    return Spinner;
  })();

  SpinnersDemo.Spinner = Spinner;
})(SpinnersDemo || (SpinnersDemo = {}));