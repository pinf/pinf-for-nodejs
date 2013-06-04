
const PATH = require("path");
const FS = require("fs-extra");
const HTTP = require("http");
const HTTPS = require("https");
const VM = require("vm");
const REQUEST = require("request");
const LOADER = require("pinf-loader-js/loader");


exports.sandbox = function(sandboxIdentifier, sandboxOptions, loadedCallback, errorCallback) {

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

	// Set our own loader for the sandbox.
	options.load = function(uri, loadedCallback) {
		function loadCode(uri, callback) {
            if (/^\//.test(uri)) {
                return FS.readFile(uri, "utf8", callback);
            } else {
                return REQUEST(uri, function(err, result) {
                	if (err) return callback(err);
                	return callback(null, result.body);
                });
            }
        }
        return loadCode(uri, function(err, code) {
			if (err) {
				console.error("Error reading file: " + uri);
				return loadedCallback(err);
			}
			try {
		    	evalBundle(uri, code);
		        return loadedCallback(null);
		    } catch(err) {
		        return loadedCallback(err);
		    }
        });
	}

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
        	clearInterval: clearInterval
    	};
    	if (sandboxOptions.globals) {
    		for (var name in sandboxOptions.globals) {
    			globals[name] = sandboxOptions.globals[name];
    		}
    	}
        VM.runInNewContext(code, globals, uri, true);
	}

	options.onInitModule = function(moduleInterface, moduleObj, pkg) {
		if (typeof sandboxOptions.onInitModule === "function") {
			sandboxOptions.onInitModule(moduleInterface, moduleObj);
		}

		// @see http://nodejs.org/docs/latest/api/globals.html

		// TODO: Implement `require.cache`. Will need proxies to do that.

		moduleObj.require.resolve = function() {
			return moduleObj.require.id.apply(null, arguments);
		}
	};

	options.onInitPackage = function(pkg, sandbox, options) {
		var origRequire = pkg.require;
		pkg.require = function(moduleIdentifier) {
			var origModuleIdentifier = moduleIdentifier;

			moduleIdentifier = moduleIdentifier || options.descriptor.main;
            if (!/^\//.test(moduleIdentifier)) {
                moduleIdentifier = "/" + options.libPath + moduleIdentifier;
            }
			var canonicalId = pkg.id + moduleIdentifier;

			if (options.initializedModules[canonicalId] || options.moduleInitializers[canonicalId]) {
				return origRequire(origModuleIdentifier);
			}

//console.log("moduleIdentifier", moduleIdentifier);

			// We encountered a dynamic sync require.

			// TODO: Check if requiring native nodejs module.

			if (typeof sandboxOptions.resolveDynamicSync === "function") {
				var uri = sandboxOptions.resolveDynamicSync(pkg, sandbox, canonicalId, options);

//console.log("RESOLVED DYNAMIC URI", uri);

				// Load the bundle SYNCHRONOUSLY as new modules must be available before we return.
				var code = null;
				try {
					code = FS.readFileSync(uri, "utf8");
				} catch(err) {
					console.error("Error reading file: " + uri);
					throw err;
				}
				evalBundle(uri, code);

				// Activate the new modules from the bundle.
				options.finalizeLoad(sandbox.id + canonicalId, pkg.id);

				// Now let the loader continue.
				return origRequire(origModuleIdentifier);
			}

			// We assume we have a 'dynamic sync require' (`require(<id>)`) vs a 'static sync require' (`require("<id>")`) as module
			// should already be in bundle in the latter case. If we do have a 'static sync require'
			// and module is not in bundle, the bundler should use `async require` (`require.async(<id>, callback)`).
			throw new Error("Could not resolve dynamic sync require for '" + origModuleIdentifier + "'");

/*
            var canonicalId = (pkg.id + "/" + moduleIdentifier).replace(/\/+/, "/");

            // HACK
			// TODO: Use a better flag than '__' to indicate that module should be loaded here!
			if (pkg.id === "__nodejs.org/0__") {
				return {
					exports: require(moduleIdentifier.replace(/\.js$/, ""))
				};
			}
			else
			if (typeof options.moduleInitializers[canonicalId] === "undefined") {
				// TODO: Check if module is memoized. If not we assume we need to load bundle.
                // Check if `moduleIdentifier` resolves to a new bundle file on the local filesystem.

				var path = sandbox.id + "/" + canonicalId;

				if (FS.existsSync(path)) {
					// Load the bundle SYNCHRONOUSLY as new modules must be available before we return.
			    	evalBundle(path, FS.readFileSync(path, "utf8"));

			    	// Activate the new modules from the bundle.
			    	options.finalizeLoad(path, pkg.id);

			    	// Now let the loader continue.
					return origRequire(moduleIdentifier);
				} else {
	                return origRequire(moduleIdentifier);
	            }
			} else {
                return origRequire(moduleIdentifier);
            }
*/
		};

		pkg.require.id = origRequire.id;
	}

	return LOADER.sandbox(sandboxIdentifier, options, loadedCallback, errorCallback);
}

exports.getReport = LOADER.getReport;
