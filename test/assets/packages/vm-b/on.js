
const PINF_FOR_NODEJS = require("pinf-for-nodejs");


PINF_FOR_NODEJS.main(function(options, callback) {

	// NOTE: We use a non- string literal module id to trigger a dynamic require.
	//       We also declare this dynamic require in package.json so we don't trigger
	//		 a `Error: Bundling dynamic require '/extra.js' for '<main>'.` error.
	var world = require("./" + "extra").getWorld();

	return callback(null, "Hello " + world);

}, module);
