// @pinf-bundle-ignore: 
PINF.bundle("", function(require, _____bundle_global) {
// @pinf-bundle-module: {"file":"/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/component/sub/comp.js","mtime":0,"wrapper":"commonjs","format":"commonjs","variation":"","id":"/sub/comp.js"}
require.memoize("/sub/comp.js", 
function(require, exports, module) {var __dirname = '/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/component/sub';

exports.main = function (callback) {

    const COMMON = require("common/helpers");

    return COMMON.loadTemplate("hello", function (err, tpl) {
        if (err) return callback(err);
        
console.log("FINAL tpl", tpl);

        var rendered = tpl.render({
            "foo": "bar"
        });

console.log("FINAL rendered", rendered);

        return callback(null, rendered);
    });
}

}
, {"filename":"/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/component/sub/comp.js","variation":""});
// @pinf-bundle-module: {"file":"/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/common/helpers.js","mtime":0,"wrapper":"commonjs","format":"commonjs","variation":"","id":"5bb91176038bc5572ba1264df31a985415b171f1-common/helpers.js"}
require.memoize("5bb91176038bc5572ba1264df31a985415b171f1-common/helpers.js", 
function(require, exports, module) {var __dirname = '/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/common';


// This is needed to support mapped requires for plain nodejs modules
// as they are supported by the pinf bundler.
// TODO: Move this into a generic helper.
var originalRequire = require;
require = function (id) {
    if (module.parent) {
        // We are running directly via NodeJS.
        var idParts = id.split("/");
        var packageAlias = idParts.shift();
        if (/^\./.test(packageAlias)) {
            return originalRequire(id);
        }
        var descriptor = require("./package.json");
        idParts.unshift(descriptor.mappings[packageAlias]);
        return originalRequire(idParts.join("/"));
    } else {
        // We are running within a PINF bundle.
        return originalRequire(id);
    }
};


const TEMPLATES = require("templates/loader");

exports.loadTemplate = function (name, callback) {

    return TEMPLATES.load(name, callback);
}


}
, {"filename":"/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/common/helpers.js","variation":""});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"5bb91176038bc5572ba1264df31a985415b171f1-common/package.json"}
require.memoize("5bb91176038bc5572ba1264df31a985415b171f1-common/package.json", 
{
    "mappings": {
        "templates": "c9021c7f9d3ec48564a6399bbabbf0d09f152b1e-templates"
    },
    "dirpath": "/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/common"
}
, {"filename":"/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/common/package.json"});
// @pinf-bundle-module: {"file":"/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/templates/loader.js","mtime":0,"wrapper":"commonjs","format":"commonjs","variation":"","id":"c9021c7f9d3ec48564a6399bbabbf0d09f152b1e-templates/loader.js"}
require.memoize("c9021c7f9d3ec48564a6399bbabbf0d09f152b1e-templates/loader.js", 
function(require, exports, module) {var __dirname = '/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/templates';

require("require.async")(require);

exports.load = function (name, callback) {

console.log("load template", name);

    return require.async("./tpl/" + name, function (api) {

console.log("TEMPLATE API", api);

    	return callback(null, api);
    }, callback);
}

}
, {"filename":"/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/templates/loader.js","variation":""});
// @pinf-bundle-module: {"file":"/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/node_modules/require.async/require.async.js","mtime":0,"wrapper":"commonjs/leaky","format":"leaky","variation":"","id":"a81d66805e2377970585ecd1237e83ab78636759-require.async/require.async.js"}
require.memoize("a81d66805e2377970585ecd1237e83ab78636759-require.async/require.async.js", 
function(require, exports, module) {var __dirname = '/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/node_modules/require.async';
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
, {"filename":"/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/node_modules/require.async/require.async.js","variation":""});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"/package.json"}
require.memoize("/package.json", 
{
    "main": "sub/comp.js",
    "mappings": {
        "common": "5bb91176038bc5572ba1264df31a985415b171f1-common"
    },
    "dirpath": "/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/component"
}
, {"filename":"/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/component/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"c9021c7f9d3ec48564a6399bbabbf0d09f152b1e-templates/package.json"}
require.memoize("c9021c7f9d3ec48564a6399bbabbf0d09f152b1e-templates/package.json", 
{
    "mappings": {
        "require.async": "a81d66805e2377970585ecd1237e83ab78636759-require.async"
    },
    "dirpath": "/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/templates"
}
, {"filename":"/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/test/use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/templates/package.json"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"a81d66805e2377970585ecd1237e83ab78636759-require.async/package.json"}
require.memoize("a81d66805e2377970585ecd1237e83ab78636759-require.async/package.json", 
{
    "main": "a81d66805e2377970585ecd1237e83ab78636759-require.async/require.async.js",
    "dirpath": "/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/node_modules/require.async"
}
, {"filename":"/freedom/0.workspace/0/0.FireWidgets/.deps/github.com~pinf~pinf-for-nodejs~0/source/installed/master/node_modules/require.async/package.json"});
// @pinf-bundle-ignore: 
});
// @pinf-bundle-report: {}