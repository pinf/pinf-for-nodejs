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

	const PINF = require("pinf-for-nodejs");
	
	PINF.sandbox("<bundle path>", function(sandbox) {
		sandbox.main();
    });


Development
-----------

    make test


License
=======

[UNLICENSE](http://unlicense.org/)
