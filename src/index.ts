const rollup = require('rollup');
const typescript = require('rollup-plugin-typescript2');
const sourcemaps = require('rollup-plugin-sourcemaps');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');
const json = require('rollup-plugin-json');

import merge from 'deepmerge';
import * as path from 'path';
import { ECANCELED } from 'constants';

export type Input = {
    input: string
    output?: string
    format?: string
    sourcemap?: "inline" | "external"
    compress?: boolean
    target?: string
    tsconfig?: any
}

export type Output = {
    js: {
        file: string,
        content: string
    },
    map?: {
        file: string
        content: string
        isExternal: boolean
    }
}

const cacheRoot = path.join(path.dirname(path.resolve(process.cwd(), __filename)), '.cache');

export default async function rollerblade(inputs: Input[]) {

    if (inputs.length == 0) throw new Error("Must specify at least one path to a file.");
    else {

        let results = new Array<Output>();

        // For each file
        for (let item of inputs) {

            // 
            if (item.output === undefined) {
                item.output = changeExtension(item.input, "js");
            }

            // 
            if (item.format === undefined) {
                item.format = "iife";
            }

            // 
            if (item.compress === undefined) {
                item.compress = false;
            }

            // No custom TS Config
            if (item.tsconfig === undefined) {
                // Target isn't known
                if (item.target === undefined) {
                    item.target = 'es5';
                }
            } else {

                // Target is specified and the config, this is a clash!
                if (item.target !== undefined) {
                    console.warn('Both target and tsconfig specified, target will be overriden by tsconfig.');
                }

                // Attempt to get the tsconfig target version
                item.target = item.tsconfig.compilerOptions.target || "es5";
            }

            console.log("Processing: (" + item.target + ") " + item.input);

            try {

                // 
                const rollupResult = await rollup.rollup({
                    input: item.input,
                    treeshake: true,
                    plugins: [
                        json(),
                        typescript({
                            cacheRoot: cacheRoot,
                            useTsconfigDeclarationDir: true,
                            tsconfigDefaults: {
                                "compilerOptions": {
                                    "moduleResolution": "node",
                                    "target": item.target,
                                    "lib": [
                                        "es2018",
                                        "es2017",
                                        "es2016",
                                        "es2015",
                                        "dom"
                                    ],
                                    "declaration": true,
                                    "declarationDir": path.dirname(item.output),
                                    "allowSyntheticDefaultImports": true,
                                    "experimentalDecorators": true,
                                    "emitDecoratorMetadata": true,
                                    "downlevelIteration": true,
                                    "noImplicitReturns": true,
                                    "noImplicitThis": true
                                }
                            },
                            tsconfigOverride: merge(item.tsconfig || {}, {
                                "compilerOptions": {
                                    "sourceMap": item.sourcemap !== undefined
                                }
                            })
                        }),
                        commonjs(),
                        uglify(getMinifyOptions(item.target as string, item.compress || false)),
                        sourcemaps()
                    ]
                });

                // Parse path 
                const mapFile = changeExtension(item.output, 'js.map');
                const relativeMapFile = path.relative(path.dirname(item.output), mapFile);

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
                console.error(`Unable to find '${item.input}'.`);
                console.error(e);
            }
        }

        return results;
    }
}

function changeExtension(src: string, ext: string) {
    let fileInfo = path.parse(src);
    return path.join(fileInfo.dir, fileInfo.name + "." + ext);
}

function getMinifyOptions(target: string, compress: boolean) {
    let ecma = getEcmaVersion(target);

    // console.log("Configuring Uglify for ECMA " + ecma);

    return {
        output: {
            beautify: !compress,
            ecma: ecma,
        },
        compress: {
            ecma: ecma,
            // unsafe: true
        }
    }
}

function getEcmaVersion(target: string) {
    target = target.toLowerCase();

    switch (target) {

        case "es6":
        case "es2015":
            return 6;

        case "es7":
        case "es2016":
            return 7;

        case "es8":
        case "es2017":
            return 8;

        case "es9":
        case "es2018":
        case "esnext":
            return 9;

        default:
            return 5;
    }
}