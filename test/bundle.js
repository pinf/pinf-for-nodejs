
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const SPAWN = require("child_process").spawn;
const PINF = require("..");
const VM = require("../lib/vm").VM;


//const MODE = "test";
const MODE = "write";


describe("bundle", function() {

    this.timeout(30 * 1000);

    [
        "nodejs-dynamic-require-nested-declared"
    ].forEach(function(dirname) {

        var context = null;

        it("init - " + dirname, function(done) {
            FS.writeFileSync(PATH.join(__dirname, "program.json"), JSON.stringify({
                "boot": {
                    "package": "../node_modules/pinf-it-bundler/test/assets/packages/" + dirname
                }
            }, null, 4));
            try { FS.removeSync(PATH.join(__dirname, ".rt")); } catch(err) {}
            return PINF.contextForModule(module, {
                "PINF_PROGRAM": PATH.join(__dirname, "program.json"),
                "PINF_RUNTIME": "",
                verbose: false,
                debug: false
            }, function(err, _context) {
                if (err) return done(err);
                context = _context;
                return done();
            });
        });

        it("bundle - " + dirname, function(done) {
            var options = {
                distPath: PATH.join(__dirname, "assets/bundles/" + dirname)
            };
            return context.bundleProgram(options, function(err, summary) {
                if (err) return done(err);
                ASSERT.deepEqual(summary, {
                    bundles: {
                        "./app.js": {}
                    }
                });
                return done();
            });
        });

        it("rewrite descriptors - " + dirname, function(done) {
            FS.writeFileSync(PATH.join(__dirname, "program.json"), JSON.stringify({
                "boot": {
                    "package": "./assets/bundles/" + dirname + "/package.json"
                }
            }, null, 4));
            return PINF.contextForModule(module, {
                "PINF_PROGRAM": PATH.join(__dirname, "program.json"),
                "PINF_RUNTIME": "",
                verbose: false,
                debug: false
            }, function(err, _context) {
                if (err) return done(err);
                context = _context;
                return done();
            });
        });

        it("run bundle - " + dirname, function(done) {            
            var vm = new VM(context);
            // We delete the runtime cache to prepare for a test to ensure
            // the package was not scanned before running.
            try { FS.removeSync(PATH.join(__dirname, ".rt")); } catch(err) {}
            var buffer = [];
            PINF.reset();
            return vm.loadPackage("assets/bundles/" + dirname, {
                globals: {
                    console: {
                        log: function(message) {
                            buffer.push(message);
                        },
                        error: console.error
                    }
                },
                rootPath: __dirname
            }, function(err, sandbox) {
                if (err) return done(err);

                function callback(err, result) {
                    if (err) {
                        console.error(err.stack);
                        return done(err);
                    }

                    var keys = null;
                    if (typeof result === "object") {
                        keys = Object.keys(result);
                    }
                    if (result && result.$pinf) {
                        result.$pinf = JSON.parse(result.$pinf.stringify());
                    }
                    result = JSON.stringify(result);
                    result = result.replace(new RegExp(__dirname.replace(/(\/|\+|\.)/g, "\\$1"), "g"), "");
                    result = JSON.parse(result);
                    if (keys) {
                        keys.forEach(function(name) {
                            if (typeof result[name] === "undefined") {
                                result[name] = {};
                            }
                        });
                    }
                    if (result && result.$pinf) result.$pinf.now = 0;

                    var basePath = PATH.join(__dirname, "assets/bundles/" + dirname);
                    if (MODE === "test") {
                        ASSERT.deepEqual(buffer, JSON.parse(FS.readFileSync(PATH.join(basePath, ".result/console.json"))));
                        ASSERT.deepEqual(result, JSON.parse(FS.readFileSync(PATH.join(basePath, ".result/api.json"))));
                        ASSERT.deepEqual(
                            PINF.getReport().sandboxes,
                            JSON.parse(FS.readFileSync(PATH.join(basePath, ".result/loader-report.json")))
                        );
                    } else {
                        FS.outputFileSync(PATH.join(basePath, ".result/console.json"), JSON.stringify(buffer, null, 4));
                        FS.writeFileSync(PATH.join(basePath, ".result/api.json"), JSON.stringify(result, null, 4));
                        FS.writeFileSync(PATH.join(basePath, ".result/loader-report.json"), JSON.stringify(PINF.getReport().sandboxes, null, 4));
                    }

                    return done();
                }
                try {
                    result = sandbox.main(callback);
                } catch(err) {
                    return done(err);
                }
                if (typeof result === "function") {
                    result = result();
                }
                if (result !== null) {
                    return callback(null, result);
                }
                throw new Error("We should never get here!");
            });
        });

        it("run - " + dirname, function(done) {


            return done();
        });

        it("cleanup - " + dirname, function() {
            FS.unlinkSync(PATH.join(__dirname, "program.json"));
            try { FS.removeSync(PATH.join(__dirname, ".rt")); } catch(err) {}
            try { FS.unlinkSync(PATH.join(__dirname, ".program.json")); } catch(err) {}
        });
    });

});
