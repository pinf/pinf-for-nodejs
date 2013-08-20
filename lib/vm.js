
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const RT_BUNDLER = require("pinf-it-bundler/lib/rt-bundler");
const PINF = require("..");
const CONTEXT = require("./context");


var VM = exports.VM = function(PINF_CONTEXT) {
	this.PINF_CONTEXT = PINF_CONTEXT;
	this.sandboxes = {};
}

VM.prototype.loadPackage = function(uri, options, callback) {
	var self = this;
	if (typeof options === "function" && typeof callback === "undefined") {
		callback = options;
		options = null;
	}
	options = options || {};
	var key = uri + ":" + (options.rootModule || "");
	if (self.sandboxes[key]) {
		return callback(null, self.sandboxes[uri]);
	}
	var distPath = self.PINF_CONTEXT.makePath("cache", PATH.join("vm", CONTEXT.uriToFilename(uri), "dist"));
	var lastBundlePath = null;
	var opts = {
		verbose: options.verbose || false,
		debug: options.debug || false,
		test: options.test || false,
		rootModule: options.rootModule,
		distPath: distPath,
		onRun: function(bundlePath, sandboxOptions, callback) {
			lastBundlePath = bundlePath;
			return PINF.sandbox(bundlePath, sandboxOptions, function(sandbox) {
				return callback();
			}, callback);
		},
		getLoaderReport: function() {
			return PINF.getReport();
		}
	};
	FS.removeSync(opts.distPath);
	return RT_BUNDLER.bundlePackage(uri, opts, function(err, bundleDescriptors, helpers) {
		if (err) return callback(err);
		return PINF.sandbox(lastBundlePath, {
			verbose: options.verbose || false,
			debug: options.debug || false,
            resolveDynamicSync: helpers.resolveDynamicSync,
            ensureAsync: helpers.ensureAsync
		}, function(sandbox) {
			self.sandboxes[key] = sandbox;
			return callback(null, sandbox);
		}, callback);
	});
}
