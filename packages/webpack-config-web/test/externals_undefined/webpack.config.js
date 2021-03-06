/* eslint-env node */
"use strict";
const getConfig = require("../..");

module.exports = function () {
	const config = getConfig({
		rootFolder: __dirname,
		mode: "development",
		polyfills: [],
		webworkerPolyfills: [],
		sourcemaps: false,
		entry: {
			"app-externals-undefined": "./src/application.ts"
		},
		pages: [
			{
				filename: "index.html",
				chunks: ["app-externals-undefined"]
			}
		]
	});
	config.externals = {};
	return config;
};
