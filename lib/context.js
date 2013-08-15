
const PATH = require("path");
const FS = require("fs-extra");
const URL = require("url");
const WAITFOR = require("waitfor");
const DEEPMERGE = require("deepmerge");
const JSON_FILE_STORE = require("./json-file-store").JsonFileStore;
const EVENTS = require("events");
const UTIL = require("util");
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

// Descriptors get merged on top of each other in reverse order.
exports.LOOKUP_PATHS = [
	//   1) /program.$PINF_MODE.json (~ $PINF_PROGRAM)
	[function (ENV) {
		return ENV.PINF_PROGRAM.replace(".json", "." + ENV.PINF_MODE + ".json");
	}, { type: "program" }],
	//   2) /.rt/program.rt.json ($PINF_RUNTIME)
	//		The `rt` descriptor holds the runtime information for this instance of the program. There can always
	//		only be one runtime instance of a program installation. If you want to boot a second, create an
	//		inheriting program descriptor in a new directory and boot it there.
	[function (ENV) {
		return ENV.PINF_RUNTIME;
	}, { type: "program" }],
	//   3) /.program.json (~ $PINF_PROGRAM)
	[function (ENV) {
		return ENV.PINF_PROGRAM.replace(/\/\.?([^\/]*)$/, "\/.$1");
	}, { type: "program" }],
	//   4) ./.package.json (~ $PINF_PACKAGE)
	[function (ENV) {
		return ENV.PINF_PACKAGE.replace(/\/\.?([^\/]*)$/, "\/.$1");
	}, { type: "package" }],
	//   5) /program.json ($PINF_PROGRAM)
	[function (ENV) {
		return ENV.PINF_PROGRAM;
	}, { type: "program" }],
	//   6) ./package.json
	[function (ENV) {
		return ENV.PINF_PACKAGE;
	}, { type: "package" }],
	//   7) <parent>/program.json ($PINF_PROGRAM_PARENT)
	[function (ENV) {
		return ENV.PINF_PROGRAM_PARENT;
	}, { type: "program" }]
];

