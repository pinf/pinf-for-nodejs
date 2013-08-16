
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

    function getProgramContext(callback) {
        // TODO: If program.json not wound in CWD, go up the tree until found.
        var programPath = PATH.join(process.cwd(), "program.json");
        return FS.exists(programPath, function(exists) {
            if (!exists) return callback(new Error("No program descriptor at '" + programPath + "'"));
            return PINF.context(programPath, "", {
                env: {
                    CWD: process.cwd()
                }
            }, callback);
        });
    }


    var program = new COMMANDER.Command();

    program
        .version(JSON.parse(FS.readFileSync(PATH.join(__dirname, "../package.json"))).version)
        .option("-v, --verbose", "Show verbose progress.")
        .option("--output <TYPE>", "Output format.");

    var acted = false;

    program
        .command("info [path]")
        .description("Show information about program")
        .action(function(path) {
            acted = true;
            return getProgramContext(function(err, context) {
                if (err) return callback(err);
                if (path) {
                    return context.getPackageInfo(PATH.resolve(path), function(err, info) {
                        if (err) return callback(err);
                        if (typeof program.output === "string" && program.output.toUpperCase() === "JSON") {
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
                        if (typeof program.output === "string" && program.output.toUpperCase() === "JSON") {
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
        });

    program
        .command("start")
        .description("Start program")
        .action(function() {
            acted = true;
            return getProgramContext(function(err, context) {
                if (err) return callback(err);
                return context.startProgram(function(err, info) {
                    if (err) return callback(err);
                    process.stdout.write(JSON.stringify({
                        program: {
                            status: info
                        }
                    }, null, 4) + "\n");
                    return callback(null);
                });
            });
        });

    program
        .command("stop")
        .description("Stop program")
        .action(function() {
            acted = true;
            return getProgramContext(function(err, context) {
                if (err) return callback(err);
                return context.stopProgram(function(err, info) {
                    if (err) return callback(err);
                    process.stdout.write(JSON.stringify({
                        program: {
                            status: info
                        }
                    }, null, 4) + "\n");
                    return callback(null);
                });
            });
        });

    program
        .command("config [path]")
        .description("Show currently active program configuration")
        .action(function(path) {
            acted = true;
            return getProgramContext(function(err, context) {
                if (err) return callback(err);
                // TODO: Add non-json output.
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
                        if (info.packages) {
                            for (var id in info.packages) {
                                config[id] = DEEPMERGE(
                                    (info.packages[id].descriptor && info.packages[id].descriptor.config) || {},
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
        });

    program
        .command("status")
        .description("Show current program status")
        .action(function() {
            acted = true;
            return getProgramContext(function(err, context) {
                if (err) return callback(err);
                return context.getProgramStatus(function(err, status) {
                    if (err) return callback(err);
                    process.stdout.write(JSON.stringify({
                        program: {
                            status: status
                        }
                    }, null, 4) + "\n");
                    return callback(null);
                });
            });
        });

    program.parse(process.argv);

    if (!acted) {
        console.error(("ERROR: Command '" + process.argv.slice(2).join(" ") + "' not found!").error);
        program.outputHelp();
        return callback(true);
    }

}, module);
