
const ASSERT = require("assert");
const PATH = require("path");
const FS = require("fs-extra");
const PINF = require("../lib/pinf");


describe("main", function() {

    it("calls app without context", function(done) {
        return PINF.main(function(callback) {
            return callback(null);
        }, function(err) {
            if (err) return done(err);
            return done();
        });
    });

    it("calls app that errors without context", function(done) {
        return PINF.main(function(callback) {
            return callback(new Error());
        }, function(err) {
            if (err) return done();
            return done(new Error("Should have errored"));
        });
    });

    it("calls app that throws without context", function(done) {
        return PINF.main(function(callback) {
            throw new Error();
        }, function(err) {
            if (err) return done();
            return done(new Error("Should have errored"));
        });
    });

    it("calls app with context", function(done) {
        return PINF.main(function(context, callback) {
            ASSERT.equal(typeof context, "object");
            ASSERT.equal(typeof context.env, "object");
            ASSERT.equal(typeof context.env.PINF_MODE, "string");
            return callback(null);
        }, module, function(err) {
            if (err) return done(err);
            return done();
        });
    });

    it("calls app that errors with context", function(done) {
        return PINF.main(function(context, callback) {
            ASSERT.equal(typeof context, "object");
            ASSERT.equal(typeof context.env, "object");
            ASSERT.equal(typeof context.env.PINF_MODE, "string");
            return callback(new Error());
        }, module, function(err) {
            if (err) return done();
            return done(new Error("Should have errored"));
        });
    });

    it("calls app that throws with context", function(done) {
        return PINF.main(function(context, callback) {
            ASSERT.equal(typeof context, "object");
            ASSERT.equal(typeof context.env, "object");
            ASSERT.equal(typeof context.env.PINF_MODE, "string");
            throw new Error();
        }, module, function(err) {
            if (err) return done();
            return done(new Error("Should have errored"));
        });
    });

});
