
const PATH = require("path");
const PINF = require("../..");
const EXPRESS = require("express");
const SEND = require("send");
const HTTP = require("http");


return PINF.main(function(options, callback) {

	var app = EXPRESS();

	app.get(/^\/lib\/pinf-loader-js\/(.+)$/, function (req, res, next) {
		return SEND(req, req.params[0], {
			root: PATH.dirname(require.resolve("pinf-loader-js/package.json"))
		}).on("error", next).pipe(res);
	});

	app.get(/^\/bundles(\/client.+)$/, PINF.hoist(PATH.join(__dirname, "client/program.json"), options.$pinf.makeOptions({
		debug: true,
		verbose: true,
		PINF_RUNTIME: "",
		autoloadSourceChanges: true,
        $pinf: options.$pinf
    })));

	app.get(/^\/$/, function (req, res, next) {
		var html = [
			'<script src="/lib/pinf-loader-js/loader.js"></script>',
			'<script>',
				'PINF.sandbox("/bundles/client.js", function (sandbox) {',
					'sandbox.main();',
				'}, function (err) {',
					'console.error("Error while loading bundle \'/bundles/client.js\':", err.stack);',
				'});',
			'</script>'
		];
		return res.end(html.join("\n"));
	});

	HTTP.createServer(app).listen(3000)

}, module);
