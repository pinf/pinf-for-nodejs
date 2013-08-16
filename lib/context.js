
const PATH = require("path");
const FS = require("fs-extra");
const URL = require("url");
const WAITFOR = require("waitfor");
const DEEPMERGE = require("deepmerge");
const JSON_FILE_STORE = require("./json-file-store").JsonFileStore;
const EVENTS = require("events");
const UTIL = require("util");
const PINF_PRIMITIVES = require("pinf-primitives-js");
const PACKAGE_INSIGHT = require("pinf-it-package-insight");
const PROGRAM_INSIGHT = require("pinf-it-program-insight");


exports.contextForModule = function(module, options, callback) {
	if (typeof options === "function" && typeof callback === "undefined") {
		callback = options;
		options = null;
	}
	options = options || {};

	function findPackagePath(basePath, callback) {
		var descriptorPath = PATH.join(basePath, "package.json");
		return FS.exists(descriptorPath, function(exists) {
			if (exists) return callback(null, descriptorPath);
			descriptorPath = PATH.join(basePath, ".package.json");
			return FS.exists(descriptorPath, function(exists) {
				if (exists) return callback(null, descriptorPath);
				var newPath = PATH.dirname(basePath);
				if (newPath === basePath) return callback(null, null);
				return findPackagePath(newPath, callback);
			});
		});
	}

	if (typeof options.PINF_PROGRAM === "undefined") {
		options.PINF_PROGRAM = process.env.PINF_PROGRAM;
	}
	if (typeof options.PINF_RUNTIME === "undefined") {
		options.PINF_RUNTIME = process.env.PINF_RUNTIME;
	}

	if (!options.PINF_PROGRAM) {
		return callback(new Error("The PINF_PROGRAM environment variable must be set!"));
	}
	if (!module.filename) {
		return callback(new Error("`module.filename` must be set!"));
	}
	return findPackagePath(module.filename, function(err, path) {
		if (err) return callback(err);
		return exports.context(options.PINF_PROGRAM, path, {
			env: {
				PINF_RUNTIME: options.PINF_RUNTIME
			}
		}, callback)
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
		this.env = {};
		this.paths = {};
		this.binPaths = [];
		this.config = [];
		this.descriptorPaths = [];
		this.lookupPaths = [];
	}
	UTIL.inherits(Context, EVENTS.EventEmitter);

	Context.prototype._descriptors = {
		package: {},
		program: {}
	};

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
			return callback(new Error("`uid` must be set for package '" + this.paths.package + "'"));
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
			return callback(new Error("`uid` must be set for package '" + this.paths.package + "'"));
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
	Context.prototype.clearRuntimeConfig = function(ns, callback) {
		if (!this.uid) {
			return callback(new Error("`uid` must be set for package '" + this.paths.package + "'"));
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
			return callback(new Error("`uid` must be set for package '" + this.paths.package + "'"));
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
        var packages = self.__proto__._descriptors.program.combined.packages;
        for (var uri in packages) {
	    	if (packages[uri].dirpath === path) {

	    		var config = packages[uri].combined.config || {};
	    		if (
	    			packages[uri].combined.uid &&
	    			self.__proto__._descriptors.program.combined &&
	    			self.__proto__._descriptors.program.combined.config &&
	    			self.__proto__._descriptors.program.combined.config[packages[uri].combined.uid]
	    		) {
	    			config = DEEPMERGE(config, self.__proto__._descriptors.program.combined.config[packages[uri].combined.uid]);
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
	            descriptor: self.__proto__._descriptors.program.combined
	        }
        };
        // Convert paths to IDs.
        // TODO: Maybe already do this in `pinf-it-program-insight`.
        if (info.program.descriptor.boot && info.program.descriptor.boot.package) {
	       	info.program.descriptor.boot.package = info.program.descriptor.packages[info.program.descriptor.boot.package].id;
        }
        for (var uri in info.program.descriptor.packages) {
        	info.program.descriptor.packages[info.program.descriptor.packages[uri].id] = {
        		dirpath: info.program.descriptor.packages[uri].dirpath,
        		descriptor: info.program.descriptor.packages[uri].combined
        	};
        	delete info.program.descriptor.packages[uri];
        }
        // We gather all event handlers from all packages in the program.
        for (var id in info.program.descriptor.packages) {
        	if (info.program.descriptor.packages[id].descriptor.events) {
        		for (var type in info.program.descriptor.packages[id].descriptor.events) {
        			if (!info.program.events[type]) {
        				info.program.events[type] = {};
        			}
        			for (var name in info.program.descriptor.packages[id].descriptor.events[type]) {
	        			if (!info.program.events[type][name]) {
	        				info.program.events[type][name] = [];
	        			}
	        			info.program.events[type][name].push({
	        				package: id,
	        				handler: info.program.descriptor.packages[id].descriptor.events[type][name]
	        			});
        			}
        		}
        	}
        }
		return callback(null, info);
    }

	var context = new Context();

	try {

		var env = options.env || null;

		env = PINF_PRIMITIVES.normalizeEnvironmentVariables(env, {
			PINF_PROGRAM: programDescriptorPath || (env && env.PINF_PROGRAM) || undefined,
			PINF_PACKAGE: packageDescriptorPath || (env && env.PINF_PACKAGE) || undefined
		});

		function loadConfigs(callback) {
			var opts = {};
			for (var name in options) {
				opts[name] = options[name];
			}
			opts.env = env;
			opts.includeUnknownProperties = true;

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

	            context.__proto__._descriptors.program = descriptor;

		        return PACKAGE_INSIGHT.parse(PATH.dirname(env.PINF_PACKAGE), opts, function(err, descriptor) {
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
		            context.__proto__._descriptors.package = descriptor;

					function importEnvVars(callback) {
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
			if (context.__proto__._descriptors.package.combined.layout && context.__proto__._descriptors.package.combined.layout.directories) {
				for (var name in context.__proto__._descriptors.package.combined.layout.directories) {
					context.paths[name] = PATH.join(context.env.PINF_PACKAGE, "..", context.__proto__._descriptors.package.combined.layout.directories[name]);
				}
			}
			return callback(null);
		}

		return loadConfigs(function(err) {
			if (err) return callback(err);

			if (context.__proto__._descriptors.package.combined.uid) {
				context.uid = exports.formatUid(context.__proto__._descriptors.package.combined.uid);
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

