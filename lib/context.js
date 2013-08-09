
const PATH = require("path");
const FS = require("fs");
const WAITFOR = require("waitfor");
const DEEPMERGE = require("deepmerge");


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
	ENV.PINF_RUNTIME = PATH.join(ENV.PINF_PROGRAM_PARENT || ENV.PINF_PROGRAM, "../.rt/program.rt.json");
	//   * The mode the runtime should run it. Will load `program.$PINF_MODE.json`.
	ENV.PINF_MODE = ENV.PINF_MODE || "production";
	return ENV;
}


// Descriptors get merged on top of each other in reverse order.
exports.DESCRIPTOR_LOOKUP_PATHS = [
	//   1) /program.$PINF_MODE.json (~ $PINF_PROGRAM)
	function (ENV) {
		return ENV.PINF_PROGRAM.replace(".json", "." + ENV.PINF_MODE + ".json");
	},
	//   2) /.rt/program.rt.json ($PINF_RUNTIME)
	//		The `rt` descriptor holds the runtime information for this instance of the program. There can always
	//		only be one runtime instance of a program installation. If you want to boot a second, create an
	//		inheriting program descriptor in a new directory and boot it there.
	function (ENV) {
		return ENV.PINF_RUNTIME;
	},
	//   3) /.program.json (~ $PINF_PROGRAM)
	function (ENV) {
		return ENV.PINF_PROGRAM.replace(/\/([^\/]*)$/, "\/.$1");
	},
	//   4) ./.package.json (~ $PINF_PACKAGE)
	function (ENV) {
		return ENV.PINF_PACKAGE.replace(/\/([^\/]*)$/, "\/.$1");
	},
	//   5) /program.json ($PINF_PROGRAM)
	function (ENV) {
		return ENV.PINF_PROGRAM;
	},
	//   6) ./package.json
	function (ENV) {
		return ENV.PINF_PACKAGE;
	},
	//   7) <parent>/program.json ($PINF_PROGRAM_PARENT)
	function (ENV) {
		return ENV.PINF_PROGRAM_PARENT;
	}
];


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

	var context = {
		env: options.env || null,
		descriptorLookupPaths: [],
		descriptorFoundPaths: [],
		binPaths: [],
		descriptor: {}
	};

	try {

		context.env = exports.normalizeEnvironmentVariables(context.env, {
			PINF_PROGRAM: programDescriptorPath || (context.env && context.env.PINF_PROGRAM) || undefined,
			PINF_PACKAGE: packageDescriptorPath || (context.env && context.env.PINF_PACKAGE) || undefined
		});

		function loadDescriptor(path, descriptorFound, callback) {

			function ensureExists(callback) {
				return FS.exists(path, function(exists) {
					return callback(null, exists);
				});
			}

			function loadAugmentAndParseJSON(callback) {
				FS.readFile(path, function(err, data) {
					if (err) return callback(err);
					var json = null;
					var obj = null;
					try {
						json = data.toString();
						// Replace environment variables.
			            // NOTE: We always replace `$__DIRNAME` with the path to the directory holding the descriptor.
			            json = json.replace(/\$__DIRNAME/g, options._relpath(PATH.dirname(path)));
						if (options.debug) console.log("[pinf] JSON from '" + path + "': ", json);
						obj = JSON.parse(json);
					} catch(err) {
						err.message += " (while parsing '" + path + "')";
						return callback(err);
					}
					if (!obj) return callback(null, json, null);
					return callback(null, json, obj);
				});
			}

			function followExtends(parsed, callback) {
				if (!parsed["@extends"]) {
					return callback(null);
				}
				try {
					if (typeof parsed["@extends"].forEach !== "function") {
						throw new Error("'@extends' value in descriptor '" + path + "' is not an array!");
					}
				} catch(err) {
					return callback(err);
				}
				var waitfor = WAITFOR.serial(callback)
				parsed["@extends"].forEach(function(uri) {
					waitfor(function(done) {
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
							if (!context.env.PINF_PACKAGES) {
								throw new Error("`PINF_PACKAGES` must be set to resolve extends uri '" + uri + "'");
							}
							var waitfor = WAITFOR.serial(done);
							var found = false;
							context.env.PINF_PACKAGES.split(":").forEach(function(packagesPath) {
								waitfor(function(done) {
									if (found) return;
									return loadDescriptor(PATH.join(packagesPath, uri), function(path, descriptor) {
										found = true;
										return descriptorFound(path, descriptor);
									}, done);
								});
							});
							return waitfor();
						} else {
							return loadDescriptor(uri, descriptorFound, done);
						}
					});
				});
				delete parsed["@extends"];
				return waitfor();
			}

			if (options.debug) console.log("[pinf] Load JSON from '" + path + "'.");

			return ensureExists(function(err, exists) {
				if (err) return callback(err);
				if (!exists) {
					if (options.debug) console.log("[pinf] WARN: Path '" + path + "' does not exist.");
					return callback(null);
				}
				return loadAugmentAndParseJSON(function(err, raw, parsed) {
					if (err) return callback(err);
					if (!parsed) {
						if (options.debug) console.log("[pinf] WARN: Path '" + path + "' does not contain file with JSON data. Found '" + raw + "'");
						return callback(null);
					}
					return followExtends(parsed, function(err) {
						if (err) return callback(err);
						descriptorFound(path, parsed);
						return callback(null);
					});
				});
			});

		}

		function loadConfigs(callback) {
			var waitfor = WAITFOR.serial(callback);
			exports.DESCRIPTOR_LOOKUP_PATHS.slice(0).reverse().forEach(function(lookup) {
				return waitfor(function(done) {
					var path = lookup(context.env);
					context.descriptorLookupPaths.unshift(options._relpath(path));
					return loadDescriptor(path, function(path, descriptor) {
						context.descriptorFoundPaths.unshift(options._relpath(path));
						context.descriptor = DEEPMERGE(context.descriptor, descriptor);
					}, done);
				});
			});
			return waitfor();
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

		return loadConfigs(function(err) {
			if (err) return callback(err);

			return rerootEnvPaths(function(err) {
				if (err) return callback(err);

				return callback(null, context);
			});
		});

	} catch(err) {
		return callback(err);
	}
}

