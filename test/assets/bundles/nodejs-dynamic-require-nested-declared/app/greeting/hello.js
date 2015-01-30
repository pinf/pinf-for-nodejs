// @pinf-bundle-ignore: 
PINF.bundle("", function(require) {
// @pinf-bundle-module: {"file":"hello.js","mtime":1421533770,"wrapper":"commonjs","format":"commonjs","id":"/hello.js"}
require.memoize("/hello.js", 
function(require, exports, module) {var __dirname = '';

var APP = require("./app");

exports.getWord = function() {

	var moduleId = "./greeting";

	var GREETING = require(moduleId);

	return APP.getLetterH() + "e" + GREETING.getLetterL() + "l" + require(("./" + "o")).getLetter();
}

}
, {"filename":"hello.js"});
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