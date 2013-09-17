
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const RT_BUNDLER = require("pinf-it-bundler/lib/rt-bundler");
const LOADER = require("./loader");
const CONTEXT = require("./context");
const VFS = require("./vfs");


var VM = exports.VM = function($pinf) {
	this.$pinf = $pinf;
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
		return callback(null, self.sandboxes[key]);
	}

	var distPath = self.$pinf.makePath("cache", PATH.join("vm", CONTEXT.uriToFilename(uri), "dist"));
	var opts = self.$pinf.makeOptions({
		$pinf: options.$pinf || null,
		verbose: options.verbose || false,
		debug: options.debug || false,
		test: options.test || false,
		rootPath: options.rootPath,
		rootModule: options.rootModule,
		distPath: distPath,
		onRun: function(bundlePath, sandboxOptions, callback) {
			return LOADER.sandbox(bundlePath, sandboxOptions, function(sandbox) {
				return callback();
			}, callback);
		},
		getLoaderReport: function() {
			return LOADER.getReport();
		}
	});

	if (options.$pinf && options.$pinf.ttl === -1) {
		// Remove the dist path to force re-generate the bundle.
		FS.removeSync(opts.distPath);
	} else {
		// TODO: We don't remove the dist path by default now that the bundler cache is working.
		//       We may still need to get the bundler to delete the dist file or clean it up
		//		 rather than just agument it if it retains stale data.
	}

	return VFS.open("file://", opts, function(err, vfs) {
		if (err) return callback(err);

		opts.$pinf._api.FS = vfs;

		return RT_BUNDLER.bundlePackage(uri, opts, function(err, bundleDescriptors, helpers) {
			if (err) return callback(err);

			return LOADER.sandbox(bundleDescriptors["#pinf"].data.rootBundlePath, {
				verbose: options.verbose || false,
				debug: options.debug || false,
	            resolveDynamicSync: helpers.resolveDynamicSync,
	            ensureAsync: helpers.ensureAsync
			}, function(sandbox) {
				self.sandboxes[key] = sandbox;
				return callback(null, sandbox);
			}, callback);
		});
	});
}
