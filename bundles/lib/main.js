// @pinf-bundle-ignore: 
PINF.bundle("", function(require) {
// @pinf-bundle-module: {"file":"lib/main.js","mtime":1406263191,"wrapper":"commonjs","format":"commonjs","id":"/lib/main.js"}
require.memoize("/lib/main.js", 
function(require, exports, module) {var __dirname = 'lib';

require("require.async")(require);

const PATH = require("__SYSTEM__/path");


exports.main = function(main, module, options, callback) {
	if (typeof module === "function" && typeof options === "undefined" && typeof callback === "undefined") {
		callback = module;
		module = null;
	}
	if (typeof options === "function" && typeof callback === "undefined") {
		callback = options;
		options = null;
	}

	options = options || {};

	function done(err) {
		if (callback) {
			try {
				return callback.apply(null, arguments);
			} catch(err) {
                console.error(err.stack);
	            process.exit(1);
			}
		}
        if (err) {
            if (err !== true) {
                console.error(err.stack);
            }
            if (typeof arguments[1] !== "object" || arguments[1].EXIT !== false) process.exit(1);
        }
        if (typeof arguments[1] !== "object" || arguments[1].EXIT !== false) process.exit(0);
	}
	if (!module) {
	    try {
			var ret = main(done);
			// If main function returns `true` we exit and don't wait for `done` callback.
			if (ret === true) {
				return done(null);
			}
			return;
	    } catch(err) {
	        return done(err);
	    }
	}

	module.exports.main = main;

	// Don't call app unless it is the main file loaded or there is a callback registered.
	if (require.main !== module && !callback) {
		return;
	}

	// TODO: module.pinf should be set and memoized in bundle based on the program context and available at `module.pinf`.
	if (typeof module.pinf === "object") {
		return callback(null, module.pinf);
	}

	// TODO: Only continue below if no context found in cache.
	//       Only load cache module and determine cache path by looking at PINF_RUNTIME and own package uid (use pinf-primitives-js to do this).
	//		 Cache module is in primitives package as well.
	return require.async("./context", function(CONTEXT) {

		var opts = {};
		for (var name in options) {
			opts[name] = options[name];
		}

		if (typeof opts.PINF_PROGRAM === "undefined") {
			opts.PINF_PROGRAM = PATH.join(__dirname, "program.json");
		}
		if (typeof options.PINF_RUNTIME === "undefined") {
	        opts.PINF_RUNTIME = "";
	    }

		return CONTEXT.contextForModule(module, opts, function(err, context) {
			if (err) return done(err);
		    try {
		    	var opts = {};
		    	for (var name in options) {
		    		opts[name] = options[name];
		    	}
		    	opts.$pinf = context;
				var ret = main(opts, done);
				if (ret === true) {
					return done(null);
				}
				return;
		    } catch(err) {
		        return done(err);
		    }		
		});
	}, done);
}

}
, {"filename":"lib/main.js"});
// @pinf-bundle-module: {"file":"node_modules/require.async/require.async.js","mtime":1402713829,"wrapper":"commonjs/leaky","format":"leaky","id":"437ef8aee826325a41c701ca21e78f84f35ff9f1-require.async/require.async.js"}
require.memoize("437ef8aee826325a41c701ca21e78f84f35ff9f1-require.async/require.async.js", 
function(require, exports, module) {var __dirname = 'node_modules/require.async';
/**
 * Author: Christoph Dorn <christoph@christophdorn.com>
 * [UNLICENSE](http://unlicense.org/)
 */

module.exports = function(require) {

	// We only add the method if it is not already there.
	if (typeof require.async !== "undefined") {
		return;
	}

	// We add the portable `require.async` method.
	require.async = function(id, successCallback, errorCallback) {
		var exports = null;
		try {
			exports = require(id);
		} catch(err) {
			if (typeof errorCallback === "function") {
				errorCallback(err);
			}
			return;
		}
		successCallback(exports);
		return;
	}

}

return {
    module: (typeof module !== "undefined") ? module : null
};
}
, {"filename":"node_modules/require.async/require.async.js"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"/package.json"}
require.memoize("/package.json", 
{
    "main": "/lib/pinf.js",
    "mappings": {
        "require.async": "437ef8aee826325a41c701ca21e78f84f35ff9f1-require.async",
        "fs-extra": "b98063a15c6bafaefa93c7f701af192d69a9efd8-fs-extra",
        "waitfor": "416bf2c65cd8db6a197939f8a9c5b953245a0d2f-waitfor",
        "deepmerge": "1e29e18e148032301f32032281a983e3f4419e8a-deepmerge",
        "deepcopy": "11124220cd02b820fdc3ab7d0acdcfd08a720fbe-deepcopy",
        "pinf-primitives-js": "cf11d4f040476e26b811c17d7a25673b6a6f6e86-pinf-primitives-js",
        "pinf-it-package-insight": "79c3886f38d246eca26d997a4cde1dc621d53b56-pinf-it-package-insight",
        "pinf-it-program-insight": "4cbfcf3a6f76b102c8abe5ac9f4f68bc773ef413-pinf-it-program-insight",
        "pinf-it-bundler": "d410d765c4a91b52828ad9d1eba8d92a9eb81b63-pinf-it-bundler",
        "request": "ed4bb06796db1905581e7b400da006dd7b8b1b55-request",
        "pinf-loader-js": "46436413248440678ad5c9378e5dd00081b623bd-pinf-loader-js",
        "pinf-vfs": "59286364ebdd2811b0b95c9a3a98aff6543fdb23-pinf-vfs"
    },
    "dirpath": "."
}
, {"filename":"./package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"437ef8aee826325a41c701ca21e78f84f35ff9f1-require.async/package.json"}
require.memoize("437ef8aee826325a41c701ca21e78f84f35ff9f1-require.async/package.json", 
{
    "main": "437ef8aee826325a41c701ca21e78f84f35ff9f1-require.async/require.async.js",
    "dirpath": "node_modules/require.async"
}
, {"filename":"node_modules/require.async/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"b98063a15c6bafaefa93c7f701af192d69a9efd8-fs-extra/package.json"}
require.memoize("b98063a15c6bafaefa93c7f701af192d69a9efd8-fs-extra/package.json", 
{
    "main": "b98063a15c6bafaefa93c7f701af192d69a9efd8-fs-extra/lib/index.js",
    "mappings": {
        "jsonfile": "d5ba5d20168aa9175f55feda3f60aab1a6ace818-jsonfile",
        "mkdirp": "693ec9cb1f2f61428c63e9cd17e57775f4df0f74-mkdirp",
        "ncp": "c99227b03d285ab9292c0748af53c56ffc9ac859-ncp",
        "rimraf": "16117a71d212e842209fc0336b7b2cf0572a5023-rimraf"
    },
    "dirpath": "node_modules/fs-extra"
}
, {"filename":"node_modules/fs-extra/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"d5ba5d20168aa9175f55feda3f60aab1a6ace818-jsonfile/package.json"}
require.memoize("d5ba5d20168aa9175f55feda3f60aab1a6ace818-jsonfile/package.json", 
{
    "main": "d5ba5d20168aa9175f55feda3f60aab1a6ace818-jsonfile/lib/jsonfile.js",
    "dirpath": "node_modules/fs-extra/node_modules/jsonfile"
}
, {"filename":"node_modules/fs-extra/node_modules/jsonfile/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"693ec9cb1f2f61428c63e9cd17e57775f4df0f74-mkdirp/package.json"}
require.memoize("693ec9cb1f2f61428c63e9cd17e57775f4df0f74-mkdirp/package.json", 
{
    "main": "693ec9cb1f2f61428c63e9cd17e57775f4df0f74-mkdirp/index.js",
    "dirpath": "node_modules/fs-extra/node_modules/mkdirp"
}
, {"filename":"node_modules/fs-extra/node_modules/mkdirp/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"c99227b03d285ab9292c0748af53c56ffc9ac859-ncp/package.json"}
require.memoize("c99227b03d285ab9292c0748af53c56ffc9ac859-ncp/package.json", 
{
    "main": "c99227b03d285ab9292c0748af53c56ffc9ac859-ncp/lib/ncp.js",
    "dirpath": "node_modules/fs-extra/node_modules/ncp"
}
, {"filename":"node_modules/fs-extra/node_modules/ncp/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"16117a71d212e842209fc0336b7b2cf0572a5023-rimraf/package.json"}
require.memoize("16117a71d212e842209fc0336b7b2cf0572a5023-rimraf/package.json", 
{
    "main": "16117a71d212e842209fc0336b7b2cf0572a5023-rimraf/rimraf.js",
    "mappings": {
        "graceful-fs": "8221f2fbd3f3ff50c6ef3876a188d48a8e78bc6e-graceful-fs"
    },
    "dirpath": "node_modules/fs-extra/node_modules/rimraf"
}
, {"filename":"node_modules/fs-extra/node_modules/rimraf/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"8221f2fbd3f3ff50c6ef3876a188d48a8e78bc6e-graceful-fs/package.json"}
require.memoize("8221f2fbd3f3ff50c6ef3876a188d48a8e78bc6e-graceful-fs/package.json", 
{
    "main": "8221f2fbd3f3ff50c6ef3876a188d48a8e78bc6e-graceful-fs/graceful-fs.js",
    "dirpath": "node_modules/fs-extra/node_modules/rimraf/node_modules/graceful-fs"
}
, {"filename":"node_modules/fs-extra/node_modules/rimraf/node_modules/graceful-fs/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"416bf2c65cd8db6a197939f8a9c5b953245a0d2f-waitfor/package.json"}
require.memoize("416bf2c65cd8db6a197939f8a9c5b953245a0d2f-waitfor/package.json", 
{
    "main": "416bf2c65cd8db6a197939f8a9c5b953245a0d2f-waitfor/waitfor.js",
    "mappings": {
        "setimmediate": "d97aab55e5515ebe14ba51f391cbdd9594d439b4-setimmediate"
    },
    "dirpath": "node_modules/waitfor"
}
, {"filename":"node_modules/waitfor/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"d97aab55e5515ebe14ba51f391cbdd9594d439b4-setimmediate/package.json"}
require.memoize("d97aab55e5515ebe14ba51f391cbdd9594d439b4-setimmediate/package.json", 
{
    "main": "d97aab55e5515ebe14ba51f391cbdd9594d439b4-setimmediate/setImmediate.js",
    "dirpath": "node_modules/waitfor/node_modules/setimmediate"
}
, {"filename":"node_modules/waitfor/node_modules/setimmediate/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"1e29e18e148032301f32032281a983e3f4419e8a-deepmerge/package.json"}
require.memoize("1e29e18e148032301f32032281a983e3f4419e8a-deepmerge/package.json", 
{
    "main": "1e29e18e148032301f32032281a983e3f4419e8a-deepmerge/index.js",
    "dirpath": "node_modules/deepmerge"
}
, {"filename":"node_modules/deepmerge/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"11124220cd02b820fdc3ab7d0acdcfd08a720fbe-deepcopy/package.json"}
require.memoize("11124220cd02b820fdc3ab7d0acdcfd08a720fbe-deepcopy/package.json", 
{
    "main": "11124220cd02b820fdc3ab7d0acdcfd08a720fbe-deepcopy/index.js",
    "dirpath": "node_modules/deepcopy"
}
, {"filename":"node_modules/deepcopy/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"cf11d4f040476e26b811c17d7a25673b6a6f6e86-pinf-primitives-js/package.json"}
require.memoize("cf11d4f040476e26b811c17d7a25673b6a6f6e86-pinf-primitives-js/package.json", 
{
    "main": "cf11d4f040476e26b811c17d7a25673b6a6f6e86-pinf-primitives-js/primitives.js",
    "mappings": {
        "deepcopy": "eafb2f714c137c3736413fb656256f9934d33fd0-deepcopy"
    },
    "dirpath": "node_modules/pinf-primitives-js"
}
, {"filename":"node_modules/pinf-primitives-js/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"eafb2f714c137c3736413fb656256f9934d33fd0-deepcopy/package.json"}
require.memoize("eafb2f714c137c3736413fb656256f9934d33fd0-deepcopy/package.json", 
{
    "main": "eafb2f714c137c3736413fb656256f9934d33fd0-deepcopy/index.js",
    "dirpath": "node_modules/pinf-primitives-js/node_modules/deepcopy"
}
, {"filename":"node_modules/pinf-primitives-js/node_modules/deepcopy/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"79c3886f38d246eca26d997a4cde1dc621d53b56-pinf-it-package-insight/package.json"}
require.memoize("79c3886f38d246eca26d997a4cde1dc621d53b56-pinf-it-package-insight/package.json", 
{
    "main": "79c3886f38d246eca26d997a4cde1dc621d53b56-pinf-it-package-insight/lib/package-insight.js",
    "mappings": {
        "waitfor": "b47b8b5412ba5444d612817b30a850531212beaa-waitfor",
        "deepmerge": "2c1d755491aedceacf51d503e759c39acae8d22b-deepmerge",
        "pinf-primitives-js": "f0247bd4db3455e18d3a8b85995b20ee229a444e-pinf-primitives-js"
    },
    "dirpath": "node_modules/pinf-it-package-insight"
}
, {"filename":"node_modules/pinf-it-package-insight/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"b47b8b5412ba5444d612817b30a850531212beaa-waitfor/package.json"}
require.memoize("b47b8b5412ba5444d612817b30a850531212beaa-waitfor/package.json", 
{
    "main": "b47b8b5412ba5444d612817b30a850531212beaa-waitfor/waitfor.js",
    "mappings": {
        "setimmediate": "79635a6d167e3788c94082e2a683daae6b65a52f-setimmediate"
    },
    "dirpath": "node_modules/pinf-it-package-insight/node_modules/waitfor"
}
, {"filename":"node_modules/pinf-it-package-insight/node_modules/waitfor/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"79635a6d167e3788c94082e2a683daae6b65a52f-setimmediate/package.json"}
require.memoize("79635a6d167e3788c94082e2a683daae6b65a52f-setimmediate/package.json", 
{
    "main": "79635a6d167e3788c94082e2a683daae6b65a52f-setimmediate/setImmediate.js",
    "dirpath": "node_modules/pinf-it-package-insight/node_modules/waitfor/node_modules/setimmediate"
}
, {"filename":"node_modules/pinf-it-package-insight/node_modules/waitfor/node_modules/setimmediate/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"2c1d755491aedceacf51d503e759c39acae8d22b-deepmerge/package.json"}
require.memoize("2c1d755491aedceacf51d503e759c39acae8d22b-deepmerge/package.json", 
{
    "main": "2c1d755491aedceacf51d503e759c39acae8d22b-deepmerge/index.js",
    "dirpath": "node_modules/pinf-it-package-insight/node_modules/deepmerge"
}
, {"filename":"node_modules/pinf-it-package-insight/node_modules/deepmerge/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"f0247bd4db3455e18d3a8b85995b20ee229a444e-pinf-primitives-js/package.json"}
require.memoize("f0247bd4db3455e18d3a8b85995b20ee229a444e-pinf-primitives-js/package.json", 
{
    "main": "f0247bd4db3455e18d3a8b85995b20ee229a444e-pinf-primitives-js/primitives.js",
    "mappings": {
        "deepcopy": "19936d7f3a2057ed0d18b5e73b43ef38228a01d5-deepcopy"
    },
    "dirpath": "node_modules/pinf-it-package-insight/node_modules/pinf-primitives-js"
}
, {"filename":"node_modules/pinf-it-package-insight/node_modules/pinf-primitives-js/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"19936d7f3a2057ed0d18b5e73b43ef38228a01d5-deepcopy/package.json"}
require.memoize("19936d7f3a2057ed0d18b5e73b43ef38228a01d5-deepcopy/package.json", 
{
    "main": "19936d7f3a2057ed0d18b5e73b43ef38228a01d5-deepcopy/index.js",
    "dirpath": "node_modules/pinf-it-package-insight/node_modules/pinf-primitives-js/node_modules/deepcopy"
}
, {"filename":"node_modules/pinf-it-package-insight/node_modules/pinf-primitives-js/node_modules/deepcopy/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"4cbfcf3a6f76b102c8abe5ac9f4f68bc773ef413-pinf-it-program-insight/package.json"}
require.memoize("4cbfcf3a6f76b102c8abe5ac9f4f68bc773ef413-pinf-it-program-insight/package.json", 
{
    "main": "4cbfcf3a6f76b102c8abe5ac9f4f68bc773ef413-pinf-it-program-insight/lib/program-insight.js",
    "mappings": {
        "waitfor": "66d3683d7013a79bb4c005c22b4fa1669544f2b8-waitfor",
        "deepmerge": "37163795207a847516701e38c945479553ee3980-deepmerge",
        "deepcopy": "9864f565e5fd5852df682a6003662ef79124a083-deepcopy",
        "pinf-it-package-insight": "930bd0ef3346030aef4ddac6eaadb8cd4d7a0d71-pinf-it-package-insight"
    },
    "dirpath": "node_modules/pinf-it-program-insight"
}
, {"filename":"node_modules/pinf-it-program-insight/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"66d3683d7013a79bb4c005c22b4fa1669544f2b8-waitfor/package.json"}
require.memoize("66d3683d7013a79bb4c005c22b4fa1669544f2b8-waitfor/package.json", 
{
    "main": "66d3683d7013a79bb4c005c22b4fa1669544f2b8-waitfor/waitfor.js",
    "mappings": {
        "setimmediate": "7e1ba632666e1c02662bc07f0c44e6a69966a710-setimmediate"
    },
    "dirpath": "node_modules/pinf-it-program-insight/node_modules/waitfor"
}
, {"filename":"node_modules/pinf-it-program-insight/node_modules/waitfor/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"7e1ba632666e1c02662bc07f0c44e6a69966a710-setimmediate/package.json"}
require.memoize("7e1ba632666e1c02662bc07f0c44e6a69966a710-setimmediate/package.json", 
{
    "main": "7e1ba632666e1c02662bc07f0c44e6a69966a710-setimmediate/setImmediate.js",
    "dirpath": "node_modules/pinf-it-program-insight/node_modules/waitfor/node_modules/setimmediate"
}
, {"filename":"node_modules/pinf-it-program-insight/node_modules/waitfor/node_modules/setimmediate/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"37163795207a847516701e38c945479553ee3980-deepmerge/package.json"}
require.memoize("37163795207a847516701e38c945479553ee3980-deepmerge/package.json", 
{
    "main": "37163795207a847516701e38c945479553ee3980-deepmerge/index.js",
    "dirpath": "node_modules/pinf-it-program-insight/node_modules/deepmerge"
}
, {"filename":"node_modules/pinf-it-program-insight/node_modules/deepmerge/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"9864f565e5fd5852df682a6003662ef79124a083-deepcopy/package.json"}
require.memoize("9864f565e5fd5852df682a6003662ef79124a083-deepcopy/package.json", 
{
    "main": "9864f565e5fd5852df682a6003662ef79124a083-deepcopy/index.js",
    "dirpath": "node_modules/pinf-it-program-insight/node_modules/deepcopy"
}
, {"filename":"node_modules/pinf-it-program-insight/node_modules/deepcopy/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"930bd0ef3346030aef4ddac6eaadb8cd4d7a0d71-pinf-it-package-insight/package.json"}
require.memoize("930bd0ef3346030aef4ddac6eaadb8cd4d7a0d71-pinf-it-package-insight/package.json", 
{
    "main": "930bd0ef3346030aef4ddac6eaadb8cd4d7a0d71-pinf-it-package-insight/lib/package-insight.js",
    "mappings": {
        "waitfor": "8472926e40af7076aa93a0be9472b8a5e6231e19-waitfor",
        "deepmerge": "d737807c5f70ac4bddf331ad4d023a9a0a22c166-deepmerge",
        "pinf-primitives-js": "78c325ed1929112310e192c92ac8f6785d8a10ee-pinf-primitives-js"
    },
    "dirpath": "node_modules/pinf-it-program-insight/node_modules/pinf-it-package-insight"
}
, {"filename":"node_modules/pinf-it-program-insight/node_modules/pinf-it-package-insight/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"8472926e40af7076aa93a0be9472b8a5e6231e19-waitfor/package.json"}
require.memoize("8472926e40af7076aa93a0be9472b8a5e6231e19-waitfor/package.json", 
{
    "main": "8472926e40af7076aa93a0be9472b8a5e6231e19-waitfor/waitfor.js",
    "mappings": {
        "setimmediate": "afcebeaa4f1db93e6952b75ccdb1fc749a7b0618-setimmediate"
    },
    "dirpath": "node_modules/pinf-it-program-insight/node_modules/pinf-it-package-insight/node_modules/waitfor"
}
, {"filename":"node_modules/pinf-it-program-insight/node_modules/pinf-it-package-insight/node_modules/waitfor/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"afcebeaa4f1db93e6952b75ccdb1fc749a7b0618-setimmediate/package.json"}
require.memoize("afcebeaa4f1db93e6952b75ccdb1fc749a7b0618-setimmediate/package.json", 
{
    "main": "afcebeaa4f1db93e6952b75ccdb1fc749a7b0618-setimmediate/setImmediate.js",
    "dirpath": "node_modules/pinf-it-program-insight/node_modules/pinf-it-package-insight/node_modules/waitfor/node_modules/setimmediate"
}
, {"filename":"node_modules/pinf-it-program-insight/node_modules/pinf-it-package-insight/node_modules/waitfor/node_modules/setimmediate/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"d737807c5f70ac4bddf331ad4d023a9a0a22c166-deepmerge/package.json"}
require.memoize("d737807c5f70ac4bddf331ad4d023a9a0a22c166-deepmerge/package.json", 
{
    "main": "d737807c5f70ac4bddf331ad4d023a9a0a22c166-deepmerge/index.js",
    "dirpath": "node_modules/pinf-it-program-insight/node_modules/pinf-it-package-insight/node_modules/deepmerge"
}
, {"filename":"node_modules/pinf-it-program-insight/node_modules/pinf-it-package-insight/node_modules/deepmerge/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"78c325ed1929112310e192c92ac8f6785d8a10ee-pinf-primitives-js/package.json"}
require.memoize("78c325ed1929112310e192c92ac8f6785d8a10ee-pinf-primitives-js/package.json", 
{
    "main": "78c325ed1929112310e192c92ac8f6785d8a10ee-pinf-primitives-js/primitives.js",
    "mappings": {
        "deepcopy": "89ca7637aefdb9a8a221e4aa29808f03121486db-deepcopy"
    },
    "dirpath": "node_modules/pinf-it-program-insight/node_modules/pinf-it-package-insight/node_modules/pinf-primitives-js"
}
, {"filename":"node_modules/pinf-it-program-insight/node_modules/pinf-it-package-insight/node_modules/pinf-primitives-js/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"89ca7637aefdb9a8a221e4aa29808f03121486db-deepcopy/package.json"}
require.memoize("89ca7637aefdb9a8a221e4aa29808f03121486db-deepcopy/package.json", 
{
    "main": "89ca7637aefdb9a8a221e4aa29808f03121486db-deepcopy/index.js",
    "dirpath": "node_modules/pinf-it-program-insight/node_modules/pinf-it-package-insight/node_modules/pinf-primitives-js/node_modules/deepcopy"
}
, {"filename":"node_modules/pinf-it-program-insight/node_modules/pinf-it-package-insight/node_modules/pinf-primitives-js/node_modules/deepcopy/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"d410d765c4a91b52828ad9d1eba8d92a9eb81b63-pinf-it-bundler/package.json"}
require.memoize("d410d765c4a91b52828ad9d1eba8d92a9eb81b63-pinf-it-bundler/package.json", 
{
    "main": "d410d765c4a91b52828ad9d1eba8d92a9eb81b63-pinf-it-bundler/lib/bundler.js",
    "mappings": {
        "fs-extra": "aaad36e42c345004146d6700e0b748d91e9a427b-fs-extra",
        "q": "9a670412d07e21d69cd1a1e71443738a2abe1c7a-q",
        "deepcopy": "f21c0f6ca204bc2971fa61943a3130cd4ecbff7b-deepcopy",
        "waitfor": "cd142f54508896ed284ac95205675d15d40ae2db-waitfor",
        "pinf-it-module-insight": "b930ebdd389f52ad47542b825bd2fb6705f2a6d4-pinf-it-module-insight",
        "pinf-it-package-insight": "b357eaf1268ffeb8ba51bc0ea7cf154db5841df7-pinf-it-package-insight",
        "pinf-loader-js": "19418dae005c4d23567770942bd446bf4ab98489-pinf-loader-js",
        "requirejs": "3cbdeaccfdb4ad426e3df4d62ea14ab7520b6fa7-requirejs",
        "browser-builtins": "5ffbe8b6d730bb97f4962540bf61cb0e2f6ecc6e-browser-builtins",
        "colors": "835808d4d2aa99ffb0289769d0c56dbe3d47a2b0-colors"
    },
    "dirpath": "node_modules/pinf-it-bundler"
}
, {"filename":"node_modules/pinf-it-bundler/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"aaad36e42c345004146d6700e0b748d91e9a427b-fs-extra/package.json"}
require.memoize("aaad36e42c345004146d6700e0b748d91e9a427b-fs-extra/package.json", 
{
    "main": "aaad36e42c345004146d6700e0b748d91e9a427b-fs-extra/lib/index.js",
    "mappings": {
        "jsonfile": "375b58e4b0b018f631e32090e7afa59ce1282532-jsonfile",
        "mkdirp": "7c01aa8372c61eb574da9a22387f282308ef60e2-mkdirp",
        "ncp": "24a0e61368c63d4b8f25b1abc99a630fc0bb12dd-ncp",
        "rimraf": "a6aa5994e4c63bdbb2df21f7d70c450d9569e863-rimraf"
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/fs-extra"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/fs-extra/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"375b58e4b0b018f631e32090e7afa59ce1282532-jsonfile/package.json"}
require.memoize("375b58e4b0b018f631e32090e7afa59ce1282532-jsonfile/package.json", 
{
    "main": "375b58e4b0b018f631e32090e7afa59ce1282532-jsonfile/lib/jsonfile.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/fs-extra/node_modules/jsonfile"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/fs-extra/node_modules/jsonfile/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"7c01aa8372c61eb574da9a22387f282308ef60e2-mkdirp/package.json"}
require.memoize("7c01aa8372c61eb574da9a22387f282308ef60e2-mkdirp/package.json", 
{
    "main": "7c01aa8372c61eb574da9a22387f282308ef60e2-mkdirp/index.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/fs-extra/node_modules/mkdirp"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/fs-extra/node_modules/mkdirp/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"24a0e61368c63d4b8f25b1abc99a630fc0bb12dd-ncp/package.json"}
require.memoize("24a0e61368c63d4b8f25b1abc99a630fc0bb12dd-ncp/package.json", 
{
    "main": "24a0e61368c63d4b8f25b1abc99a630fc0bb12dd-ncp/lib/ncp.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/fs-extra/node_modules/ncp"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/fs-extra/node_modules/ncp/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"a6aa5994e4c63bdbb2df21f7d70c450d9569e863-rimraf/package.json"}
require.memoize("a6aa5994e4c63bdbb2df21f7d70c450d9569e863-rimraf/package.json", 
{
    "main": "a6aa5994e4c63bdbb2df21f7d70c450d9569e863-rimraf/rimraf.js",
    "mappings": {
        "graceful-fs": "fef38679b0341693c4a10a27ccd6ac889a929ecb-graceful-fs"
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/fs-extra/node_modules/rimraf"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/fs-extra/node_modules/rimraf/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"fef38679b0341693c4a10a27ccd6ac889a929ecb-graceful-fs/package.json"}
require.memoize("fef38679b0341693c4a10a27ccd6ac889a929ecb-graceful-fs/package.json", 
{
    "main": "fef38679b0341693c4a10a27ccd6ac889a929ecb-graceful-fs/graceful-fs.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/fs-extra/node_modules/rimraf/node_modules/graceful-fs"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/fs-extra/node_modules/rimraf/node_modules/graceful-fs/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"9a670412d07e21d69cd1a1e71443738a2abe1c7a-q/package.json"}
require.memoize("9a670412d07e21d69cd1a1e71443738a2abe1c7a-q/package.json", 
{
    "main": "9a670412d07e21d69cd1a1e71443738a2abe1c7a-q/q.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/q"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/q/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"f21c0f6ca204bc2971fa61943a3130cd4ecbff7b-deepcopy/package.json"}
require.memoize("f21c0f6ca204bc2971fa61943a3130cd4ecbff7b-deepcopy/package.json", 
{
    "main": "f21c0f6ca204bc2971fa61943a3130cd4ecbff7b-deepcopy/index.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/deepcopy"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/deepcopy/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"cd142f54508896ed284ac95205675d15d40ae2db-waitfor/package.json"}
require.memoize("cd142f54508896ed284ac95205675d15d40ae2db-waitfor/package.json", 
{
    "main": "cd142f54508896ed284ac95205675d15d40ae2db-waitfor/waitfor.js",
    "mappings": {
        "setimmediate": "e54b8deaab99fd8bc58c98ae31246f336361173d-setimmediate"
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/waitfor"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/waitfor/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"e54b8deaab99fd8bc58c98ae31246f336361173d-setimmediate/package.json"}
require.memoize("e54b8deaab99fd8bc58c98ae31246f336361173d-setimmediate/package.json", 
{
    "main": "e54b8deaab99fd8bc58c98ae31246f336361173d-setimmediate/setImmediate.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/waitfor/node_modules/setimmediate"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/waitfor/node_modules/setimmediate/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"b930ebdd389f52ad47542b825bd2fb6705f2a6d4-pinf-it-module-insight/package.json"}
require.memoize("b930ebdd389f52ad47542b825bd2fb6705f2a6d4-pinf-it-module-insight/package.json", 
{
    "main": "b930ebdd389f52ad47542b825bd2fb6705f2a6d4-pinf-it-module-insight/lib/module-insight.js",
    "mappings": {
        "fs-extra": "f7c12608d0fd487794fea1deb542ad50d2728a54-fs-extra",
        "jslint": "319ba4b07dcb331f70363d5d43d90236f1aabe48-jslint",
        "esprima": "4ab8fcc23d7355653b8487f8c160afd934108bc7-esprima"
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"f7c12608d0fd487794fea1deb542ad50d2728a54-fs-extra/package.json"}
require.memoize("f7c12608d0fd487794fea1deb542ad50d2728a54-fs-extra/package.json", 
{
    "main": "f7c12608d0fd487794fea1deb542ad50d2728a54-fs-extra/lib/index.js",
    "mappings": {
        "jsonfile": "3a2b7d8a5f0e346d8b3b4d4c85331998189591b3-jsonfile",
        "mkdirp": "6232d8487687e47d3d463707278017d6fab5ac53-mkdirp",
        "ncp": "b4e974f39ddef18388b73bcc34fe529a20cd66ae-ncp",
        "rimraf": "d27360686edcec5363287069bb5f6c7a494be302-rimraf"
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/fs-extra"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/fs-extra/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"3a2b7d8a5f0e346d8b3b4d4c85331998189591b3-jsonfile/package.json"}
require.memoize("3a2b7d8a5f0e346d8b3b4d4c85331998189591b3-jsonfile/package.json", 
{
    "main": "3a2b7d8a5f0e346d8b3b4d4c85331998189591b3-jsonfile/lib/jsonfile.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/fs-extra/node_modules/jsonfile"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/fs-extra/node_modules/jsonfile/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"6232d8487687e47d3d463707278017d6fab5ac53-mkdirp/package.json"}
require.memoize("6232d8487687e47d3d463707278017d6fab5ac53-mkdirp/package.json", 
{
    "main": "6232d8487687e47d3d463707278017d6fab5ac53-mkdirp/index.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/fs-extra/node_modules/mkdirp"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/fs-extra/node_modules/mkdirp/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"b4e974f39ddef18388b73bcc34fe529a20cd66ae-ncp/package.json"}
require.memoize("b4e974f39ddef18388b73bcc34fe529a20cd66ae-ncp/package.json", 
{
    "main": "b4e974f39ddef18388b73bcc34fe529a20cd66ae-ncp/lib/ncp.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/fs-extra/node_modules/ncp"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/fs-extra/node_modules/ncp/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"d27360686edcec5363287069bb5f6c7a494be302-rimraf/package.json"}
require.memoize("d27360686edcec5363287069bb5f6c7a494be302-rimraf/package.json", 
{
    "main": "d27360686edcec5363287069bb5f6c7a494be302-rimraf/rimraf.js",
    "mappings": {
        "graceful-fs": "952ad1ee915976e87a0189016b22e1952357bf87-graceful-fs"
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/fs-extra/node_modules/rimraf"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/fs-extra/node_modules/rimraf/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"952ad1ee915976e87a0189016b22e1952357bf87-graceful-fs/package.json"}
require.memoize("952ad1ee915976e87a0189016b22e1952357bf87-graceful-fs/package.json", 
{
    "main": "952ad1ee915976e87a0189016b22e1952357bf87-graceful-fs/graceful-fs.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/fs-extra/node_modules/rimraf/node_modules/graceful-fs"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/fs-extra/node_modules/rimraf/node_modules/graceful-fs/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"319ba4b07dcb331f70363d5d43d90236f1aabe48-jslint/package.json"}
require.memoize("319ba4b07dcb331f70363d5d43d90236f1aabe48-jslint/package.json", 
{
    "main": "319ba4b07dcb331f70363d5d43d90236f1aabe48-jslint/lib/nodelint.js",
    "directories": {
        "lib": "lib"
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/jslint"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/jslint/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"4ab8fcc23d7355653b8487f8c160afd934108bc7-esprima/package.json"}
require.memoize("4ab8fcc23d7355653b8487f8c160afd934108bc7-esprima/package.json", 
{
    "main": "4ab8fcc23d7355653b8487f8c160afd934108bc7-esprima/esprima.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/esprima"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-module-insight/node_modules/esprima/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"b357eaf1268ffeb8ba51bc0ea7cf154db5841df7-pinf-it-package-insight/package.json"}
require.memoize("b357eaf1268ffeb8ba51bc0ea7cf154db5841df7-pinf-it-package-insight/package.json", 
{
    "main": "b357eaf1268ffeb8ba51bc0ea7cf154db5841df7-pinf-it-package-insight/lib/package-insight.js",
    "mappings": {
        "waitfor": "80672231e691f27ae80929b46825c4500fefae2d-waitfor",
        "deepmerge": "20ce56c6aaf00470942f19603f3e140c77e96365-deepmerge",
        "pinf-primitives-js": "487b1109cf7a9249ed0e893c8b320b7547e44c0c-pinf-primitives-js"
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-package-insight"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-package-insight/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"80672231e691f27ae80929b46825c4500fefae2d-waitfor/package.json"}
require.memoize("80672231e691f27ae80929b46825c4500fefae2d-waitfor/package.json", 
{
    "main": "80672231e691f27ae80929b46825c4500fefae2d-waitfor/waitfor.js",
    "mappings": {
        "setimmediate": "3dd305fd76f02f32dc307204d072d8fbea99e90c-setimmediate"
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-package-insight/node_modules/waitfor"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-package-insight/node_modules/waitfor/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"3dd305fd76f02f32dc307204d072d8fbea99e90c-setimmediate/package.json"}
require.memoize("3dd305fd76f02f32dc307204d072d8fbea99e90c-setimmediate/package.json", 
{
    "main": "3dd305fd76f02f32dc307204d072d8fbea99e90c-setimmediate/setImmediate.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-package-insight/node_modules/waitfor/node_modules/setimmediate"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-package-insight/node_modules/waitfor/node_modules/setimmediate/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"20ce56c6aaf00470942f19603f3e140c77e96365-deepmerge/package.json"}
require.memoize("20ce56c6aaf00470942f19603f3e140c77e96365-deepmerge/package.json", 
{
    "main": "20ce56c6aaf00470942f19603f3e140c77e96365-deepmerge/index.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-package-insight/node_modules/deepmerge"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-package-insight/node_modules/deepmerge/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"487b1109cf7a9249ed0e893c8b320b7547e44c0c-pinf-primitives-js/package.json"}
require.memoize("487b1109cf7a9249ed0e893c8b320b7547e44c0c-pinf-primitives-js/package.json", 
{
    "main": "487b1109cf7a9249ed0e893c8b320b7547e44c0c-pinf-primitives-js/primitives.js",
    "mappings": {
        "deepcopy": "d918773878e2e21f6e74b5499fc1530daf47db32-deepcopy"
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-package-insight/node_modules/pinf-primitives-js"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-package-insight/node_modules/pinf-primitives-js/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"d918773878e2e21f6e74b5499fc1530daf47db32-deepcopy/package.json"}
require.memoize("d918773878e2e21f6e74b5499fc1530daf47db32-deepcopy/package.json", 
{
    "main": "d918773878e2e21f6e74b5499fc1530daf47db32-deepcopy/index.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-it-package-insight/node_modules/pinf-primitives-js/node_modules/deepcopy"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-it-package-insight/node_modules/pinf-primitives-js/node_modules/deepcopy/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"19418dae005c4d23567770942bd446bf4ab98489-pinf-loader-js/package.json"}
require.memoize("19418dae005c4d23567770942bd446bf4ab98489-pinf-loader-js/package.json", 
{
    "main": "19418dae005c4d23567770942bd446bf4ab98489-pinf-loader-js/loader.js",
    "directories": {
        "lib": "."
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/pinf-loader-js"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/pinf-loader-js/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"3cbdeaccfdb4ad426e3df4d62ea14ab7520b6fa7-requirejs/package.json"}
require.memoize("3cbdeaccfdb4ad426e3df4d62ea14ab7520b6fa7-requirejs/package.json", 
{
    "main": "3cbdeaccfdb4ad426e3df4d62ea14ab7520b6fa7-requirejs/bin/r.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/requirejs"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/requirejs/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"835808d4d2aa99ffb0289769d0c56dbe3d47a2b0-colors/package.json"}
require.memoize("835808d4d2aa99ffb0289769d0c56dbe3d47a2b0-colors/package.json", 
{
    "main": "835808d4d2aa99ffb0289769d0c56dbe3d47a2b0-colors/colors.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/colors"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/colors/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"ed4bb06796db1905581e7b400da006dd7b8b1b55-request/package.json"}
require.memoize("ed4bb06796db1905581e7b400da006dd7b8b1b55-request/package.json", 
{
    "main": "ed4bb06796db1905581e7b400da006dd7b8b1b55-request/index.js",
    "mappings": {
        "qs": "bad905498fb7a8a034fa664d6ed1a9c67f1b189c-qs",
        "oauth-sign": "4c8c493e0464365389fe0601e4bb6254d3b41a3c-oauth-sign",
        "hawk": "29eb5a18eb620cc598527d89a0c5c611db63e91b-hawk",
        "aws-sign": "effa10bda53b956d3e4fe3fada19d444ee3ea1ac-aws-sign",
        "http-signature": "6f0d5981580f5664565c0af7ca279d689a790fb5-http-signature",
        "node-uuid": "e999f0bd6e194076d315ffd2a431c4c6e32def1e-node-uuid",
        "mime": "acbfdcf6c33b2a153969671d593b45e4d0cd5768-mime",
        "tunnel-agent": "11cb05bc0940ffae1a1e1f73ca7c89e4731519fe-tunnel-agent",
        "json-stringify-safe": "cd513417702c216d7e831b5e07732580c4cd46ff-json-stringify-safe",
        "forever-agent": "0aece9af14f253ebe7db431e7f82a4db65578bac-forever-agent",
        "form-data": "30e023fb56d12219edd0fa0dc5fec5bc671e23d7-form-data",
        "cookie-jar": "96d6c97b8f07f8f227fbeb5b214187b162ad8c7c-cookie-jar"
    },
    "dirpath": "node_modules/request"
}
, {"filename":"node_modules/request/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"bad905498fb7a8a034fa664d6ed1a9c67f1b189c-qs/package.json"}
require.memoize("bad905498fb7a8a034fa664d6ed1a9c67f1b189c-qs/package.json", 
{
    "main": "bad905498fb7a8a034fa664d6ed1a9c67f1b189c-qs/index.js",
    "dirpath": "node_modules/request/node_modules/qs"
}
, {"filename":"node_modules/request/node_modules/qs/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"4c8c493e0464365389fe0601e4bb6254d3b41a3c-oauth-sign/package.json"}
require.memoize("4c8c493e0464365389fe0601e4bb6254d3b41a3c-oauth-sign/package.json", 
{
    "main": "4c8c493e0464365389fe0601e4bb6254d3b41a3c-oauth-sign/index.js",
    "dirpath": "node_modules/request/node_modules/oauth-sign"
}
, {"filename":"node_modules/request/node_modules/oauth-sign/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"29eb5a18eb620cc598527d89a0c5c611db63e91b-hawk/package.json"}
require.memoize("29eb5a18eb620cc598527d89a0c5c611db63e91b-hawk/package.json", 
{
    "main": "29eb5a18eb620cc598527d89a0c5c611db63e91b-hawk/index.js",
    "mappings": {
        "boom": "799caeb4798b9c4de483910de2aa52868f1f47d9-boom",
        "sntp": "99cc0c112bc5e48183c985f6e4c69af129c98ba7-sntp",
        "hoek": "f7d6999ac201573ce8335e058ee0439994171772-hoek",
        "cryptiles": "0d16239d3ef60fdd17d17b1d50d2c59ee8e63166-cryptiles"
    },
    "dirpath": "node_modules/request/node_modules/hawk"
}
, {"filename":"node_modules/request/node_modules/hawk/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"799caeb4798b9c4de483910de2aa52868f1f47d9-boom/package.json"}
require.memoize("799caeb4798b9c4de483910de2aa52868f1f47d9-boom/package.json", 
{
    "main": "799caeb4798b9c4de483910de2aa52868f1f47d9-boom/index.js",
    "mappings": {
        "hoek": "6b825b609d9fcb26d947f3cee8a737a80a9b27b3-hoek"
    },
    "dirpath": "node_modules/request/node_modules/hawk/node_modules/boom"
}
, {"filename":"node_modules/request/node_modules/hawk/node_modules/boom/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"6b825b609d9fcb26d947f3cee8a737a80a9b27b3-hoek/package.json"}
require.memoize("6b825b609d9fcb26d947f3cee8a737a80a9b27b3-hoek/package.json", 
{
    "main": "6b825b609d9fcb26d947f3cee8a737a80a9b27b3-hoek/index.js",
    "dirpath": "node_modules/request/node_modules/hawk/node_modules/boom/node_modules/hoek"
}
, {"filename":"node_modules/request/node_modules/hawk/node_modules/boom/node_modules/hoek/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"99cc0c112bc5e48183c985f6e4c69af129c98ba7-sntp/package.json"}
require.memoize("99cc0c112bc5e48183c985f6e4c69af129c98ba7-sntp/package.json", 
{
    "main": "99cc0c112bc5e48183c985f6e4c69af129c98ba7-sntp/index.js",
    "mappings": {
        "hoek": "d5ffe40658ed1d8bb0108338b7999512eedb8a6f-hoek"
    },
    "dirpath": "node_modules/request/node_modules/hawk/node_modules/sntp"
}
, {"filename":"node_modules/request/node_modules/hawk/node_modules/sntp/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"d5ffe40658ed1d8bb0108338b7999512eedb8a6f-hoek/package.json"}
require.memoize("d5ffe40658ed1d8bb0108338b7999512eedb8a6f-hoek/package.json", 
{
    "main": "d5ffe40658ed1d8bb0108338b7999512eedb8a6f-hoek/index.js",
    "dirpath": "node_modules/request/node_modules/hawk/node_modules/sntp/node_modules/hoek"
}
, {"filename":"node_modules/request/node_modules/hawk/node_modules/sntp/node_modules/hoek/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"f7d6999ac201573ce8335e058ee0439994171772-hoek/package.json"}
require.memoize("f7d6999ac201573ce8335e058ee0439994171772-hoek/package.json", 
{
    "main": "f7d6999ac201573ce8335e058ee0439994171772-hoek/index.js",
    "dirpath": "node_modules/request/node_modules/hawk/node_modules/hoek"
}
, {"filename":"node_modules/request/node_modules/hawk/node_modules/hoek/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"0d16239d3ef60fdd17d17b1d50d2c59ee8e63166-cryptiles/package.json"}
require.memoize("0d16239d3ef60fdd17d17b1d50d2c59ee8e63166-cryptiles/package.json", 
{
    "main": "0d16239d3ef60fdd17d17b1d50d2c59ee8e63166-cryptiles/index.js",
    "mappings": {
        "boom": "799caeb4798b9c4de483910de2aa52868f1f47d9-boom"
    },
    "dirpath": "node_modules/request/node_modules/hawk/node_modules/cryptiles"
}
, {"filename":"node_modules/request/node_modules/hawk/node_modules/cryptiles/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"effa10bda53b956d3e4fe3fada19d444ee3ea1ac-aws-sign/package.json"}
require.memoize("effa10bda53b956d3e4fe3fada19d444ee3ea1ac-aws-sign/package.json", 
{
    "main": "effa10bda53b956d3e4fe3fada19d444ee3ea1ac-aws-sign/index.js",
    "dirpath": "node_modules/request/node_modules/aws-sign"
}
, {"filename":"node_modules/request/node_modules/aws-sign/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"6f0d5981580f5664565c0af7ca279d689a790fb5-http-signature/package.json"}
require.memoize("6f0d5981580f5664565c0af7ca279d689a790fb5-http-signature/package.json", 
{
    "main": "6f0d5981580f5664565c0af7ca279d689a790fb5-http-signature/lib/index.js",
    "mappings": {
        "assert-plus": "fbda01465fe6db497c8c3e6b1a4a2bfae5a62cfc-assert-plus",
        "asn1": "e612e189cff4640079c1b54bfddcf962015c2f30-asn1",
        "ctype": "772d995e44ccaf42f98f64a0097b4a58863c38af-ctype"
    },
    "dirpath": "node_modules/request/node_modules/http-signature"
}
, {"filename":"node_modules/request/node_modules/http-signature/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"fbda01465fe6db497c8c3e6b1a4a2bfae5a62cfc-assert-plus/package.json"}
require.memoize("fbda01465fe6db497c8c3e6b1a4a2bfae5a62cfc-assert-plus/package.json", 
{
    "main": "fbda01465fe6db497c8c3e6b1a4a2bfae5a62cfc-assert-plus/assert.js",
    "dirpath": "node_modules/request/node_modules/http-signature/node_modules/assert-plus"
}
, {"filename":"node_modules/request/node_modules/http-signature/node_modules/assert-plus/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"e612e189cff4640079c1b54bfddcf962015c2f30-asn1/package.json"}
require.memoize("e612e189cff4640079c1b54bfddcf962015c2f30-asn1/package.json", 
{
    "main": "e612e189cff4640079c1b54bfddcf962015c2f30-asn1/lib/index.js",
    "dirpath": "node_modules/request/node_modules/http-signature/node_modules/asn1"
}
, {"filename":"node_modules/request/node_modules/http-signature/node_modules/asn1/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"772d995e44ccaf42f98f64a0097b4a58863c38af-ctype/package.json"}
require.memoize("772d995e44ccaf42f98f64a0097b4a58863c38af-ctype/package.json", 
{
    "main": "772d995e44ccaf42f98f64a0097b4a58863c38af-ctype/ctype.js",
    "dirpath": "node_modules/request/node_modules/http-signature/node_modules/ctype"
}
, {"filename":"node_modules/request/node_modules/http-signature/node_modules/ctype/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"e999f0bd6e194076d315ffd2a431c4c6e32def1e-node-uuid/package.json"}
require.memoize("e999f0bd6e194076d315ffd2a431c4c6e32def1e-node-uuid/package.json", 
{
    "main": "e999f0bd6e194076d315ffd2a431c4c6e32def1e-node-uuid/uuid.js",
    "dirpath": "node_modules/request/node_modules/node-uuid"
}
, {"filename":"node_modules/request/node_modules/node-uuid/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"acbfdcf6c33b2a153969671d593b45e4d0cd5768-mime/package.json"}
require.memoize("acbfdcf6c33b2a153969671d593b45e4d0cd5768-mime/package.json", 
{
    "main": "acbfdcf6c33b2a153969671d593b45e4d0cd5768-mime/mime.js",
    "dirpath": "node_modules/request/node_modules/mime"
}
, {"filename":"node_modules/request/node_modules/mime/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"11cb05bc0940ffae1a1e1f73ca7c89e4731519fe-tunnel-agent/package.json"}
require.memoize("11cb05bc0940ffae1a1e1f73ca7c89e4731519fe-tunnel-agent/package.json", 
{
    "main": "11cb05bc0940ffae1a1e1f73ca7c89e4731519fe-tunnel-agent/index.js",
    "dirpath": "node_modules/request/node_modules/tunnel-agent"
}
, {"filename":"node_modules/request/node_modules/tunnel-agent/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"cd513417702c216d7e831b5e07732580c4cd46ff-json-stringify-safe/package.json"}
require.memoize("cd513417702c216d7e831b5e07732580c4cd46ff-json-stringify-safe/package.json", 
{
    "main": "cd513417702c216d7e831b5e07732580c4cd46ff-json-stringify-safe/stringify.js",
    "dirpath": "node_modules/request/node_modules/json-stringify-safe"
}
, {"filename":"node_modules/request/node_modules/json-stringify-safe/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"0aece9af14f253ebe7db431e7f82a4db65578bac-forever-agent/package.json"}
require.memoize("0aece9af14f253ebe7db431e7f82a4db65578bac-forever-agent/package.json", 
{
    "main": "0aece9af14f253ebe7db431e7f82a4db65578bac-forever-agent/index.js",
    "dirpath": "node_modules/request/node_modules/forever-agent"
}
, {"filename":"node_modules/request/node_modules/forever-agent/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"30e023fb56d12219edd0fa0dc5fec5bc671e23d7-form-data/package.json"}
require.memoize("30e023fb56d12219edd0fa0dc5fec5bc671e23d7-form-data/package.json", 
{
    "main": "30e023fb56d12219edd0fa0dc5fec5bc671e23d7-form-data/lib/form_data.js",
    "mappings": {
        "combined-stream": "06cbcc54faef9f40e30e431889706609e5cfcee5-combined-stream",
        "mime": "acbfdcf6c33b2a153969671d593b45e4d0cd5768-mime",
        "async": "257a70b6290719603e5079400727f3d2d2d1b03a-async"
    },
    "dirpath": "node_modules/request/node_modules/form-data"
}
, {"filename":"node_modules/request/node_modules/form-data/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"06cbcc54faef9f40e30e431889706609e5cfcee5-combined-stream/package.json"}
require.memoize("06cbcc54faef9f40e30e431889706609e5cfcee5-combined-stream/package.json", 
{
    "main": "06cbcc54faef9f40e30e431889706609e5cfcee5-combined-stream/lib/combined_stream.js",
    "mappings": {
        "delayed-stream": "199a58ca20a8d32f3b68d292b20fd112db88b5ec-delayed-stream"
    },
    "dirpath": "node_modules/request/node_modules/form-data/node_modules/combined-stream"
}
, {"filename":"node_modules/request/node_modules/form-data/node_modules/combined-stream/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"199a58ca20a8d32f3b68d292b20fd112db88b5ec-delayed-stream/package.json"}
require.memoize("199a58ca20a8d32f3b68d292b20fd112db88b5ec-delayed-stream/package.json", 
{
    "main": "199a58ca20a8d32f3b68d292b20fd112db88b5ec-delayed-stream/lib/delayed_stream.js",
    "dirpath": "node_modules/request/node_modules/form-data/node_modules/combined-stream/node_modules/delayed-stream"
}
, {"filename":"node_modules/request/node_modules/form-data/node_modules/combined-stream/node_modules/delayed-stream/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"257a70b6290719603e5079400727f3d2d2d1b03a-async/package.json"}
require.memoize("257a70b6290719603e5079400727f3d2d2d1b03a-async/package.json", 
{
    "main": "257a70b6290719603e5079400727f3d2d2d1b03a-async/lib/async.js",
    "dirpath": "node_modules/request/node_modules/form-data/node_modules/async"
}
, {"filename":"node_modules/request/node_modules/form-data/node_modules/async/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"96d6c97b8f07f8f227fbeb5b214187b162ad8c7c-cookie-jar/package.json"}
require.memoize("96d6c97b8f07f8f227fbeb5b214187b162ad8c7c-cookie-jar/package.json", 
{
    "main": "96d6c97b8f07f8f227fbeb5b214187b162ad8c7c-cookie-jar/index.js",
    "dirpath": "node_modules/request/node_modules/cookie-jar"
}
, {"filename":"node_modules/request/node_modules/cookie-jar/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"46436413248440678ad5c9378e5dd00081b623bd-pinf-loader-js/package.json"}
require.memoize("46436413248440678ad5c9378e5dd00081b623bd-pinf-loader-js/package.json", 
{
    "main": "46436413248440678ad5c9378e5dd00081b623bd-pinf-loader-js/loader.js",
    "directories": {
        "lib": "."
    },
    "dirpath": "node_modules/pinf-loader-js"
}
, {"filename":"node_modules/pinf-loader-js/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"__SYSTEM__/package.json"}
require.memoize("__SYSTEM__/package.json", 
{
    "mappings": {
        "__SYSTEM__": "__SYSTEM__"
    }
}
, {"filename":"__SYSTEM__/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"5ffbe8b6d730bb97f4962540bf61cb0e2f6ecc6e-browser-builtins/package.json"}
require.memoize("5ffbe8b6d730bb97f4962540bf61cb0e2f6ecc6e-browser-builtins/package.json", 
{
    "main": "5ffbe8b6d730bb97f4962540bf61cb0e2f6ecc6e-browser-builtins/index.js",
    "mappings": {
        "http-browserify": "418ec4551cd2bc7e46bfbd6356c17babf6a1be16-http-browserify",
        "vm-browserify": "f1aac6d232e16345a20d845bdf051a9d73b339c3-vm-browserify",
        "crypto-browserify": "6edee8a8bdc30840641a8088b91554a13cecc76f-crypto-browserify",
        "console-browserify": "96d4e09a7298da99ea4f97d441a830624519a0ac-console-browserify",
        "zlib-browserify": "0bddfdc82945031778c66af5874772da2349b323-zlib-browserify",
        "buffer-browserify": "c98adf73d135cb3405a72956d8986602c9b75984-buffer-browserify",
        "constants-browserify": "95b9016890f1582e6f761491de0c23521afc7035-constants-browserify",
        "os-browserify": "5720622a71b1720e4468008606266a3005769b99-os-browserify"
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/browser-builtins"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/browser-builtins/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"418ec4551cd2bc7e46bfbd6356c17babf6a1be16-http-browserify/package.json"}
require.memoize("418ec4551cd2bc7e46bfbd6356c17babf6a1be16-http-browserify/package.json", 
{
    "main": "418ec4551cd2bc7e46bfbd6356c17babf6a1be16-http-browserify/index.js",
    "directories": {
        "lib": "."
    },
    "mappings": {
        "concat-stream": "b06cbf27e188f2588acf94783b2da349807e5a78-concat-stream",
        "Base64": "5486a895cc19ff09df890a3e3c42c14d411e5d3e-Base64"
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/http-browserify"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/http-browserify/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"b06cbf27e188f2588acf94783b2da349807e5a78-concat-stream/package.json"}
require.memoize("b06cbf27e188f2588acf94783b2da349807e5a78-concat-stream/package.json", 
{
    "main": "b06cbf27e188f2588acf94783b2da349807e5a78-concat-stream/index.js",
    "mappings": {
        "bops": "86699f825da014d5f495228dbd0fffa9183e9d51-bops"
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/http-browserify/node_modules/concat-stream"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/http-browserify/node_modules/concat-stream/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"86699f825da014d5f495228dbd0fffa9183e9d51-bops/package.json"}
require.memoize("86699f825da014d5f495228dbd0fffa9183e9d51-bops/package.json", 
{
    "main": "86699f825da014d5f495228dbd0fffa9183e9d51-bops/index.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/http-browserify/node_modules/concat-stream/node_modules/bops"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/http-browserify/node_modules/concat-stream/node_modules/bops/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"5486a895cc19ff09df890a3e3c42c14d411e5d3e-Base64/package.json"}
require.memoize("5486a895cc19ff09df890a3e3c42c14d411e5d3e-Base64/package.json", 
{
    "main": "5486a895cc19ff09df890a3e3c42c14d411e5d3e-Base64/base64.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/http-browserify/node_modules/Base64"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/http-browserify/node_modules/Base64/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"f1aac6d232e16345a20d845bdf051a9d73b339c3-vm-browserify/package.json"}
require.memoize("f1aac6d232e16345a20d845bdf051a9d73b339c3-vm-browserify/package.json", 
{
    "main": "f1aac6d232e16345a20d845bdf051a9d73b339c3-vm-browserify/index.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/vm-browserify"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/vm-browserify/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"6edee8a8bdc30840641a8088b91554a13cecc76f-crypto-browserify/package.json"}
require.memoize("6edee8a8bdc30840641a8088b91554a13cecc76f-crypto-browserify/package.json", 
{
    "main": "6edee8a8bdc30840641a8088b91554a13cecc76f-crypto-browserify/index.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/crypto-browserify"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/crypto-browserify/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"96d4e09a7298da99ea4f97d441a830624519a0ac-console-browserify/package.json"}
require.memoize("96d4e09a7298da99ea4f97d441a830624519a0ac-console-browserify/package.json", 
{
    "main": "96d4e09a7298da99ea4f97d441a830624519a0ac-console-browserify/index.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/console-browserify"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/console-browserify/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"0bddfdc82945031778c66af5874772da2349b323-zlib-browserify/package.json"}
require.memoize("0bddfdc82945031778c66af5874772da2349b323-zlib-browserify/package.json", 
{
    "main": "0bddfdc82945031778c66af5874772da2349b323-zlib-browserify/index.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/zlib-browserify"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/zlib-browserify/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"c98adf73d135cb3405a72956d8986602c9b75984-buffer-browserify/package.json"}
require.memoize("c98adf73d135cb3405a72956d8986602c9b75984-buffer-browserify/package.json", 
{
    "main": "c98adf73d135cb3405a72956d8986602c9b75984-buffer-browserify/index.js",
    "mappings": {
        "base64-js": "92c9de5da7cbd0016ed8f5cdd0ce8af7c7bc8716-base64-js"
    },
    "dirpath": "node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/buffer-browserify"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/buffer-browserify/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"92c9de5da7cbd0016ed8f5cdd0ce8af7c7bc8716-base64-js/package.json"}
require.memoize("92c9de5da7cbd0016ed8f5cdd0ce8af7c7bc8716-base64-js/package.json", 
{
    "main": "92c9de5da7cbd0016ed8f5cdd0ce8af7c7bc8716-base64-js/lib/b64.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/buffer-browserify/node_modules/base64-js"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/buffer-browserify/node_modules/base64-js/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"95b9016890f1582e6f761491de0c23521afc7035-constants-browserify/package.json"}
require.memoize("95b9016890f1582e6f761491de0c23521afc7035-constants-browserify/package.json", 
{
    "main": "95b9016890f1582e6f761491de0c23521afc7035-constants-browserify/constants.json",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/constants-browserify"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/constants-browserify/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"5720622a71b1720e4468008606266a3005769b99-os-browserify/package.json"}
require.memoize("5720622a71b1720e4468008606266a3005769b99-os-browserify/package.json", 
{
    "main": "5720622a71b1720e4468008606266a3005769b99-os-browserify/main.js",
    "dirpath": "node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/os-browserify"
}
, {"filename":"node_modules/pinf-it-bundler/node_modules/browser-builtins/node_modules/os-browserify/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"59286364ebdd2811b0b95c9a3a98aff6543fdb23-pinf-vfs/package.json"}
require.memoize("59286364ebdd2811b0b95c9a3a98aff6543fdb23-pinf-vfs/package.json", 
{
    "main": "59286364ebdd2811b0b95c9a3a98aff6543fdb23-pinf-vfs/lib/vfs.js",
    "mappings": {
        "fs-extra": "b392cc47b0135d716456ecbac2efcdb545109b89-fs-extra",
        "pinf-proxy": "5c4d27962ebe23d26570d53ee0d0bc1cdcae9d31-pinf-proxy"
    },
    "dirpath": "node_modules/pinf-vfs"
}
, {"filename":"node_modules/pinf-vfs/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"b392cc47b0135d716456ecbac2efcdb545109b89-fs-extra/package.json"}
require.memoize("b392cc47b0135d716456ecbac2efcdb545109b89-fs-extra/package.json", 
{
    "main": "b392cc47b0135d716456ecbac2efcdb545109b89-fs-extra/lib/index.js",
    "mappings": {
        "jsonfile": "33cd8596aa45c211389fbb91bcd5fd83f20f9c09-jsonfile",
        "mkdirp": "47a8a810ed6f88dcf64e4c73771d6324407be6db-mkdirp",
        "ncp": "b101bb7429bcbe5507ba29edbda1b4d54b1ca43e-ncp",
        "rimraf": "bd38d03734ae98ce725226fd810039b1029ff8fc-rimraf"
    },
    "dirpath": "node_modules/pinf-vfs/node_modules/fs-extra"
}
, {"filename":"node_modules/pinf-vfs/node_modules/fs-extra/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"33cd8596aa45c211389fbb91bcd5fd83f20f9c09-jsonfile/package.json"}
require.memoize("33cd8596aa45c211389fbb91bcd5fd83f20f9c09-jsonfile/package.json", 
{
    "main": "33cd8596aa45c211389fbb91bcd5fd83f20f9c09-jsonfile/lib/jsonfile.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/fs-extra/node_modules/jsonfile"
}
, {"filename":"node_modules/pinf-vfs/node_modules/fs-extra/node_modules/jsonfile/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"47a8a810ed6f88dcf64e4c73771d6324407be6db-mkdirp/package.json"}
require.memoize("47a8a810ed6f88dcf64e4c73771d6324407be6db-mkdirp/package.json", 
{
    "main": "47a8a810ed6f88dcf64e4c73771d6324407be6db-mkdirp/index.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/fs-extra/node_modules/mkdirp"
}
, {"filename":"node_modules/pinf-vfs/node_modules/fs-extra/node_modules/mkdirp/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"b101bb7429bcbe5507ba29edbda1b4d54b1ca43e-ncp/package.json"}
require.memoize("b101bb7429bcbe5507ba29edbda1b4d54b1ca43e-ncp/package.json", 
{
    "main": "b101bb7429bcbe5507ba29edbda1b4d54b1ca43e-ncp/lib/ncp.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/fs-extra/node_modules/ncp"
}
, {"filename":"node_modules/pinf-vfs/node_modules/fs-extra/node_modules/ncp/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"bd38d03734ae98ce725226fd810039b1029ff8fc-rimraf/package.json"}
require.memoize("bd38d03734ae98ce725226fd810039b1029ff8fc-rimraf/package.json", 
{
    "main": "bd38d03734ae98ce725226fd810039b1029ff8fc-rimraf/rimraf.js",
    "mappings": {
        "graceful-fs": "82bd18473116977f40712a90a1f535253356f989-graceful-fs"
    },
    "dirpath": "node_modules/pinf-vfs/node_modules/fs-extra/node_modules/rimraf"
}
, {"filename":"node_modules/pinf-vfs/node_modules/fs-extra/node_modules/rimraf/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"82bd18473116977f40712a90a1f535253356f989-graceful-fs/package.json"}
require.memoize("82bd18473116977f40712a90a1f535253356f989-graceful-fs/package.json", 
{
    "main": "82bd18473116977f40712a90a1f535253356f989-graceful-fs/graceful-fs.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/fs-extra/node_modules/rimraf/node_modules/graceful-fs"
}
, {"filename":"node_modules/pinf-vfs/node_modules/fs-extra/node_modules/rimraf/node_modules/graceful-fs/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"5c4d27962ebe23d26570d53ee0d0bc1cdcae9d31-pinf-proxy/package.json"}
require.memoize("5c4d27962ebe23d26570d53ee0d0bc1cdcae9d31-pinf-proxy/package.json", 
{
    "main": "5c4d27962ebe23d26570d53ee0d0bc1cdcae9d31-pinf-proxy/lib/proxy.js",
    "mappings": {
        "http-proxy": "34055e448207acada2bb2775e4bd460aafe2cc66-http-proxy",
        "empty-port": "55f305dcea137c22d102c9ee607f6cd142bcd3f5-empty-port",
        "request": "6f63720409c06f45f7e78cfa91332f0ed44a51cb-request"
    },
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"34055e448207acada2bb2775e4bd460aafe2cc66-http-proxy/package.json"}
require.memoize("34055e448207acada2bb2775e4bd460aafe2cc66-http-proxy/package.json", 
{
    "main": "34055e448207acada2bb2775e4bd460aafe2cc66-http-proxy/lib/node-http-proxy.js",
    "mappings": {
        "pkginfo": "ca2c03206ae800c98eca40fecd29e5446834c2b5-pkginfo",
        "utile": "6031b7cca24abd8d0e8f287b25a9daacc2c6e759-utile"
    },
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"ca2c03206ae800c98eca40fecd29e5446834c2b5-pkginfo/package.json"}
require.memoize("ca2c03206ae800c98eca40fecd29e5446834c2b5-pkginfo/package.json", 
{
    "main": "ca2c03206ae800c98eca40fecd29e5446834c2b5-pkginfo/lib/pkginfo.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/pkginfo"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/pkginfo/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"6031b7cca24abd8d0e8f287b25a9daacc2c6e759-utile/package.json"}
require.memoize("6031b7cca24abd8d0e8f287b25a9daacc2c6e759-utile/package.json", 
{
    "main": "6031b7cca24abd8d0e8f287b25a9daacc2c6e759-utile/lib/index.js",
    "mappings": {
        "async": "3642444a33bc99ecf4f0db8991df6fdab0430aa5-async",
        "i": "f51a1779ab170e78789951fc042da8b855960364-i",
        "mkdirp": "d957dd8574ec7c106547d19209ac21fab7edfbed-mkdirp",
        "deep-equal": "7a2b28bdac6b45d64ec87bd9354b78af838139e7-deep-equal",
        "rimraf": "7b1ced90bbd2868cd55dfe12eaff354291421b2a-rimraf",
        "ncp": "3d3dbd4012bfc9787f2b733b87132fdc7957dfee-ncp"
    },
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/utile"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/utile/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"3642444a33bc99ecf4f0db8991df6fdab0430aa5-async/package.json"}
require.memoize("3642444a33bc99ecf4f0db8991df6fdab0430aa5-async/package.json", 
{
    "main": "3642444a33bc99ecf4f0db8991df6fdab0430aa5-async/index.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/utile/node_modules/async"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/utile/node_modules/async/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"f51a1779ab170e78789951fc042da8b855960364-i/package.json"}
require.memoize("f51a1779ab170e78789951fc042da8b855960364-i/package.json", 
{
    "main": "f51a1779ab170e78789951fc042da8b855960364-i/lib/inflect.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/utile/node_modules/i"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/utile/node_modules/i/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"d957dd8574ec7c106547d19209ac21fab7edfbed-mkdirp/package.json"}
require.memoize("d957dd8574ec7c106547d19209ac21fab7edfbed-mkdirp/package.json", 
{
    "main": "d957dd8574ec7c106547d19209ac21fab7edfbed-mkdirp/index.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/utile/node_modules/mkdirp"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/utile/node_modules/mkdirp/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"7a2b28bdac6b45d64ec87bd9354b78af838139e7-deep-equal/package.json"}
require.memoize("7a2b28bdac6b45d64ec87bd9354b78af838139e7-deep-equal/package.json", 
{
    "main": "7a2b28bdac6b45d64ec87bd9354b78af838139e7-deep-equal/index.js",
    "directories": {
        "lib": "."
    },
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/utile/node_modules/deep-equal"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/utile/node_modules/deep-equal/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"7b1ced90bbd2868cd55dfe12eaff354291421b2a-rimraf/package.json"}
require.memoize("7b1ced90bbd2868cd55dfe12eaff354291421b2a-rimraf/package.json", 
{
    "main": "7b1ced90bbd2868cd55dfe12eaff354291421b2a-rimraf/rimraf.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/utile/node_modules/rimraf"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/utile/node_modules/rimraf/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"3d3dbd4012bfc9787f2b733b87132fdc7957dfee-ncp/package.json"}
require.memoize("3d3dbd4012bfc9787f2b733b87132fdc7957dfee-ncp/package.json", 
{
    "main": "3d3dbd4012bfc9787f2b733b87132fdc7957dfee-ncp/lib/ncp.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/utile/node_modules/ncp"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/http-proxy/node_modules/utile/node_modules/ncp/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"55f305dcea137c22d102c9ee607f6cd142bcd3f5-empty-port/package.json"}
require.memoize("55f305dcea137c22d102c9ee607f6cd142bcd3f5-empty-port/package.json", 
{
    "main": "55f305dcea137c22d102c9ee607f6cd142bcd3f5-empty-port/index.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/empty-port"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/empty-port/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"6f63720409c06f45f7e78cfa91332f0ed44a51cb-request/package.json"}
require.memoize("6f63720409c06f45f7e78cfa91332f0ed44a51cb-request/package.json", 
{
    "main": "6f63720409c06f45f7e78cfa91332f0ed44a51cb-request/index.js",
    "mappings": {
        "cookie-jar": "048e1c948e1b1bf41b9d82f2d8ec4bacde5a7d2a-cookie-jar",
        "qs": "8edd7664213b72331eafafa780f2c2e1cbd7b000-qs",
        "oauth-sign": "c79a15b17d64a66f527c0913a3f9e5d7a8d07940-oauth-sign",
        "hawk": "a87ca0438386c16b5ac6514d724eb1d0d35b76f1-hawk",
        "aws-sign": "0ea6b5ff22c395db134201c64e7ba265521edd03-aws-sign",
        "http-signature": "3817f8a5bc6f393a043372f2f0cae65fb9528327-http-signature",
        "node-uuid": "5f8d9053f5854bb5ef71399aeecdcaae0353e029-node-uuid",
        "mime": "da6cdb7088091b9d2a445b608712eedc04a29923-mime",
        "tunnel-agent": "6211857db27bf4e867376aa0aa9488144c9f3127-tunnel-agent",
        "json-stringify-safe": "35b0fc23c495eebad75e0c3644783445414c8cab-json-stringify-safe",
        "forever-agent": "1e56cf0396f2815e2929dd3e39f4c8c667044dba-forever-agent",
        "form-data": "ac9e40a4f06e8d8531f989c33e03749368976327-form-data"
    },
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"048e1c948e1b1bf41b9d82f2d8ec4bacde5a7d2a-cookie-jar/package.json"}
require.memoize("048e1c948e1b1bf41b9d82f2d8ec4bacde5a7d2a-cookie-jar/package.json", 
{
    "main": "048e1c948e1b1bf41b9d82f2d8ec4bacde5a7d2a-cookie-jar/index.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/cookie-jar"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/cookie-jar/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"8edd7664213b72331eafafa780f2c2e1cbd7b000-qs/package.json"}
require.memoize("8edd7664213b72331eafafa780f2c2e1cbd7b000-qs/package.json", 
{
    "main": "8edd7664213b72331eafafa780f2c2e1cbd7b000-qs/index.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/qs"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/qs/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"c79a15b17d64a66f527c0913a3f9e5d7a8d07940-oauth-sign/package.json"}
require.memoize("c79a15b17d64a66f527c0913a3f9e5d7a8d07940-oauth-sign/package.json", 
{
    "main": "c79a15b17d64a66f527c0913a3f9e5d7a8d07940-oauth-sign/index.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/oauth-sign"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/oauth-sign/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"a87ca0438386c16b5ac6514d724eb1d0d35b76f1-hawk/package.json"}
require.memoize("a87ca0438386c16b5ac6514d724eb1d0d35b76f1-hawk/package.json", 
{
    "main": "a87ca0438386c16b5ac6514d724eb1d0d35b76f1-hawk/index.js",
    "mappings": {
        "boom": "9051b3a7264a96fcafd6aae5e48d6d2ed7177c16-boom",
        "sntp": "b5ce9568f402ff8b438b5334158d250c67ac6323-sntp",
        "hoek": "9a931f873f7ab95323ec3b68cc5caa3a47b4b0ec-hoek",
        "cryptiles": "c0863acc28d39fa23d4638a14fdba8d4ff3d4516-cryptiles"
    },
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/hawk"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/hawk/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"9051b3a7264a96fcafd6aae5e48d6d2ed7177c16-boom/package.json"}
require.memoize("9051b3a7264a96fcafd6aae5e48d6d2ed7177c16-boom/package.json", 
{
    "main": "9051b3a7264a96fcafd6aae5e48d6d2ed7177c16-boom/index.js",
    "mappings": {
        "hoek": "9a931f873f7ab95323ec3b68cc5caa3a47b4b0ec-hoek"
    },
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/hawk/node_modules/boom"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/hawk/node_modules/boom/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"9a931f873f7ab95323ec3b68cc5caa3a47b4b0ec-hoek/package.json"}
require.memoize("9a931f873f7ab95323ec3b68cc5caa3a47b4b0ec-hoek/package.json", 
{
    "main": "9a931f873f7ab95323ec3b68cc5caa3a47b4b0ec-hoek/index.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/hawk/node_modules/hoek"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/hawk/node_modules/hoek/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"b5ce9568f402ff8b438b5334158d250c67ac6323-sntp/package.json"}
require.memoize("b5ce9568f402ff8b438b5334158d250c67ac6323-sntp/package.json", 
{
    "main": "b5ce9568f402ff8b438b5334158d250c67ac6323-sntp/index.js",
    "mappings": {
        "hoek": "9a931f873f7ab95323ec3b68cc5caa3a47b4b0ec-hoek"
    },
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/hawk/node_modules/sntp"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/hawk/node_modules/sntp/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"c0863acc28d39fa23d4638a14fdba8d4ff3d4516-cryptiles/package.json"}
require.memoize("c0863acc28d39fa23d4638a14fdba8d4ff3d4516-cryptiles/package.json", 
{
    "main": "c0863acc28d39fa23d4638a14fdba8d4ff3d4516-cryptiles/index.js",
    "mappings": {
        "boom": "9051b3a7264a96fcafd6aae5e48d6d2ed7177c16-boom"
    },
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/hawk/node_modules/cryptiles"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/hawk/node_modules/cryptiles/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"0ea6b5ff22c395db134201c64e7ba265521edd03-aws-sign/package.json"}
require.memoize("0ea6b5ff22c395db134201c64e7ba265521edd03-aws-sign/package.json", 
{
    "main": "0ea6b5ff22c395db134201c64e7ba265521edd03-aws-sign/index.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/aws-sign"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/aws-sign/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"3817f8a5bc6f393a043372f2f0cae65fb9528327-http-signature/package.json"}
require.memoize("3817f8a5bc6f393a043372f2f0cae65fb9528327-http-signature/package.json", 
{
    "main": "3817f8a5bc6f393a043372f2f0cae65fb9528327-http-signature/lib/index.js",
    "mappings": {
        "assert-plus": "a049982648077fabe8948273bc6518b800b5930e-assert-plus",
        "asn1": "9c29ae96331c2bf1a2869290a35d2e7044e8a2fc-asn1",
        "ctype": "7066e8d1d89f73b7d239e8a2448a6e84a4c0fe0a-ctype"
    },
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/http-signature"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/http-signature/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"a049982648077fabe8948273bc6518b800b5930e-assert-plus/package.json"}
require.memoize("a049982648077fabe8948273bc6518b800b5930e-assert-plus/package.json", 
{
    "main": "a049982648077fabe8948273bc6518b800b5930e-assert-plus/assert.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/http-signature/node_modules/assert-plus"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/http-signature/node_modules/assert-plus/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"9c29ae96331c2bf1a2869290a35d2e7044e8a2fc-asn1/package.json"}
require.memoize("9c29ae96331c2bf1a2869290a35d2e7044e8a2fc-asn1/package.json", 
{
    "main": "9c29ae96331c2bf1a2869290a35d2e7044e8a2fc-asn1/lib/index.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/http-signature/node_modules/asn1"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/http-signature/node_modules/asn1/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"7066e8d1d89f73b7d239e8a2448a6e84a4c0fe0a-ctype/package.json"}
require.memoize("7066e8d1d89f73b7d239e8a2448a6e84a4c0fe0a-ctype/package.json", 
{
    "main": "7066e8d1d89f73b7d239e8a2448a6e84a4c0fe0a-ctype/ctype.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/http-signature/node_modules/ctype"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/http-signature/node_modules/ctype/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"5f8d9053f5854bb5ef71399aeecdcaae0353e029-node-uuid/package.json"}
require.memoize("5f8d9053f5854bb5ef71399aeecdcaae0353e029-node-uuid/package.json", 
{
    "main": "5f8d9053f5854bb5ef71399aeecdcaae0353e029-node-uuid/uuid.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/node-uuid"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/node-uuid/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"da6cdb7088091b9d2a445b608712eedc04a29923-mime/package.json"}
require.memoize("da6cdb7088091b9d2a445b608712eedc04a29923-mime/package.json", 
{
    "main": "da6cdb7088091b9d2a445b608712eedc04a29923-mime/mime.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/mime"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/mime/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"6211857db27bf4e867376aa0aa9488144c9f3127-tunnel-agent/package.json"}
require.memoize("6211857db27bf4e867376aa0aa9488144c9f3127-tunnel-agent/package.json", 
{
    "main": "6211857db27bf4e867376aa0aa9488144c9f3127-tunnel-agent/index.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/tunnel-agent"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/tunnel-agent/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"35b0fc23c495eebad75e0c3644783445414c8cab-json-stringify-safe/package.json"}
require.memoize("35b0fc23c495eebad75e0c3644783445414c8cab-json-stringify-safe/package.json", 
{
    "main": "35b0fc23c495eebad75e0c3644783445414c8cab-json-stringify-safe/stringify.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/json-stringify-safe"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/json-stringify-safe/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"1e56cf0396f2815e2929dd3e39f4c8c667044dba-forever-agent/package.json"}
require.memoize("1e56cf0396f2815e2929dd3e39f4c8c667044dba-forever-agent/package.json", 
{
    "main": "1e56cf0396f2815e2929dd3e39f4c8c667044dba-forever-agent/index.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/forever-agent"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/forever-agent/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"ac9e40a4f06e8d8531f989c33e03749368976327-form-data/package.json"}
require.memoize("ac9e40a4f06e8d8531f989c33e03749368976327-form-data/package.json", 
{
    "main": "ac9e40a4f06e8d8531f989c33e03749368976327-form-data/lib/form_data.js",
    "mappings": {
        "combined-stream": "1040f388056b3d4d71490cdb6b54419ffe545981-combined-stream",
        "mime": "da6cdb7088091b9d2a445b608712eedc04a29923-mime",
        "async": "109199efc96ba8d46699e51052770e8f9564e28b-async"
    },
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/form-data"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/form-data/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"1040f388056b3d4d71490cdb6b54419ffe545981-combined-stream/package.json"}
require.memoize("1040f388056b3d4d71490cdb6b54419ffe545981-combined-stream/package.json", 
{
    "main": "1040f388056b3d4d71490cdb6b54419ffe545981-combined-stream/lib/combined_stream.js",
    "mappings": {
        "delayed-stream": "f143bee852aba49af1afbcba4bc39ad2c5d4b511-delayed-stream"
    },
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/form-data/node_modules/combined-stream"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/form-data/node_modules/combined-stream/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"f143bee852aba49af1afbcba4bc39ad2c5d4b511-delayed-stream/package.json"}
require.memoize("f143bee852aba49af1afbcba4bc39ad2c5d4b511-delayed-stream/package.json", 
{
    "main": "f143bee852aba49af1afbcba4bc39ad2c5d4b511-delayed-stream/lib/delayed_stream.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/form-data/node_modules/combined-stream/node_modules/delayed-stream"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/form-data/node_modules/combined-stream/node_modules/delayed-stream/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"109199efc96ba8d46699e51052770e8f9564e28b-async/package.json"}
require.memoize("109199efc96ba8d46699e51052770e8f9564e28b-async/package.json", 
{
    "main": "109199efc96ba8d46699e51052770e8f9564e28b-async/lib/async.js",
    "dirpath": "node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/form-data/node_modules/async"
}
, {"filename":"node_modules/pinf-vfs/node_modules/pinf-proxy/node_modules/request/node_modules/form-data/node_modules/async/package.json"});
// @pinf-bundle-ignore: 
});
// @pinf-bundle-report: {}