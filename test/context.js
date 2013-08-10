
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const Q = require("q");
const CONTEXT = require("../lib/context");

//const MODE = "test";
const MODE = "write";


describe("context", function() {

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
