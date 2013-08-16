
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const EXEC = require("child_process").exec;


describe("pinf-cli", function() {

    it("init context", function(done) {
        FS.writeFileSync(PATH.join(__dirname, "program.json"), JSON.stringify({
            "boot": {
                "package": PATH.join(__dirname, "assets/packages/pinf-cli")
            }
        }, null, 4));
        return done();
    });

    it("info", function(done) {
        return call([
            "--format", "JSON",
            "info"
        ], function(err, stdout) {
            if (err) return done(err);
            try {
                var output = JSON.parse(stdout);
            } catch(err) {
                console.error("stdout", stdout);
                return done(new Error("Error '" + err.message + "' parsing output."));
            }
            ASSERT.equal(typeof output, "object");
            ASSERT.equal(typeof output.context, "object");

console.log("output", output);

            return done();
        });
    });

    it("config", function(done) {
        return call([
            "config"
        ], function(err, stdout) {
            if (err) return done(err);
            try {
                var output = JSON.parse(stdout);
            } catch(err) {
                console.error("stdout", stdout);
                return done(new Error("Error '" + err.message + "' parsing output."));
            }
            ASSERT.equal(typeof output, "object");

console.log("output", output);

            return done();
        });
    });

    it("cleanup", function() {
        FS.unlinkSync(PATH.join(__dirname, "program.json"));
        try { FS.unlinkSync(PATH.join(__dirname, ".program.json")); } catch(err) {}
        try { FS.removeSync(PATH.join(__dirname, ".rt")); } catch(err) {}
    });


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
