
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const VM = require("../lib/vm").VM;
const PINF_FOR_NODEJS = require("..");


const DEBUG = false;


describe("vm", function() {

    it("load package-a", function(done) {
        return PINF_FOR_NODEJS.main(function(context, callback) {
            var vm = new VM(context);
            return vm.loadPackage(PATH.join(__dirname, "assets/packages/package-a"), {
                debug: DEBUG
            }, function(err, sandbox) {
                if (err) return callback(err);
                var context = {
                    key1: "value1"
                };
                return sandbox.main(context, function(err, ctx) {
                    if (err) return callback(err);
                    ASSERT.deepEqual(ctx, context);
                    return callback();
                });
            });
        }, module, done);
    });

    it("load package-b", function(done) {
        return PINF_FOR_NODEJS.main(function(context, callback) {
            var vm = new VM(context);
            return vm.loadPackage(PATH.join(__dirname, "assets/packages/package-b"), {
                debug: DEBUG
            }, function(err, sandbox) {
                if (err) return callback(err);
                var context = {
                    key1: "value1"
                };
                return sandbox.main(context, function(err, ctx) {
                    if (err) return callback(err);
                    ASSERT.deepEqual(ctx, context);
                    return callback();
                });
            });
        }, module, done);
    });

});