exports.normalizeEnvironmentVariables = function(env, overrides) {
	env = env || process.env;
	overrides = overrides || {};
	var ENV = {};
	for (var name in env) {
		ENV[name] = env[name];
	}
	for (var name in overrides) {
		if (typeof overrides[name] !== "undefined") {
			ENV[name] = overrides[name];
		}
	}
	if (!ENV.PINF_PROGRAM && !ENV.CWD) {
		throw new Error("Either `ENV.PINF_PROGRAM` (" + ENV.PINF_PROGRAM + ") or `ENV.CWD` (" + ENV.CWD + ") must be set!");
	}
	if (!ENV.PINF_PACKAGE && !ENV.CWD) {
		throw new Error("Either `ENV.PINF_PACKAGE` (" + ENV.PINF_PACKAGE + ") or `ENV.CWD` (" + ENV.CWD + ") must be set!");
	}
	// `PINF_PACKAGES` contains a list of directories used to lookup packages.
	// Packages should be stored in these directories where the package directory
	// represents the global ID of the package.
	ENV.PINF_PACKAGES = (typeof ENV.PINF_PACKAGES === "string") ? ENV.PINF_PACKAGES : (process.env.PINF_PACKAGES || "");
	// If `PINF_PROGRAM_PARENT` is set the parent descriptor will be merged on top of our descriptor.
	// Under normal conditions the `PINF_PROGRAM_PARENT` varibale should never be set in the shell directly.
	// `PINF_PROGRAM_PARENT` is used when a program boots other programs as part of its own runtime to tell sub program
	// to store runtime info in parent context.
	// e.g. `/path/to/program.json`
	ENV.PINF_PROGRAM_PARENT = (typeof ENV.PINF_PROGRAM_PARENT === "string") ? ENV.PINF_PROGRAM_PARENT : (process.env.PINF_PROGRAM_PARENT || "");
	// These environment variables declare what to boot and in which state:
	//   * A local filesystem path to a `program.json` file (how to boot & custom config).
	ENV.PINF_PROGRAM = ENV.PINF_PROGRAM || PATH.join(ENV.CWD, "program.json");
	//   * A local filesystem path to a `package.json` file (what to boot & default config).
	ENV.PINF_PACKAGE = ENV.PINF_PACKAGE || PATH.join(ENV.CWD, "package.json");
	//   * A local filesystem path to a `program.rt.json` file (the state to boot in).
	ENV.PINF_RUNTIME = ENV.PINF_RUNTIME || PATH.join(ENV.PINF_PROGRAM_PARENT || ENV.PINF_PROGRAM, "../.rt/program.rt.json");
	//   * The mode the runtime should run it. Will load `program.$PINF_MODE.json`.
	ENV.PINF_MODE = ENV.PINF_MODE || "production";
	return ENV;
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
		this._descriptors = {
			package: {},
			program: {}
		};
	}
	UTIL.inherits(Context, EVENTS.EventEmitter);

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

	Context.prototype.getInfo = function(callback) {
		var self = this;
        var info = {
            context: self
        };
        info.env = {
            CWD: process.cwd()
        };
        info.program = {
            path: info.context.paths.program,
            runtime: info.context.env.PINF_RUNTIME
        };
        info.package = {
            path: info.context.paths.package,
            id: null,
            descriptor: null
        };
        return PROGRAM_INSIGHT.parse(info.program.path, {}, function(err, descriptor) {
            if (err) return callback(err);
            descriptor.warnings.forEach(function(warning) {
                console.warn("[pinf-insight] warning for '" + info.program.path + "':", warning);
            });
            info.program.descriptor = descriptor.combined;

	        return PACKAGE_INSIGHT.parse(info.package.path, {}, function(err, descriptor) {
	            if (err) return callback(err);
	            descriptor.warnings.forEach(function(warning) {
	                console.warn("[pinf-insight] warning for '" + info.package.path + "':", warning);
	            });
	            info.package.id = descriptor.id;
	            info.package.descriptor = descriptor.combined;

	    		return callback(null, info);
	        });
        });
    }

	var context = new Context();

	try {

		var env = options.env || null;

		env = exports.normalizeEnvironmentVariables(env, {
			PINF_PROGRAM: programDescriptorPath || (env && env.PINF_PROGRAM) || undefined,
			PINF_PACKAGE: packageDescriptorPath || (env && env.PINF_PACKAGE) || undefined
		});

		function loadDescriptor(path, descriptorFound, callback) {

			function ensureExists(callback) {
				return FS.exists(path, function(exists) {
					return callback(null, exists);
				});
			}

			function resolveUri(uri, callback) {
				// If `uri` is relative we make it absolute.
				if (/^\./.test(uri)) {
					uri = PATH.join(PATH.dirname(path), uri);
				}
				// If no descriptor filename specified we append default.
				if (!/\.json$/.test(uri)) {
					uri = PATH.join(uri, PATH.basename(path).replace(".json", ".prototype.json"));
				}
				// If we don't have an absolute path we resolve it against the 'PINF_PACKAGES' paths.
				if (!/^\//.test(uri)) {
					if (!env.PINF_PACKAGES) {
						return callback(new Error("`PINF_PACKAGES` must be set to resolve extends uri '" + uri + "'"));
					}
					var foundPath = null;
					var waitfor = WAITFOR.serial(function(err) {
						if (err) return callback(err);
						return callback(null, foundPath);
					});
					env.PINF_PACKAGES.split(":").forEach(function(packagesPath) {
						waitfor(function(done) {
							if (foundPath) return done();
							var lookupPath = PATH.join(packagesPath, uri);
							return FS.exists(lookupPath, function(exists) {
								if (exists) {
									foundPath = lookupPath;
								}
								return done();
							});
						});
					});
					return waitfor();
				} else {
					return callback(null, uri);
				}
			}

			function loadAugmentAndParseJSON(callback) {
				return FS.readFile(path, function(err, data) {
					if (err) return callback(err);
					var raw = null;
					var obj = null;
					try {
						raw = data.toString();
						// Replace environment variables.
			            // NOTE: We always replace `$__DIRNAME` with the path to the directory holding the descriptor.
			            raw = raw.replace(/\$__DIRNAME/g, options._relpath(PATH.dirname(path)));
						if (options.debug) console.log("[pinf] JSON from '" + path + "': ", raw);
						obj = JSON.parse(raw);
					} catch(err) {
						err.message += " (while parsing '" + path + "')";
						return callback(err);
					}
					if (!obj) return callback(null, raw, null);
					var json = JSON.stringify(obj);
					var waitfor = WAITFOR.parallel(function(err) {
						if (err) return callback(err);
						try {
							if (options.debug) console.log("[pinf] JSON from '" + path + "' after injections: ", json);
							obj = JSON.parse(json);
						} catch(err) {
							err.message += " (while parsing '" + path + "' after injections)";
							return callback(err);
						}
						return callback(null, json, obj);
					});
					var re = /(\["<\-","([^"]*)"\])/g;
					var m = null;
					while(m = re.exec(json)) {
						waitfor(m, function(m, done) {
							return resolveUri(m[2], function(err, injectionPath) {
								if (err) return done(err);
								if (!path) {
									if (options.debug) console.log("[pinf] WARN: Injection uri '" + uri + "' could not be resolved to path!");
									return done();
								}
								return FS.readFile(injectionPath, function(err, raw) {
									if (err) return done(err);
									raw = raw.toString();
									// Replace environment variables.
						            // NOTE: We always replace `$__DIRNAME` with the path to the directory holding the descriptor.
						            raw = raw.replace(/\$__DIRNAME/g, options._relpath(PATH.dirname(injectionPath)));
									if (options.debug) console.log("[pinf] JSON from '" + path + "': ", raw);
									json = json.replace(m[1], raw);
									return done();
								});
							});
						});
					}
					return waitfor();
				});
			}

			function followExtends(parsed, callback) {
				if (!parsed["@extends"]) {
					return callback(null);
				}
				try {
					if (!Array.isArray(parsed["@extends"])) {
						throw new Error("'@extends' value in descriptor '" + path + "' is not an array!");
					}
				} catch(err) {
					return callback(err);
				}
				var waitfor = WAITFOR.serial(callback)
				parsed["@extends"].forEach(function(uri) {
					return waitfor(function(done) {
						return resolveUri(uri, function(err, extendsPath) {
							if (err) return done(err);
							if (!extendsPath) {
								if (options.debug) console.log("[pinf] WARN: Extends uri '" + uri + "' declared in '" + path + "' could not be resolved!");
								return done();
							}
							return loadDescriptor(extendsPath, descriptorFound, done);
						});
					});
				});
				delete parsed["@extends"];
				return waitfor();
			}

			function importEnvVars(parsed, callback) {
				if (!parsed["env"]) {
					return callback(null);
				}
				for (var name in parsed["env"]) {
					if (!/[A-Z_]/.test(name)) {
						return callback(new Error("ENV var '" + name + "' declared in '" + path + "' must follow '[A-Z_]'"));
					}
					if (/^PINF_/.test(name)) {
						return callback(new Error("'PINF_*' ENV var '" + name + "' may not be declared in '" + path + "'"));
					}
					if (/^(CWD)$/.test(name)) {
						return callback(new Error("Reserved ENV var '" + name + "' may not be declared in '" + path + "'"));
					}
					context.env[name] = parsed["env"][name];
				}
				delete parsed["env"];
				return callback(null);
			}

			function recordBinPaths(callback) {
				var binPath = PATH.join(path, "../.bin");
				return FS.exists(binPath, function(exists) {
					if (exists) {
						context.binPaths.unshift(options._relpath(binPath));
					}
					binPath = PATH.join(path, "../bin");
					return FS.exists(binPath, function(exists) {
						if (exists) {
							context.binPaths.unshift(options._relpath(binPath));
						}
						return callback(null);
					});
				});
			}

			if (options.debug) console.log("[pinf] Load JSON from '" + path + "'.");

			context.lookupPaths.unshift(options._relpath(path));

			return ensureExists(function(err, exists) {
				if (err) return callback(err);
				if (!exists) {
					if (options.debug) console.log("[pinf] WARN: Path '" + path + "' does not exist.");
					return callback(null);
				}
				return recordBinPaths(function(err) {
					if (err) return callback(err);
					return loadAugmentAndParseJSON(function(err, raw, parsed) {
						if (err) return callback(err);
						if (!parsed) {
							if (options.debug) console.log("[pinf] WARN: Path '" + path + "' does not contain file with JSON data. Found '" + raw + "'");
							return callback(null);
						}
						return followExtends(parsed, function(err) {
							if (err) return callback(err);
							return importEnvVars(parsed, function(err) {
								if (err) return callback(err);
								descriptorFound(path, parsed);
								return callback(null);
							});
						});
					});
				});
			});
		}

		function loadConfigs(callback) {
			var waitfor = WAITFOR.serial(callback);
			exports.LOOKUP_PATHS.slice(0).reverse().forEach(function(lookup) {
				return waitfor(function(done) {
					var path = lookup[0](env);
					return loadDescriptor(path, function(path, descriptor) {
						context.descriptorPaths.unshift(options._relpath(path));
						if (descriptor.config) {
							context.config.push([descriptor.config, lookup[1]]);
							delete descriptor.config;
						}
						context._descriptors[lookup[1].type] = DEEPMERGE(context._descriptors[lookup[1].type], descriptor);
					}, done);
				});
			});
			return waitfor();
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
			context.config.forEach(function(json) {
				if (json[1].type === "program") {
					if (context.uid && json[0][context.uid]) {
						config = DEEPMERGE(config, json[0][context.uid]);
					}
				} else {
					config = DEEPMERGE(config, json[0]);
				}
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
			if (context._descriptors.package.directories) {
				for (var name in context._descriptors.package.directories) {
					context.paths[name] = PATH.join(context.env.PINF_PACKAGE, "..", context._descriptors.package.directories[name]);
				}
			}
			return callback(null);
		}

		return loadConfigs(function(err) {
			if (err) return callback(err);

			if (context._descriptors.package.uid) {
				context.uid = exports.formatUid(context._descriptors.package.uid);
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

								delete context._descriptors;

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

