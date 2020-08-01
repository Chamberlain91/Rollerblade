#!/usr/bin/env node
import { compile } from "../index.js"
import parseArgs from "minimist"

var argv = parseArgs(process.argv.slice(2), {
    alias: {
        c: 'tsconfig'
    }
});

if (argv._.length == 0 || argv._.length > 2) {
    console.log("usage: escompile <input> [output]");
    console.log("[*.ts]");
    console.log("--tsconfig or -c <path>");
    console.log("    (optional) Specify a path to a tsconfig.json (optional)");
} else {

    // Get input file
    const input = argv._[0];

    // Get output file
    let output = undefined;
    if (argv._.length == 2) {
        output = argv._[1];
    }

    // Compile!
    compile({
        input, output,
        tsconfig: argv.tsconfig
    });
} 