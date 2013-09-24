
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const PACKAGE_INSIGHT = require("pinf-it-package-insight");
const VFS = require("../lib/vfs");
const PINF = require("..");

//const MODE = "test";
const MODE = "write";


describe('vfs', function() {

	this.timeout(20 * 1000);

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

		FS.removeSync(PATH.join(__dirname, "../.rt"));

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

		            var json = JSON.stringify(Object.keys(usedPaths));
		            var output = JSON.parse(json);
		            if (MODE === "test") {
		                ASSERT.deepEqual(
		                    output,
		                    JSON.parse(FS.readFileSync(PATH.join(__dirname, "assets/results", "pinf-vfs-0.json")))
		                );
		            } else
		            if (MODE === "write") {
		                FS.outputFileSync(PATH.join(__dirname, "assets/results", "pinf-vfs-0.json"), JSON.stringify(output, null, 4));
		            } else {
		                throw new Error("Unknown `MODE`");
		            }

					return callback(null);
				});
			});
		}, module, done);
	});

});
