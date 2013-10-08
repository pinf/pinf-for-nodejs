
require("./helpers/cycle");

const PATH = require("path");
const FS = require("fs-extra");
const URL = require("url");
const WAITFOR = require("waitfor");
const DEEPMERGE = require("deepmerge");
const DEEPCOPY = require("deepcopy");
const JSON_FILE_STORE = require("./json-file-store").JsonFileStore;
const EVENTS = require("events");
const UTIL = require("util");
const PINF_PRIMITIVES = require("pinf-primitives-js");
const PACKAGE_INSIGHT = require("pinf-it-package-insight");
const PROGRAM_INSIGHT = require("pinf-it-program-insight");
const VM = require("./vm").VM;
const VFS = require("./vfs");
const LOADER = require("./loader");
const CRYPTO = require("crypto");
const ZLIB = require("zlib");


exports.contextForProgram = function(programUri, options, callback) {
	if (typeof options === "function" && typeof callback === "undefined") {
		callback = options;
		options = null;
	}
	options = options || {};

	var opts = {};
	for (var name in options) {
		opts[name] = options[name];
	}

	opts.PINF_PROGRAM = programUri;

	if (typeof opts.PINF_RUNTIME === "undefined") {
		opts.PINF_RUNTIME = (options.$pinf && options.$pinf.env && options.$pinf.env.PINF_RUNTIME) || process.env.PINF_RUNTIME;
	}

	return exports.context(opts.PINF_PROGRAM, null, {
		env: {
			PINF_RUNTIME: opts.PINF_RUNTIME
		},
		debug: opts.debug || false,
		verbose: opts.verbose || false,
		test: opts.test || false
	}, callback);
}

exports.contextForModule = function(module, options, callback) {
	if (typeof options === "function" && typeof callback === "undefined") {
		callback = options;
		options = null;
	}
	options = options || {};

	var opts = {};
	for (var name in options) {
		opts[name] = options[name];
	}

	if (typeof opts.PINF_PROGRAM === "undefined") {
		opts.PINF_PROGRAM = (options.$pinf && options.$pinf.env && options.$pinf.env.PINF_PROGRAM) || process.env.PINF_PROGRAM;
	}
	if (typeof opts.PINF_RUNTIME === "undefined") {
		opts.PINF_RUNTIME = (options.$pinf && options.$pinf.env && options.$pinf.env.PINF_RUNTIME) || process.env.PINF_RUNTIME;
	}

	if (!opts.PINF_PROGRAM) {
		return callback(new Error("The PINF_PROGRAM environment variable must be set!"));
	}
	if (!module.filename) {
		return callback(new Error("`module.filename` must be set!"));
	}

	return PACKAGE_INSIGHT.findPackagePath(module.filename, function(err, path) {
		if (err) return callback(err);
		return exports.context(opts.PINF_PROGRAM, path, {
			env: {
				PINF_RUNTIME: opts.PINF_RUNTIME
			},
			debug: opts.debug || false,
			verbose: opts.verbose || false,
			test: opts.test || false
		}, callback);
	});
}


