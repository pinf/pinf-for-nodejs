
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs");
const Q = require("q");
const REQUEST = require("request");
const LOADER = require("../lib/loader");


describe("loader-bundles", function() {

    var featuresPath = PATH.join(require.resolve("pinf-loader-js/package.json"), "..", "features");

    var logBuffer = {};

    function logToBuffer(moduleObj, arguments) {
        var uri = moduleObj.require.sandbox.id + moduleObj.id;
        if (uri.substring(0, featuresPath.length) === featuresPath) {
            uri = uri.substring(featuresPath.length);
        }
        logBuffer[uri] = arguments[0];
    }

    var sandboxOptions = {
        onInitModule: function(moduleInterface, moduleObj) {
            moduleObj.require.API = {
                Q: Q,
                FETCH: function(uri, callback) {
                    if (/^\//.test(uri)) {
                        return FS.readFile(uri, "utf8", callback);
                    } else {
                        return REQUEST(uri, function(err, result) {
                            if (err) return callback(err);
                            return callback(null, result.body);
                        });
                    }
                }
            };
            moduleInterface.log = function() {
                logToBuffer(moduleObj, arguments);
            };
            moduleInterface.logForModule = function(moduleObj, arguments) {
                logToBuffer(moduleObj, arguments);
            };
        }
    };


    FS.readdirSync(featuresPath).forEach(function(filename) {
        if (!/^\d{2}-[^\.]*\.js$/.test(filename)) return;

        it(filename.replace(/\.js$/,""), function(done) {

            return LOADER.sandbox(PATH.join(featuresPath, filename), sandboxOptions, function(sandbox) {
                return Q.when(sandbox.main({
                    debug: true
                }), function() {
                    return done(null);
                }).fail(done);
            }, done);

        });

    });

    it("verify output", function() {
        ASSERT.deepEqual(logBuffer, {
            "/01-HelloWorld/main.js": "Hello from 01-HelloWorld!",
            "/02-ReturnExports/main.js": "Hello from 02-ReturnExports!",
            "/03-SpecifyMain/init.js": "Hello from 03-SpecifyMain!",
            "/04-PackageLocalDependencies/main.js": "Hello from 04-PackageLocalDependencies!",
            "/05-CrossPackageDependenciespackageA/logger.js": "Hello from 05-CrossPackageDependencies!",
            "/06-JsonModule/main.js": "Hello from 06-JsonModule!",
            "/07-TextModule/main.js": "Hello from 07-TextModule!",
            "/08-ResourceURI/main.js": "Hello from 08-ResourceURI!",
            "/09-LoadBundle/main.js": "Hello from 09-LoadBundle!",
            "/09-LoadBundle/ExtraBundle.js": "Hello from 09-LoadBundle/ExtraBundle!",
            "/10-Sandbox/main.js": "Hello from 10-Sandbox!",
            "/10-Sandbox/SandboxedExtraBundle/main.js": "Hello from 10-Sandbox/SandboxedExtraBundle!",
            "/11-CrossDomain/main.js": "Hello from 11-CrossDomain!",
            "http://rawgithub.com/pinf/pinf-loader-js/master/features/11-CrossDomain/CrossDomainBundle/main.js": "Hello from 11-CrossDomain/CrossDomainBundle!",
            "/12-Environment/main.js": "Hello from 12-Environment!",
            "/13-AssignExports/main.js": "Hello from 13-AssignExports!",
            "/14-NamedBundle/main.js": "Hello from 14-NamedBundle!",
            "/15-GlobalDependencyFallbackpackageA/logger.js": "Hello from 15-GlobalDependencyFallback!",
            "/16-MemoizedDynamic/main.js": "Hello from 16-MemoizedDynamic!",
            "/16-MemoizedDynamic/Dynamic.js": "Hello from 16-MemoizedDynamic/Dynamic!",
            "/17-LoadPackageDependency/main.js": "Hello from 17-LoadPackageDependency!",
            "/17-LoadPackageDependencyExtraPackageID/ExtraModule.js": "Hello from 17-LoadPackageDependency/ExtraPackageID/ExtraModule!"
        });
    });

});
