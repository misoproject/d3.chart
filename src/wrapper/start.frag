(function(global, factory) {
	"use strict";

	if (typeof global.define === "function" && global.define.amd) {
		define(["d3"], function(d3) {
			factory(global, d3);
		});
	} else {
		factory(global, global.d3);
	}

})(this, function(window, d3) {
"use strict";
