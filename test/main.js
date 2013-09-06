
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const PINF = require("../lib/pinf");


describe("main", function() {

    it("call app without context", function(done) {
        return PINF.main(function(callback) {
            return callback(null);
        }, function(err) {
            if (err) return done(err);
            return done();
        });
    });

    it("call app without context and return sync true", function(done) {
        return PINF.main(function() {
            return true;
        }, function(err) {
            if (err) return done(err);
            return done();
        });
    });

    it("call app that errors without context", function(done) {
        return PINF.main(function(callback) {
            return callback(new Error());
        }, function(err) {
            if (err) return done();
            return done(new Error("Should have errored"));
        });
    });

    it("call app that throws without context", function(done) {
        return PINF.main(function(callback) {
            throw new Error();
        }, function(err) {
            if (err) return done();
            return done(new Error("Should have errored"));
        });
    });

    it("call app with context", function(done) {
        return PINF.main(function(options, callback) {
            ASSERT.equal(typeof options, "object");
            ASSERT.equal(typeof options.$pinf, "object");
            ASSERT.equal(typeof options.$pinf.env, "object");
            ASSERT.equal(typeof options.$pinf.env.PINF_MODE, "string");
            return callback(null);
        }, module, function(err) {
            if (err) return done(err);
            return done();
        });
    });

    it("call app with context and return sync true", function(done) {
        return PINF.main(function(options) {
            ASSERT.equal(typeof options, "object");
            ASSERT.equal(typeof options.$pinf, "object");
            ASSERT.equal(typeof options.$pinf.env, "object");
            ASSERT.equal(typeof options.$pinf.env.PINF_MODE, "string");
            return true;
        }, module, function(err) {
            if (err) return done(err);
            return done();
        });
    });

    it("call app with context and options", function(done) {
        return PINF.main(function(options, callback) {
            ASSERT.equal(typeof options, "object");
            ASSERT.equal(typeof options.$pinf, "object");
            ASSERT.equal(typeof options.$pinf.foo, "undefined");
            ASSERT.equal(options.$pinf.test, false);
            ASSERT.equal(typeof options.$pinf.env, "object");
            ASSERT.equal(typeof options.$pinf.env.PINF_MODE, "string");
            ASSERT.equal(options.foo, "bar");
            ASSERT.equal(options.test, true);
            return callback(null);
        }, module, {
            foo: "bar",
            test: true
        }, function(err) {
            if (err) return done(err);
            return done();
        });
    });

    it("call app that errors with context", function(done) {
        return PINF.main(function(options, callback) {
            ASSERT.equal(typeof options, "object");
            ASSERT.equal(typeof options.$pinf, "object");
            ASSERT.equal(typeof options.$pinf.env, "object");
            ASSERT.equal(typeof options.$pinf.env.PINF_MODE, "string");
            return callback(new Error());
        }, module, function(err) {
            if (err) return done();
            return done(new Error("Should have errored"));
        });
    });

    it("call app that throws with context", function(done) {
        return PINF.main(function(options, callback) {
            ASSERT.equal(typeof options, "object");
            ASSERT.equal(typeof options.$pinf, "object");
            ASSERT.equal(typeof options.$pinf.env, "object");
            ASSERT.equal(typeof options.$pinf.env.PINF_MODE, "string");
            throw new Error();
        }, module, function(err) {
            if (err) return done();
            return done(new Error("Should have errored"));
        });
    });

    it("exports `main()` function via `module.exports`", function(done) {
        var mod = {};
        for (var name in module) {
            mod[name] = module[name];
        }
        mod.exports = {};
        function main(options, callback) {
            ASSERT.equal(typeof options, "object");
            ASSERT.equal(typeof options.$pinf, "object");
            ASSERT.equal(typeof options.$pinf.env, "object");
            ASSERT.equal(typeof options.$pinf.env.PINF_MODE, "string");
            return callback(null);
        }
        return PINF.main(main, mod, function(err) {
            if (err) return done(err);
            ASSERT.deepEqual(mod.exports, {
                main: main
            });
            return done(null);
        });
    });

});
