

// This is needed to support mapped requires for plain nodejs modules
// as they are supported by the pinf bundler.
// TODO: Move this into a generic helper.
var originalRequire = require;
require = function (id) {
    if (module.parent) {
        // We are running directly via NodeJS.
        var idParts = id.split("/");
        var packageAlias = idParts.shift();
        if (/^\./.test(packageAlias)) {
            return originalRequire(id);
        }
        var descriptor = require("./package.json");
        idParts.unshift(descriptor.mappings[packageAlias]);
        return originalRequire(idParts.join("/"));
    } else {
        // We are running within a PINF bundle.
        return originalRequire(id);
    }
};


const TEMPLATES = require("templates/loader");

exports.loadTemplate = function (name, callback) {

    return TEMPLATES.load(name, callback);
}

