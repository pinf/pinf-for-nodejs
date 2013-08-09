
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
		ENV[name] = overrides[name];
	}
	if (!ENV.PINF_PROGRAM && !ENV.CWD) {
		throw new Error("Either `ENV.PINF_PROGRAM` (" + ENV.PINF_PROGRAM + ") or `ENV.CWD` (" + ENV.CWD + ") must be set!");
	}
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


exports.CONFIG_LOOKUP_PATHS = [
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
		configPaths: [],
		binPaths: [],
		descriptor: {}
	};

	try {

		context.env = exports.normalizeEnvironmentVariables(context.env, {
			PINF_PROGRAM: programDescriptorPath,
			PINF_PACKAGE: packageDescriptorPath
		});

		function loadConfigs(callback) {
			var waitfor = WAITFOR.serial(callback);
			exports.CONFIG_LOOKUP_PATHS.forEach(function(lookup) {
				waitfor(function(done) {
					var path = lookup(context.env);
					context.configPaths.push(options._relpath(path));

					// TODO: Use loading logic that follows extends.

					FS.exists(path, function(exists) {
						if (!exists) return done();

						FS.readFile(path, function(err, descriptor) {
							if (err) return done(err);

							try {
								descriptor = JSON.parse(descriptor);
							} catch(err) {
								return done(new Error("Error '" + err.message + "' while parsing JSON from file '" + path + "'"));
							}

							context.descriptor = DEEPMERGE(context.descriptor, descriptor);

							return done();
						});
					});
				});
			});
			waitfor();
		}

		function rerootEnvPaths(callback) {
			[
				"PINF_PROGRAM_PARENT",
				"PINF_PROGRAM",
				"PINF_PACKAGE",
				"PINF_RUNTIME"
			].forEach(function(name) {
				context.env[name] = options._relpath(context.env[name]);
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

