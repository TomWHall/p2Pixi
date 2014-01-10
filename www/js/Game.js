/// <reference path="PixiAdapter.js" />

var BuggyDemo;
(function (BuggyDemo) {
	'use strict';

	var Game = (function () {

		/**
		 * Creates a new Game instance
		 */
		function Game() {

			var terrain;

			this.world = new p2.World({
				gravity: [0, -10]
			});

			this.gameObjects = [];

			this.pixiAdapter = new BuggyDemo.PixiAdapter({
				viewport: document.getElementById('viewport')
				, transparent: true
			});

			this.buggy = new BuggyDemo.Buggy(this);

			BuggyDemo.environmentUtil.buildTerrain(this);

			// Add friction between buggy tyres and terrain
			this.world.addContactMaterial(new p2.ContactMaterial(this.buggy.tyreMaterial, BuggyDemo.environmentUtil.terrainMaterial, {
				friction: 0.5
			}));

			this.addHandlers();

			this.paused = false;

			this.run();
		}

		Game.prototype.time = function () {
		    return new Date().getTime() / 1000;
		};

		/**
		 * Begins the world step / render loop
		 */
		Game.prototype.run = function() {
		    var self = this
		        , lastCallTime = self.time()
                , maxSubSteps = 10;

		    function update() {
		        var timeSinceLastCall;

				if (!self.paused) {
				    timeSinceLastCall = self.time() - lastCallTime;
				    lastCallTime = self.time();
					self.world.step(1 / 60, timeSinceLastCall, maxSubSteps);
				}

				self.render();
				requestAnimationFrame(update);
			}

			requestAnimationFrame(update);
		};

		Game.prototype.render = function () {
			var pixiAdapter = this.pixiAdapter
				, w = pixiAdapter.renderer.width
				, h = pixiAdapter.renderer.height
				, ppu = pixiAdapter.pixelsPerLengthUnit
				, gameObjects = this.gameObjects
				, gameObjectCount = gameObjects.length
				, gameObject
				, i
				, j
				, buggyPrimaryBodyPosition;

			for (i = 0; i < gameObjectCount; i++) {
				gameObject = gameObjects[i];

				// Update body sprite transforms
				for (j = 0; j < gameObject.bodies.length; j++) {
					var body = gameObject.bodies[j];
					var sprite = gameObject.sprites[j];

					sprite.position.x = body.position[0] * ppu;
					sprite.position.y = h - body.position[1] * ppu;
					sprite.rotation = -body.angle;
				}
			}

			// Scroll viewport to track focused buggy body
			buggyPrimaryBodyPosition = this.buggy.primaryBody.position;
			pixiAdapter.stage.position.x = (pixiAdapter.renderer.width / 2) - (buggyPrimaryBodyPosition[0] * ppu);
			pixiAdapter.stage.position.y = -(pixiAdapter.renderer.height / 2) + (buggyPrimaryBodyPosition[1] * ppu);

			pixiAdapter.renderer.render(pixiAdapter.container);
		}

		/**
		 * Adds keyboard and touch handlers
		 */
		Game.prototype.addHandlers = function () {
			var buggy = this.buggy
				, pixiAdapter = this.pixiAdapter;

			document.addEventListener('keydown', function (e) {
				var keyDownID = window.event ? event.keyCode : (e.keyCode !== 0 ? e.keyCode : e.which);
				switch (keyDownID) {
					case 37:
						buggy.accelerateLeft();
						break;

					case 39:
						buggy.accelerateRight();
						break;
				}
			});

			function onCanvasTouch(e) {
				var touch = e.gesture.touches[0];

				if (touch.pageX <= pixiAdapter.windowWidth / 2)
					buggy.accelerateLeft();
				else
					buggy.accelerateRight();
			}

			function onCanvasHold(e) {
				var touch = e.gesture.touches[0];

				if (touch.pageX <= pixiAdapter.windowWidth / 2)
					buggy.accelerateLeft();
				else
					buggy.accelerateRight();
			}

			var viewport = document.getElementById('viewport');
			Hammer(viewport)
				.on('touch', onCanvasTouch)
				.on('hold', onCanvasHold);
		}

		return Game;
	})();

	BuggyDemo.Game = Game;
})(BuggyDemo || (BuggyDemo = {}));
