
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");

const PINF_CONTEXT = require("../lib/context");
const PINF_LOADER = require("../lib/loader");
const VM = require("../lib/vm").VM;
const RT_BUNDLER = require("../node_modules/pinf-it-bundler/lib/rt-bundler");


const VERBOSE = true;
const DEBUG = true;

describe("main", function() {


    it("01-MultipleMappedPackagesServerBundleLoadDynamic", function (callback) {

    	var programDescriptorPath = PATH.join(__dirname, "use-cases/01-MultipleMappedPackagesServerBundleLoadDynamic/program.json");
    	var distPath = PATH.join(programDescriptorPath, "../_dist");
    	
    	FS.removeSync(distPath);
    	FS.removeSync(PATH.join(programDescriptorPath, "../.rt"));
    	
    	var rootModule = "sub/comp.js";

		return PINF_CONTEXT.contextForModule(module, {
            "PINF_PROGRAM": programDescriptorPath,
            "PINF_RUNTIME": ""
        }, function(err, context) {
        	if (err) return callback(err);


        	function bundle (callback) {
/*
// NOTE: The 'VM' based alternative below uses a similar RT_BUNDLER setup as this here.
				var options = {
					$pinf: context,
					debug: DEBUG,
					verbose: VERBOSE,
					rootPath: PATH.dirname(programDescriptorPath),
					distPath: distPath,
					onRun: function(bundlePath, sandboxOptions, callback) {
						sandboxOptions.globals = {
			                console: {
			                    log: function(message) {
			                    	var args = Array.prototype.slice.call(arguments);
			                    	args.unshift("[program:" + rootModule + "]");
			                    	console.log.apply(console, args);
			                    },
			                    error: console.error
			                }
						};
						PINF_LOADER.reset();
						return PINF_LOADER.sandbox(bundlePath, sandboxOptions, function(sandbox) {
		                    return sandbox.main(function (err, rendered) {
		                	    if (err) return callback(err);
		
		                        ASSERT.deepEqual(rendered, {
		                            "rendered": {
		                                "foo": "bar"
		                            }
		                        });
		            			return callback(null);
		                    });
						}, callback);
					},
					getLoaderReport: function() {
						return PINF_LOADER.getReport();
					}
				};
				return RT_BUNDLER.bundlePackage("component", options, function(err, bundleDescriptors, helpers) {
					if (err) return callback(err);
					return callback(null);	
				});
*/

		        var vm = new VM(context);
		        return vm.loadProgram(programDescriptorPath, {
					distPath: distPath,
		            globals: {
		                console: {
		                    log: function(message) {
		                    	var args = Array.prototype.slice.call(arguments);
		                    	args.unshift("[program:" + rootModule + "]");
		                    	console.log.apply(console, args);
		                    },
		                    error: console.error
		                }
		            },
			        rootModule: rootModule,
			        rootModuleBundleOnly: true,
			        omitMtimeMeta: true,
					debug: DEBUG,
					verbose: VERBOSE,
					ttl: -1     // Always re-build
		        }, function (err, sandbox) {
		        	if (err) return callback(err);

                    return sandbox.main(function (err, rendered) {
                	    if (err) return callback(err);

                        ASSERT.deepEqual(rendered, {
                            "rendered": {
                                "foo": "bar"
                            }
                        });

            			return callback(null);
                    });
		        });


/*
// TODO: Fix this to produce the same dist output as the runtime loader above.
//       To generate the correct output all dynamic includes must be declared in the package descriptors.
	            return context.bundleProgram({
	                distPath: distPath,
			        rootModule: rootModule,
			        rootModuleBundleOnly: true,
			        omitMtimeMeta: true,
					debug: DEBUG,
					verbose: VERBOSE
	            }, function(err, summary) {
	                if (err) return callback(err);

console.log("summary", summary);

                    return callback(null);
	            });
*/
        	}

        	function load (callback) {

        		var bundlePath = PATH.join(distPath, rootModule);

				return PINF_LOADER.sandbox(bundlePath, {
					debug: DEBUG,
					verbose: VERBOSE,
					ttl: 0,     // Cache indefinite
		            globals: {
		                console: {
		                    log: function(message) {
		                    	var args = Array.prototype.slice.call(arguments);
		                    	args.unshift("[program:" + rootModule + "]");
		                    	console.log.apply(console, args);
		                    },
		                    error: console.error
		                }
		            },
					resolveDynamicSync: function (moduleObj, pkg, sandbox, canonicalId, options) {
						if (/^\//.test(canonicalId)) {
							return PATH.join(moduleObj.bundle.replace(/\.js$/, ""), canonicalId);
						} else {
							// TODO: Deal with package alias prefixes.
						}
						console.log("canonicalId", canonicalId);
		            	throw new Error("`resolveDynamicSync` should not be called here! Make sure all dynamic links are declared in the package descriptor!");
		            },
					ensureAsync: function(moduleObj, pkg, sandbox, canonicalId, options, callback) {
						// We assume dynamic link points to a generated bundle.
						return callback(null);
		            }
				}, function (sandbox) {
					return callback(null, sandbox);
				}, callback);
        	}

        	return bundle(function (err) {
        	    if (err) return callback(err);

            	return load(function (err, sandbox) {
            	    if (err) return callback(err);

                    return sandbox.main(function (err, rendered) {
                	    if (err) return callback(err);

                        ASSERT.deepEqual(rendered, {
                            "rendered": {
                                "foo": "bar"
                            }
                        });

            			return callback(null);
                    });
            	});
        	});
        });
    });

});
