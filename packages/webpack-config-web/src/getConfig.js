/* eslint-env node */
/* eslint-disable max-statements */
"use strict";
const {strictEqual} = require("assert");
const {join, isAbsolute} = require("path");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackTagsPlugin = require("html-webpack-tags-plugin");
const SriPlugin = require("webpack-subresource-integrity");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const postcssPresetEnv = require("postcss-preset-env");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const cssnano = require("cssnano");
const templateFilepath = join(__dirname, "template.html");

/**
 * @param {String[]} extensions
 */
function getRegex(extensions) {
	return new RegExp("\\.(" + extensions.join("|") + ")$");
}

module.exports = function getConfig({
	entry = {application: "./src/index.ts"},
	pages = [{title: "Index", filename: "index.html"}],
	jsFilename,
	jsChunkFilename,
	cssFilename,
	cssChunkFilename,
	webworkerFilename,
	assetFilename,
	rootFolder = "",
	outputFolder = "",
	publicPath = "/",
	mode = "production",
	port = 8000,
	cssModules = true,
	scss,
	embedLimit = 5000,
	embedExtensions = ["jpg", "png", "gif", "svg"],
	rawExtensions = ["txt"],
	copyExtensions = ["woff"],
	copyPatterns = [],
	injectPatterns = [],
	sourcemaps = true,
	skipPostprocess = false,
	polyfills = ["core-js/stable/promise"],
	webworkerPolyfills = ["core-js/stable/promise"],
	webworkerPattern = /\.webworker\.ts$/,
	skipHashes = false,
	skipReset = false
} = {}) {
	strictEqual(typeof rootFolder, "string", '"rootFolder" should be a String');
	let actualRootFolder = rootFolder;
	if (actualRootFolder === "") {
		actualRootFolder = process.cwd();
	} else if (!isAbsolute(actualRootFolder)) {
		throw new Error('"rootFolder" should be an absolute path');
	}

	strictEqual(typeof outputFolder, "string", '"outputFolder" should be a String');
	let actualOutputFolder = outputFolder;
	if (actualOutputFolder === "") {
		actualOutputFolder = join(actualRootFolder, "dist");
	} else if (!isAbsolute(actualOutputFolder)) {
		throw new Error('"outputFolder" should be an absolute path');
	}

	strictEqual(typeof mode, "string", '"mode" should be a String');
	if (mode === "") {
		throw new Error('"mode" should not be empty');
	}

	strictEqual(entry === null, false, '"entry" should not be null');
	strictEqual(Array.isArray(entry), false, '"entry" should not be an Array');
	strictEqual(entry instanceof Promise, false, '"entry" should not be a Promise');
	strictEqual(entry instanceof RegExp, false, '"entry" should not be a RegExp');
	strictEqual(entry instanceof Symbol, false, '"entry" should not be a Symbol');
	strictEqual(typeof entry, "object", '"entry" should be an Object');

	strictEqual(Array.isArray(pages), true, '"pages" should be an Array');

	if (typeof jsFilename !== "string" && typeof jsFilename !== "undefined") {
		throw new Error(`"jsFilename" should be a String or undefined`);
	}
	if (typeof jsChunkFilename !== "string" && typeof jsChunkFilename !== "undefined") {
		throw new Error(`"jsChunkFilename" should be a String or undefined`);
	}
	if (typeof cssFilename !== "string" && typeof cssFilename !== "undefined") {
		throw new Error(`"cssFilename" should be a String or undefined`);
	}
	if (typeof cssChunkFilename !== "string" && typeof cssChunkFilename !== "undefined") {
		throw new Error(`"cssChunkFilename" should be a String or undefined`);
	}
	if (typeof webworkerFilename !== "string" && typeof webworkerFilename !== "undefined") {
		throw new Error(`"webworkerFilename" should be a String or undefined`);
	}
	if (typeof assetFilename !== "string" && typeof assetFilename !== "undefined") {
		throw new Error(`"assetFilename" should be a String or undefined`);
	}

	strictEqual(typeof port, "number", '"port" should be a Number');
	strictEqual(isNaN(port), false, '"port" must not be NaN');
	strictEqual(port > 0, true, '"port" should be a positive number');

	const okCssModules =
		cssModules !== null &&
		(typeof cssModules === "boolean" || typeof cssModules === "object" || typeof cssModules === "string");
	strictEqual(okCssModules, true, '"cssModules" should be a Boolean');
	strictEqual(
		typeof scss === "string" || typeof scss === "function" || typeof scss === "undefined",
		true,
		'"scss" should be a String or Function'
	);

	strictEqual(typeof embedLimit, "number", '"embedLimit" should be a Number');
	strictEqual(isNaN(embedLimit), false, '"embedLimit" must not be NaN');

	strictEqual(Array.isArray(embedExtensions), true, '"embedExtensions" should be an Array');
	strictEqual(Array.isArray(rawExtensions), true, '"rawExtensions" should be an Array');
	strictEqual(Array.isArray(copyExtensions), true, '"copyExtensions" should be an Array');
	strictEqual(Array.isArray(copyPatterns), true, '"copyPatterns" should be an Array');
	strictEqual(Array.isArray(injectPatterns), true, '"injectPatterns" should be an Array');

	strictEqual(typeof publicPath, "string", '"publicPath" should be a String');
	strictEqual(typeof sourcemaps, "boolean", '"sourcemaps" should be a Boolean');
	strictEqual(typeof skipPostprocess, "boolean", '"skipPostprocess" should be a Boolean');
	strictEqual(Array.isArray(polyfills), true, '"polyfills" should be an Array');
	strictEqual(Array.isArray(webworkerPolyfills), true, '"webworkerPolyfills" should be an Array');
	strictEqual(typeof skipHashes, "boolean", '"skipHashes" should be a Boolean');
	strictEqual(typeof skipReset, "boolean", '"skipReset" should be a Boolean');

	if (!(webworkerPattern instanceof RegExp)) {
		throw new Error('"webworkerPattern" should be a RegExp');
	}

	//region Polyfills
	const entries = {};
	for (const key in entry) {
		const filepath = entry[key];
		entries[key] = polyfills.concat(Array.isArray(filepath) ? filepath : [filepath]);
	}
	//endregion

	//region Base Config
	const minify = mode === "production";
	const loaders = [];
	const plugins = [];

	let actualJsFilename = jsFilename;
	if (typeof actualJsFilename !== "string") {
		actualJsFilename = minify && !skipHashes ? "[hash].[name].js" : "[name].js";
	}

	let actualJsChunkFilename = jsChunkFilename;
	if (typeof actualJsChunkFilename !== "string") {
		actualJsChunkFilename = minify && !skipHashes ? "[hash].chunk.[id].js" : "chunk.[id].js";
	}

	let actualWebworkerFilename = webworkerFilename;
	if (typeof actualWebworkerFilename !== "string") {
		actualWebworkerFilename = minify && !skipHashes ? "[hash].[name].js" : "[name].js";
	}

	let actualCssFilename = cssFilename;
	if (typeof actualCssFilename !== "string") {
		actualCssFilename = minify && !skipHashes ? "[hash].[name].css" : "[name].css";
	}

	let actualCssChunkFilename = cssChunkFilename;
	if (typeof actualCssChunkFilename !== "string") {
		actualCssChunkFilename = minify && !skipHashes ? "[hash].chunk.[id].css" : "chunk.[id].css";
	}

	let actualAssetFilename = assetFilename;
	if (typeof actualAssetFilename !== "string") {
		actualAssetFilename = minify && !skipHashes ? "assets/[hash].[name].[ext]" : "assets/[name].[ext]";
	}

	const config = {
		//region Input
		target: "web",
		devtool: sourcemaps ? "source-map" : false,
		mode,
		resolve: {
			extensions: [".ts", ".tsx", ".js", ".jsx"]
		},
		context: actualRootFolder,
		entry: entries,
		//endregion
		//region Output
		output: {
			path: actualOutputFolder,
			pathinfo: false,
			publicPath,
			filename: actualJsFilename,
			chunkFilename: actualJsChunkFilename
		},
		//endregion
		//region Hints
		performance: {
			hints: false
		}
		//endregion
	};
	//endregion

	//region Minification
	if (!skipPostprocess) {
		config.optimization = {
			minimize: minify,
			nodeEnv: mode,
			concatenateModules: true
		};
	}
	//endregion

	//region Reset the output
	if (!skipReset) {
		plugins.push(
			new CleanWebpackPlugin({
				verbose: false,
				cleanOnceBeforeBuildPatterns: [actualOutputFolder]
			})
		);
	}
	//endregion

	//region HTML
	if (!skipPostprocess) {
		if (pages.length > 0) {
			for (const page of pages) {
				if (page === null || typeof page !== "object") {
					if (typeof page.minify === "undefined") {
						page.minify = minify;
					}
					if (typeof page.template === "undefined") {
						page.template = templateFilepath;
					}
					if (typeof page.lang === "undefined") {
						page.lang = "en";
					}
					if (typeof page.viewport === "undefined") {
						page.viewport = "width=device-width, initial-scale=1.0";
					}
				}
				plugins.push(new HtmlWebpackPlugin(page));
			}
		}
		//endregion
	}
	//endregion

	//region Subressource Integrity
	if (!skipPostprocess && !skipHashes) {
		config.output.crossOriginLoading = "anonymous";
		plugins.push(
			new SriPlugin({
				hashFuncNames: ["sha256", "sha384"],
				enabled: minify
			})
		);
	}
	//endregion

	//region Typescript
	if (sourcemaps) {
		loaders.push({
			enforce: "pre",
			test: /\.(ts|tsx|js|jsx)?$/,
			use: "source-map-loader"
		});
	}
	loaders.push({
		enforce: "pre",
		test: webworkerPattern,
		use: [
			{
				loader: join(__dirname, "polyfills.loader.js"),
				options: {
					polyfills: webworkerPolyfills
				}
			}
		]
	});
	loaders.push({
		test: webworkerPattern,
		use: [
			{
				loader: "ts-loader",
				options: {
					transpileOnly: true
				}
			},
			{
				loader: "worker-loader",
				options: {
					esModule: false,
					filename: actualWebworkerFilename
				}
			}
		]
	});
	loaders.push({
		test: /\.(ts|tsx|js|jsx)$/,
		use: [
			{
				loader: "ts-loader",
				options: {
					transpileOnly: true
				}
			}
		]
	});
	//endregion

	//region CSS
	const postcssPlugins = [postcssPresetEnv()];
	if (!skipPostprocess && minify) {
		postcssPlugins.push(
			cssnano({
				preset: [
					"default",
					{
						discardComments: {
							removeAll: true
						}
					}
				]
			})
		);
	}
	const cssLoaders = [
		{
			loader: MiniCssExtractPlugin.loader,
			options: {
				esModule: false
			}
		},
		{
			loader: "css-loader",
			options: {
				modules: cssModules
			}
		},
		{
			loader: "postcss-loader",
			options: {
				postcssOptions: {
					plugins: postcssPlugins
				}
			}
		}
	];

	if (typeof scss !== "undefined") {
		cssLoaders.push({
			loader: "sass-loader",
			options: {
				additionalData: scss
			}
		});
	} else {
		cssLoaders.push("sass-loader");
	}

	loaders.push({
		test: /\.(scss|css)$/,
		use: cssLoaders
	});
	plugins.push(
		new MiniCssExtractPlugin({
			filename: actualCssFilename,
			chunkFilename: actualCssChunkFilename
		})
	);
	//endregion

	//region Embeddable assets
	if (embedExtensions.length > 0) {
		if (embedExtensions.includes("json")) {
			loaders.push({
				type: "javascript/auto",
				test: /\.json$/,
				use: {
					loader: "url-loader",
					options: {
						limit: embedLimit,
						name: actualAssetFilename
					}
				}
			});
		}
		const embedExtensionsWithoutJson = embedExtensions.filter((ext) => ext !== "json");
		if (embedExtensionsWithoutJson.length > 0) {
			loaders.push({
				test: getRegex(embedExtensionsWithoutJson),
				use: {
					loader: "url-loader",
					options: {
						limit: embedLimit,
						name: actualAssetFilename
					}
				}
			});
		}
	}
	//endregion

	//region Raw assets imported in code
	if (rawExtensions.length > 0) {
		loaders.push({
			test: getRegex(rawExtensions),
			use: {
				loader: "raw-loader"
			}
		});
	}
	//endregion

	//region Assets imported in code
	if (copyExtensions.length > 0) {
		if (copyExtensions.includes("json")) {
			loaders.push({
				type: "javascript/auto",
				test: /\.json$/,
				use: {
					loader: "file-loader",
					options: {
						name: actualAssetFilename
					}
				}
			});
		}
		const copyExtensionsWithoutJson = copyExtensions.filter((ext) => ext !== "json");
		if (copyExtensionsWithoutJson.length > 0) {
			loaders.push({
				test: getRegex(copyExtensionsWithoutJson),
				use: {
					loader: "file-loader",
					options: {
						name: actualAssetFilename
					}
				}
			});
		}
	}
	//endregion

	//region Raw assets indirectly referenced in code
	if (copyPatterns.length > 0) {
		plugins.push(
			new CopyWebpackPlugin({patterns: copyPatterns})
		);
	}
	//endregion

	//region Arbitrary extra scripts & stylesheets
	if (injectPatterns.length > 0) {
		for (const injectPattern of injectPatterns) {
			plugins.push(new HtmlWebpackTagsPlugin(injectPattern));
		}
	}
	//endregion

	//region Dev Server
	if (!skipPostprocess) {
		config.devServer = {
			port,
			compress: true,
			contentBase: actualOutputFolder,
			publicPath,
			historyApiFallback: false,
			clientLogLevel: "none",
			stats: "errors-only"
		};
	}
	//endregion

	config.plugins = plugins;
	config.module = {
		rules: loaders
	};
	return config;
};
