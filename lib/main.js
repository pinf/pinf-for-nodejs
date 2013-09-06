
require("require.async")(require);


exports.main = function(main, module, options, callback) {
	if (typeof module === "function" && typeof options === "undefined" && typeof callback === "undefined") {
		callback = module;
		module = null;
	}
	if (typeof options === "function" && typeof callback === "undefined") {
		callback = options;
		options = null;
	}

	options = options || {};

	function done(err) {
		if (callback) {
			try {
				return callback.apply(null, arguments);
			} catch(err) {
                console.error(err.stack);
	            process.exit(1);
			}
		}
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
			var ret = main(done);			
			if (ret === true) {
				return done(null);
			}
			return;
	    } catch(err) {
	        return done(err);
	    }
	}

	module.exports.main = main;

	// Don't call app unless it is the main file loaded or there is a callback registered.
	if (require.main !== module && !callback) {
		return;
	}

	// TODO: module.pinf should be set and memoized in bundle based on the program context and available at `module.pinf`.
	if (typeof module.pinf === "object") {
		return callback(null, module.pinf);
	}

	// TODO: Only continue below if no context found in cache.
	//       Only load cache module and determine cache path by looking at PINF_RUNTIME and own package uid (use pinf-primitives-js to do this).
	//		 Cache module is in primitives package as well.
	return require.async("./context", function(CONTEXT) {
		return CONTEXT.contextForModule(module, options, function(err, context) {
			if (err) return done(err);
		    try {
		    	var opts = {};
		    	for (var name in options) {
		    		opts[name] = options[name];
		    	}
		    	opts.$pinf = context;
				var ret = main(opts, done);
				if (ret === true) {
					return done(null);
				}
				return;
		    } catch(err) {
		        return done(err);
		    }		
		});
	}, done);
}
