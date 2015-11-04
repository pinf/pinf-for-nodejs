
const PATH = require("path");
const FS = require("fs");
const URL = require("url");
const PINF = require("..");
const SEND = require("send");
const Q = require("q");

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

            var distPath = options.distPath;

            if (!distPath) {
				if (
					options.bootProgramDescriptorOverlay &&
					options.bootProgramDescriptorOverlay.layout &&
					options.bootProgramDescriptorOverlay.layout.directories &&
					options.bootProgramDescriptorOverlay.layout.directories.bundles
				) {
					distPath = PATH.join(programUri, "..", options.bootProgramDescriptorOverlay.layout.directories.bundles);
				} else {
					distPath = options.distPath || $pinf.makePath("bundles") || $pinf.makePath("cache", ["bundles", programUri]);
				}
			}

            return $pinf.bundleProgram({
                distPath: distPath,
                bootProgramDescriptorOverlay: options.bootProgramDescriptorOverlay || null,
                plugins: options.plugins || {}
            }, function(err, summary) {
                if (err) return callback(err);

                summary.distPath = distPath;

				return callback(null, summary);
            });
        });
	}

	var responder = function (req, res, next) {
		res.writeHead(503, "Service Temporarily Unavailable", {
			"Content-Type": "text/plain",
			// `Retry-After` can be a relative number of seconds from now, or an RFC 1123 Date.
			"Retry-After": "5"
		});
		return res.end("Service Temporarily Unavailable\n");
	};

	var firstBuildDeferred = Q.defer();
	if (options.waitForBuild) {
		responder = function (req, res, next) {
			return firstBuildDeferred.promise.then(function (app) {
				return app(req, res, next);
			});
		}
	}

	hoist(function(err, summary) {
		if (err) {
			firstBuildDeferred.reject(err);
			console.error("ERROR", err.stack);
		}

		if (options.verbose) console.log("[pinf-for-nodejs][hoist] Mounted", JSON.stringify(summary, null, 4));

		var staticResponder = function (req, res, next) {
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


			if (/^loader\./.test(req.params[0])) {
				return SEND(req, req.params[0])
					.root(PATH.join(__dirname, "../node_modules/pinf-loader-js"))
					.on("error", next)
					.on('directory', next)
					.pipe(res);
			}
			
			return FS.exists(PATH.join(summary.distPath, req.params[0]), function (exists) {
				if (!exists) return next();

				return SEND(req, path)
					.root(summary.distPath)
					.on("error", next)
					.maxage(60 * 60 * 1000)	// 1 hour
					.pipe(res);				
			});
		};

		if (options.autoloadSourceChanges) {
			if (options.verbose) console.log("[pinf-for-nodejs][hoist] Mounting in autoload source changes mode ...");

			responder = function (req, res, next) {
				// First we re-build.
				return hoist(function(err, summary) {
					if (err) return next(err);

					// Then we serve built bundles making sure that client does not cache it.

					res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
					res.setHeader("Pragma", "no-cache");
					res.setHeader("Expires", "0");

					return staticResponder(req, res, next);
				});
			};

		} else {
			if (options.verbose) console.log("[pinf-for-nodejs][hoist] Mounting in static generated bundle mode ...");

			responder = staticResponder;
		}

		firstBuildDeferred.resolve(responder);
		return;
	});

	return function (req, res, next) {
		return responder(req, res, next);
	};
}
