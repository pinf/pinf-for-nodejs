// @pinf-bundle-ignore: 
PINF.bundle("", function(require) {
// @pinf-bundle-module: {"file":"client.js","mtime":1425845037,"wrapper":"commonjs","format":"commonjs","id":"/client.js"}
require.memoize("/client.js", 
function(require, exports, module) {var __dirname = '';


exports.main = function () {

	console.log("Greeting from util: " + require("./util").getGreeting());

}


}
, {"filename":"client.js"});
// @pinf-bundle-module: {"file":"util.js","mtime":1425845177,"wrapper":"commonjs","format":"commonjs","id":"/util.js"}
require.memoize("/util.js", 
function(require, exports, module) {var __dirname = '';


exports.getGreeting = function () {

	return "Hey from Util!";

}


}
, {"filename":"util.js"});
// @pinf-bundle-module: {"file":null,"mtime":0,"wrapper":"json","format":"json","id":"/package.json"}
require.memoize("/package.json", 
{
    "main": "/client.js",
    "dirpath": "."
}
, {"filename":"./package.json"});
// @pinf-bundle-ignore: 
});
// @pinf-bundle-report: {}