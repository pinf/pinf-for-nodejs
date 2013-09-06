
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const VM = require("../lib/vm").VM;
const MAIN = require("../lib/main");


const DEBUG = false;


describe("vm", function() {

    it("load package-a", function(done) {
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

});
