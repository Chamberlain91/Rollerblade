import rollerblade from "./index"
import parseArgs from "minimist"
import chalk from "chalk"
import fs from "fs"

import * as p from "path"

var argv = parseArgs(process.argv.slice(2), {
    alias: {
        c: 'tsconfig'
    }
});

(async () => {

    if (argv._.length == 0 || argv._.length > 2) {
        console.log("usage: rollerblade <input> [output]");
        console.log("");
        console.log("--tsconfig or -c <path>");
        console.log("    Specify a path to a tsconfig.json. Optional");
    } else {

        // Get input file
        const input = argv._[0];

        // Get output file
        let output = undefined;
        if (argv._.length == 2) {
            output = argv._[1];
        }

        // Get tsconfig
        const tsconfig = argv.tsconfig ?? false;

        // Validate files exist
        if (!fs.existsSync(input)) { console.error(`Unable to find input file '${input}'.`); }
        if (tsconfig && !fs.existsSync(tsconfig)) { console.error(`Unable to find tsconfig '${tsconfig}'.`); }

        // Transpile source
        for (let result of await rollerblade({ input, output, tsconfig })) {
            ensurepath(result.file); // make sure output path exists
            fs.writeFileSync(result.file, result.text);
        }
    }

})();

// Shamelessy ripped from rollup
function ensurepath(path: string) {
    const dir = p.dirname(path);
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