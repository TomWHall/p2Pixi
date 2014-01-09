/// <reference path="GameObject.js" />
/// <reference path="util.js" />

var BuggyDemo;
(function (BuggyDemo) {
	'use strict';

	var environmentUtil = (function () {

	    var terrainMaterial = new p2.Material()
            , zero = [0, 0];

	    // Default options for terrain bodies
	    var terrainBodyOptions = {
	        collisionGroup: 1
			, collisionMask: 1 | 2
	    };

		function buildTerrain(game) {

			var terrain = new BuggyDemo.GameObject(game)
				, x
				, width
				, box
				, angle
				, lastAngle
				, rectangle;


			// Ground

			box = new p2.Body({
				mass: 0
				, position: [0, -6.5]
			});

			terrain.addBody(box)
				.addShape(box
					, new p2.Rectangle(100, 3)
                    , zero
                    , 0
					, {
						fillColor: 0x444444
					}
					, terrainBodyOptions);

			x = -50;
			while (x < 50) {
				width = BuggyDemo.util.randomNumber(25, 100) / 25;
				x += width * 0.7;

				angle = BuggyDemo.util.randomNumber(1, 20) / 100;
				if (lastAngle > 0) {
					angle = angle * -1;
				}
				lastAngle = angle;

				box = new p2.Body({
					mass: 0
					, position: [x, -5]
					, angle: angle
				});

				rectangle = new p2.Rectangle(width, 1);
				rectangle.material = terrainMaterial;

				terrain.addBody(box)
					.addShape(box
						, rectangle
                        , zero
                        , 0
						, {
							fillColor: 0x444444
						}
						, terrainBodyOptions);

			}
		}

		return {
			buildTerrain: buildTerrain
			, terrainMaterial: terrainMaterial
		};

	})();

	BuggyDemo.environmentUtil = environmentUtil;
})(BuggyDemo || (BuggyDemo = {}));
