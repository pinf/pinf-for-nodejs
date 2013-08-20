
require("require.async")(require);


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

	// TODO: Only continue below if no context found in cache.
	//       Only load cache module and determine cache path by looking at PINF_RUNTIME and own package uid (use pinf-primitives-js to do this).
	//		 Cache module is in primitives package as well.

	return require.async("./context", function(CONTEXT) {
		return CONTEXT.contextForModule(module, function(err, context) {
			if (err) return done(err);
		    try {
				return main(context, done);
		    } catch(err) {
		        return done(err);
		    }		
		});
	}, done);
}
