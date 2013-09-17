
const PATH = require("path");
const UTIL = require("util");
const URL = require("url");
const FS = require("fs-extra");
const WAITFOR = require("waitfor");
const EVENTS = require("events");


exports.open = function(uri, options, callback) {

	if (typeof options === "function" && typeof callback === "undefined") {
		callback = options;
		options = null;
	}
	options = options || {};

	try {

		var parsedUri = URL.parse(uri);

		if (parsedUri.protocol === "file:") {

			return callback(null, new FileFS(parsedUri.path || "/", options));

		} else {
			throw new Error("VFS for 'protocol' `" + protocol.protocol + "` not supported ('uri' `" + uri + "`)");
		}
	} catch(err) {
		return callback(err);
	}
}

exports.READ_METHODS = {
	"exists": true,
	"existsSync": true,
	"readFile": true,
	"readFileSync": true,
	"openSync": true,
	"readdir": true,
	"readdirSync": true,
	"lstat": true,
	"stat": true,
	"lstatSync": true,
	"statSync": true,
	"readlink": true,
	"readlinkSync": true,
	"createReadStream": true,
	"createWriteStream": true,
	"readJsonFile": true,
	"readJSONFile": true,
	"readJsonFileSync": true,
	"readJSONFileSync": true,
	"readJson": true,
	"readJSON": true,
	"readJsonSync": true,
	"readJSONSync": true,
	"open-read": true,
	"fstat": true,
	"read": true
};

exports.WRITE_METHODS = {
	"truncate": true,
	"truncateSync": true,
	"rmdir": true,
	"rmdirSync": true,
	"mkdir": true,
	"mkdirSync": true,
	"symlink": true,
	"symlinkSync": true,
	"unlink": true,
	"unlinkSync": true,
	"lchmod": true,
	"lchmodSync": true,
	"chmod": true,
	"chmodSync": true,
	"lchown": true,
	"lchownSync": true,
	"chown": true,
	"chownSync": true,
	"utimes": true,
	"utimesSync": true,
	"writeFile": true,
	"writeFileSync": true,
	"appendFile": true,
	"appendFileSync": true,
	"remove": true,
	"removeSync": true,
	"delete": true,
	"deleteSync": true,
	"createFile": true,
	"createFileSync": true,
	"outputFile": true,
	"outputFileSync": true,
	"outputJsonSync": true,
	"outputJSONSync": true,
	"outputJson": true,
	"outputJSON": true,
	"writeJsonFile": true,
	"writeJSONFile": true,
	"writeJsonFileSync": true,
	"writeJSONFileSync": true,
	"writeJson": true,
	"writeJSON": true,
	"writeJsonSync": true,
	"writeJSONSync": true,
	"open-write": true,
	"ftruncate": true,
	"write": true
};

var FileFS = function(rootPath, options) {
	var self = this;
	self._rootPath = rootPath;
	self._options = options;
	self.READ_METHODS = exports.READ_METHODS;
	self.WRITE_METHODS = exports.WRITE_METHODS;
}

UTIL.inherits(FileFS, EVENTS.EventEmitter);


FileFS.prototype.notifyUsedPath = function(path, method) {
	this.emit("used-path", path, method);	
}
// Intercept all FS methods that have a path like argument.
Object.keys(FS).forEach(function(name) {
	var source = null;
	var args = null;
	var index = -1;
	if (name === "open") {
		FileFS.prototype[name] = function() {
			var mode = "write";
			if (arguments[1] === "r" || arguments[1] === "rs") {
				mode = "read";
			}
			this.notifyUsedPath(arguments[0], name + "-" + mode);
			return FS[name].apply(null, arguments);
		};
	} else
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
			this.notifyUsedPath(arguments[index], name);
			return FS[name].apply(null, arguments);
		};
	} else {
		FileFS.prototype[name] = FS[name];
	}
});

