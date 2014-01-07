/// <reference path="GameObject.js" />

var BuggyDemo;
(function (BuggyDemo) {
	'use strict';

	var Buggy = (function () {

		/**
		 * Creates a new Buggy instance
		 * @param  {Game} game
		 */
		function Buggy(game) {

			BuggyDemo.GameObject.call(this, game);

			function addMotorizedRevoluteConstraint(bodyA, offsetA, bodyB, offsetB) {
				var revoluteConstraint = new p2.RevoluteConstraint(bodyA, offsetA, bodyB, offsetB);
				revoluteConstraint.enableMotor();
				revoluteConstraint.setMotorSpeed(0);

				this.revoluteConstraints.push(revoluteConstraint);
				game.world.addConstraint(revoluteConstraint);
			}

			var self = this
				, dome
				, chassis
				, plate
				, leftSuspensionBar
				, rightSuspensionBar
				, leftOuterWheel
				, leftInnerWheel
				, rightInnerWheel
				, rightOuterWheel
				, wheels
				, wheel
				, tyre
				, box
				, i
				, revoluteConstraint;

			this.maximumSpeed = 25;
			this.speed = 0;
			this.decelerationPerStep = 0.1;
			this.tyreMaterial  = new p2.Material();


			// Dome

			dome = new p2.Body({
				mass: 0.1
				, position: [0, 0]
			});

			this.addBody(dome)
				.addShape(dome
					, new p2.Circle(0.3)
					, {
						lineColor: 0x000000
						, lineWidth: 1
						, fillColor: 0x999999
						, opacity: 0.15
					}
					, {
						collisionGroup: 2
						, collisionMask: 1
					});


			// Chassis

			chassis = new p2.Body({
				mass: 1
				, position: [0, 0]
			});

			this.addBody(chassis)
				.addShape(chassis
					, new p2.Convex([[-0.5, -0.2], [0.5, -0.2], [0.7, 0.2], [-0.7, 0.2]])
					, {
						fillColor: 0x007777
					}
					, {
						collisionGroup: 2
						, collisionMask: 1
					});


			// Lock dome's position relative to chassis

			game.world.addConstraint(new p2.LockConstraint(dome, chassis, {
				localOffsetB: [0, -0.2]
			}));


			// Plate

			plate = new p2.Body({
				mass: 0.1
				, position: [0, 0]
			});

			this.addBody(plate)
				.addShape(plate
					, new p2.Rectangle(1.5, 0.025)
					, {
						fillColor: 0x005555
					}
					, {
						collisionGroup: 2
						, collisionMask: 1
					});


			// Lock plate's position relative to chassis

			game.world.addConstraint(new p2.LockConstraint(plate, chassis, {
				localOffsetB: [0, -0.2]
			}));


			// Left suspension bar

			leftSuspensionBar = new p2.Body({
				mass: 0.1
				, position: [-0.5, 0.125]
			});

			this.addBody(leftSuspensionBar)
				.addShape(leftSuspensionBar
					, new p2.Rectangle(0.5, 0.05)
					, {
						fillColor: 0x666666
					}
					, {
						collisionGroup: 2
						, collisionMask: 1
					});


			// Right suspension bar

			rightSuspensionBar = new p2.Body({
				mass: 0.1
				, position: [0.5, 0.125]
			});

			this.addBody(rightSuspensionBar)
				.addShape(rightSuspensionBar
					, new p2.Rectangle(0.5, 0.05)
					, {
						fillColor: 0x666666
					}
					, {
						collisionGroup: 2
						, collisionMask: 1
					});


			// Connect suspension bars to chassis

			game.world.addConstraint(new p2.RevoluteConstraint(chassis, [-0.5, -0.2], leftSuspensionBar, [0, 0]));
			game.world.addConstraint(new p2.RevoluteConstraint(chassis, [0.5, -0.2], rightSuspensionBar, [0, 0]));


			// Wheels

			leftOuterWheel = new p2.Body({
				mass: 0.2
				, position: [0, 0]
			});

			leftInnerWheel = new p2.Body({
				mass: 0.2
				, position: [0.5, 0]
			});

			rightInnerWheel = new p2.Body({
				mass: 0.2
				, position: [1, 0]
			});

			rightOuterWheel = new p2.Body({
				mass: 0.2
				, position: [1.5, 0]
			});

			wheels = [leftOuterWheel, leftInnerWheel, rightInnerWheel, rightOuterWheel];

			for (i = 0; i < wheels.length; i++) {
				wheel = wheels[i];

				tyre = new p2.Circle(0.23);
				tyre.material = this.tyreMaterial;

				this.addBody(wheel)
					.addShape(wheel // Tyre
						, tyre
						, {
							fillColor: 0x111111
						}, {
							collisionGroup: 2
							, collisionMask: 1
						})
					.addShape(wheel // Hub
						, new p2.Circle(0.1)
						, {
							fillColor: 0x999999
						}, {
							collisionGroup: 2
							, collisionMask: 1
						})
					.addShape(wheel // Hub detail
						, new p2.Rectangle(0.12, 0.025)
						, {
							fillColor: 0x444444
						}, {
							collisionGroup: 2
							, collisionMask: 1
						});
			}


			// Connect wheels to suspension bars, with motors

			this.revoluteConstraints = [];
			addMotorizedRevoluteConstraint.call(this, leftSuspensionBar, [-0.25, 0], leftOuterWheel, [0, 0]);
			addMotorizedRevoluteConstraint.call(this, leftSuspensionBar, [0.25, 0], leftInnerWheel, [0, 0]);
			addMotorizedRevoluteConstraint.call(this, rightSuspensionBar, [-0.25, 0], rightInnerWheel, [0, 0]);
			addMotorizedRevoluteConstraint.call(this, rightSuspensionBar, [0.25, 0], rightOuterWheel, [0, 0]);


			// Apply drag to the motors

			this.game.world.on('postStep', function (e) {
				var speed = self.getSpeed();

				if (speed < 0) {
					speed += self.decelerationPerStep;
				} else if (speed > 0) {
					speed -= self.decelerationPerStep;
				}

				self.setSpeed(speed);
			})


			// Set the body which acts as the visual center of the group, tracked when scrolling

			this.primaryBody = chassis;
		}

		Buggy.prototype = Object.create(BuggyDemo.GameObject.prototype);

		/**
		 * Returns the motor speed of the buggy's wheels
		 * @return {Number} speed
		 */
		Buggy.prototype.getSpeed = function () {
			return this.revoluteConstraints[0].getMotorSpeed();
		};

		/**
		 * Sets the motor speed of the buggy's wheels
		 * @param  {Number} speed
		 */
		Buggy.prototype.setSpeed = function (speed) {
			for (var i = 0; i < this.revoluteConstraints.length; i++) {
				this.revoluteConstraints[i].setMotorSpeed(speed);
			}
		};

		/**
		 * Adds a positive or negative increment to the motor speed of the buggy's wheels
		 * @param  {Number} speed
		 */
		Buggy.prototype.addSpeed = function (increment) {
			var speed = this.getSpeed();

			speed += increment;
			if (speed < -this.maximumSpeed) {
				speed = -this.maximumSpeed;
			} else if (speed > this.maximumSpeed) {
				speed = this.maximumSpeed;
			}

			this.setSpeed(speed);
		}

		/**
		 * Accelerates the buggy to the left
		 */
		Buggy.prototype.accelerateLeft = function () {
			this.addSpeed(-1);
		}

		/**
		 * Accelerates the buggy to the right
		 */
		Buggy.prototype.accelerateRight = function () {
			this.addSpeed(1);
		}

		return Buggy;
	})();

	BuggyDemo.Buggy = Buggy;
})(BuggyDemo || (BuggyDemo = {}));
