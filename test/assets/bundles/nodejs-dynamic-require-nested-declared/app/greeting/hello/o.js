// @pinf-bundle-ignore: 
PINF.bundle("", function(require) {
// @pinf-bundle-module: {"file":"o.js","mtime":1421533770,"wrapper":"commonjs","format":"commonjs","id":"/o.js"}
require.memoize("/o.js", 
function(require, exports, module) {var __dirname = '';

exports.getLetter = function() {
	return "o";
}

}
, {"filename":"o.js"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"/package.json"}
require.memoize("/package.json", 
{
    "main": "/app.js",
    "dirpath": "."
}
, {"filename":"./package.json"});
// @pinf-bundle-ignore: 
});
// @pinf-bundle-report: {}