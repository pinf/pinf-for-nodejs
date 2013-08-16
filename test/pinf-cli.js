
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const EXEC = require("child_process").exec;


//const MODE = "test";
const MODE = "write";

describe("pinf-cli", function() {

    it("init context", function(done) {
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
        return done();
    });

    it("info - program", function(done) {
        return runTest("info-program", [
            "--format", "JSON",
            "info"
        ], done);
    });

    it("info - program package", function(done) {
        return runTest("info-program-package", [
            "--format", "JSON",
            "info",
            "assets/packages/pinf-cli"
        ], done);
    });

    it("info - sub package", function(done) {
        return runTest("info-sub-package", [
            "--format", "JSON",
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

    it("cleanup", function() {
        FS.unlinkSync(PATH.join(__dirname, "program.json"));
        try { FS.unlinkSync(PATH.join(__dirname, ".program.json")); } catch(err) {}
        try { FS.removeSync(PATH.join(__dirname, ".rt")); } catch(err) {}
    });


    function runTest(name, args, done) {
        return call(args, function(err, stdout) {
            if (err) return done(err);
            try {
                var output = JSON.parse(stdout);
            } catch(err) {
                console.error("stdout", stdout);
                return done(new Error("Error '" + err.message + "' parsing output."));
            }
            ASSERT.equal(typeof output, "object");
            var json = JSON.stringify(output);
            json = json.replace(new RegExp((process.cwd()+"/").replace(/([\/\+])/g, "\\$1"), "g"), "");
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
        return EXEC(PATH.join(__dirname, "../bin/pinf") + " " + args.join(" "), {
            cwd: __dirname,
            env: {
                PATH: process.env.PATH,
                PINF_PROGRAM: PATH.join(__dirname, "program.json")
            }
        }, function (error, stdout, stderr) {
            if (error) {
                console.error(stdout);
                console.error(stderr);
                return callback(new Error("Got error '" + error + "' while trying to call `pinf`"));
            }
            if (stderr) {
                console.error(stderr);
            }
            return callback(null, stdout);
        });
    }

});
