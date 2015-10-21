
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const HTTP = require("http");
const HTTPS = require("https");
const VM = require("vm");
const REQUEST = require("request");
const LOADER = require("pinf-loader-js/loader");
const JSDOM = require("jsdom");


exports.sandbox = function(sandboxIdentifier, sandboxOptions, loadedCallback, errorCallback) {

	if (!sandboxIdentifier) {
		if (errorCallback) return errorCallback(new Error("'sandboxIdentifier' not specified"));
		throw new Error("'sandboxIdentifier' not specified");
	}

	if (typeof sandboxOptions === "function" && typeof loadedCallback === "function" && typeof errorCallback === "undefined") {
		errorCallback = loadedCallback;
		loadedCallback = sandboxOptions;
		sandboxOptions = {};
	} else
	if (typeof sandboxOptions === "function" && typeof loadedCallback === "undefined") {
		loadedCallback = sandboxOptions;
		sandboxOptions = {};
	} else {
		sandboxOptions = sandboxOptions || {};
	}

	var options = {};

	for (var key in sandboxOptions) {
		options[key] = sandboxOptions[key];
	}

	delete options.globals;

	sandboxOptions._realpath = function(path) {
		if (!sandboxOptions.rootPath) return path;
		if (/^\/|:\/\//.test(path)) return path;
		return PATH.join(sandboxOptions.rootPath, path);
	}

	// Set our own loader for the sandbox.
	options.load = function(uri, loadedCallback) {		
		function loadCode(uri, callback) {
            if (/:\/\//.test(uri)) {
                return REQUEST(uri, function(err, result) {
                	if (err) return callback(err);
                	return callback(null, result.body);
                });
            } else {
                return FS.readFile(sandboxOptions._realpath(uri), "utf8", callback);
            }
        }
        return loadCode(uri, function(err, code) {
			if (err) {
				console.error("Error reading file: " + sandboxOptions._realpath(uri));
				return loadedCallback(err);
			}
			try {
		    	evalBundle(sandboxOptions._realpath(uri), code);
		        return loadedCallback(null);
		    } catch(err) {
		        return loadedCallback(err);
		    }
        });
	}

	var domWindow = null;

	function evalBundle(uri, code) {
    	// NOTE: If there are sytnax errors in code this will print
    	//		 error to stdout (if fourth argument set to `true`).
    	//		 There is no way to capture errors from here.
    	// @see https://github.com/joyent/node/issues/1307#issuecomment-1551157
    	// TODO: Find a better solution to handle errors here.
    	// TODO: Capture errors by watching this processe's stdout file log from
    	//		 another process.
    	var globals = {
		    // TODO: Inject and fix environment based on options.
        	PINF: LOADER,
        	// TODO: Wrap to `console` object provided by `sandboxOptions` and inject module info.
        	console: console,
        	// NodeJS globals.
        	// @see http://nodejs.org/docs/latest/api/globals.html
        	global: global,
        	process: process,
        	Buffer: Buffer,
        	setTimeout: setTimeout,
        	clearTimeout: clearTimeout,
        	setInterval: setInterval,
        	clearInterval: clearInterval,
        	setImmediate: setImmediate,
        	ArrayBuffer: ArrayBuffer,

			Int8Array: Int8Array,
			Uint8Array: Uint8Array,
			Uint8ClampedArray: Uint8ClampedArray,
			Int16Array: Int16Array,
			Uint16Array: Uint16Array,
			Int32Array: Int32Array,
			Uint32Array: Uint32Array,
			Float32Array: Float32Array,
			Float64Array: Float64Array,

        	// Browser
        	navigator: {},
        	window: domWindow,
        	document: domWindow.document,
        	location: domWindow.location
    	};
    	if (sandboxOptions.globals) {
    		for (var name in sandboxOptions.globals) {
    			globals[name] = sandboxOptions.globals[name];
    		}
    	}
    	if (sandboxOptions.test && sandboxOptions.rootPath) {
    		globals.TEST_ROOT_PATH = sandboxOptions.rootPath;
    	}
    	if (sandboxOptions.debug) console.log("[pinf-for-nodejs] node vm exec:", uri);


		// Remove ES6 features so we can still use nodejs vm to exec code until it fully supports ES6.
		try {
			const BABEL = require("babel");
			var result = BABEL.transform(code, {});
			code = result.code;
		} catch (err) {
			console.log("WARN: Got error while babelifying code '" + uri + "' but ignoring as source may already be proper ES5: " + err.message);
		}


        VM.runInNewContext(code, globals, {
        	filename: sandboxOptions._realpath(uri),
        	displayErrors: true
        });
	}

	function loadResolvedDynamicSync(uri, bundleIdentifier, options) {
		if (sandboxOptions.debug) console.log("[loader-for-nodejs] loadResolveDynamicSync", "uri", uri, "bundleIdentifier", bundleIdentifier);

		// Load the bundle SYNCHRONOUSLY as new modules must be available before we return.
		var code = null;
		try {
			code = FS.readFileSync(sandboxOptions._realpath(uri), "utf8");
		} catch(err) {
			console.error("Error reading file: " + sandboxOptions._realpath(uri));
			throw err;
		}
		evalBundle(uri, code);

		// Activate the new modules from the bundle.
		return options.finalizeLoad(bundleIdentifier);
	}

	function getBundleBasePath(moduleObj) {

		ASSERT.equal(typeof moduleObj.bundle, "string");

		return moduleObj.bundle.replace(/\.js$/, "");
	}

	var lastModuleRequireContext = null;

	options.onInitModule = function(moduleInterface, moduleObj, pkg, sandbox, options) {
		if (typeof sandboxOptions.onInitModule === "function") {
			sandboxOptions.onInitModule(moduleInterface, moduleObj);
		}

		moduleInterface.filename = sandboxOptions._realpath(moduleInterface.filename);

		var origRequire = moduleObj.require;

		moduleObj.require = function(identifier) {

			// This assumes that if a directory is being referenced without a module path we return
			// the `index.js` module.
			// TODO: Look at at other criteria to determine index module?
			if (/\/$/.test(identifier)) {
				identifier = identifier + "index";
			}

			lastModuleRequireContext = {
				moduleObj: moduleObj
			};

			if (/^([^!]+!)?\./.test(identifier)) {

				var moduleIdentifier =options.resolveIdentifier(identifier)[1];
				var modulePlugin = moduleIdentifier.plugin || null;
				moduleIdentifier = moduleIdentifier.toString();

				var moduleIdentifier = PATH.normalize(moduleIdentifier).replace(/^[\/\.]$/, "");

	            if (moduleIdentifier) {
	            	if (!/^\//.test(moduleIdentifier)) {
		                moduleIdentifier = "/" + options.libPath + moduleIdentifier;
		            }
					var canonicalId = pkg.id + moduleIdentifier;
	            } else {
	            	moduleIdentifier = pkg.main;
					var canonicalId = moduleIdentifier;
	            }

				if (options.initializedModules[canonicalId] || options.moduleInitializers[canonicalId]) {
					return origRequire(identifier);
				}

				if (options.initializedModules[canonicalId.replace(/\.js$/, "/index.js")] || options.moduleInitializers[canonicalId.replace(/\.js$/, "/index.js")]) {
					return origRequire(identifier + "/index");
				}

				// We encountered a dynamic sync require.

				if (sandboxOptions.debug) console.log("[loader-for-nodejs][moduleObj.require] relative", "identifier", identifier, "pkg.id", pkg.id, "moduleIdentifier", moduleIdentifier, "canonicalId", canonicalId);

				var bundleBasePath = getBundleBasePath(moduleObj);

				var uri = null;

				if (typeof sandboxOptions.resolveDynamicSync === "function") {
					// We have a runtime bundler.
					uri = sandboxOptions.resolveDynamicSync(moduleObj, pkg, sandbox, canonicalId, options);
				} else {
//					uri = PATH.join(bundleBasePath, canonicalId.replace(/^\//, "").replace(/\//g, "+"));
					uri = PATH.join(bundleBasePath, canonicalId.replace(/^\//, ""));
				}

//				loadResolvedDynamicSync(uri, PATH.join(bundleBasePath, canonicalId.replace(/^\//, "").replace(/\//g, "+")), options);
				loadResolvedDynamicSync(uri, PATH.join(bundleBasePath, canonicalId.replace(/^\//, "")), options);

				// Now let the loader continue.
				return origRequire(identifier);

			} else {

				var splitIdentifier = identifier.split("/");

				if (typeof pkg.mappings[splitIdentifier[0]] !== "undefined") return origRequire(identifier);

				try {
					var canonicalId = options.resolveIdentifier(identifier)[1];

					if (options.initializedModules[canonicalId] || options.moduleInitializers[canonicalId]) {
						return origRequire(identifier);
					}
				} catch(err) {
					// We get here when running `pinf-it-bundler` tests.
				}

				// Check if we are delaing with a native nodejs module.
				// TODO: Use a better flag than '__' to indicate that module should be loaded here! Use proper versioned uri.
				if (splitIdentifier[0] === "__SYSTEM__") {
					// Check if the system module is memoized first. If it is it takes precedence.
					var canonicalId = identifier + ".js";
					if (options.initializedModules[canonicalId] || options.moduleInitializers[canonicalId]) {
						return origRequire(identifier);
					}
					return require(splitIdentifier.slice(1).join("/"));
				}
				// HACK: We catch any module IDs that were not re-written in the hope that we catch any system modules.
				// This happens when wrapping r.js for example which tests for nodejs and requires system modules.
				// These system module requires should be rewritten by now.
				// TODO: Set in config file how to resolve these system modules.
				try {
					if (require.resolve(identifier) === identifier) {
						return require(identifier);
					}
				} catch(err) {}		

				// We encountered a dynamic sync require.

				if (sandboxOptions.debug) console.log("[loader-for-nodejs][moduleObj.require] absolute", "identifier", identifier, "pkg.id", pkg.id);

				if (typeof sandboxOptions.resolveDynamicSync === "function") {
					// We have a runtime bundler.

					var uri = sandboxOptions.resolveDynamicSync(moduleObj, pkg, sandbox, identifier, options);

					loadResolvedDynamicSync(uri, PATH.join(moduleObj.bundle.replace(/\.js$/, ""), identifier), options);

					// Now let the loader continue.
					return origRequire(identifier);
				}
			}

			// HACK: We catch any module IDs that were not re-written in the hope that we catch any system modules.
			// TODO: Set in config file how to resolve these system modules.
			try {
				if (require.resolve(identifier) === identifier) {
					return require(identifier);
				}
			} catch(err) {}

			throw new Error("Could not find module '" + identifier + "'");

/*
			// We assume we have a 'dynamic sync require' (`require(<id>)`) vs a 'static sync require' (`require("<id>")`) as module
			// should already be in bundle in the latter case. If we do have a 'static sync require'
			// and module is not in bundle, the bundler should use `async require` (`require.async(<id>, callback)`).
			throw new Error("Could not resolve dynamic sync require for '" + identifier + "'");
*/
		}

		for (var property in origRequire) {
			moduleObj.require[property] = origRequire[property];
		}

		// @see http://nodejs.org/docs/latest/api/globals.html
		moduleObj.require.resolve = function() {
			return origRequire.id.apply(null, arguments);
		}

		moduleObj.require.async = function(id, successCallback, errorCallback) {
			if (sandboxOptions.ensureAsync) {
				return sandboxOptions.ensureAsync(moduleObj, pkg, sandbox, id, options, function(err) {
					if (err) return errorCallback(err);
					return origRequire.async(id, successCallback, errorCallback);
				});
			}
			return origRequire.async(id, successCallback, errorCallback);
		}
	};

	options.onInitPackage = function(pkg, sandbox, options) {
		var origRequire = pkg.require;
		
		pkg.require = function(moduleIdentifier) {
			
			moduleIdentifier = moduleIdentifier.toString();
			
			var origModuleIdentifier = PATH.normalize(moduleIdentifier).replace(/^\.$/, "").replace(/^\/$/, "");
			var canonicalId = null;
			if (origModuleIdentifier) {
				moduleIdentifier = origModuleIdentifier;
            	if (!/^\//.test(moduleIdentifier)) {
	                moduleIdentifier = "/" + ((moduleIdentifier.substring(0, pkg.libPath.length)===pkg.libPath)?"":pkg.libPath) + moduleIdentifier;
	            }
				canonicalId = pkg.id + moduleIdentifier;
			} else
			if (pkg.descriptor && pkg.descriptor.main) {
				canonicalId = moduleIdentifier = pkg.descriptor.main;
			} else {
				moduleIdentifier = "";
				canonicalId = pkg.id;
			}

			if (options.initializedModules[canonicalId] || options.moduleInitializers[canonicalId]) {
				return origRequire(origModuleIdentifier);
			}

			// If `canonicalId` is just an alias we assume that the main module is memoized
			// if the package descriptor for the alias is memoized.

			if (!/\//.test(canonicalId)) {
				if (options.initializedModules[canonicalId + "/package.json"] || options.moduleInitializers[canonicalId + "/package.json"]) {
					return origRequire(origModuleIdentifier);
				}
			}
/*
console.log("pkg.id", pkg.id);
console.log("canonicalId", canonicalId);

			if (pkg.id === "__SYSTEM__") {
				return require(canonicalId.replace(/^__SYSTEM__\/|\.js$/g, ""));
			}
*/
			// We encountered a dynamic sync require.

			if (sandboxOptions.debug) console.log("[loader-for-nodejs][pkg.require]", "moduleIdentifier", moduleIdentifier, "pkg.id", pkg.id, "canonicalId", canonicalId);

			var bundleBasePath = getBundleBasePath(lastModuleRequireContext.moduleObj);

			var uri = null;

			if (typeof sandboxOptions.resolveDynamicSync === "function") {
				// We have a runtime bundler.

				var opts = {};
				for (var name in options) {
					opts[name] = options[name];
				}
				opts.lastModuleRequireContext = lastModuleRequireContext;

				uri = sandboxOptions.resolveDynamicSync(null, pkg, sandbox, canonicalId, opts);
			} else {

				// We assume that `canonicalId` is a package ID (not an alias) as the package mapping should
				// already be loaded if requiring a dependency by alias using pure bundles (without runtime bundler).

				var canonicalIdParts = canonicalId.split("/");
				var packageId = canonicalIdParts.shift();
				var moduleId = canonicalIdParts.join("/");
//				uri = PATH.join(bundleBasePath, options.normalizeIdentifier((packageId + ((moduleId) ? "/" + moduleId : "")).replace(/\//g, "+")));
				uri = PATH.join(bundleBasePath, options.normalizeIdentifier(packageId + ((moduleId) ? "/" + moduleId : "")));
			}

//			loadResolvedDynamicSync(uri, PATH.join(bundleBasePath, canonicalId.replace(/\//g, "+")), options);
			loadResolvedDynamicSync(uri, PATH.join(bundleBasePath, canonicalId), options);

			// Now let the loader continue.
			return origRequire(origModuleIdentifier);
/*
			// We assume we have a 'dynamic sync require' (`require(<id>)`) vs a 'static sync require' (`require("<id>")`) as module
			// should already be in bundle in the latter case. If we do have a 'static sync require'
			// and module is not in bundle, the bundler should use `async require` (`require.async(<id>, callback)`).
			throw new Error("Could not resolve dynamic sync require for '" + origModuleIdentifier + "'");
*/
		};

		for (var property in origRequire) {
			pkg.require[property] = origRequire[property];
		}
	}


	return JSDOM.env(
		"",
		[],
		function (err, window) {
			if (err) return errorCallback(err);

			domWindow = window;

			return LOADER.sandbox(sandboxIdentifier, options, loadedCallback, errorCallback);
		}
	);
}

exports.getReport = LOADER.getReport;

exports.reset = LOADER.reset;
