
const PATH = require("path");
const ASSERT = require("assert");
const PACKAGE_INSIGHT = require("pinf-it-package-insight");
const VFS = require("../lib/vfs");
const PINF = require("..");

const MODE = "test";
//const MODE = "write";


describe('vfs', function() {

	it('should export `open()`', function() {
		ASSERT(typeof VFS.open === "function");
	});

	it('`open("<file://...>")` should open filesystem based VFS', function(done) {
		var path = PATH.join(__dirname, "assets/vfs-1");
		return VFS.open("file://" + path, function(err, vfs) {
			if (err) return done(err);

			ASSERT.equal(typeof vfs, "object");
			ASSERT.equal(vfs._rootPath, path);

			return done(null);
		});
	});

	it("works for 'pinf-it-package-insight'", function(done) {

		return PINF.main(function(options, callback) {

			var opts = {
				test: true,
				rootPath: PATH.join(__dirname, "assets")
			};

			var path = PATH.join("packages", "package-b");
			return VFS.open("file://" + path, opts, function(err, vfs) {
				if (err) return callback(err);

				options.$pinf._api.FS = vfs;

				return PACKAGE_INSIGHT.parse(path, options.$pinf.makeOptions(opts), function(err, descriptor) {
					if (err) return callback(err);

					ASSERT.equal(typeof descriptor, "object");
					ASSERT.equal(typeof descriptor.id, "string");
					ASSERT.equal(descriptor.dirpath, path);
					ASSERT.equal(typeof descriptor.combined, "object");

					return vfs.getCacheManifest(opts, function(err, manifest) {
						if (err) return callback(err);

						ASSERT.equal(typeof manifest, "object");
						ASSERT.equal(typeof manifest.paths, "object");

						ASSERT.deepEqual(Object.keys(manifest.paths), [
						    "packages/package-b",
						    "packages/package-b/.package.json",
						    "packages/package-b/node_modules",
						    "packages/package-b/index.js",
						    "packages/node_modules",
						    "node_modules",
						    "packages/package-b/package.json"
						]);

						return callback(null);
					});
				});
			});
		}, module, done);
	});

});
