*Status: DEV*

PINF JavaScript Loader for NodeJS
=================================

A [NodeJS](http://nodejs.org/) module for
loading [PINF JavaScript Bundles](https://github.com/pinf/pinf-loader-js).

Any portable bundle may be loaded. Modules and packages written for NodeJS may also
be [bundled](https://github.com/pinf-it/pinf-it-bundler) and loaded.


Install
-------

    npm install pinf-for-nodejs


Usage
-----

`app.js`

    const PATH = require("path");
	const PINF = require("pinf-for-nodejs");
    
	PINF.sandbox(PATH.resolve("bundle.js"), function(sandbox) {
		sandbox.main();
    });

`bundle.js`

    PINF.bundle("", function(require) {
        require.memoize("/main.js", function(require, exports, module) {
            exports.main = function(options) {
                console.log("HelloWorld!");
            }
        });
    });


Development
-----------

    make test


License
=======

[UNLICENSE](http://unlicense.org/)
