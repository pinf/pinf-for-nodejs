
var CONNECT_DISPATCH = require("connect-dispatch/dispatch"),
	JSGI = require("pinf-server/vendor/connect/middleware/jsgi"),
	PROGRAM_SERVER = require("pinf/program-server"),
	FILE = require("modules/file"),
	MD5 = require("modules/md5"),
	QUERYSTRING = require("nodejs/querystring");
	HTTP = require("nodejs/http"),
	FS = require("nodejs/fs"),
	ZLIB = require("nodejs/zlib");
	
const ROOT_PATH = FILE.dirname(FILE.dirname(FILE.dirname(module.id)));


exports.main = function(options)
{
	if (!options.stacks)
	{
		module.print("\0red(" + "Serve this program by using the '--script serve' option for the 'commonjs' command! e.g. 'commonjs --script serve ./ -v ./'" + "\0)\n");
		return;
	}

    var CONNECT = options.stacks.connect.instance;

    options.stacks.connect.start(

        CONNECT.createServer(
    		CONNECT_DISPATCH({
              	
              	"/ui.*": JSGI.jsgi(
	                new PROGRAM_SERVER.JSGI({
	                    map: {
	                        "/ui.js": {
	                            programPath: FILE.dirname(module.id) + "/ui/program.json"
	                        }
	                    },
	                    trackRoutes: true
	                }).responder(null)
	            ),

	            "/loader.js": function(req, res)
				{
					res.setHeader("Content-Type", "text/javascript");
					res.end(getRawSource());
				},

	            "/loader.stripped.js": function(req, res)
				{
					res.setHeader("Content-Type", "text/plain");
					res.end(getStrippedSource());
				},

	            "/loader.min.js": function(req, res)
				{
					res.setHeader("Content-Type", "text/plain");
					getMinifiedSource(function(source)
					{
						res.end(source);
					});
				},

	            "/loader.min.js.gz": function(req, res)
				{
					res.setHeader("Content-Type", "application/x-javascript");
					res.setHeader("Content-Encoding", "gzip");
					getMinifiedSource(function()
					{
						var raw = FS.createReadStream(ROOT_PATH + "/loader.min.js.gz");
					    res.writeHead(200, {
							"content-encoding": "gzip"
						});
				    	raw.pipe(res);
					});
				},

	            "/loader.min.js.gz-size": function(req, res)
				{
					res.setHeader("Content-Type", "text/plain");
					FS.stat(ROOT_PATH + "/loader.min.js.gz", function(err, stat)
					{
						res.end("" + stat.size);
					});
				},

	            "/.*": CONNECT.static(FILE.dirname(module.id) + "/www", {
    	            maxAge: 0
    	        })  
        	})
        )
    );
}

function getRawSource()
{
	return FILE.read(ROOT_PATH + "/loader.js");
}

function getStrippedSource()
{
	var source = getRawSource();
	
	source = source.split("\n").filter(function(line)
	{
		return !(/\/\*DEBUG\*\//.test(line));
	}).join("\n");

	source = "\n\n// WARNING: DO NOT EDIT THIS FILE! IT IS AUTO-GENERATED FROM ./loader.js BY STRIPPING '/*DEBUG*/' LINES.\n\n\n" + source;

	FILE.write(ROOT_PATH + "/loader.stripped.js", source);

	return source;
}

function getMinifiedSource(callback)
{
	var source = getStrippedSource(),
		sourceHash = MD5.hash_md5(source),
		fileHash = false;
		
	function done()
	{
		callback(FILE.read(ROOT_PATH + "/loader.min.js"));		
	}
	
	if (FILE.exists(ROOT_PATH + "/loader.stripped.js.md5"))
	{
		fileHash = FILE.read(ROOT_PATH + "/loader.stripped.js.md5");
	}
	
	if (sourceHash != fileHash)
	{
		console.log("Minifying loader.js using Google Closure ...");
		
		compileSource(source, function(compiledSource)
		{
			FILE.write(ROOT_PATH + "/loader.min.js", compiledSource);
			
			var inp = FS.createReadStream(ROOT_PATH + "/loader.min.js");
			var out = FS.createWriteStream(ROOT_PATH + "/loader.min.js.gz");

			inp.pipe(ZLIB.createGzip()).pipe(out);

			FILE.write(ROOT_PATH + "/loader.stripped.js.md5", sourceHash);
			
			console.log("... OK");

			done();
		});
	}
	else
	{
		done();
	}
}


function compileSource(codestring, callback)
{
	// @credit http://stackoverflow.com/questions/6158933/http-post-request-in-node-js

	var post_data = QUERYSTRING.stringify({
			'compilation_level' : 'SIMPLE_OPTIMIZATIONS',
			'output_format': 'json',
			'output_info': 'compiled_code',
			'js_code' : codestring
		});

	// An object of options to indicate where to post to
	var post_options = {
		host: 'closure-compiler.appspot.com',
		port: '80',
		path: '/compile',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length
		}
	};

	// Set up the request
	var post_req = HTTP.request(post_options, function(res) {
		res.setEncoding('utf8');
		var data = [];
		res.on('data', function(chunk) {
			data.push(chunk);
		});
		res.on('end', function() {
			callback(JSON.parse(data.join("")).compiledCode);
		});
	});

	// post the data
	post_req.write(post_data);
	post_req.end();	
}