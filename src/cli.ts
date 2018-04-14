import rollerblade, { Input } from "./index";
import minimist from "minimist";
import path, { dirname } from "path";
import fs from "fs";

// Read command line params
const command = minimist(process.argv.slice(2), {

    alias: {
        o: 'output',
        m: 'sourcemap',
        f: 'format',
        t: 'target',
        h: 'help'
    },

    default: {
        o: undefined,
        h: false,
        s: false,
        t: 'es5',
        f: 'es',
    },

    // 
    boolean: ['s', 'h']
});

let config: Input[] | undefined;

// Display long help
if (command.help) {

    // Show long form help information
    printHelp(true);

    // Exit application
    process.exit(0);
}

// If no paths are given, attempt to get configuration from package.json
else if (command._.length == 0) {

    // Load package.json
    const pkg = require(path.join(process.cwd(), 'package.json'));

    // If we found the package and have a rollerblade field
    if (pkg && pkg.rollerblade) {

        // Get the conifiguration
        let config = pkg.rollerblade;

        // Get individual configurations
        config = config.map((e: Input | string) => {

            // If just a string
            if (typeof e === 'string')
                e = { input: e };

            return e;
        });
    }
}

// Has one input path specified
else if (command._.length == 1) {

    const input = command._[0];

    // Find directory for input file
    const dir = path.resolve(input, process.cwd());

    // 
    config = [{
        input: input, // path.join(dir, input),
        sourcemap: command.sourcemap,
        format: command.format
    }];

}

// If we found a configuration
if (config !== undefined) {

    // Call rollerblade with the configuration
    rollerblade(config).then(results => {

        // For each result
        for (let result of results) {

            // 
            mkdirpath(result.js.file);

            // Write transpiled JS code to disk
            fs.writeFileSync(result.js.file, result.js.content);

            // Write sourcemap to disk
            if (result.map) {
                fs.writeFileSync(result.map.file, result.map.content);
            }
        }
    });

} else {

    // Invalid configuration ( show short form help )
    printHelp(false);

    // Exit application
    process.exit(0);
}

function printHelp(long: boolean) {

    // Prints basic usage
    console.log("Usage:\t`rollerblade [options] input`");
    console.log("or\t`rollerblade` configured with package.json");
    console.log("");
    console.log("Must specify entry file or be configured in package.json.");

    if (long) {
        // Extended help
        console.log("");
        console.log("Options:");
        console.log("");
        console.log("--output or -o");
        console.log("\tSpecifies output file path.")
        console.log("\tIf not specified, writes adjacent to input file with .js extension.");
        console.log("");
        console.log("--sourcemap or -m");
        console.log("\tEnable writing sourcemaps ( writes adjacent to output with .js.map extension ).");
        console.log("\tDisabled by default.");
        console.log("");
        console.log("--format or -f");
        console.log("\tSets the desired module format ( amd, cjs, es, iife or umd ).");
        console.log("\tWill use `es` by default.");
        console.log("");
        console.log("--target or -t");
        console.log("\tSets the desired js version target ( es3, es5, es2015... etc ).");
        console.log("\tA tsconfig.json file will override this settings.");
        console.log("\tWill use `es5` by default.");
        console.log("");
        console.log("--help or -h");
        console.log("\tDisplays this help text and ignores all other options.");
    }

    console.log("");
    console.log("Example:");
    console.log("        rollerblade ./myfile.ts -f cjs -s");

    if (!long) {
        console.log("");
        console.log("Use option --help or -h for more information.");
    }
}

// Shamelessy ripped from rollup
function mkdirpath(path: string) {
    const dir = dirname(path);
    try {
        fs.readdirSync(dir);
    } catch (err) {
        mkdirpath(dir);
        try {
            fs.mkdirSync(dir);
        } catch (err2) {
            if (err2.code !== 'EEXIST') {
                throw err2;
            }
        }
    }
}
