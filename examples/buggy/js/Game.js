/// <reference path="PixiAdapter.js" />

var BuggyDemo;
(function (BuggyDemo) {
    'use strict';

    var Game = (function () {

        /**
		 * Creates a new space buggy Game instance
		 */
        function Game() {

            var options = {
                worldOptions: {
                    gravity: [0, -10]
                }
                , pixiOptions: {
                    viewport: document.getElementById('viewport')
				    , transparent: true
                }
                , imageUrls: [
                    'img/rock.jpg'
                    , 'img/metal.jpg'
                    , 'img/glass.jpg'
                    , 'img/tyre.png'
                ]
            };

            P2Pixi.Game.call(this, options);
        }

        Game.prototype = Object.create(P2Pixi.Game.prototype);

        Game.prototype.beforeRun = function () {
            this.buggy = new BuggyDemo.Buggy(this);
            this.trackedBody = this.buggy.primaryBody;

            this.terrain = new BuggyDemo.Terrain(this);

            // Add friction between buggy tyres and terrain
            this.world.addContactMaterial(new p2.ContactMaterial(this.buggy.tyreMaterial, this.terrain.rockMaterial, {
                friction: 1
            }));

            this.addHandlers();
        };

        /**
		 * Adds keyboard and touch handlers
		 */
        Game.prototype.addHandlers = function () {
            var buggy = this.buggy
				, pixiAdapter = this.pixiAdapter
                , viewport = document.getElementById('viewport');

            document.addEventListener('keydown', function (e) {
                var keyID = window.event ? event.keyCode : (e.keyCode !== 0 ? e.keyCode : e.which);
                switch (keyID) {
                    case 37:
                        buggy.accelerateLeft();
                        break;

                    case 39:
                        buggy.accelerateRight();
                        break;
                }
            });

            document.addEventListener('keyup', function (e) {
                var keyID = window.event ? event.keyCode : (e.keyCode !== 0 ? e.keyCode : e.which);
                switch (keyID) {
                    case 37:
                    case 39:
                        buggy.endAcceleration();
                        break;
                }
            });

            function onCanvasTouchHold(e) {
                var touch = e.gesture.touches[0];

                if (touch.pageX <= pixiAdapter.windowWidth / 2)
                    buggy.accelerateLeft();
                else
                    buggy.accelerateRight();
            }

            function onCanvasRelease(e) {
                buggy.endAcceleration();
            }

            Hammer(viewport)
				.on('touch', onCanvasTouchHold)
				.on('hold', onCanvasTouchHold)
                .on('release', onCanvasRelease);
        }

        return Game;
    })();

    BuggyDemo.Game = Game;
})(BuggyDemo || (BuggyDemo = {}));
