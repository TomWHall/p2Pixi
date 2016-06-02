var BuggyDemo;
(function (BuggyDemo) {
  'use strict';

  var Game = (function () {

    /**
     * Creates a new space buggy Game instance
     */
    function Game() {

      var options = {
        pixiAdapterOptions: {
          rendererOptions: {
            view: document.getElementById('viewport'),
            transparent: true
          }
        },
        assetUrls: [
          'img/rock.jpg',
          'img/metal.jpg',
          'img/glass.jpg',
          'img/tyre.png'
        ]
      };

      P2Pixi.Game.call(this, options);
    }

    Game.prototype = Object.create(P2Pixi.Game.prototype);

    Game.prototype.beforeRun = function () {
      this.buggy = new BuggyDemo.Buggy(this);
      this.addGameObject(this.buggy);

      this.trackedBody = this.buggy.primaryBody;

      this.terrain = new BuggyDemo.Terrain(this);
      this.addGameObject(this.terrain);

      // Add friction between buggy tyres and terrain
      this.world.addContactMaterial(new p2.ContactMaterial(this.buggy.tyreMaterial, this.terrain.rockMaterial, {
        friction: 1
      }));

      this.addHandlers();

      document.getElementById('loading').style.display = 'none';
      document.getElementById('viewport').style.display = 'block';
    };

    /**
     * Adds keyboard and touch handlers
     */
    Game.prototype.addHandlers = function () {
      var buggy = this.buggy;
      var pixiAdapter = this.pixiAdapter;
      var view = pixiAdapter.renderer.view;

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

      function onViewportTouchHold(e) {
        var touch = e.changedTouches ? e.changedTouches[0] : e;

        if (touch.clientX <= pixiAdapter.windowWidth / 2)
          buggy.accelerateLeft();
        else
          buggy.accelerateRight();
      }

      function onViewportRelease(e) {
        buggy.endAcceleration();
      }

      view.addEventListener('touchstart', onViewportTouchHold, false);
      view.addEventListener('touchend', onViewportRelease, false);

      view.addEventListener('mousedown', onViewportTouchHold, false);
      view.addEventListener('mouseup', onViewportRelease, false);
    }

    return Game;
  })();

  BuggyDemo.Game = Game;
})(BuggyDemo || (BuggyDemo = {}));
