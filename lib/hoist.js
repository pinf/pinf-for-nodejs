
const PATH = require("path");
const URL = require("url");
const PINF = require("..");
const SEND = require("send");


// TODO: Allow option to hoist programs sequentially instead of in parallel as is the
//       default when declaring more than one hoise at a time when setting up routes.

exports.hoist = function(programUri, options) {

	options = options || {};

	if (options.verbose) console.log("[pinf-for-nodejs][hoist]", "programUri", programUri);

	function hoist (callback) {

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
			if (typeof req.params !== "object" || typeof req.params[0] !== "string") {
				throw new Error("`req.param[0]` must be set to the uri to load.");
			}
			var path = req.params[0];
			if (summary.bundles[req.params[0]]) {
				path = summary.bundles[req.params[0]];
			}

			// HACK: Removing content-length as SEND gets it wrong too!
			// TODO: Find a way to determine content length 100% accurately.
			var _setHeader = res.setHeader;
			res.setHeader = function () {
				_setHeader.apply(res, arguments);
				res.removeHeader("Content-Length");
			}

			return SEND(req, path)
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
				.maxage(60 * 60 * 1000)	// 1 hour
				.on('directory', next)
				.pipe(res);
		};
	});

	return function(req, res, next) {
		return responder(req, res, next);
	};
}