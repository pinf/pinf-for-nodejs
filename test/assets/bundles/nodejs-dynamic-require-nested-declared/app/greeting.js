// @pinf-bundle-ignore: 
PINF.bundle("", function(require) {
// @pinf-bundle-module: {"file":"greeting.js","mtime":1379961364,"wrapper":"commonjs","format":"commonjs","id":"/greeting.js"}
require.memoize("/greeting.js", 
function(require, exports, module) {var __dirname = '';

var APP = require("./app");

exports.getGreeting = function() {

	var moduleId = "./hello";

	var HELLO = require(moduleId);

	return HELLO.getWord() + " " + APP.getWorld();
}

exports.getLetterL = function() {
	return "l";	
}

}
, {"filename":"greeting.js"});
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