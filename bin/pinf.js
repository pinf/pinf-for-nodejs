
const PATH = require("path");
const FS = require("fs");
const Q = require("q");
const COMMANDER = require("commander");
const PINF = require("..");
const COLORS = require("colors");

COLORS.setTheme({
    error: 'red'
});


PINF.main(function(context, callback) {

    exports.config = function(callback) {
		return callback(null, context.config);    	
    }

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
        .command("info")
        .description("Show information about program runtime")
        .action(function() {
            acted = true;
            return context.getInfo(function(err, info) {
                if (err) return callback(err);
                if (typeof program.format === "string" && program.format.toUpperCase() === "JSON") {
                	process.stdout.write(JSON.stringify(info, null, 4) + "\n");
                	return callback(null);
                }
                console.log("ENV:".bold);
                console.log("  CWD:", ("" + info.env.CWD).yellow);
                console.log("Program:".bold);
                console.log("  Path:", ("" + info.program.path).yellow);
                console.log("  Runtime:", ("" + info.program.runtime).yellow);
                console.log("Package:".bold);
                console.log("  Path:", ("" + info.package.path).yellow);
                // TODO: Log dependency tree as determined by following package declarations and directories.
                return callback(null);
            });
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
        .command("config")
        .description("Show currently active runtime configuration")
        .action(function() {
            acted = true;
            return exports.config(function(err, config) {
                if (err) return callback(err);
                process.stdout.write(JSON.stringify(config, null, 4) + "\n");
                return callback(null);
            });
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
