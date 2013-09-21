
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

	it('`open("file://")` should open filesystem based VFS', function(done) {
		return VFS.open("file://", function(err, vfs) {
			if (err) return done(err);

			ASSERT.equal(typeof vfs, "object");
			ASSERT.equal(vfs._rootPath, "/");

			return done(null);
		});
	});

	it("works for 'pinf-it-package-insight'", function(done) {

		return PINF.main(function(options, callback) {

			var opts = {
				test: true,
				rootPath: PATH.join(__dirname, "assets")
			};

			return VFS.open("file://" + opts.rootPath, opts, function(err, vfs) {
				if (err) return callback(err);

				options.$pinf._api.FS = vfs;

				ASSERT.equal(typeof vfs.on, "function");

				var usedPaths = {};
				function relpath(path) {
					if (!path || !opts.rootPath || !/^\//.test(path)) return path;
					return PATH.relative(opts.rootPath, path);
				}
				vfs.on("used-path", function(path) {
					usedPaths[relpath(path)] = true;
				});

				var path = PATH.join("packages", "package-b");
				return PACKAGE_INSIGHT.parse(path, options.$pinf.makeOptions(opts), function(err, descriptor) {
					if (err) return callback(err);

					ASSERT.equal(typeof descriptor, "object");
					ASSERT.equal(typeof descriptor.id, "string");
					ASSERT.equal(descriptor.dirpath, path);
					ASSERT.equal(typeof descriptor.combined, "object");

					ASSERT.deepEqual(Object.keys(usedPaths), [
						"packages/package-b",
						"packages/package-b/.package.json",
						"packages/package-b/node_modules",
						"packages/package-b/index.js",
						"packages/node_modules",
						"packages/package-b/package.json",
						"node_modules"
					]);

					return callback(null);
				});
			});
		}, module, done);
	});

});
