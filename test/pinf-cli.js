
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const SPAWN = require("child_process").spawn;
const PINF = require("..");


//const MODE = "test";
const MODE = "write";


describe("pinf-cli", function() {

    this.timeout(30 * 1000);

    var context = null;

    it("init context", function(done) {
        FS.writeFileSync(PATH.join(__dirname, "package.json"), JSON.stringify({
            "uid": "github.com/pinf/pinf-for-nodejs/test"
        }, null, 4));
        FS.writeFileSync(PATH.join(__dirname, "program.json"), JSON.stringify({
            "boot": {
                "package": PATH.join(__dirname, "assets/packages/pinf-cli")
            },
            "config": {
                "github.com/pinf/pinf-for-nodejs/test/assets/packages/pinf-cli": {
                    "key2": "value2: $__DIRNAME"
                },
                "github.com/pinf/pinf-for-nodejs/test/assets/packages/pinf-cli/node_modules/sub": {
                    "key2": "value2: $__DIRNAME"
                }
            }
        }, null, 4));
        try { FS.removeSync(PATH.join(__dirname, ".rt")); } catch(err) {}
        return PINF.contextForModule(module, {
            "PINF_PROGRAM": PATH.join(__dirname, "program.json"),
            "PINF_RUNTIME": ""
        }, function(err, _context) {
            if (err) return done(err);
            context = _context;
            return done();
        });
    });


    it("info - program", function(done) {
        return runTest("info-program", [
            "info"
        ], done);
    });

    it("info - program package", function(done) {
        return runTest("info-program-package", [
            "info",
            "assets/packages/pinf-cli"
        ], done);
    });

    it("info - sub package", function(done) {
        return runTest("info-sub-package", [
            "info",
            "assets/packages/pinf-cli/node_modules/sub"
        ], done);
    });

    it("config - program", function(done) {
        return runTest("config-program", [
            "config"
        ], done);
    });

    it("config - program package", function(done) {
        return runTest("config-program-package", [
            "config",
            "assets/packages/pinf-cli"
        ], done);
    });

    it("config - sub package", function(done) {
        return runTest("config-sub-package", [
            "config",
            "assets/packages/pinf-cli/node_modules/sub"
        ], done);
    });


    it("status - before start", function(done) {
        return runTest("status-before-start", [
            "status"
        ], done);
    });

    it("get program info", function() {
        var output = context.getProgramInfo();
        var json = JSON.stringify(output);
        json = json.replace(new RegExp((process.cwd()).replace(/([\/\+])/g, "\\$1"), "g"), "");
        output = JSON.parse(json);
        if (MODE === "test") {
            ASSERT.deepEqual(
                output,
                JSON.parse(FS.readFileSync(PATH.join(__dirname, "assets/results", "pinf-cli-" + "get-program-info" + ".json")))
            );
        } else
        if (MODE === "write") {
            FS.outputFileSync(PATH.join(__dirname, "assets/results", "pinf-cli-" + "get-program-info" + ".json"), JSON.stringify(output, null, 4));
        } else {
            throw new Error("Unknown `MODE`");
        }
    });

    it("get package info", function(done) {
        return context.getPackageInfo(PATH.join(__dirname, "assets/packages/pinf-cli/node_modules/sub"), function(err, output) {
            if (err) return done(err);
            var json = JSON.stringify(output);
            json = json.replace(new RegExp((process.cwd()).replace(/([\/\+])/g, "\\$1"), "g"), "");
            output = JSON.parse(json);
            if (MODE === "test") {
                ASSERT.deepEqual(
                    output,
                    JSON.parse(FS.readFileSync(PATH.join(__dirname, "assets/results", "pinf-cli-" + "get-package-info" + ".json")))
                );
            } else
            if (MODE === "write") {
                FS.outputFileSync(PATH.join(__dirname, "assets/results", "pinf-cli-" + "get-package-info" + ".json"), JSON.stringify(output, null, 4));
            } else {
                throw new Error("Unknown `MODE`");
            }
            return done();
        });
    });

    it("start", function(done) {
        return runTest("start", [
            "start"
        ], done);
    });

    it("start - again", function(done) {
        return runTest("start-again", [
            "start"
        ], done);
    });

    it("status - after start", function(done) {
        return runTest("status-after-start", [
            "status"
        ], done);
    });

    it("stop", function(done) {
        return runTest("stop", [
            "stop"
        ], done);
    });

    it("stop - again", function(done) {
        return runTest("stop-again", [
            "stop"
        ], done);
    });

    it("status - after stop", function(done) {
        return runTest("status-after-stop", [
            "status"
        ], done);
    });

    it("run", function(done) {
        return runTest("run", [
            "run"
        ], done);
    });

    it("status - after run", function(done) {
        return runTest("status-after-run", [
            "status"
        ], done);
    });

    it("cleanup", function() {
        FS.unlinkSync(PATH.join(__dirname, "package.json"));
        FS.unlinkSync(PATH.join(__dirname, "program.json"));
        try { FS.unlinkSync(PATH.join(__dirname, ".program.json")); } catch(err) {}
    });


    function runTest(name, args, done) {
        return call(args, function(err, stdout) {
            if (err) return done(err);
            try {
                var output = JSON.parse(stdout);
            } catch(err) {
                console.error("stdout", stdout);
                console.error("err", err.stack);
                return done(new Error("Error '" + err.message + "' parsing output."));
            }
            ASSERT.equal(typeof output, "object");
//console.log(JSON.stringify(output, null, 4));
            var json = JSON.stringify(output);
            json = json.replace(new RegExp((process.cwd()+"/?").replace(/([\/\+])/g, "\\$1"), "g"), "");
            output = JSON.parse(json);
            if (MODE === "test") {
                ASSERT.deepEqual(
                    output,
                    JSON.parse(FS.readFileSync(PATH.join(__dirname, "assets/results", "pinf-cli-" + name + ".json")))
                );
            } else
            if (MODE === "write") {
                FS.outputFileSync(PATH.join(__dirname, "assets/results", "pinf-cli-" + name + ".json"), JSON.stringify(output, null, 4));
            } else {
                throw new Error("Unknown `MODE`");
            }
            return done();
        });
    }

    function call(args, callback) {
        var proc = SPAWN(PATH.join(__dirname, "../bin/pinf"), [
            "--output", "JSON"
        ].concat(args), {
            cwd: __dirname,
            env: {
                PATH: process.env.PATH,
                PINF_PROGRAM: PATH.join(__dirname, "program.json")
            }
        });
        var buffer = [];
        proc.stdout.on("data", function (data) {
            buffer.push(data.toString());
        });
        proc.stderr.on("data", function (data) {
            console.error(data.toString());
        });
        proc.on("close", function (code) {
            if (code != 0) {
                console.error(buffer.join(""));
                return callback(new Error("Got status code '" + code + "' while trying to call `pinf`"));
            }
            return callback(null, buffer.join(""));
        });
    }

});
