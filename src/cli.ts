import rollerblade, { Input } from "./index";
import minimist from "minimist";
import path, { dirname } from "path";
import fs from "fs";

// Read command line params
const command = minimist(process.argv.slice(2), {

    alias: {
        o: 'output',
        s: 'sourcemap',
        m: 'minify',
        f: 'format',
        t: 'target',
        h: 'help'
    },

    default: {
        o: undefined,
        s: undefined,
        m: false,
        h: false,
        t: 'es5',
        f: 'cjs',
    },

    // 
    boolean: ['m', 'h']
});

let config: Input[] | undefined;

// Display long help
if (command.help) {

    // Show long form help information
    printHelp(true);

    // Exit application
    process.exit(0);
}

// If no paths are given, attempt to get configuration from rollerblade.config.json
else if (command._.length == 0) {

    // Load rollerblade.config.json
    let cfg = loadConfigFile('rollerblade.config.json');

    // If we found the package and have a rollerblade field
    if (cfg) {

        // Wrap as array if not
        if (!Array.isArray(cfg))
            cfg = [cfg];

        // Get individual configurations
        config = cfg.map((e: Input | string) => {

            // If just a string
            if (typeof e === 'string')
                e = { input: e };

            return e;
        });

    } else {

        // Report failure
        console.error("Unable to find rollerblade.config.json");

    }
}

// Has one input path specified
else if (command._.length == 1) {

    const input = command._[0];

    // Find directory for input file
    const dir = path.resolve(input, process.cwd());

    console.log(`Using input: ${input}`);
    console.log(`             ${dir}`);

    // 
    config = [{
        input: input,
        output: command.output,
        target: command.target,
        format: command.format,
        sourcemap: command.sourcemap,
        minify: command.minify,
    }];
}

// If we found a configuration
if (config !== undefined) {

    // Call rollerblade with the configuration
    rollerblade(config).then(outputs => {

        // For each result
        for (let output of outputs) {

            // 
            ensurepath(output.js.file);

            // Write transpiled JS code to disk
            fs.writeFileSync(output.js.file, output.js.content);

            // Write sourcemap to disk
            if (output.map && output.map.isExternal) {
                fs.writeFileSync(output.map.file, output.map.content);
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
    console.log("or\t`rollerblade` configured with rollerblade.config.json");
    console.log("");
    console.log("Must specify entry file or be configured in rollerblade.config.json.");

    if (long) {
        // Extended help
        console.log("");
        console.log("Options:");
        console.log("");
        console.log("--output or -o");
        console.log("\tSpecifies output file path.")
        console.log("\tIf not specified, writes adjacent to input file with .js extension.");
        console.log("");
        console.log("--format or -f");
        console.log("\tSets the desired module format ( amd, cjs, es, iife or umd ).");
        console.log("\tWill use `cjs` by default.");
        console.log("");
        console.log("--target or -t");
        console.log("\tSets the desired js version target ( es3, es5, es2015... etc ).");
        console.log("\tWill use `es5` by default.");
        console.log("");
        console.log("--minify or -m");
        console.log("\tEnable minification of output files.");
        console.log("\tDisabled by default.");
        console.log("");
        console.log("--sourcemap or -s");
        console.log("\tEnable writing sourcemaps, either \"inline\" or \"external\".");
        console.log("\tDisabled by default.");
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

function loadConfigFile(file: string) {

    // Find configuration file
    const configPath = path.resolve(process.cwd(), file);

    // If it exists, read file and parse
    if (fs.existsSync(configPath)) return require(configPath);
    else return false;
}

// Shamelessy ripped from rollup
function ensurepath(path: string) {
    const dir = dirname(path);
    try {
        fs.readdirSync(dir);
    } catch (err) {
        ensurepath(dir);
        try {
            fs.mkdirSync(dir);
        } catch (err2) {
            if (err2.code !== 'EEXIST') {
                throw err2;
            }
        }
    }
}
