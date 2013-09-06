
const PATH = require("path");
const URL = require("url");
const FS = require("fs-extra");
const WAITFOR = require("waitfor");


exports.open = function(uri, options, callback) {

	if (typeof options === "function" && typeof callback === "undefined") {
		callback = options;
		options = null;
	}
	options = options || {};

	try {

		var parsedUri = URL.parse(uri);

		if (parsedUri.protocol === "file:") {

			return callback(null, new FileFS(parsedUri.path));

		} else {
			throw new Error("VFS for 'protocol' `" + protocol.protocol + "` not supported ('uri' `" + uri + "`)");
		}
	} catch(err) {
		return callback(err);
	}
}


var FileFS = function(rootPath) {
	var self = this;
	self._rootPath = rootPath;
	self._usedPaths = {};
}

// Intercept all methods that read from the FS without modifying it.
var intercept = [
	"exists",
	"existsSync",
	"readFile",
	"readFileSync",
	"open",
	"openSync",
	"readdir",
	"readdirSync",
	"lstat",
	"stat",
	"lstatSync",
	"statSync",
	"readlink",
	"readlinkSync",
	"createReadStream",
	"createWriteStream",
	"readJsonFile",
	"readJSONFile",
	"readJsonFileSync",
	"readJSONFileSync",
	"readJson",
	"readJSON",
	"readJsonSync",
	"readJSONSync"
];
intercept.forEach(function(name) {
	var source = null;
	var args = null;
	var index = -1;
	if (
		typeof FS[name] === "function" &&
		/^[a-z]/.test(name) &&
		(source = FS[name].toString()) &&
		(args = source.match(/function[^\(]+\(([^\)]*)\)/)[1].split(", ")) &&
		(
			(index = args.indexOf("path")) >= 0 ||
			(index = args.indexOf("dir")) >= 0 ||
			(index = args.indexOf("file")) >= 0 ||
			(index = args.indexOf("filename")) >= 0
		)
	) {
		FileFS.prototype[name] = function() {
			if (!this._usedPaths[arguments[index]]) {
				this._usedPaths[arguments[index]] = {
					methods: []
				};
			}
			this._usedPaths[arguments[index]].methods.push(name);
			return FS[name].apply(null, arguments);
		};
	} else {
		FileFS.prototype[name] = FS[name];
	}
});

FileFS.prototype.getCacheManifest = function(options, callback) {
	var self = this;
	if (typeof options === "function" && callback === "undefined") {
		callback = options;
		options = null;
	}
	options = options || {};
	function _relpath(path) {
		if (!path || !options.rootPath || !/^\//.test(path)) return path;
		return PATH.relative(options.rootPath, path);
	}
	var waitfor = WAITFOR.parallel(function(err) {
		if (err) return callback(err);
		var manifest = {
			paths: {}
		};
		for (var path in self._usedPaths) {
			manifest.paths[_relpath(path)] = {
				mtime: self._usedPaths[path].mtime
			};
		}
		return callback(null, manifest);
	});
	for (var path in self._usedPaths) {
		if (typeof self._usedPaths[path].mtime === "undefined") {
			waitfor(path, function(path, done) {
				return FS.exists(path, function(exists) {
					if (!exists) {
						self._usedPaths[path].mtime = -1;
						return done();
					}
					return FS.stat(path, function(err, stat) {
						if (err) return done(err);
						self._usedPaths[path].mtime = stat.mtime.getTime();
						return done();
					});
				});
			});
		}
	}
	return waitfor();
}
