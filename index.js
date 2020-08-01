import { compileTypescript } from "./compile.typescript.js";
import { compileSass } from "./compile.sass.js";
import { changeExtension } from "./helper.js";
import path from "path"
import fs from "fs"

export function compile(params) {

    const input = params.input;
    let output = params.output;

    // Is a Typescript file
    if (input.endsWith(".ts")) {

        // No specified output, replace with default next to input file
        if (!output) { output = changeExtension(input, 'js'); }

        // Is the output a directory (ie, no extension)
        if (path.extname(output) === '') {
            if (!output.endsWith('/')) { output += '/'; }
            output = output + changeExtension(path.basename(input), 'js');
        }

        // Extract parameters
        const tsconfig = params.tsconfig;

        // Validate files exist
        if (!fs.existsSync(input)) { console.error(`Unable to find input file '${input}'.`); }
        if (tsconfig && !fs.existsSync(tsconfig)) { console.error(`Unable to find tsconfig '${tsconfig}'.`); }

        // Ensure path to output file exists
        ensurepath(output);

        // Compile Typescript
        compileTypescript({
            input: input,
            output: output,
            tsconfig: tsconfig
        });
    }
    // Is a SCSS or SASS stylesheet
    else if (input.endsWith(".scss") || input.endsWith(".sass")) {

        // No specified output, replace with default next to input file
        if (!output) { output = changeExtension(input, 'css'); }

        // Is the output a directory (ie, no extension)
        if (path.extname(output) === '') {
            if (!output.endsWith('/')) { output += '/'; }
            output = output + changeExtension(path.basename(input), 'css');
        }

        // Validate files exist
        if (!fs.existsSync(input)) { console.error(`Unable to find input file '${input}'.`); }

        // Ensure path to output file exists
        ensurepath(output);

        // Compile Sassy Stylesheet
        compileSass({
            input: input,
            output: output
        });
    }

    // Shamelessy ripped from rollup
    function ensurepath(filepath) {
        const dir = path.dirname(filepath);
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
}

export default { compile, compileTypescript, compileSass }
export { compileTypescript, compileSass };
