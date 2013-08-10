
const LOADER = require("./loader");
const CONTEXT = require("./context");

exports.reset = LOADER.reset;

exports.sandbox = LOADER.sandbox;

exports.getReport = LOADER.getReport;

exports.context = CONTEXT.context;
exports.contextForModule = CONTEXT.contextForModule;
