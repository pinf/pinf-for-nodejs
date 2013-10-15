
const PATH = require("path");
const FS = require("fs");
const Q = require("q");
const COMMANDER = require("commander");
const PINF = require("..");
const DEEPMERGE = require("deepmerge");
const DEEPCOPY = require("deepcopy");
const COLORS = require("colors");

COLORS.setTheme({
    error: 'red'
});


PINF.main(function(context, callback) {

    var program = new COMMANDER.Command();


    function getProgramContext(options, callback) {
        if (typeof options === "function" && typeof callback === "undefined") {
            callback = options;
            options = null;
        }
        options = options || {};
        // TODO: If program.json not wound in CWD, go up the tree until found.
        var programPath = PATH.join(process.cwd(), "program.json");

        return FS.exists(programPath, function(exists) {
            if (!exists) {
// TODO: Mock program.json in overlay FS with context from `./program.prototype.json`.
                return callback(new Error("No program descriptor at '" + programPath + "'"));
            }
            var opts = {
                env: {
                    CWD: process.cwd()
                },
                debug: options.debug || program.debug || false,
                verbose: options.verbose || options.verbose || program.verbose || program.debug || false
            };
            opts.ttl = 0;
            if (typeof options.nocache !== "undefined") {
                opts.ttl = -1;
            } else
            if (typeof program.nocache !== "undefined") {
                opts.ttl = -1;
            }
            return PINF.context(programPath, "", opts, callback);
        });
    }


    program
        .version(JSON.parse(FS.readFileSync(PATH.join(__dirname, "../package.json"))).version)
        .option("-v, --verbose", "Show verbose progress.")
        .option("--debug", "Show debug output.")
        .option("--nocache", "Don't use cache for anything.")
        .option("--output <TYPE>", "Output format.");

    var acted = false;

    program
        .command("info [relpath]")
        .description("Show information")
        .action(function(path) {
            acted = true;
            return getProgramContext(function(err, context) {
                if (err) return callback(err);
                if (path) {
                    return context.getPackageInfo(PATH.resolve(path), function(err, info) {
                        if (err) return callback(err);
                        if (!info) return callback(new Error("No info found for package at path: " + PATH.resolve(path)));
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
                    var info = context.getProgramInfo();
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
                }
            });
        });

    program
        .command("dev")
        .description("Start development envrionment")
        .action(function() {
            acted = true;
            return getProgramContext(function(err, context) {
                if (err) return callback(err);
                return context.devProgram(function(err, info) {
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
        .command("run")
        .description("Run (don't detach on daemonize)")
        .action(function() {
            acted = true;
            return getProgramContext(function(err, context) {
                if (err) return callback(err);
                return context.runProgram(function(err, info) {
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
        .command("start")
        .description("Start (detach on daemonize)")
        .option("--restart", "Stop before starting if already started.")
        .action(function(options) {
            acted = true;
            return getProgramContext(function(err, context) {
                if (err) return callback(err);
                return context.startProgram({
                    restart: options.restart || false
                }, function(err, info) {
                    if (err) {
                        if (err.code === "ALREADY_STARTED") {
                            process.stdout.write(JSON.stringify({
                                error: {
                                    code: err.code
                                }
                            }, null, 4) + "\n");
                            return callback(null);
                        }
                        return callback(err);
                    }
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
        .description("Stop (daemonized processes)")
        .action(function() {
            acted = true;
            return getProgramContext(function(err, context) {
                if (err) return callback(err);
                return context.stopProgram(function(err, info) {
                    if (err) {
                        if (err.code === "NOT_STARTED") {
                            process.stdout.write(JSON.stringify({
                                error: {
                                    code: err.code
                                }
                            }, null, 4) + "\n");
                            return callback(null);
                        }
                        return callback(err);
                    }
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
        .command("test")
        .description("Run tests")
        .action(function() {
            acted = true;
            return getProgramContext(function(err, context) {
                if (err) return callback(err);
                return context.testProgram(function(err, summary) {
                    if (err) return callback(err);
                    process.stdout.write(JSON.stringify({
                        program: {
                            test: {
                                summary: summary
                            }
                        }
                    }, null, 4) + "\n");
                    return callback(null);
                });
            });
        });

    program
        .command("config [relpath]")
        .description("Show currently active configuration")
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
                                config: (info && info.package && info.package.config) || null
                            }
                        }, null, 4) + "\n");
                        return callback(null);
                    });
                } else {
                    var info = context.getProgramInfo();
                    var config = DEEPCOPY(info.program.descriptor.config);
                    if (info.packages) {
                        for (var id in info.packages) {
                            if (info.packages[id].descriptor && info.packages[id].descriptor.config) {
                                config[id] = DEEPMERGE(info.packages[id].descriptor.config, config[id] || {});
                            }
                        }
                    }
                    process.stdout.write(JSON.stringify({
                        program: {
                            config: config
                        }
                    }, null, 4) + "\n");
                    return callback(null);
                }
            });
        });

    program
        .command("status")
        .description("Show current status")
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

    program
        .command("open")
        .description("Open in tool")
        .action(function() {
            acted = true;
            return getProgramContext(function(err, context) {
                if (err) return callback(err);
                return context.openProgram(function(err, info) {
                    if (err) return callback(err);
                    process.stdout.write(JSON.stringify({
                        program: {
                            open: info
                        }
                    }, null, 4) + "\n");
                    return callback(null);
                });
            });
        });

    program
        .command("bundle")
        .description("Bundle for distribution")
        .action(function() {
            acted = true;
            return getProgramContext(function(err, context) {
                if (err) return callback(err);
                return context.bundleProgram(function(err, info) {
                    if (err) return callback(err);
                    process.stdout.write(JSON.stringify(info, null, 4) + "\n");
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
