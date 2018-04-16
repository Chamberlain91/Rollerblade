const rollup = require('rollup');

const typescript = require('rollup-typescript');
const tsc = require('typescript');

const json = require('rollup-plugin-json');
const pegjs = require('rollup-plugin-pegjs');
const scss = require('rollup-plugin-scss');
const pug = require('rollup-plugin-pug');

const commonjs = require('rollup-plugin-commonjs');

// const nodeResolve = require('rollup-plugin-node-resolve-magic');
const nodeResolve = require('rollup-plugin-node-resolve');
const nodeBuiltins = require('rollup-plugin-node-builtins');
const nodeGlobals = require('rollup-plugin-node-globals');

const uglify = require('rollup-plugin-uglify');

const sourcemaps = require('rollup-plugin-sourcemaps');

import { resolve, dirname, join, parse, relative } from 'path';
import { existsSync } from 'fs';
import chalk from "chalk";

export type Target = "es5" | "es6";

export type Input = {

    input: string
    output?: string

    format?: string
    target?: Target

    sourcemap?: "inline" | "external" | "none"
    minify?: boolean
}

export type Output = {

    js: {
        file: string
        content: string
    }

    map?: {
        file: string
        content: string
        isExternal: boolean
    }
}

const cacheRoot = join(require('temp-dir'), '.rpt2_cache');

export default async function rollerblade(inputs: Input[]) {

    if (inputs.length == 0) throw new Error("Must specify at least one path to a file.");
    else {

        let results = new Array<Output>();

        // For each file
        for (let item of inputs) {

            // Default Configuration

            if (item.output == undefined)
                item.output = changeExtension(item.input, "js");

            if (item.format == undefined)
                item.format = "cjs";

            if (item.target == undefined)
                item.target = "es5";

            if (item.minify == undefined)
                item.minify = false;

            if (item.sourcemap == undefined)
                item.sourcemap = "none";

            // Log which file we are processing

            console.log(
                chalk.cyanBright(`Processing: '${item.input}' as ${item.target} (${item.format})`)
            );

            try {

                const tsoptions = tsconfig(
                    item.target,
                    item.sourcemap == "none");

                // 
                const rollupResult = await rollup.rollup({
                    input: item.input,
                    treeshake: true,
                    plugins: [

                        // TYPESCRIPT

                        typescript({
                            typescript: tsc,
                            ...tsoptions.compilerOptions
                        }),

                        // ASSETS

                        json(),
                        pegjs(),
                        scss(),
                        pug(),

                        // RESOLVE

                        nodeResolve({
                            browser: false
                        }),

                        nodeBuiltins(),
                        nodeGlobals(),

                        commonjs(),

                        // MINIFY

                        uglify({
                            output: {
                                beautify: !item.minify
                            }
                        }),

                        // 
                        sourcemaps()
                    ]
                });

                // Parse path 
                const mapFile = changeExtension(item.output, 'js.map');
                const relativeMapFile = relative(dirname(item.output), mapFile);

                // 
                const result = await rollupResult.generate({
                    format: item.format,
                    sourcemapFile: mapFile,
                    sourcemap: item.sourcemap
                });
                // 
                let sourceMappingURL = relativeMapFile;
                if (item.sourcemap == "inline") {
                    let buffer = new Buffer(JSON.stringify(result.map));
                    let base64 = buffer.toString('base64');
                    sourceMappingURL = "data:application/json;charset=utf-8;base64," + base64;
                }

                results.push({
                    js: {
                        file: item.output,
                        content: result.code
                            + (item.sourcemap ? `//# sourceMappingURL=${sourceMappingURL}` : '')
                    },
                    map: item.sourcemap ? {
                        file: mapFile,
                        content: result.map,
                        isExternal: item.sourcemap == "external"
                    } : undefined
                });

            } catch (e) {
                console.error(chalk.red(`Error processing '${item.input}'.`));
                console.error(chalk.red(e));
            }
        }

        return results;
    }
}

function changeExtension(src: string, ext: string) {
    let fileInfo = parse(src);
    return join(fileInfo.dir, fileInfo.name + "." + ext);
}

function tsconfig(target: Target, sourcemap: boolean) {

    return {
        "compilerOptions": {
            "moduleResolution": "node",
            "target": target,
            "lib": [
                "es2018",
                "es2017",
                "es2016",
                "es2015",
                "dom"
            ],
            "allowSyntheticDefaultImports": true,
            "experimentalDecorators": true,
            "emitDecoratorMetadata": true,
            "downlevelIteration": true,
            // "noImplicitReturns": true,
            // "noImplicitThis": true,
            // "noImplicitAny": true,
            "sourceMap": sourcemap
        }
    };
}
