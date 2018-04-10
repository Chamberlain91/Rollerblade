import rollerblade, { Input } from "./index";
import minimist from "minimist";
import path from "path";
import fs from "fs";

const rootDir = path.resolve("package.json", process.cwd());

// Read command line params
const command = minimist(process.argv.slice(2), {
    alias: {
        // o: 'output',
        s: 'sourcemap',
        f: 'format'
    },
    default: {
        // o: undefined,
        s: false,
        f: 'es'
    },
    boolean: ['s']
});

// console.log(command);
let paths: Input[] | undefined;

// If no paths are given, assume the local path
if (command._.length == 0) {

    // Load a config?
    const pkg = require(path.join(process.cwd(), 'package.json'));
    if (pkg && pkg.rollerblade) {

        // Get paths
        paths = pkg.rollerblade.map((e: Input | string) => {
            if (typeof e === 'string') { return { input: e }; }
            else { return e as Input; }
        });

    } else {
        // Needs to specify an entry point
        console.log("Usage: rollerblade ./myfile.ts -f cjs -s");
        console.log("Must specify at least one ts entry file or be configured in package.json.");
        process.exit(0);
    }

} else {

    // Find absolute paths to files
    paths = command._
        .filter(fp => typeof fp === "string") // Only keep strings ( sometimes was undefined? )
        .map(file => {
            const dir = path.resolve(file, process.cwd());
            return {
                input: path.join(dir, file),
                sourcemap: command.sourcemap,
                format: command.format
            }
        });

}

if (paths) {

    // 
    rollerblade(paths)
        .then(results => {

            // For each result
            for (let result of results) {

                // Write transpiled JS code to disk
                fs.writeFileSync(result.js.file, result.js.content);

                // Write sourcemap to disk
                if (command.sourcemap && result.map) {
                    fs.writeFileSync(result.map.file, result.map.content);
                }
            }
        });
}