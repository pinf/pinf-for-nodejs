
const PATH = require("path");
const FS = require("fs");
const Q = require("q");
const COMMANDER = require("commander");
const PINF = require("..");
const DEEPMERGE = require("deepmerge");
const COLORS = require("colors");

COLORS.setTheme({
    error: 'red'
});


PINF.main(function(context, callback) {

    exports.status = function(callback) {
console.log("STATUS");
		return callback(null, {});    	
    }

    exports.start = function (callback) {
console.log("START");
		return callback(null);    	
    }

    exports.stop = function (callback) {
console.log("STOP");
		return callback(null);    	
    }


    var program = new COMMANDER.Command();

    program
        .version(JSON.parse(FS.readFileSync(PATH.join(__dirname, "../package.json"))).version)
        .option("-v, --verbose", "Show verbose progress.")
        .option("--format <TYPE>", "Output format.");

    var acted = false;

    program
        .command("info [path]")
        .description("Show information about program runtime")
        .action(function(path) {
            acted = true;
            if (path) {
                return context.getPackageInfo(PATH.resolve(path), function(err, info) {
                    if (err) return callback(err);
                    if (typeof program.format === "string" && program.format.toUpperCase() === "JSON") {
                        process.stdout.write(JSON.stringify(info, null, 4) + "\n");
                        return callback(null);
                    }
                    // TODO: Expand on this.
                    console.log("ENV:".bold);
                    console.log("  CWD:", ("" + info.env.CWD).yellow);
                    console.log("  PINF_PACKAGE:", ("" + info.env.PINF_PACKAGE).yellow);
                    console.log("Package:".bold);
                    console.log("  Path:", ("" + info.package.path).yellow);
                    console.log("  ID:", ("" + info.package.id).yellow);
                    // TODO: Log dependency tree as determined by following package declarations and directories.
                    return callback(null);
                });
            } else {
                return context.getProgramInfo(function(err, info) {
                    if (err) return callback(err);
                    if (typeof program.format === "string" && program.format.toUpperCase() === "JSON") {
                    	process.stdout.write(JSON.stringify(info, null, 4) + "\n");
                    	return callback(null);
                    }
                    // TODO: Expand on this.
                    console.log("ENV:".bold);
                    console.log("  CWD:", ("" + info.env.CWD).yellow);
                    console.log("Program:".bold);
                    console.log("  Path:", ("" + info.program.path).yellow);
                    console.log("  Runtime:", ("" + info.program.runtime).yellow);
                    // TODO: Log dependency tree as determined by following package declarations and directories.
                    return callback(null);
                });
            }
        });

    program
        .command("start")
        .description("Start runtime")
        .action(function() {
            acted = true;
            return exports.start(callback);
        });

    program
        .command("stop")
        .description("Stop runtime")
        .action(function() {
            acted = true;
            return exports.stop(callback);
        });

    program
        .command("config [path]")
        .description("Show currently active runtime configuration")
        .action(function(path) {
            acted = true;
            if (path) {
                return context.getPackageInfo(PATH.resolve(path), function(err, info) {
                    if (err) return callback(err);
                    process.stdout.write(JSON.stringify({
                        package: {
                            config: info.package.config
                        }
                    }, null, 4) + "\n");
                    return callback(null);
                });
            } else {
                return context.getProgramInfo(function(err, info) {
                    if (err) return callback(err);
                    var config = {};
                    if (
                        info.program.descriptor &&
                        info.program.descriptor.packages
                    ) {
                        for (var id in info.program.descriptor.packages) {
                            config[id] = DEEPMERGE(
                                (info.program.descriptor.packages[id].descriptor && info.program.descriptor.packages[id].descriptor.config) || {},
                                (info.program.descriptor.config && info.program.descriptor.config[id]) || {}
                            );
                        }
                    }
                    process.stdout.write(JSON.stringify({
                        program: {
                            config: config
                        }
                    }, null, 4) + "\n");
                    return callback(null);
                });
            }
        });

    program
        .command("status")
        .description("Show current runtime status")
        .action(function() {
            acted = true;
            return exports.status(function(err, status) {
                if (err) return callback(err);
                process.stdout.write(JSON.stringify(status, null, 4) + "\n");
                return callback(null);
            });
        });

    program.parse(process.argv);

    if (!acted) {
        console.error(("ERROR: Command '" + process.argv.slice(2).join(" ") + "' not found!").error);
        program.outputHelp();
        return callback(true);
    }

}, module);
