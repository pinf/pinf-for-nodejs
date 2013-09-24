
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const Q = require("q");
const CONTEXT = require("../lib/context");
const PINF = require("..");

//const MODE = "test";
const MODE = "write";


describe("context", function() {

    this.timeout(20 * 1000);

    describe("load", function() {

        var options = {
            rootPath: PATH.join(__dirname, "assets")
        };

        [
            {
                program: "a",
                package: "a",
                env: {
                    "FOO": "BAR"
                }
            },
            {
                program: null,
                package: "a",
                env: {
                    "PINF_PROGRAM": PATH.join("programs/program-a/program.json"),
                    "FOO": "BAR"
                }
            },
            {
                program: null,
                package: "a",
                env: {
                    "CWD": PATH.join("programs/program-a"),
                    "FOO": "BAR"
                }
            },
            {
                program: "a",
                package: null,
                env: {
                    "PINF_PACKAGE": PATH.join("packages/package-a/package.json"),
                    "FOO": "BAR"
                }
            },
            {
                program: "a",
                package: null,
                env: {
                    "CWD": PATH.join("packages/package-a"),
                    "FOO": "BAR"
                }
            },
            {
                program: null,
                package: null,
                env: {
                    "CWD": PATH.join("programs/program-a"),
                    "FOO": "BAR"
                }
            },
            {
                program: "b",
                package: "b",
                env: {
                    "FOO": "BAR"
                }
            },
            {
                program: "c",
                package: "b",
                env: {
                    "FOO": "BAR"
                }
            },
            {
                program: "c",
                package: "c",
                env: {
                    "FOO": "BAR",
                    "PINF_PACKAGES": PATH.join("programs") + ":" + PATH.join("packages")
                }
            },
            {
                program: "a",
                package: "d",
                env: {
                    "FOO": "BAR"
                }
            },
            {
                program: "d",
                package: "d",
                env: {
                    "FOO": "BAR"
                }
            },
            {
                program: "e",
                package: "e",
                env: {
                    "FOO": "BAR"
                }
            }
        ].forEach(function(info, index) {

            it("(" + index + ") verify output for program '" + info.program + "' and package '" + info.package + "' given ENV '" + JSON.stringify(info.env) + "'", function(done) {

                var programDescriptorPath = (info.program) ? PATH.join(options.rootPath, "programs/program-" + info.program + "/program.json") : info.program;
                var packageDescriptorPath = (info.package) ? PATH.join(options.rootPath, "packages/package-" + info.package + "/package.json") : info.package;

                options.env = info.env;

                CONTEXT.context(programDescriptorPath, packageDescriptorPath, options, function(err, context) {
                    if (err) return done(err);

                    context.now = 0;

                    if (MODE === "test") {
                        ASSERT.deepEqual(
                            JSON.parse(context.stringify()),
                            JSON.parse(FS.readFileSync(PATH.join(options.rootPath, "results", "context-" + index + "-" + info.program + "-" + info.package + ".json")))
                        );
                    } else
                    if (MODE === "write") {
                        FS.writeFileSync(PATH.join(options.rootPath, "results", "context-" + index + "-" + info.program + "-" + info.package + ".json"), context.stringify(null, 4));
                    } else {
                        throw new Error("Unknown `MODE`");
                    }

                    return done();
                });

            });

        });

    });

    describe("config", function() {

        var context = null;

        it("load context", function(done) {
            try { FS.removeSync(PATH.join(__dirname, ".rt")); } catch(err) {}
            try { FS.unlinkSync(PATH.join(__dirname, ".program.json")); } catch(err) {}
            FS.writeFileSync(PATH.join(__dirname, "package.json"), JSON.stringify({
                uid: "github.com/pinf/pinf-for-nodejs/test"
            }, null, 4));
            FS.writeFileSync(PATH.join(__dirname, "program.json"), "{}");
            return PINF.contextForModule(module, {
                "PINF_PROGRAM": PATH.join(__dirname, "program.json"),
                "PINF_RUNTIME": ""
            }, function(err, _context) {
                if (err) return done(err);
                context = _context;
                return done();
            });
        });

        it("read", function() {
            ASSERT.deepEqual(context.config, {});
        });

        it("write default", function(done) {
            context.once("config.changed", function() {
                return done();
            });
            return context.ensureDefaultConfig("ns1", {
                "group": {
                    "key": "defaultValue"
                }
            }, function(err, config) {
                if (err) {
                    console.error(err.stack);
                    return done(err);
                }
                // `config.changed` event should have already fired above.
            });
        });

        it("read", function() {
            ASSERT.deepEqual(context.config, { ns1: { group: { key: 'defaultValue' } } });
        });

        it("write runtime", function(done) {
            context.once("config.changed", function() {
                return done();
            });
            return context.updateRuntimeConfig("ns1", {
                "group": {
                    "key": "runtimeValue"
                }
            }, function(err, config) {
                if (err) return done(err);
                // `config.changed` event should have already fired above.
            });
        });

        it("read", function() {
            ASSERT.deepEqual(context.config, { ns1: { group: { key: 'runtimeValue' } } });
        });

        it("clear runtime", function(done) {
            context.once("config.changed", function() {
                return done();
            });
            return context.clearRuntimeConfig("ns1", function(err) {
                if (err) return done(err);
                // `config.changed` event should have already fired above.
            });
        });

        it("read", function() {
            ASSERT.deepEqual(context.config, { ns1: { group: { key: 'defaultValue' } } });
        });

        it("clear default", function(done) {
            context.once("config.changed", function() {
                return done();
            });
            return context.clearDefaultConfig("ns1", function(err) {
                if (err) return done(err);
                // `config.changed` event should have already fired above.
            });
        });

        it("read", function() {
            ASSERT.deepEqual(context.config, {});
        });

        it("cleanup", function() {
            FS.unlinkSync(PATH.join(__dirname, "package.json"));
            FS.unlinkSync(PATH.join(__dirname, "program.json"));
        });

    });

    describe("api", function() {

        it("has `console` by default", function(done) {
            return PINF.main(function main(options, callback) {
                ASSERT.equal(options.$pinf.getAPI("console") === console, true);
                return done(null);
            }, module, done);
        });

    });

    describe("passing and narrowing", function() {

        var context = null;

        it("init", function(done) {
            return PINF.main(function main(options, callback) {
                ASSERT.equal(typeof options, "object");
                ASSERT.equal(typeof options.$pinf, "object");
                ASSERT.equal(options.$pinf.test, false);
                context = options.$pinf;
                delete options.$pinf;
                ASSERT.deepEqual(options, {
                    foo: "bar",
                    test: true
                });
                return callback(null);
            }, module, {
                foo: "bar",
                test: true
            }, done);
        });

        it("pass through sandbox", function() {
            // TODO
        });

        it("setup", function() {
            FS.writeFileSync(PATH.join(__dirname, "package.json"), JSON.stringify({
                uid: "github.com/pinf/pinf-for-nodejs/test"
            }, null, 4));
        });

        it("narrow", function(done) {
          context._api.FS = FS;
          context.test = true;
          ASSERT.equal(context.getAPI("FS"), FS);
          return PINF.main(function main(options, callback) {
            ASSERT.equal(options.$pinf.paths.package, __dirname);
            ASSERT.equal(options.$pinf.getAPI("FS") === null, true);
            ASSERT.equal(options.$pinf.getAPI("Q") === null, true);
            options.$pinf._api.Q = Q;
            ASSERT.equal(options.$pinf.getAPI("Q") === Q, true);
            var opts = options.$pinf.makeOptions({
                foo: "bar",
                test: true,
                $pinf: context
            });
            ASSERT.notEqual(opts.$pinf, options.$pinf);
            ASSERT.equal(opts.$pinf._parentContext === opts.$pinf.__proto__, true);
            ASSERT.equal(opts.$pinf._parentContext === context, true);
            ASSERT.equal(opts.$pinf.getAPI("FS") === FS, true);
            ASSERT.equal(options.$pinf.getAPI("Q") === Q, true);
            ASSERT.equal(opts.$pinf.test, true);
            delete opts.$pinf;
            ASSERT.deepEqual(opts, {
                foo: "bar",
                test: true
            });
            return callback(null);
          }, module, done);
        });

        it("cleanup", function() {
            FS.unlinkSync(PATH.join(__dirname, "package.json"));
        });
    });

    describe("sandbox", function() {

        it("init and run", function(done) {
            return PINF.main(function main(options, callback) {
                return options.$pinf.sandbox(PATH.join(__dirname, "assets", "packages", "package-a"), function(sandbox) {
                    return sandbox.main(options, function(err, opts) {
                        if (err) return callback(err);
                        ASSERT.equal(opts === options, true);
                        return callback();
                    });
                }, callback);

            }, module, done);
        });
    });

});
