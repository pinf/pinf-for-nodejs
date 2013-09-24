// @pinf-bundle-ignore: 
PINF.bundle("", function(require) {
// @pinf-bundle-module: {"file":"lib/main.js","mtime":1378409378,"wrapper":"commonjs","format":"commonjs","id":"/lib/main.js"}
require.memoize("/lib/main.js", 
function(require, exports, module) {var __dirname = 'lib';

require("require.async")(require);


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
            process.exit(1);
        }
        process.exit(0);
	}
	if (!module) {
	    try {
			var ret = main(done);			
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
		return CONTEXT.contextForModule(module, options, function(err, context) {
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
// @pinf-bundle-module: {"file":"node_modules/require.async/require.async.js","mtime":1376958755,"wrapper":"commonjs/leaky","format":"leaky","id":"437ef8aee826325a41c701ca21e78f84f35ff9f1-require.async/require.async.js"}
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
        "pinf-loader-js": "46436413248440678ad5c9378e5dd00081b623bd-pinf-loader-js"
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
// @pinf-bundle-ignore: 
});
// @pinf-bundle-report: {}