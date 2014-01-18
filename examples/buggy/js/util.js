var BuggyDemo;
(function (BuggyDemo) {
	'use strict';

	var util = (function () {

		// Returns a random integer between min and max
		function randomNumber(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		return {
			randomNumber: randomNumber
		};

	})();

	BuggyDemo.util = util;
})(BuggyDemo || (BuggyDemo = {}));
