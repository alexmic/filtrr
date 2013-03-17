/*
 * Filtrr2 build script.
 *
 * Builds and tests filtrr2. To use this you need to have
 * node.js and jake installed on your machine.
 */

var exec  = require('child_process').exec,
    fs    = require('fs');

// Increment this version number for new builds.
FILTRR2_VERSION = "0.6.3"

// Generates Docco documentation. Navigate into the filtrr2
// directory first and run this task. The newly created
// documentation will be in docs/.
task('docs', [], function(params) {
    exec("docco src/*.js", function(error, stdout, stderr) {
        if (error === null) {
            console.log("Documentation generated in docs/.");
        } else {
            console.log(error.message);
        }
    });
});

// Builds a new version of the project and then subsequently tags
// it. You should be in the filtrr2 directory when calling this task.
task('build', [], function(params) {
    var fout = "dist/filtrr2-" + FILTRR2_VERSION + ".min.js",
        fin  = [
            "src/filtrr2.js",
            "src/effects.js",
            "src/util.js",
            "src/events.js",
            "src/layers.js"
        ].join(" "),
        cmd = [
            "java",
            "-jar",
            "build/compiler.jar",
            "--js",
            fin,
            "--js_output_file",
            fout
        ].join(" "),
        tag = [
            "git tag -a",
            "'v" + FILTRR2_VERSION + "'",
            "-m",
            "'version " + FILTRR2_VERSION + "'"
        ].join(" ");

    // Remove old build.
    var oldBuilds = fs.readdirSync("dist");
    for (var build in oldBuilds) {
        if (oldBuilds.hasOwnProperty(build)) {
            fs.unlinkSync("dist/" + oldBuilds[build]);
        }
    }
    console.log("Removed old builds.")

    // Create new build.
    exec(cmd, function(error, stdout, stderr) {
        if (error === null) {
            console.log("New build successful.");
            // Tag new build.
            exec(tag, function(error, stdout, stderr) {
                if (error === null) {
                    console.log("New build tag successful.");
                } else {
                    console.log(error.message);
                }
            });
        } else {
            console.log(error.message);
        }
    });

});