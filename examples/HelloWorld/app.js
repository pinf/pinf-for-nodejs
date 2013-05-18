
const PATH = require("path");
const PINF = require("../..");

PINF.sandbox(PATH.resolve("bundle.js"), function(sandbox) {
	sandbox.main();
});
