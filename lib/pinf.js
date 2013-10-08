
const PATH = require("path");
const FS = require("fs-extra");
const LOADER = require("./loader");
const CONTEXT = require("./context");
const HOIST = require("./hoist");
const MAIN = require("./main");

// TODO: Use `require.async` to load various APIs.

exports.reset = LOADER.reset;

exports.sandbox = LOADER.sandbox;

exports.hoist = HOIST.hoist;

exports.getReport = LOADER.getReport;

exports.context = CONTEXT.context;
exports.contextForProgram = CONTEXT.contextForProgram;
exports.contextForModule = CONTEXT.contextForModule;

exports.main = MAIN.main;
