"use strict";
var webpack = require("webpack");

var pkg = require("../package.json");
var now = new Date();

function pad(num) {
	return (num < 10 ? "0" : "") + num;
}

var banner = [
	pkg.name + " - v" + pkg.version,
	"License: " + pkg.license,
	"Date: " + now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" +
		pad(now.getDate())
].join("\n");

module.exports = {
	context: "src",
	entry: "./chart-extensions",
	output: {
		/**
		 * Ensure the name of the exported AMD module is "d3.chart". This makes
		 * the browser global somewhat awkward to use (`window["d3.chart"]`),
		 * but consumers in those contexts are most likely referencing the
		 * function through the `d3` global.
		 */
		library: "d3.chart",
		libraryTarget: "umd",
		umdNamedDefine: true
	},
	plugins: [
		new webpack.BannerPlugin(banner)
	],
	externals: {
		d3: true
	}
};
