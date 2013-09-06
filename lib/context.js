
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
const LOADER = require("./loader");


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
		opts.PINF_PROGRAM = process.env.PINF_PROGRAM;
	}
	if (typeof opts.PINF_RUNTIME === "undefined") {
		opts.PINF_RUNTIME = process.env.PINF_RUNTIME;
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

	if (options.debug) console.log("[pinf-for-nodejs][context] new context for", programDescriptorPath, packageDescriptorPath);

	options._relpath = function(path) {
		if (!path || !options.rootPath || !/^\//.test(path)) return path;
		return PATH.relative(options.rootPath, path);
	}

	options._realpath = function(path) {
		if (!options.rootPath) return path;
		if (/^\//.test(path)) return path;
		return PATH.join(options.rootPath, path);
	}

	function ensureParentPath() {
		var path = PATH.join.apply(null, [].slice.call(arguments));
		if (FS.existsSync(PATH.dirname(path))) return path;
		FS.mkdirsSync(PATH.dirname(path));
		return path;
	}

	function reloadContext(context, callback) {
		// TODO: Make this super efficient by checking file mtimes.
		return exports.context(programDescriptorPath, packageDescriptorPath, options, function(err, reloadedConfig) {
			if (err) return callback(err);
			for (var name in reloadedConfig) {
				if (typeof reloadedConfig[name] !== "function") {
					context[name] = reloadedConfig[name];
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
	}
	UTIL.inherits(Context, EVENTS.EventEmitter);

	Context.prototype.clone = function() {
		var ctx = new Context();
		for (var name in this) {
			if (this.hasOwnProperty(name)) {
				ctx[name] = this[name];
			}
		}
		return ctx;
	}

	Context.prototype.stringify = function() {
		var obj = {};
		for (var name in this) {
			if (!this.hasOwnProperty(name)) continue;
			if (/^_/.test(name)) continue;
			obj[name] = this[name];
		}
		return JSON.stringify.apply(null, [obj].concat(Array.prototype.slice.call(arguments, 0)));
	}

	Context.prototype.makeOptions = function(options) {
		if (typeof options !== "object") {
			return options;
		}
		var opts = {};
		for (var name in options) {
			opts[name] = options[name];
		}
		var ctx = this.clone();
		if (typeof opts.$pinf !== "object") {
			opts.$pinf = ctx;
			return opts;
		}
		ctx.__proto__ = opts.$pinf;
		opts.$pinf = ctx;
		opts.$pinf.parentContext = opts.$pinf.__proto__;
		[
			"debug",
			"verbose",
			"test"
		].forEach(function(name) {
			opts.$pinf[name] = ctx.parentContext[name];
		});
		return opts;
	}

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

	Context.prototype.makePath = function(type, path) {
		return ensureParentPath(this.paths[type], path);
	}

	Context.prototype.reloadConfig = function(callback) {
		var self = this;
		return reloadContext(self, function(err) {
			if (err) return callback(err);			
			return callback(null, self.config);
		});
	}

	Context.prototype.ensureDefaultConfig = function(ns, config, callback) {
		if (!this.uid) {
			return callback(new Error("`uid` must be set for package '" + options._realpath(this.paths.package) + "'"));
		}
		try {
			//   3) /.program.json (~ $PINF_PROGRAM)
			var store = new JSON_FILE_STORE(this.env.PINF_PROGRAM.replace(/\/\.?([^\/]*)$/, "\/.$1"));
			if (!store.exists()) store.init();
			var key = ["config", this.uid].concat(ns);
			var data = store.get(key) || {};
			data = DEEPMERGE(config || {}, data);
			store.set(key, data);
			store.save();
			return reloadContext(this, function(err) {
				if (err) return callback(err);
				if (callback) {
					return callback(null, data);
				}
				return;
			});
		} catch(err) {
			return callback(err);
		}
	}
	Context.prototype.updateRuntimeConfig = function(ns, config, callback) {
		if (!this.uid) {
			return callback(new Error("`uid` must be set for package '" + options._realpath(this.paths.package) + "'"));
		}
		try {
			var store = new JSON_FILE_STORE(this.env.PINF_RUNTIME);
			if (!store.exists()) store.init();
			var key = ["config", this.uid].concat(ns);
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
	Context.prototype.getRuntimeConfig = function(ns, callback) {
		if (!this.uid) {
			return callback(new Error("`uid` must be set for package '" + options._realpath(this.paths.package) + "'"));
		}
		try {
			var store = new JSON_FILE_STORE(this.env.PINF_RUNTIME);
			if (!store.exists()) return callback(null, {});
			var key = ["config", this.uid].concat(ns);
			return callback(null, store.get(key) || {});
		} catch(err) {
			return callback(err);
		}
	}
	Context.prototype.clearRuntimeConfig = function(ns, callback) {
		if (!this.uid) {
			return callback(new Error("`uid` must be set for package '" + options._realpath(this.paths.package) + "'"));
		}
		try {
			var store = new JSON_FILE_STORE(this.env.PINF_RUNTIME);
			if (!store.exists()) store.init();
			var key = ["config", this.uid].concat(ns);
			store.remove(key);
			store.save();
			return reloadContext(this, callback);
		} catch(err) {
			return callback(err);
		}
	}
	Context.prototype.clearDefaultConfig = function(ns, callback) {
		if (!this.uid) {
			return callback(new Error("`uid` must be set for package '" + options._realpath(this.paths.package) + "'"));
		}
		try {
			//   3) /.program.json (~ $PINF_PROGRAM)
			var store = new JSON_FILE_STORE(this.env.PINF_PROGRAM.replace(/\/\.?([^\/]*)$/, "\/.$1"));
			if (!store.exists()) store.init();
			var key = ["config", this.uid].concat(ns);
			store.remove(key);
			store.save();
			return reloadContext(this, callback);
		} catch(err) {
			return callback(err);
		}
	}

	Context.prototype.getPackageInfo = function(path, callback) {
		var self = this;
        var info = {
	        env: {
	            CWD: process.cwd(),
	            PINF_PACKAGE: PATH.join(path, "package.json")
	        }
        };
        var packages = self._descriptors.program.combined.packages;

        for (var uri in packages) {
	    	if (packages[uri].dirpath === path) {

	    		var config = packages[uri].combined.config || {};
	    		if (
	    			packages[uri].combined.uid &&
	    			self._descriptors.program.combined &&
	    			self._descriptors.program.combined.config &&
	    			self._descriptors.program.combined.config[packages[uri].combined.uid]
	    		) {
	    			config = DEEPMERGE(config, self._descriptors.program.combined.config[packages[uri].combined.uid]);
	    		}
		        info.package = {
		            path: packages[uri].dirpath,
		            id: packages[uri].id,
		            descriptor: packages[uri].combined,
		            config: config
		        };
	    	}
	    }
	    return callback(null, info);
	}

	Context.prototype.getProgramInfo = function(callback) {
		var self = this;
        var info = {
	        env: {
	            CWD: process.cwd()
	        },
	        program: {
	            path: self.paths.program,
	            runtime: self.env.PINF_RUNTIME,
	            events: {},
	            descriptor: DEEPCOPY(self._descriptors.program.combined)
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
		return callback(null, info);
    }

	function notifyPackages(context, eventId, config, callback) {
		return context.getProgramInfo(function(err, info) {
			if (err) return callback(err);
			if (
				!info.program.events ||
				!info.program.events.listen ||
				!info.program.events.listen[eventId]
			) return callback(null, {});
			var waitfor = WAITFOR.parallel(function(err) {
				if (err) return callback(err);
				return context.updateRuntimeConfig(["pinf/0/runtime/control/0", "program"], config, callback);
			});
			info.program.events.listen[eventId].forEach(function(handler) {
				var packageInfo = info.packages[handler.package];
		    	if (!context.vm) {
console.log("Don't attach VM here. Create new object and inherit context");
					context.__proto__.vm = new VM(context);
				}
				return waitfor(function(done) {
					var opts = {};
					for (var name in options) {
						opts[name] = options[name];
					}
					opts.rootModule = handler.handler.substring(packageInfo.dirpath.length + 1);
		            return context.vm.loadPackage(packageInfo.dirpath, opts, function(err, sandbox) {
		                if (err) return done(err);

			            return exports.context(context.env.PINF_PROGRAM, PATH.join(packageInfo.dirpath, "package.json"), opts, function(err, ctx) {
			                if (err) return done(err);

			                return sandbox.require(opts.rootModule).main(ctx, {
			                	event: eventId
			                }, function(err, result) {
			                    if (err) return done(err);
			                    config.daemons[handler.uid] = result;
			                    return done();
			                });
			            });
		            });
				});
			});
			return waitfor();
		});
	}

	Context.prototype.runProgram = function(callback) {
		var self = this;
		return self.startProgram({
			run: true
		}, function(err) {
			if (err) return callback(err);
			return self.stopProgram(callback);
		});
	}

	Context.prototype.startProgram = function(options, callback) {
		var self = this;
		if (typeof options === "function" && typeof callback === "undefined") {
			callback = options;
			options = null;
		}
		options = options || {};
		// TODO: Don't start again if already started.
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
	}

	Context.prototype.stopProgram = function(callback) {
		var self = this;
		// TODO: Don't stop if not started.
		return self.updateRuntimeConfig(["pinf/0/runtime/control/0", "program"], {
			status: "stopping"
		}, function(err, config) {
			if (err) return callback(err);
			return notifyPackages(self, "pinf/0/runtime/control/0#events/stop", config, function(err, config) {
				if (err) return callback(err);
				return self.clearRuntimeConfig(["pinf/0/runtime/control/0", "program"], function(err) {
					if (err) return callback(err);
					return callback(null, {});
				});
			});
		});
	}

	Context.prototype.getProgramStatus = function(callback) {
		try {
			var store = new JSON_FILE_STORE(this.env.PINF_RUNTIME);
			if (!store.exists()) return callback(null, {});			
			return callback(null, store.get(["config"]) || {});
		} catch(err) {
			return callback(err);
		}
	}

	Context.prototype.testProgram = function(callback) {
		var self = this;
		return self.startProgram(function(err) {
			if (err) return callback(err);

console.log("TODO: Run tests program.");

			return self.stopProgram(callback);
		});
	}

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


	var context = new Context();

	try {

		var env = options.env || null;

		env = PINF_PRIMITIVES.normalizeEnvironmentVariables(env, {
			PINF_PROGRAM: programDescriptorPath || (env && env.PINF_PROGRAM) || undefined,
			PINF_PACKAGE: packageDescriptorPath || (env && env.PINF_PACKAGE) || undefined
		});

		if (options.verbose) console.log("[pinf-for-nodejs][context] env:", env);

		function loadConfigs(callback) {
			var opts = {};
			for (var name in options) {
				opts[name] = options[name];
			}
			opts.env = env;
			opts.includeUnknownProperties = true;

			if (options.verbose) console.log("[pinf-for-nodejs][context] program path:", PATH.dirname(env.PINF_PROGRAM));

			function load(callback) {

				opts.includePackages = false;
				if (options.forceIndexPackages) {
					opts.includePackages = true;
				} else {
					// TODO: Run PINF.context() on `env.PINF_PROGRAM` to get cache path for program descriptor.
				}

				return PROGRAM_INSIGHT.parse(PATH.dirname(env.PINF_PROGRAM), opts, function(err, descriptor) {
		            if (err) return callback(err);

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
		            		packageDescriptorPath = options._relpath(PATH.join(descriptor.dirpath, descriptor.combined.boot.package, "package.json"));
		            	}
		            }

					if (options.verbose) console.log("[pinf-for-nodejs][context] package path:", PATH.dirname(packageDescriptorPath));

			        return PACKAGE_INSIGHT.parse(PATH.dirname(packageDescriptorPath), opts, function(err, descriptor) {
			            if (err) return callback(err);

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
				if (env[name]) {
					json = json.replace(new RegExp("\\$" + name, "g"), env[name]);
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

		return loadConfigs(function(err) {
			if (err) return callback(err);

			if (options.uid) {
				context.uid = options.uid;
			} else
			if (context._descriptors.package.combined.uid) {
				context.uid = exports.formatUid(context._descriptors.package.combined.uid);
			}

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

								return callback(null, context);
							});
						});
					});
				});
			});
		});

	} catch(err) {
		return callback(err);
	}
}

