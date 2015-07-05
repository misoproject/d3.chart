(function(global, factory) {
	"use strict";

	if (typeof define === "function" && define.amd) {
		define(["d3"], function(d3) {
			factory(global, d3);
		});
	} else if (typeof require === "function") {
		factory(global, require("d3"));
	} else {
		factory(global, global.d3);
	}

})(this, function(window, d3) {
"use strict";
