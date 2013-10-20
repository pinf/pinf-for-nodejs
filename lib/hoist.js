
const PATH = require("path");
const URL = require("url");
const PINF = require("..");
const SEND = require("send");


exports.hoist = function(programUri, options) {

	options = options || {};

	if (options.verbose) console.log("[pinf-for-nodejs][hoist]", "programUri", programUri);

	function hoist(callback) {

		return PINF.contextForProgram(programUri, {
            verbose: options.verbose || false,
            debug: options.debug || false
        }, function(err, $pinf) {
            if (err) return callback(err);

			var distPath = options.distPath || $pinf.makePath("bundles") || $pinf.makePath("cache", ["bundles", programUri]);

            return $pinf.bundleProgram({
                distPath: distPath
            }, function(err, summary) {
                if (err) return callback(err);

                summary.distPath = distPath;

				return callback(null, summary);
            });
        });
	}

	var responder = function(req, res, next) {
		res.writeHead(503, "Service Temporarily Unavailable", {
			"Content-Type": "text/plain",
			// `Retry-After` can be a relative number of seconds from now, or an RFC 1123 Date.
			"Retry-After": "5"
		});
		return res.end("Service Temporarily Unavailable\n");
	};

	hoist(function(err, summary) {
		if (err) {
			throw err;
		}

		if (options.verbose) console.log("[pinf-for-nodejs][hoist] Mounted", JSON.stringify(summary, null, 4));

		responder = function(req, res, next) {
			if (!Array.isArray(req.params)) {
				throw new Error("`req.param[0]` must be set to the uri to load.");
			}
			return SEND(req, req.params[0])
				.root(summary.distPath)
				.on("error", function (err) {
					if (err && err.code !== "ENOENT") return next(err);
					if (/^loader\./.test(req.params[0])) {
						return SEND(req, req.params[0])
							.root(PATH.join(__dirname, "../node_modules/pinf-loader-js"))
							.on("error", next)
							.on('directory', next)
							.pipe(res);
					}
					return next();
				})
				.on('directory', next)
				.pipe(res);
		};
	});

	return function(req, res, next) {
		return responder(req, res, next);
	};
}
