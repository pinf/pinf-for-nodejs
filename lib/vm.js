
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const RT_BUNDLER = require("pinf-it-bundler/lib/rt-bundler");
const LOADER = require("./loader");
const CONTEXT = require("./context");
const VFS = require("./vfs");


var VM = exports.VM = function($pinf) {
	this.$pinf = $pinf;
	this.sandboxes = {};
}

VM.prototype.loadProgram = function(uri, options, finalCallback) {
	var self = this;

	options._realpath = function(path) {
		if (!options.rootPath) return path;
		if (/^\//.test(path)) return path;
		return PATH.join(options.rootPath, path);
	}

	// TODO: Load PINF descriptor.
	var programDescriptorPath = options._realpath(uri);
	return FS.readJson(programDescriptorPath, function(err, descriptor) {
		if (err) return finalCallback(err);
		if (!descriptor.boot.package) {
			return finalCallback(new Error("No 'boot.package' property found in program descriptor '" + programDescriptorPath + "'!"));
		}
		return self.loadPackage(PATH.join(programDescriptorPath, "..", descriptor.boot.package, ".."), options, finalCallback);
	});
}

VM.prototype.loadPackage = function(uri, options, finalCallback) {
	var self = this;
	if (typeof options === "function" && typeof finalCallback === "undefined") {
		finalCallback = options;
		options = null;
	}
	options = options || {};
	var key = uri + ":" + (options.rootModule || "");

	var startTime = Date.now();
	if (options.verbose) console.log(("[pinf-for-nodejs][vm][START] load package: " + uri).inverse);

	var callback = function() {
		if (options.verbose) console.log(("[pinf-for-nodejs][vm][END] (" + (Date.now() - startTime) + " ms) load package: " + uri).inverse);
		return finalCallback.apply(this, arguments);
	}

	if (self.sandboxes[key] && options.ttl !== -1) {
		if (options.verbose) console.log(("[pinf-for-nodejs][vm] using cached sandbox: " + key).green);
		return callback(null, self.sandboxes[key]);
	}

	options._realpath = function(path) {
		if (!options.rootPath) return path;
		if (/^\//.test(path)) return path;
		return PATH.join(options.rootPath, path);
	}

	options._relpath = function(path) {
		if (!path || !options.rootPath || !/^\//.test(path)) return path;
		return PATH.relative(options.rootPath, path);
	}

	// If we can find a bundled package we use it instead of bundeling again
	// unless `forceBundle` is set.
	function loadBundledPackage(bundleCallback) {
		if (options.forceBundle) {
			return bundleCallback(null);
		}
		// Load package descriptor to look for bundle config info.
		return FS.readJson(options._realpath(PATH.join(uri, "package.json")), function(err, descriptor) {
			if (err) {
				return callback(new Error("Error '" + err.message + "' parsing package descriptor: " + options._realpath(uri)));
			}
			if (
				!descriptor.exports ||
				!descriptor.exports.main ||
				!descriptor.layout ||
				!descriptor.layout.directories ||
				!descriptor.layout.directories.bundle
			) {
				// Insufficient config info to reach pre-built bundles.
				return bundleCallback(null);
			}
			var rootBundlePath = PATH.join(uri, descriptor.layout.directories.bundle, options.rootModule || descriptor.exports.main);
			return FS.exists(options._realpath(rootBundlePath), function(exists) {
				if (!exists) {
					// Root bundle not found where it should be. It has likely not been generated yet.
					return bundleCallback(null);
				}
				if (options.verbose) console.log(("[pinf-for-nodejs][vm] using pre-generated root bundle: " + rootBundlePath).green);
				return LOADER.sandbox(rootBundlePath, {
					verbose: options.verbose || false,
					debug: options.debug || false,
					ttl: options.ttl,
					rootPath: options.rootPath,
					globals: options.globals,
					resolveDynamicSync: function (moduleObj, pkg, sandbox, canonicalId, options) {
						if (/^\//.test(canonicalId)) {
							return PATH.join(moduleObj.bundle.replace(/\.js$/, ""), canonicalId);
						} else {
							// TODO: Deal with package alias prefixes.
						}
						console.log("canonicalId", canonicalId);
		            	throw new Error("`resolveDynamicSync` should not be called here! Make sure all dynamic links are declared in the package descriptor!");
		            },
					ensureAsync: function(moduleObj, pkg, sandbox, canonicalId, options, callback) {
						// We assume dynamic link points to a generated bundle.
						return callback(null);
		            }
				}, function(sandbox) {
					self.sandboxes[key] = sandbox;
					return callback(null, sandbox);
				}, callback);
			});			
		});
	}

	return loadBundledPackage(function(err) {
		if (err) return callback(err);

		var distPath = options.distPath || self.$pinf.makePath("cache", PATH.join("vm", CONTEXT.uriToFilename(uri), "dist"));

		if (options.verbose) console.log(("[pinf-for-nodejs][vm] load via bundler").yellow);

		var opts = self.$pinf.makeOptions({
			$pinf: options.$pinf || null,
			verbose: options.verbose || false,
			debug: options.debug || false,
			test: options.test || false,
			ttl: options.ttl,
			rootPath: options.rootPath,
			rootModule: options.rootModule,
			rootModuleBundleOnly: options.rootModuleBundleOnly || false,
			bundleRootModule: options.rootModule,
			omitMtimeMeta: options.omitMtimeMeta || false,
			globals: options.globals,
			distPath: distPath,
			plugins: options.plugins,
			onRun: function(bundlePath, sandboxOptions, callback) {
				return LOADER.sandbox(bundlePath, sandboxOptions, function(sandbox) {
					return callback();
				}, callback);
			},
			getLoaderReport: function() {
				return LOADER.getReport();
			},
			locateMissingFile: function(descriptor, path, callback) {
console.error("LOCATE MISSING FILE", descriptor, path);
				var lookupPath = path;
				if (!/^\//.test(lookupPath)) {
					lookupPath = PATH.join(options.rootPath, lookupPath);
				}
				return FS.exists(lookupPath, function (exists) {
					if (!exists) {
						console.log("WARN: Tried to locate module at '" + lookupPath + "' but could not found it!");
						var err = new Error("Module not found at: " + lookupPath);
						err.code = 404;
						return callback(err);
					}
throw new Error("TODO: Implement");

				});
/*
				if (path.substring(0, options.rootPath.length) !== options.rootPath) {
					return callback(new Error("Cannot locate missing file '" + path + "'"));
				}
				return callback(null, PATH.join(distPath, path.substring(relPath.length+1).replace(/\//g, "+")));
*/
			}
		});

		if (typeof options.ttl === "undefined" && options.$pinf) {
			options.ttl = options.$pinf.ttl;
		}
		if (options.ttl === -1) {
			// Remove the dist path to force re-generate the bundle.
			FS.removeSync(opts.distPath);
		} else {
			// TODO: We don't remove the dist path by default now that the bundler cache is working.
			//       We may still need to get the bundler to delete the dist file or clean it up
			//		 rather than just agument it if it retains stale data.
		}

		return VFS.open("file://", opts, function(err, vfs) {
			if (err) return callback(err);

			opts.$pinf._api.FS = vfs;

			if (options.verbose) console.log(("[pinf-for-nodejs][vm] bundling package: " + uri));

			return RT_BUNDLER.bundlePackage(uri, opts, function(err, bundleDescriptors, helpers) {
				if (err) {
console.error("ERROR: Runtime bundler error:", err.stack);
					return callback(err);
				}

				FS.outputJson(bundleDescriptors["#pinf"].data.rootBundlePath + ".bundle.json", bundleDescriptors);

				if (options.verbose) console.log(("[pinf-for-nodejs][vm] using root bundle: " + bundleDescriptors["#pinf"].data.rootBundlePath));

				return LOADER.sandbox(bundleDescriptors["#pinf"].data.rootBundlePath, {
					verbose: options.verbose || false,
					debug: options.debug || false,
					ttl: options.ttl,
					globals: options.globals,
		            resolveDynamicSync: helpers.resolveDynamicSync,
		            ensureAsync: helpers.ensureAsync
				}, function(sandbox) {
					self.sandboxes[key] = sandbox;
					return callback(null, sandbox);
				}, callback);
			});
		});
	});
}
