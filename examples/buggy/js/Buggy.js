var BuggyDemo;
(function (BuggyDemo) {
  'use strict';

  var Buggy = (function () {

    /**
     * Creates a new Buggy instance
     * @param  {Game} game
     */
    function Buggy(game) {

      P2Pixi.GameObject.call(this, game);

      function addMotorizedRevoluteConstraint(bodyA, offsetA, bodyB, offsetB) {
        var revoluteConstraint = new p2.RevoluteConstraint(bodyA, bodyB, { localPivotA: offsetA, localPivotB: offsetB });
        revoluteConstraint.enableMotor();
        revoluteConstraint.setMotorSpeed(0);

        this.addConstraint(revoluteConstraint);
      }

      var self = this;

      var collisionOptions = {
        collisionGroup: 2,
        collisionMask: 1
      };

      var metalTexture = PIXI.Texture.fromImage('img/metal.jpg', false);
      var glassTexture = PIXI.Texture.fromImage('img/glass.jpg', false);
      var tyreTexture = PIXI.Texture.fromImage('img/tyre.png', false);

      this.speed = 0; // Speed of the motors, in p2 speed units
      this.maximumSpeed = 25; // Absolute maxiumum speed of the motors in either direction, in p2 speed units
      this.accelerationRate = 0.25; // Rate at which player can accelerate, in p2 speed units per millisecond
      this.decelerationRate = 0.25; // Rate at which the buggy comes to rest, in p2 speed units per millisecond
      this.reverseDirectionRate = 3; // Multiplier for extra reverse acceleration when changing direction
      this.direction = 0; // Direction of the buggy. Negative = left, positive = right

      this.tyreMaterial = new p2.Material();


      // Chassis, dome and plate

      var chassis = new p2.Body({
        mass: 1,
        position: [0, 0]
      });

      this.addBody(chassis)
        .addShape(chassis,
          new p2.Circle({ radius: 0.3 }),
          {
            offset: [0, 0.2],
            textureOptions: {
              texture: glassTexture
            },
            alpha: 0.9,
            collisionOptions: collisionOptions
          })
        .addShape(chassis,
          new p2.Convex({ vertices: [[-0.5, -0.2], [0.5, -0.2], [0.7, 0.2], [-0.7, 0.2]] }),
          {
            textureOptions: {
              texture: metalTexture
            },
            styleOptions: {
              lineColor: 0x333333,
              lineWidth: 2
            },
            collisionOptions: collisionOptions
          })
        .addShape(chassis,
          new p2.Box({ width: 1.5, height: 0.03 }),
          {
            offset: [0, 0.2],
            styleOptions: {
              fillColor: 0x2f424d
            },
            collisionOptions: collisionOptions
          });


      // Left suspension bar

      var leftSuspensionBar = new p2.Body({
        mass: 0.1,
        position: [-0.5, 0.125]
      });

      this.addBody(leftSuspensionBar)
        .addShape(leftSuspensionBar,
          new p2.Box({ width: 0.5, height: 0.07 }),
          {
            styleOptions: {
              fillColor: 0x333333
            },
            collisionOptions: collisionOptions
          });


      // Right suspension bar

      var rightSuspensionBar = new p2.Body({
        mass: 0.1,
        position: [0.5, 0.125]
      });

      this.addBody(rightSuspensionBar)
        .addShape(rightSuspensionBar,
          new p2.Box({ width: 0.5, height: 0.07 }),
          {
            styleOptions: {
              fillColor: 0x333333
            },
            collisionOptions: collisionOptions
          });


      // Connect suspension bars to chassis

      game.world.addConstraint(new p2.RevoluteConstraint(chassis, leftSuspensionBar, { localPivotA: [-0.5, -0.2], localPivotB: [0, 0] }));
      game.world.addConstraint(new p2.RevoluteConstraint(chassis, rightSuspensionBar, { localPivotA: [0.5, -0.2], localPivotB: [0, 0] }));


      // Wheels

      var leftOuterWheel = new p2.Body({
        mass: 0.2,
        position: [0, 0]
      });

      var leftInnerWheel = new p2.Body({
        mass: 0.2,
        position: [0.5, 0]
      });

      var rightInnerWheel = new p2.Body({
        mass: 0.2,
        position: [1, 0]
      });

      var rightOuterWheel = new p2.Body({
        mass: 0.2,
        position: [1.5, 0]
      });

      var wheels = [leftOuterWheel, leftInnerWheel, rightInnerWheel, rightOuterWheel];

      for (var i = 0; i < wheels.length; i++) {
        var wheel = wheels[i];

        var tyre = new p2.Circle({ radius: 0.23 });
        tyre.material = this.tyreMaterial;

        this.addBody(wheel)
          .addShape(wheel, // Tyre
            tyre,
            {
              textureOptions: {
                texture: tyreTexture
              },
              collisionOptions: collisionOptions
            })
          .addShape(wheel, // Hub
            new p2.Circle({ radius: 0.1 }),
            {
              styleOptions: {
                fillColor: 0x999999
              },
              collisionOptions: collisionOptions
            })
          .addShape(wheel, // Hub detail
            new p2.Box({ width: 0.12, height: 0.025 }),
            {
              styleOptions: {
                fillColor: 0x444444
              },
              collisionOptions: collisionOptions
            });
      }


      // Connect wheels to suspension bars, with motors

      addMotorizedRevoluteConstraint.call(this, leftSuspensionBar, [-0.25, 0], leftOuterWheel, [0, 0]);
      addMotorizedRevoluteConstraint.call(this, leftSuspensionBar, [0.25, 0], leftInnerWheel, [0, 0]);
      addMotorizedRevoluteConstraint.call(this, rightSuspensionBar, [-0.25, 0], rightInnerWheel, [0, 0]);
      addMotorizedRevoluteConstraint.call(this, rightSuspensionBar, [0.25, 0], rightOuterWheel, [0, 0]);


      // Adjust speed based on acceleration

      this.game.world.on('postStep', function (e) {
        var speed = self.getSpeed();

        if (self.direction < 0) {
          speed -= (self.accelerationRate * (speed > 0 ? self.reverseDirectionRate : 1));
          if (speed < -self.maximumSpeed) {
            speed = -self.maximumSpeed;
          }
        } else if (self.direction > 0) {
          speed += (self.accelerationRate * (speed < 0 ? self.reverseDirectionRate : 1));
          if (speed > self.maximumSpeed) {
            speed = self.maximumSpeed;
          }
        } else {
          if (speed < 0) {
            speed += self.decelerationRate
          } else if (speed > 0) {
            speed -= self.decelerationRate;
          }
        }

        self.setSpeed(speed);
      })


      // Set the body which acts as the visual center of the group, tracked when scrolling

      this.primaryBody = chassis;
    }

    Buggy.prototype = Object.create(P2Pixi.GameObject.prototype);

    /**
     * Returns the motor speed of the buggy's wheels
     * @return {Number} speed
     */
    Buggy.prototype.getSpeed = function () {
      return this.constraints[0].getMotorSpeed();
    };

    /**
     * Sets the motor speed of the buggy's wheels
     * @param  {Number} speed
     */
    Buggy.prototype.setSpeed = function (speed) {
      for (var i = 0; i < this.constraints.length; i++) {
        this.constraints[i].setMotorSpeed(speed);
      }
    };

    /**
     * Accelerates the buggy to the left
     */
    Buggy.prototype.accelerateLeft = function () {
      this.direction = -1;
    }

    /**
     * Accelerates the buggy to the right
     */
    Buggy.prototype.accelerateRight = function () {
      this.direction = 1;
    }

    /**
     * Removes acceleration from the buggy
     */
    Buggy.prototype.endAcceleration = function () {
      this.direction = 0;
    }

    return Buggy;
  })();

  BuggyDemo.Buggy = Buggy;
})(BuggyDemo || (BuggyDemo = {}));
