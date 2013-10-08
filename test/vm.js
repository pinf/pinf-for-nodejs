
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const VM = require("../lib/vm").VM;
const MAIN = require("../lib/main");
const CONTEXT = require("../lib/context");


const DEBUG = false;


describe("vm", function() {

    it("load package-a (force re-generate)", function(done) {
        return MAIN.main(function(options, callback) {
            var vm = new VM(options.$pinf);
            return vm.loadPackage(PATH.join(__dirname, "assets/packages/package-a"), {
                debug: DEBUG,
                $pinf: {
                    ttl: -1
                }
            }, function(err, sandbox) {
                if (err) return callback(err);
                var opts = {
                    key1: "value1"
                };
                return sandbox.main(opts, function(err, options) {
                    if (err) return callback(err);
                    ASSERT.deepEqual(opts, options);
                    return callback();
                });
            });
        }, module, done);
    });

    it("load package-a (from cache)", function(done) {
        return MAIN.main(function(options, callback) {
            var vm = new VM(options.$pinf);
            return vm.loadPackage(PATH.join(__dirname, "assets/packages/package-a"), {
                debug: DEBUG
            }, function(err, sandbox) {
                if (err) return callback(err);
                var opts = {
                    key1: "value1"
                };
                return sandbox.main(opts, function(err, options) {
                    if (err) return callback(err);
                    ASSERT.deepEqual(opts, options);
                    return callback();
                });
            });
        }, module, done);
    });

    it("load package-b", function(done) {
        return MAIN.main(function(options, callback) {
            var vm = new VM(options.$pinf);
            return vm.loadPackage(PATH.join(__dirname, "assets/packages/package-b"), {
                debug: DEBUG,
                $pinf: {
                    ttl: -1
                }
            }, function(err, sandbox) {
                if (err) return callback(err);
                var opts = {
                    key1: "value1"
                };
                return sandbox.main(opts, function(err, options) {
                    if (err) return callback(err);
                    ASSERT.deepEqual(opts, options);
                    return callback();
                });
            });
        }, module, done);
    });

    describe("load multiple complex packages", function() {

        this.timeout(40 * 1000);

        var context = null;
        var vm = null;

        it("init context", function(done) {
            FS.writeFileSync(PATH.join(__dirname, "program.json"), JSON.stringify({
                boot: {
                    package: "./assets/packages/vm-main/package.json"
                }
            }, null, 4));
            try { FS.removeSync(PATH.join(__dirname, ".rt")); } catch(err) {}
            return CONTEXT.contextForProgram(PATH.join(__dirname, "program.json"), {
                "PINF_RUNTIME": ""
            }, function(err, _context) {
                if (err) return done(err);
                context = _context;
                vm = new VM(context);
                return done();
            });
        });

        it("load vm-a", function(done) {

            var opts =  {
                rootModule: "on.js",
                verbose: false
            };

            var dirpath = PATH.join(__dirname, "assets/packages/vm-a");
            return vm.loadPackage(dirpath, opts, function(err, sandbox) {
                if (err) return done(err);
//                return CONTEXT.context(context.env.PINF_PROGRAM, PATH.join(dirpath, "package.json"), opts, function(err, ctx) {
//                    if (err) return done(err);
                    var mod = sandbox.require(opts.rootModule);
                    return mod.main({
//                        $pinf: ctx
                    }, function(err, result) {
                        if (err) {
                            console.error("ERROR", err.stack);
                            return done(err);
                        }
                        ASSERT.equal(result, "Hello World");
                        return done();
                    });
//                });
            });

        });

        it("load vm-b", function(done) {

            var opts =  {
                rootModule: "on.js",
                verbose: false
            };

            var dirpath = PATH.join(__dirname, "assets/packages/vm-b");
            return vm.loadPackage(dirpath, opts, function(err, sandbox) {
                if (err) return done(err);
//                return CONTEXT.context(context.env.PINF_PROGRAM, PATH.join(dirpath, "package.json"), opts, function(err, ctx) {
//                    if (err) return done(err);
                    var mod = sandbox.require(opts.rootModule);
                    return mod.main({
//                        $pinf: ctx
                    }, function(err, result) {
                        if (err) {
                            console.error("ERROR", err.stack);
                            return done(err);
                        }
                        ASSERT.equal(result, "Hello World");
                        return done();
                    });
//                });
            });

        });

        it("cleanup", function() {
            FS.unlinkSync(PATH.join(__dirname, "program.json"));
            try { FS.unlinkSync(PATH.join(__dirname, ".program.json")); } catch(err) {}
        });
    });

});
