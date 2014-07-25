// @pinf-bundle-ignore: 
PINF.bundle("", function(require) {
// @pinf-bundle-module: {"file":"app.js","mtime":1402713883,"wrapper":"commonjs","format":"commonjs","id":"/app.js"}
require.memoize("/app.js", 
function(require, exports, module) {var __dirname = '';

function main() {

	var moduleId = "./greeting";

	var GREETING = require(moduleId);

	console.log(GREETING.getGreeting());
}

exports.getWorld = function() {
	return "World";	
}

exports.getLetterH = function() {
	return "H";	
}

if (require.main === module) {
	main();
}

}
, {"filename":"app.js"});
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