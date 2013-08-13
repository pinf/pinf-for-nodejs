
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const Q = require("q");
const CONTEXT = require("../lib/context");
const PINF = require("../lib/pinf");

//const MODE = "test";
const MODE = "write";


describe("context", function() {

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
                    "PINF_PROGRAM": PATH.join(options.rootPath, "programs/program-a/program.json"),
                    "FOO": "BAR"
                }
            },
            {
                program: null,
                package: "a",
                env: {
                    "CWD": PATH.join(options.rootPath, "programs/program-a"),
                    "FOO": "BAR"
                }
            },
            {
                program: "a",
                package: null,
                env: {
                    "PINF_PACKAGE": PATH.join(options.rootPath, "packages/package-a/package.json"),
                    "FOO": "BAR"
                }
            },
            {
                program: "a",
                package: null,
                env: {
                    "CWD": PATH.join(options.rootPath, "packages/package-a"),
                    "FOO": "BAR"
                }
            },
            {
                program: null,
                package: null,
                env: {
                    "CWD": PATH.join(options.rootPath, "programs/program-a"),
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
                    "PINF_PACKAGES": PATH.join(options.rootPath, "programs") + ":" + PATH.join(options.rootPath, "packages")
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

                    if (MODE === "test") {
                        ASSERT.deepEqual(
                            context,
                            JSON.parse(FS.readFileSync(PATH.join(options.rootPath, "results", "context-" + index + "-" + info.program + "-" + info.package + ".json")))
                        );
                    } else
                    if (MODE === "write") {
                        FS.writeFileSync(PATH.join(options.rootPath, "results", "context-" + index + "-" + info.program + "-" + info.package + ".json"), JSON.stringify(context, null, 4));
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
                if (err) return done(err);
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
            FS.unlinkSync(PATH.join(__dirname, ".program.json"));
            FS.removeSync(PATH.join(__dirname, ".rt"));
        });

    });

});
