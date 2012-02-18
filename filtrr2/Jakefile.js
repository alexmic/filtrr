/*
 * Filtrr2 build script. 
 *
 * Builds and tests filtrr2. To use this you need to have
 * node.js and jake installed on your machine.
 */

var sys  = require('sys'),
    exec = require('child_process').exec;

FILTRR2_VERSION = 0.1

task('build', [], function(params) {
    var fout = "dist/filtrr2-" + FILTRR2_VERSION + ".min.js",
        fin  = [
            "src/filtrr2.js",
            "src/events.js",
            "src/effects.js",
            "src/util.js"
        ].join(" "),
        cmd = [
            "java",
            "-jar",
            "build/compiler.jar",
            "--js",
            fin,
            "--js_output_file",
            fout
        ].join(" ");

    exec(cmd, function(error, stdout, stderr) {
        if (error === null) {
            console.log("Minify successful.");
        } else {
            console.log(error);
        }
    });
});