exports.uriToPath = function(uri) {
	return uri.replace(/[:@#]/g, "/").replace(/[\?&=]/g, "+").replace(/\/+/g, "/").replace(/\/$/, "+");
}

exports.uriToFilename = function(uri) {
	return exports.uriToPath(uri).replace(/\//g, "+");
}

exports.formatUid = function(uri) {
	if (!uri) return false;
	var parsedUri = URL.parse(uri);
	if (parsedUri) {
		uri = ((parsedUri.hostname)?parsedUri.hostname:"") + parsedUri.pathname;
	}
	return uri;
}

exports.context = function(programDescriptorPath, packageDescriptorPath, options, callback) {

	if (typeof options === "function" && typeof callback === "undefined") {
		callback = options;
		options = null;
	}

	options = options || {};

	options.API = {
		FS: (options.$pinf && options.$pinf.getAPI("FS")) || FS
	};

	var contextStartTime = Date.now();

	var originalCallback = callback;
	callback = function() {
		if (options.verbose) console.log(("[pinf-for-nodejs][context][END] (" + (Date.now() - contextStartTime) + " ms) new context for package: " + packageDescriptorPath + " (program: " + programDescriptorPath + ")").inverse);
		return originalCallback.apply(this, arguments);
	}

	if (options.verbose) console.log(("[pinf-for-nodejs][context][START] new context for package: " + packageDescriptorPath + " (program: " + programDescriptorPath + ")").inverse);

	options._relpath = function(path) {
		if (!path || !options.rootPath || !/^\//.test(path)) return path;
		return PATH.relative(options.rootPath, path);
	}

	options._realpath = function(path) {
		if (!options.rootPath) return path;
		if (/^\//.test(path)) return path;
		return PATH.join(options.rootPath, path);
	}

	var env = options.env || null;

	env = PINF_PRIMITIVES.normalizeEnvironmentVariables(env, {
		PINF_PROGRAM: programDescriptorPath || (env && env.PINF_PROGRAM) || undefined,
		PINF_PACKAGE: packageDescriptorPath || (env && env.PINF_PACKAGE) || undefined
	});

	if (options.debug) console.log("[pinf-for-nodejs][context] env:", env);


	function ensureParentPath() {
		var path = PATH.join.apply(null, [].slice.call(arguments));
		if (FS.existsSync(PATH.dirname(path))) return path;
		FS.mkdirsSync(PATH.dirname(path));
		return path;
	}

	function reloadContext(context, callback) {
		// TODO: Make this super efficient by checking file mtimes.
		//		 At the moment we force bypass the cache on reload as modified files
		//       may have the same timestamp as the cache (since FS mtime resolution is 1 sec).
		//       We should detect changed files better (maybe by hash) and reload context
		//       only for changed files. e.g. we could check the cache and if all the same
		//       we prepopulate context with our existing info and only load in files with same mtime.
		var opts = {};
		for (var name in options) {
			opts[name] = options[name];
		}
		return exports.context(programDescriptorPath, packageDescriptorPath, opts, function(err, reloadedContext) {
			if (err) return callback(err);
			for (var name in reloadedContext) {
				if (typeof reloadedContext[name] !== "function") {
					context[name] = reloadedContext[name];
				}
			}
			// TODO: Only emit this if config has in fact changed.
			context.emit("config.changed");
			return callback(null);
		});
	}

	var Context = function() {
		this.uid = null;
		this.ns = null;
		this.debug = false;
		this.verbose = false;
		this.test = false;
		this.now = Date.now();
	    // If `ttl === -1` then force cache refresh.
	    // If `ttl === 0` then cache indefinite.
	    // If `ttl >= 1` then cache for ttl (milliseconds).
	    // If `ttl <= -1` then cache if newer than (ttl * -1).
		this.ttl = 0;
		this.env = {};
		this.paths = {};
		this.binPaths = [];
		this.config = [];
		this.descriptorPaths = [];
		this.lookupPaths = [];
		this._api = {};
		this._descriptors = {
			package: {},
			program: {}
		};
		this._programInfo = {};
		this._packageInfo = {};
	}
	UTIL.inherits(Context, EVENTS.EventEmitter);

	// @unstable
	Context.prototype.clone = function() {
		var ctx = new Context();
		for (var name in this) {
			if (this.hasOwnProperty(name)) {
				ctx[name] = this[name];
			}
		}
		return ctx;
	}

	// @unstable
	Context.prototype.stringify = function() {
		var obj = {};
		for (var name in this) {
			if (!this.hasOwnProperty(name)) continue;
			if (name === "#pinf") continue;
			if (/^_/.test(name)) continue;
			obj[name] = this[name];
		}
		return JSON.stringify.apply(null, [obj].concat(Array.prototype.slice.call(arguments, 0)));
	}

	// @experimental
	Context.prototype.makeOptions = function(options) {
		if (typeof options !== "object") {
			return options;
		}
		var opts = {};
		for (var name in options) {
			opts[name] = options[name];
		}
		var ctx = this.clone();
		function inheritProperties(parent) {
			[
				"debug",
				"verbose",
				"test",
				"ttl"
			].forEach(function(name) {
				ctx[name] = parent[name];
			});
		}
		if (!opts.$pinf || typeof opts.$pinf !== "object") {
			opts.$pinf = ctx;
			return opts;
		} else
		// Ugly but nothig else seems to work. i.e. `instanceof`, `===` without `toString()`.
		if (!(opts.$pinf.constructor.toString() === Context.toString())) {
			inheritProperties(opts.$pinf);
			opts.$pinf = ctx;
			return opts;
		}
		ctx.__proto__ = opts.$pinf;
		opts.$pinf = ctx;
		opts.$pinf._parentContext = opts.$pinf.__proto__;
		inheritProperties(opts.$pinf._parentContext);
		return opts;
	}

	// @unstable
	Context.prototype.makePath = function(type, path) {
		if (!this.paths[type]) return null;
		if (!path) return ensureParentPath(this.paths[type]);
		if (Array.isArray(path)) {
			path = path.map(function(segment) {
				return segment.replace(/\//g, "+");
			}).join("/");
		}
		return ensureParentPath(this.paths[type], path);
	}

	// @experimental
	Context.prototype.getAPI = function(alias) {
		var obj = this;
		while(obj) {
			if (obj._api && obj._api[alias]) {
				return obj._api[alias];
			}
			obj = obj.__proto__;
		}
		if (alias === "console") {
			return console;
		}
		return null;
	}

	// @unstable
	Context.prototype.sandbox = function(sandboxIdentifier, sandboxOptions, loadedCallback, errorCallback) {
		var self = this;
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
		var callback = function(err, sandbox) {
			if (err) {
				if (errorCallback) {
					return errorCallback(err);
				}
				throw err;
			}
			return loadedCallback(sandbox);
		}
		return FS.stat(sandboxIdentifier, function(err, stat) {
			if (err) return callback(err);
			if (stat.isDirectory()) {
	            var vm = new VM(self);
	            return vm.loadPackage(sandboxIdentifier, sandboxOptions, callback);
			} else {
				return LOADER.sandbox(sandboxIdentifier, self.makeOptions(sandboxOptions), loadedCallback, errorCallback);
			}
		});
	}

	// @experimental
	Context.prototype.gateway = function(type, gatewayOptions) {
		var self = this;
		var gatewayStartTime = Date.now();
		gatewayOptions = gatewayOptions || {};
		if (typeof gatewayOptions.verbose === "undefined") {
			gatewayOptions.verbose = options.verbose;
		}
		if (typeof gatewayOptions.ttl === "undefined") {
			gatewayOptions.ttl = options.ttl;
		}
		// TODO: Move these into plugins.
		// If `FS` is an instance of `./vfs.js` we can bypass gateway if all written files are older than read files.
		if (type === "vfs-write-from-read-mtime-bypass") {
			// TODO: Refactor some of this into a cache module with tree-based contexts for managing expiry.
			var VFS = null;
			var rawKey = null;
			var key = null;
			var paths = {};
			var listener = function(path, method) {
				if (!paths[path]) {
					paths[path] = {};
				}
			};
			function getCachePath() {
				if (!key) {
					throw new Error("`gateway.setKey()` must be called!");
				}
				if (gatewayOptions.cacheNamespace) {
					return PATH.join(env.PINF_PROGRAM, "../.rt/cache", gatewayOptions.cacheNamespace, "gateway/" + type + "/" + key);
				} else {
					return self.makePath("cache", "gateway/" + type + "/" + key);
				}
			}
			function finalize(cacheData, callback) {
				var waitfor = WAITFOR.parallel(function(err) {
					if (err) return callback(err);
					var data = JSON.stringify(JSON.decycle({
						wtime: Date.now(),
						paths: paths,
						data: cacheData
					}));
					return ZLIB.gzip(new Buffer(data), function(err, buffer) {
						if (err) return callback(err);
						return (FS.outputFileAtomic || FS.outputFile)(getCachePath(), buffer, function(err) {
							if (err) {
								if (err.code === "ENOENT" && /rename/.test(err.message)) {
									// Rename failed likely due to other process writing file during our delete and rename.
									return callback();
								}
								return callback(err);
							}
							return callback();
						});
					});
				});
				for (var path in paths) {
					waitfor(path, function(path, done) {
						return FS.exists(path, function(exists) {
							if (!exists) {
								paths[path].mtime = -1;
								paths[path].size = 0;
								return done();
							}
							return FS.stat(path, function(err, stat) {
								if (err) return done(err);
								paths[path].mtime = stat.mtime.getTime();
								paths[path].size = stat.size;
								return done();
							});
						});
					});
				}
				return waitfor();
			}
			var api = {
				setKey: function(_key) {
					if (VFS) {
						throw new Error("`gateway.getAPI()` should not be called before `gateway.onDone()`");
					}
					if (typeof _key !== "string") {
						_key = JSON.stringify(_key);
					}
					rawKey = _key;
					var shasum = CRYPTO.createHash("sha1");
					shasum.update(_key);
					key = shasum.digest("hex");
				},
				onDone: function(callback, proceedCallback, notModifiedCallback) {
					if (VFS) {
						throw new Error("`gateway.getAPI()` should not be called before `gateway.onDone()`");
					}
					if (gatewayOptions.ttl === -1) {
						if (gatewayOptions.verbose) console.log(("[pinf-for-nodejs][context] gateway bypass due to `ttl === -1`").cyan);
						return proceedCallback(null, function() {
							var args = Array.prototype.slice.call(arguments, 0);
							return callback.apply(null, args.slice(0, args.length -1));
						});
					}
					var cachePath = getCachePath();
					function proceed(reason) {
						var startTime = Date.now();
						if (gatewayOptions.verbose) console.log(("[pinf-for-nodejs][context] gateway proceed: " + reason + " (" + cachePath + ")").yellow);
						return proceedCallback(null, function proxiedCallback(err) {
							if (gatewayOptions.verbose) console.log(("[pinf-for-nodejs][context] gateway proceed done (used " + Object.keys(paths).length + " files in " + (Date.now() - startTime) + " ms) (key: " + rawKey + ")").yellow);
							if (typeof VFS.removeListener === "function") {
								VFS.removeListener("used-path", listener);
							}
							if (err) return callback(err);
							var args = Array.prototype.slice.call(arguments, 0);
							// NOTE: We take the last argument and write it to cache in `finalize`.
							//       It is returned when bypassing.
							return finalize(args.pop(), function(err) {
								if (err) return callback(err);
								return callback.apply(null, args);
							});
						});
					}
					return FS.exists(cachePath, function(exists) {
						if (!exists) return proceed("cache-path-missing");
						return FS.stat(cachePath, function(err, stat) {
							if (err) return callback(err);
							return FS.readFile(cachePath, function(err, dataRaw) {
								if (err) return callback(err);
								return ZLIB.gunzip(dataRaw, function(err, data) {
									// NOTE: For some reason the data is not always compressed!
//									if (err) return callback(err);
									try {
										data = JSON.retrocycle(JSON.parse(data || dataRaw));
									} catch(err) {
										console.warn("Error evaling cache file '" + cachePath + "': " + err.stack);
										return proceed("error-during-cache-eval");
									}
									if (!data || !data.paths) return proceed("no-paths-in-cache");
									if (gatewayOptions.skipFSCheck) {
										if (gatewayOptions.verbose) console.log(("[pinf-for-nodejs][context] gateway skipping cache check (" + cachePath + " in " + (Date.now() - gatewayStartTime) + " ms)").green);
										// self.getAPI("console").cache("Using cached data based on path mtimes in '" + path + "'");
										return notModifiedCallback(data.data, {
											cachePath: cachePath
										});
									}
									// Find earliest mtime in write paths.
									var canBypass = true;
									// Go through all read paths to see if:
									//    * we can find one with an mtime that now does not exist (missing).
									//    * we can find one with mtime -1 that now exists (new).
									//    * we can find one with a newer mtime (changed).
									var waitfor = WAITFOR.parallel(function(err) {
										if (err) return callback(err);
										if (canBypass === true) {
											if (gatewayOptions.verbose) console.log(("[pinf-for-nodejs][context] gateway using cache (checked " + Object.keys(data.paths).length + " (key: " + rawKey + ") paths in " + (Date.now() - gatewayStartTime) + " ms)").green);
											// self.getAPI("console").cache("Using cached data based on path mtimes in '" + path + "'");
											return notModifiedCallback(data.data, {
												cachePath: cachePath
											});
										}
										if (gatewayOptions.verbose) console.log(("[pinf-for-nodejs][context] gateway found change: " + canBypass).yellow);
										// self.getAPI("console").info("Regenerating cached data based on path mtimes in '" + path + "' (" + canBypass + ")");
										return proceed("cannot-bypass-after-check");
									});
									for (var path in data.paths) {
										waitfor(path, function checkPath(path, done) {
											if (!canBypass) return done();
											return FS.exists(path, function(exists) {
												if (!canBypass) return done();
												if (exists) {
													if (data.paths[path] && data.paths[path].mtime === -1) {
														// mtime -1 that now exists.
														canBypass = "new - " + path;
														return done();
													}
													return FS.stat(path, function(err, stat) {
														if (err) return done(err);
														if (
															stat.mtime.getTime() > data.paths[path].mtime ||
															stat.size != data.paths[path].size
														) {
															// a newer mtime than `earliestMtime`.
															canBypass = "changed (" + (stat.mtime.getTime() + " - " + data.paths[path].mtime) + " - " + (stat.mtime.getTime() - data.paths[path].mtime) + ") - " + path;
															return done();
														}
														return done();
													});
												} else {
													if (data.paths[path] && data.paths[path].mtime !== -1) {
														// an mtime that now does not exist.
														canBypass = "missing - " + path;
														return done();
													}
													return done();
												}
											});
										});
									}
									return waitfor();
								});
							});
						});
					});
				},
				getAPI: function(alias) {
					if (alias !== "FS") {
						throw new Error("API for alias '" + alias + "' not supported!");
					}
					VFS = self.getAPI("FS") || FS;
					if (typeof VFS.on === "function") {
						VFS.on("used-path", listener);
					} else {
						// self.getAPI("console").optimization("If `FS` is an instance of `./vfs.js` we can bypass gateway if all written files are older than read files");
					}
					return VFS;
				}
			};
			return api;
		}
		throw new Error("Proxy of type '" + type + "' not supported!");
	}

	// @unstable
	Context.prototype.reloadConfig = function(callback) {
		var self = this;
		return reloadContext(self, function(err) {
			if (err) return callback(err);			
			return callback(null, self.config);
		});
	}

	function makeConfigKey($pinf, ns) {
		if (ns[0] === "pinf/0/runtime/control/0") {
			return ["config"].concat(ns);
		} else {
			return ["config", $pinf.uid].concat(ns);
		}
	}

	// @unstable
	Context.prototype.ensureDefaultConfig = function(ns, config, callback) {
		if (!this.uid) {
			return callback(new Error("`uid` must be set for package '" + options._realpath(this.paths.package) + "'"));
		}
		try {
			//   3) /.program.json (~ $PINF_PROGRAM)
			var store = new JSON_FILE_STORE(this.env.PINF_PROGRAM.replace(/\/\.?([^\/]*)$/, "\/.$1"));
			if (!store.exists()) store.init();
			var key = makeConfigKey(this, ns);
			var data = store.get(key) || {};
			data = DEEPMERGE(config || {}, data);
			store.set(key, data);
			store.save();
			return reloadContext(this, function(err) {
				if (callback) {
					if (err) return callback(err);
					return callback(null, data);
				}
				return;
			});
		} catch(err) {
			return callback(err);
		}
	}

	// @unstable
	Context.prototype.updateRuntimeConfig = function(ns, config, callback) {
		if (!this.uid) {
			return callback(new Error("`uid` must be set for package '" + options._realpath(this.paths.package) + "'"));
		}
		try {
			var store = new JSON_FILE_STORE(this.env.PINF_RUNTIME);
			if (!store.exists()) store.init();
			var key = makeConfigKey(this, ns);
			var data = store.get(key) || {};
			data = DEEPMERGE(data, config || {});
			store.set(key, data);
			store.save();
			return reloadContext(this, function(err) {
				if (err) return callback(err);
				return callback(null, data);
			});
		} catch(err) {
			return callback(err);
		}
	}

	// @unstable
	Context.prototype.getRuntimeConfig = function(ns, callback) {
		if (!this.uid) {
			return callback(new Error("`uid` must be set for package '" + options._realpath(this.paths.package) + "'"));
		}
		try {
			var store = new JSON_FILE_STORE(this.env.PINF_RUNTIME);
			if (!store.exists()) return callback(null, {});
			var key = makeConfigKey(this, ns);
			return callback(null, store.get(key) || {});
		} catch(err) {
			return callback(err);
		}
	}

	// @unstable
	Context.prototype.clearRuntimeConfig = function(ns, callback) {
		if (!this.uid) {
			return callback(new Error("`uid` must be set for package '" + options._realpath(this.paths.package) + "'"));
		}
		try {
			var store = new JSON_FILE_STORE(this.env.PINF_RUNTIME);
			if (!store.exists()) store.init();
			var key = makeConfigKey(this, ns);
			store.remove(key);
			store.save();
			return reloadContext(this, callback);
		} catch(err) {
			return callback(err);
		}
	}

	// @unstable
	Context.prototype.clearDefaultConfig = function(ns, callback) {
		if (!this.uid) {
			return callback(new Error("`uid` must be set for package '" + options._realpath(this.paths.package) + "'"));
		}
		try {
			//   3) /.program.json (~ $PINF_PROGRAM)
			var store = new JSON_FILE_STORE(this.env.PINF_PROGRAM.replace(/\/\.?([^\/]*)$/, "\/.$1"));
			if (!store.exists()) store.init();
			var key = makeConfigKey(this, ns);
			store.remove(key);
			store.save();
			return reloadContext(this, callback);
		} catch(err) {
			return callback(err);
		}
	}

	// @experimental
	Context.prototype.getPackageInfo = function(path, callback) {
		var self = this;
		if (self._packageInfo[path]) {
			if (callback) {
				return callback(null, self._packageInfo[path]);
			}
			return self._packageInfo[path];
		}
		if (!callback) {
			throw new Error("No package info found for path '" + path + "'. Specify 'callback' to check `realpath(path)`");
		}
		return FS.exists(path, function(exists) {
			if (!exists) return callback(null, null);
			return FS.realpath(path, function(err, realpath) {
				if (err) return callback(err);
				if (self._packageInfo[realpath]) {
					return callback(null, self._packageInfo[realpath]);
				}
				return callback(null, null);
			});
		});
	}

	// @experimental
	Context.prototype.getProgramInfo = function(callback) {
		if (callback) {
			return callback(new Error("Function is now sync!"));
		}
		return this._programInfo;
    }

	function notifyPackages($pinf, eventId, config, callback) {
		var info = $pinf.getProgramInfo();
		if (
			!info.program.events ||
			!info.program.events.listen ||
			!info.program.events.listen[eventId]
		) return callback(null, {});
		var waitfor = WAITFOR.serial(function(err) {
			if (err) return callback(err);
			return $pinf.updateRuntimeConfig(["pinf/0/runtime/control/0", "program"], config, callback);
		});
		info.program.events.listen[eventId].forEach(function(handler) {
			var packageInfo = info.packages[handler.package];
	    	if (!$pinf._vm) {
				$pinf._vm = new VM($pinf);
			}
			return waitfor(function(done) {
				var opts = {};
				for (var name in options) {
					opts[name] = options[name];
				}
				opts.rootModule = handler.handler.substring(packageInfo.dirpath.length + 1);
	            return $pinf._vm.loadPackage(packageInfo.dirpath, opts, function(err, sandbox) {
	                if (err) return done(err);
	                if (options.verbose) console.log("[pinf-for-nodejs][context] notifyPackages - package loaded - " + packageInfo.dirpath);
		            return exports.context($pinf.env.PINF_PROGRAM, PATH.join(packageInfo.dirpath, "package.json"), opts, function(err, ctx) {
		                if (err) return done(err);
		                if (options.verbose) console.log("[pinf-for-nodejs][context] notifyPackages - context loaded");
		                if (options.verbose) console.log("[pinf-for-nodejs][context] notifyPackages - require root module - " + opts.rootModule);
		                var mod = sandbox.require(opts.rootModule);
		                if (options.verbose) console.log("[pinf-for-nodejs][context] notifyPackages - root module required");
		                if (typeof mod.main !== "function") {
		                	return done(new Error("Main module for package '" + packageInfo.dirpath + "' does not export 'main' function."));
		                }
		                var notifyStartTime = Date.now();
		                if (options.verbose) console.log(("[pinf-for-nodejs][context][START] Notify '" + packageInfo.dirpath + "' about '" + eventId + "'").blue);
		                return mod.main({
		                	$pinf: ctx
		                }, {
		                	event: eventId
		                }, function(err, result) {
			                if (options.verbose) console.log(("[pinf-for-nodejs][context][END] (" + (Date.now()-notifyStartTime) + " ms) Notify '" + packageInfo.dirpath + "' about '" + eventId + "'").blue);
		                    if (err) {
		                    	console.error("ERROR", err.stack);
		                    	return done(err);
		                    }
		                    config.daemons[handler.uid] = result;
		                    return done();
		                });
		            });
	            });
			});
		});
		return waitfor();
	}

	// @unstable
	Context.prototype.runProgram = function(callback) {
		var self = this;
		return self.startProgram({
			run: true
		}, function(err) {
			if (err) return callback(err);
			return self.stopProgram(callback);
		});
	}

	// @unstable
	Context.prototype.startProgram = function(options, callback) {
		var self = this;
		if (typeof options === "function" && typeof callback === "undefined") {
			callback = options;
			options = null;
		}
		options = options || {};
		function ensureStopped(callback) {
			return self.getRuntimeConfig(["pinf/0/runtime/control/0", "program"], function(err, config) {
				if (err) return callback(err);
				if (config.status === "starting" || config.status === "started") {
					if (options.restart === true) {
						return self.stopProgram(callback);
					} else {
						// TODO: Log nice console message instead of error with stack trace.
						var err = new Error("Cannot start program. Program is already starting/started. (status: " + config.status + ")");
						err.code = "ALREADY_STARTED";
						return callback(err);
					}
				}
				return callback(null);
			});
		}
		return ensureStopped(function(err) {
			if (err) return callback(err);
			var config = {
				status: "starting",
				daemonize: true,
				daemons: {}
			};
			if (options.run === true) {
				config.daemonize = false;
			}
			return self.updateRuntimeConfig(["pinf/0/runtime/control/0", "program"], config, function(err, config) {
				if (err) return callback(err);
				return notifyPackages(self, "pinf/0/runtime/control/0#events/start", config, function(err, config) {
					if (err) return callback(err);
					config.status = "started";
					return self.updateRuntimeConfig(["pinf/0/runtime/control/0", "program"], config, callback);
				});
			});
		});
	}

	// @unstable
	Context.prototype.stopProgram = function(callback) {
		var self = this;
		return self.getRuntimeConfig(["pinf/0/runtime/control/0", "program"], function(err, config) {
			if (err) return callback(err);
			if (config.status !== "starting" && config.status !== "started") {
				// TODO: Log nice console message instead of error with stack trace.
				var err = new Error("Cannot stop program. Program is not running. (status: " + config.status + ")");
				err.code = "NOT_STARTED";
				return callback(err);
			}
			return self.updateRuntimeConfig(["pinf/0/runtime/control/0", "program"], {
				status: "stopping"
			}, function(err, config) {
				if (err) return callback(err);
				return notifyPackages(self, "pinf/0/runtime/control/0#events/stop", config, function(err, config) {
					if (err) return callback(err);
					config.status = "stopped";
//					return self.clearRuntimeConfig(["pinf/0/runtime/control/0", "program"], function(err) {
					return self.updateRuntimeConfig(["pinf/0/runtime/control/0", "program"], config, function(err, config) {
						if (err) return callback(err);
						return callback(null, config);
					});
				});
			});
		});
	}

	// @unstable
	Context.prototype.getProgramStatus = function(callback) {
		try {
			var store = new JSON_FILE_STORE(this.env.PINF_RUNTIME);
			if (!store.exists()) return callback(null, {});			
			return callback(null, store.get(["config"]) || {});
		} catch(err) {
			return callback(err);
		}
	}

	// @unstable
	Context.prototype.testProgram = function(callback) {
		var self = this;
		return self.startProgram(function(err) {
			if (err) return callback(err);

console.log("TODO: Run tests program.");

			return self.stopProgram(callback);
		});
	}

	// @unstable
	Context.prototype.openProgram = function(callback) {
		var self = this;

		return exports.context(programDescriptorPath, PATH.join(__dirname, ".."), {
			PINF_PROGRAM: self.env.PINF_PROGRAM,
			PINF_RUNTIME: self.env.PINF_RUNTIME,
			uid: "pinf/0/project/control/0"
		}, function(err, context) {
			if (err) return callback(err);
			if (typeof context.config.open === "undefined") {
				return callback(new Error('No open command specified in program config at `config["pinf/0/project/control/0"].open`'));				
			}

console.log("TODO: Call `context.config.open` to open program.");

			return callback(null, {
				active: false
			});
		});
	}

	// @unstable
	Context.prototype.bundleProgram = function(bundleOptions, callback) {
		var self = this;
		if (typeof bundleOptions === "function" && typeof callback === "undefined") {
			callback = bundleOptions;
			bundleOptions = null;
		}
		bundleOptions = bundleOptions || {};
		var programInfo = self.getProgramInfo();
		if (
			!programInfo ||
			!programInfo.program ||
			!programInfo.program.descriptor ||
			!programInfo.program.descriptor.boot ||
			!programInfo.program.descriptor.boot.package
		) {
			return callback(new Error("No `boot.package` property specified in program descriptor!"));
		}
		var bootPackageInfo = programInfo.packages[programInfo.program.descriptor.boot.package];
		if (
			!bootPackageInfo.descriptor ||
			!bootPackageInfo.descriptor.exports ||
			!bootPackageInfo.descriptor.exports.bundles
		) {
			return callback(new Error("No `exports.bundles` property specified in boot package descriptor!"));
		}
		var bundles = bootPackageInfo.descriptor.exports.bundles;
		var opts = {};
		for (var name in options) {
			opts[name] = options[name];
		}
		for (var name in bundleOptions) {
			opts[name] = bundleOptions[name];
		}
		opts.rootPath = bootPackageInfo.dirpath;
		opts.distPath = opts.distPath || PATH.join(self.paths.program, (
			bootPackageInfo.descriptor.layout &&
			bootPackageInfo.descriptor.layout.directories &&
			bootPackageInfo.descriptor.layout.directories.bundles
		) || "bundles");
		var vm = new VM(self);
		var summary = {
			"bundles": {}
		};
		var waitfor = WAITFOR.serial(function(err) {
			if (err) return callback(err);
			return callback(null, summary);
		});
		for (var uri in bundles) {
			waitfor(uri, function(uri, done) {
				opts.rootModule = bundles[uri];
				if (options.verbose) console.log(("[pinf-for-nodejs][context] generate bundle for: " + opts.rootModule).yellow);
		        return vm.loadPackage(".", opts, function(err, info) {
		        	if (err) return done(err);
		        	// TODO: Attach more info from the vm.
		        	summary.bundles[bundles[uri]] = {};
					return done();
		        });
			});
		}
		return waitfor();
	}


	function populateContext(context, scope, options, callback) {

		function bypassIfWeCan(proceedCallback) {
			if (!options.$pinf) {
				return proceedCallback(callback);
			}
			var gateway = options.$pinf.gateway("vfs-write-from-read-mtime-bypass", {
				cacheNamespace: "pinf-context",
				skipFSCheck: (scope === "packages" && env.PINF_MODE === "production")
			});
			// All criteria that makes this call (argument combination) unique.
			gateway.setKey({
				scope: scope,
				programDescriptorPath: programDescriptorPath,
				packageDescriptorPath: packageDescriptorPath
			});

			// NOTE: `callback` will be called by gateway right away if we can bypass.
			return gateway.onDone(callback, function(err, proxiedCallback) {
				if (err) return 
				// If callback was triggered above we will get an empty callback back so we can just stop here.
				if (!proxiedCallback) return;
				options.API.FS = gateway.getAPI("FS");
				return proceedCallback(proxiedCallback);
			}, function(cachedData) {
				if (options.verbose) console.log("[pinf-for-nodejs][context] using cached context for", programDescriptorPath, packageDescriptorPath);
				for (var name in cachedData) {
					context[name] = cachedData[name];
				}
				context["#pinf"] = {
					status: 304,
					data: cachedData
				}
				return callback(null, context);
			});
		}

		return bypassIfWeCan(function(callback) {

			try {

				function loadConfigs(callback) {
					var opts = {};
					for (var name in options) {
						opts[name] = options[name];
					}
					opts.env = env;
					opts.includeUnknownProperties = true;

					if (options.verbose) console.log("[pinf-for-nodejs][context] program path:", PATH.dirname(env.PINF_PROGRAM));

					function load(callback) {

						opts.includePackages = (scope === "packages");
						opts.lookupPaths = (scope === "packages") ? [].concat(
							PROGRAM_INSIGHT.LOOKUP_PATHS[0],
							PROGRAM_INSIGHT.LOOKUP_PATHS.slice(PROGRAM_INSIGHT.LOOKUP_PATHS.length - 2)
						) : PROGRAM_INSIGHT.LOOKUP_PATHS;

						return PROGRAM_INSIGHT.parse(PATH.dirname(env.PINF_PROGRAM), opts, function(err, descriptor) {
				            if (err) return callback(err);

				            if (descriptor.errors.length > 0) {
				            	return callback(new Error("Package insight errors for '" + PATH.dirname(env.PINF_PROGRAM) + "': " + JSON.stringify(descriptor.errors)));
				            }

				            var lookupPaths = descriptor.lookupPaths.slice(0);
				            lookupPaths.reverse();
				            context.lookupPaths = context.lookupPaths.concat(lookupPaths);

				            var descriptorPaths = descriptor.descriptorPaths.slice(0);
				            descriptorPaths.reverse();
				            context.descriptorPaths = context.descriptorPaths.concat(descriptorPaths);

							if (descriptor.combined.config) {							
								context.config.push([descriptor.combined.config, "program"]);
								delete descriptor.config;
							}

				            context._descriptors.program = descriptor;

							if (env.PINF_PACKAGE) {
								packageDescriptorPath = env.PINF_PACKAGE;
							} else
				            if (!packageDescriptorPath) {
				            	if (descriptor.combined.boot && descriptor.combined.boot.package) {
									if (/^\//.test(descriptor.combined.boot.package)) {
					            		packageDescriptorPath = options._relpath(PATH.join(descriptor.combined.boot.package.replace(/package\.json$/, "package.json")));
									} else {
					            		packageDescriptorPath = options._relpath(PATH.join(descriptor.dirpath, descriptor.combined.boot.package.replace(/package\.json$/, "package.json")));
									}
									env.PINF_PACKAGE = packageDescriptorPath;
				            	}
				            }
							if (options.verbose) console.log("[pinf-for-nodejs][context] package path:", PATH.dirname(packageDescriptorPath));

							delete opts.lookupPaths;
					        return PACKAGE_INSIGHT.parse(PATH.dirname(packageDescriptorPath), opts, function(err, descriptor) {
					            if (err) return callback(err);

					            if (descriptor.errors.length > 0) {
					            	return callback(new Error("Package insight errors for '" + PATH.dirname(packageDescriptorPath) + "': " + JSON.stringify(descriptor.errors)));
					            }

					            var lookupPaths = descriptor.lookupPaths.slice(0);
					            lookupPaths.reverse();
					            context.lookupPaths = context.lookupPaths.concat(lookupPaths);

					            var descriptorPaths = descriptor.descriptorPaths.slice(0);
					            descriptorPaths.reverse();
					            context.descriptorPaths = context.descriptorPaths.concat(descriptorPaths);

								if (descriptor.combined.config) {
									context.config.push([descriptor.combined.config, "package"]);
									delete descriptor.config;
								}
					            context._descriptors.package = descriptor;

					            // TODO: Write cache file.

					            return callback(null);
					        });
				        });
					}

					return load(function(err) {
						if (err) return callback(err);

						function importEnvVars(callback) {
							var descriptor = context._descriptors.package;
							if (!descriptor.combined.requirements || !descriptor.combined.requirements.env) {
								return callback(null);
							}
							for (var name in descriptor.combined.requirements.env) {
								if (!/[A-Z_]/.test(name)) {
									return callback(new Error("ENV var '" + name + "' declared in " + JSON.stringify(Object.keys(descriptor.normalized)) + " must follow '[A-Z_]'"));
								}
								if (/^PINF_/.test(name)) {
									return callback(new Error("'PINF_*' ENV var '" + name + "' may not be declared in " + JSON.stringify(Object.keys(descriptor.normalized))));
								}
								if (/^(CWD)$/.test(name)) {
									return callback(new Error("Reserved ENV var '" + name + "' may not be declared in " + JSON.stringify(Object.keys(descriptor.normalized))));
								}
								context.env[name] = descriptor.combined.requirements.env[name];
							}
							return callback(null);
						}

						function recordBinPaths(callback) {
							var waitfor = WAITFOR.serial(callback);
							var checked = {};
							context.lookupPaths.forEach(function(path) {
								return waitfor(function(done) {
									var binPath = options._realpath(PATH.join(PATH.dirname(path), ".bin"));
									if (checked[binPath]) return done(null);
									checked[binPath] = true;
									return FS.exists(binPath, function(exists) {
										if (exists) {
											context.binPaths.unshift(options._relpath(binPath));
										}
										binPath = options._realpath(PATH.join(PATH.dirname(path), "bin"));
										if (checked[binPath]) return done(null);
										checked[binPath] = true;
										return FS.exists(binPath, function(exists) {
											if (exists) {
												context.binPaths.unshift(options._relpath(binPath));
											}
											return done(null);
										});
									});
								});
							});
							return waitfor();
						}

						return importEnvVars(function(err) {
							if (err) return callback(err);
							return recordBinPaths(callback);
						});
					});
				}

				function collectProgramEnvVars(callback) {
					if (
						!context._descriptors.program ||
						!context._descriptors.program.combined ||
						!context._descriptors.program.combined.requirements ||
						!context._descriptors.program.combined.requirements.env
					) return callback();
					for (var name in context._descriptors.program.combined.requirements.env) {
						if (typeof env[name] === "undefined") {
							env[name] = context._descriptors.program.combined.requirements.env[name].replace(new RegExp("\\$" + name, "g"), process.env[name]);
						}
					}
					return callback();
				}

				function injectPinfVars(callback) {
					for (var name in env) {
						if (/^PINF_/.test(name)) {
							context.env[name] = env[name];
						}
					}
					return callback();
				}

				function rerootEnvPaths(callback) {
					[
						"PINF_PACKAGES",
						"PINF_PROGRAM_PARENT",
						"PINF_PROGRAM",
						"PINF_PACKAGE",
						"PINF_RUNTIME",
						"CWD"
					].forEach(function(name) {
						if (!context.env[name]) return;
						if (name === "PINF_PACKAGES") {
							context.env[name] = context.env[name].split(":").map(function(path) {
								return options._relpath(path);
							}).join(":");
						} else {
							context.env[name] = options._relpath(context.env[name]);
						}
					});
					return callback(null);
				}

				function replaceEnvVars(callback) {
					var json = JSON.stringify(context.env);
					for (var name in context.env) {
						if (typeof env[name] !== "undefined") {
							json = json.replace(new RegExp("\\$" + name, "g"), env[name]);
						} else
						if (typeof process.env[name] !== "undefined") {
							json = json.replace(new RegExp("\\$" + name, "g"), process.env[name]);
						}
					}
					var m = json.match(/\$([A-Z]{1}[A-Z0-9_]*)/g);
					if (m) {
						m.forEach(function(name) {
							throw new Error("The '" + name.substring(1) + "' environment variable must be set!");
						});
					}
					context.env = JSON.parse(json);
					return callback(null);
				}

				function collectConfig(callback) {
					var config = {};
					[
						"package",
						"program"
					].forEach(function(type) {
						context.config.forEach(function(json) {
							if (json[1] === type) {
								if (json[1] === "program") {
									if (context.uid && json[0][context.uid]) {
										config = DEEPMERGE(config, json[0][context.uid]);
									}
								} else {
									config = DEEPMERGE(config, json[0]);
								}
							}
						});
					});
					context.config = config;
					return callback(null);
				}

				function formatPaths(callback) {
					var basePath = PATH.join(context.env.PINF_RUNTIME, "..");
					function makePath(dir) {
						var path = PATH.join(basePath, dir);
						if (context.ns) {
							path = PATH.join(path, context.ns);
						}
						return path;
					}
					context.paths = {
						program: PATH.join(context.env.PINF_PROGRAM, ".."),
						package: PATH.join(context.env.PINF_PACKAGE, ".."),
						run: makePath("run"),
						data: makePath("data"),
						etc: makePath("etc"),
						log: makePath("log"),
						cache: makePath("cache"),
						tmp: makePath("tmp")
					};
					if (context._descriptors.package.combined.layout && context._descriptors.package.combined.layout.directories) {
						for (var name in context._descriptors.package.combined.layout.directories) {
							context.paths[name] = PATH.join(context.env.PINF_PACKAGE, "..", context._descriptors.package.combined.layout.directories[name]);
						}
					}
					return callback(null);
				}

				function summarizeProgramInfo(callback) {
			        var info = {
				        env: {
				            CWD: process.cwd()
				        },
				        program: {
				            path: context.paths.program,
				            runtime: context.env.PINF_RUNTIME,
				            events: {},
				            descriptor: DEEPCOPY(context._descriptors.program.combined)
				        },
				        packages: {}
			        };
			        // Convert paths to IDs.
			        // TODO: Maybe already do this in `pinf-it-program-insight`.
			        if (info.program.descriptor.boot && info.program.descriptor.boot.package) {
				       	info.program.descriptor.boot.package = info.program.descriptor.packages[info.program.descriptor.boot.package].id;
			        }
			        for (var uri in info.program.descriptor.packages) {
			        	info.packages[info.program.descriptor.packages[uri].id] = {
			        		dirpath: info.program.descriptor.packages[uri].dirpath,
			        		descriptor: info.program.descriptor.packages[uri].combined
			        	};
			        }
			        delete info.program.descriptor.packages;

			        // We gather all event handlers from all packages in the program.
			        for (var id in info.packages) {
			        	if (info.packages[id].descriptor.events) {
			        		for (var type in info.packages[id].descriptor.events) {
			        			if (!info.program.events[type]) {
			        				info.program.events[type] = {};
			        			}
			        			for (var name in info.packages[id].descriptor.events[type]) {
				        			if (!info.program.events[type][name]) {
				        				info.program.events[type][name] = [];
				        			}
				        			info.program.events[type][name].push({
				        				package: id,
				        				// TODO: Make `uid` handler specific. It is scoped to the package for now.
				        				uid: info.packages[id].descriptor.uid,
				        				handler: info.packages[id].descriptor.events[type][name]
				        			});
			        			}
			        		}
			        	}
			        }
			        context._programInfo = info;
					return callback(null);
			    }

				function summarizePackageInfo(callback) {
					try {
				        var packages = (context._descriptors.program.combined && context._descriptors.program.combined.packages) || {};
				        var overrides = {};
				        for (var uri in packages) {
				        	if (packages[uri].combined.overrides) {
				        		for (var override in packages[uri].combined.overrides) {
				        			var p = PATH.join(packages[uri].dirrealpath, override);
				        			if (!overrides[p]) {
				        				overrides[p] = [];
				        			}
				        			overrides[p].push(packages[uri].combined.overrides[override]);
				        		}
				        	}
				        }

						for (var uri in packages) {
							var path = packages[uri].dirpath;
							var realpath = packages[uri].dirrealpath;

					        var info = {
						        env: {
						            CWD: process.cwd(),
						            PINF_PACKAGE: PATH.join(path, "package.json")
						        },
						        package: {
						            path: path,
						            id: packages[uri].id,
						            descriptor: packages[uri].combined
						        }
					        };
							var config = packages[uri].combined.config || {};
							if (overrides[realpath]) {
								overrides[realpath].forEach(function(override) {
									if (override.descriptor && override.descriptor.config) {
										var json = JSON.stringify(override.descriptor.config);
										function replaceAll(str, find, replace) {
											while (str.indexOf(find) > -1) {
												str = str.replace(find, replace);
											}
											return str;
										}
										// Temporarily replace all `\\$__DIRNAME` (escaped) so we can keep them.
							            json = replaceAll(json, "\\\\$__DIRNAME", "__TMP_tOtAlYrAnDoM__");
							            // Replace all `$__DIRNAME`.
							            json = json.replace(/\$__DIRNAME/g, packages[uri].dirpath);
							            // Put back escaped `$__DIRNAME` as the string should be kept.
							            json = json.replace(/__TMP_tOtAlYrAnDoM__/g, "$__DIRNAME");
						    			config = DEEPMERGE(config, JSON.parse(json));
									}
								});
							}
				    		if (
				    			packages[uri].combined.uid &&
				    			context._descriptors.program.combined &&
				    			context._descriptors.program.combined.config &&
				    			context._descriptors.program.combined.config[packages[uri].combined.uid]
				    		) {
				    			config = DEEPMERGE(config, context._descriptors.program.combined.config[packages[uri].combined.uid]);
				    		}
					        info.package.config = config;
							context._packageInfo[path] = info;
							if (path !== realpath) {
								context._packageInfo[realpath] = info;
							}
						}
						return callback(null);
					} catch(err) {
						return callback(err);
					}
				}

                if (scope === "root" && typeof options.API.FS.notifyUsedPath === "function") {
                    options.API.FS.notifyUsedPath(env.PINF_RUNTIME, "writeFile");
                    options.API.FS.notifyUsedPath(env.PINF_PROGRAM.replace(/\/\.?([^\/]*)$/, "\/.$1"), "writeFile");
                }

				return loadConfigs(function(err) {
					if (err) return callback(err);

					if (options.uid) {
						context.uid = options.uid;
					} else
					if (context._descriptors.package.combined.uid) {
						context.uid = exports.formatUid(context._descriptors.package.combined.uid);
					}

					return collectProgramEnvVars(function(err) {
						if (err) return callback(err);

						return injectPinfVars(function(err) {
							if (err) return callback(err);

							return rerootEnvPaths(function(err) {
								if (err) return callback(err);

								return replaceEnvVars(function(err) {
									if (err) return callback(err);

									return collectConfig(function(err) {
										if (err) return callback(err);

										if (context.uid) {
											context.ns = exports.uriToFilename(context.uid);
										} else {
											context.ns = PATH.basename(PATH.dirname(context.env.PINF_PACKAGE));
										}

										return formatPaths(function(err) {
											if (err) return callback(err);

											return summarizeProgramInfo(function(err) {
												if (err) return callback(err);

												return summarizePackageInfo(function(err) {
													if (err) return callback(err);

													delete context._descriptors;

													var ctx = context.clone();
													function clearAPI(ctx) {
														if (ctx.__proto__) {
															clearAPI(ctx.__proto__);
														}
														if (ctx._api) {
															ctx._api = {};
														}
													}
													clearAPI(ctx);

													return callback(null, ctx, context);
												});
											});
										});
									});
								});
							});
						});
					});
				});

			} catch(err) {
				return callback(err);
			}
		});
	}

	var rootContext = new Context();
	var packagesContext = rootContext.clone();

	// Init a virtual filesystem so we can track FS calls.
	var opts = {};
	for (var name in options) {
		opts[name] = options[name];
	}
	opts.$pinf = rootContext;
	return VFS.open("file://", opts, function(err, vfs) {
		if (err) return callback(err);
		opts.$pinf._api.FS = vfs;

		return populateContext(rootContext, "root", opts, function(err) {
			if (err) return callback(err);

			// TODO: We should not need to set this here again. For some reason the prototype chain on the `FS` object is gone.
			opts.$pinf._api.FS = vfs;

			return populateContext(packagesContext, "packages", opts, function(err) {
				if (err) return callback(err);

				rootContext._programInfo = packagesContext._programInfo;
				rootContext._packageInfo = packagesContext._packageInfo;
				rootContext._api = {};

				return callback(null, rootContext);
			});
		});
	});
}

