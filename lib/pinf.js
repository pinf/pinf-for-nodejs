
const PATH = require("path");
const FS = require("fs-extra");
const LOADER = require("./loader");
const CONTEXT = require("./context");

exports.reset = LOADER.reset;

exports.sandbox = LOADER.sandbox;

exports.getReport = LOADER.getReport;

exports.context = CONTEXT.context;
exports.contextForModule = CONTEXT.contextForModule;


exports.main = function(main, module, callback) {
	if (typeof module === "function" && typeof callback === "undefined") {
		callback = module;
		module = null;
	}
	function done(err) {
		if (callback) return callback.apply(null, arguments);
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
			return main(done);
	    } catch(err) {
	        return done(err);
	    }		
	}
	// Don't call app unless it is the main file loaded or there is a callback registered.
	if (require.main !== module && !callback) {
		return;
	}
	return exports.contextForModule(module, function(err, context) {
		if (err) return done(err);
	    try {
			return main(context, done);
	    } catch(err) {
	        return done(err);
	    }		
	});
}
