const path = require('path');
const rollup = require('rollup');
const typescript = require('rollup-plugin-typescript2');
const sourcemaps = require('rollup-plugin-sourcemaps');
const commonjs = require('rollup-plugin-commonjs');
const minify = require('rollup-plugin-babel-minify');
const json = require('rollup-plugin-json');

import merge from 'deepmerge';

export type Input = {
    path: string
    format?: string
    sourcemap?: boolean
    tsconfig?: any
}

const cacheRoot = path.join(path.resolve(__filename, process.cwd()), '.cache');

export default async function rollerblade(paths: Input[]) {

    if (paths.length == 0) throw new Error("Must specify at least one path to a file.");
    else {

        let results = [];

        // For each file
        for (let input of paths) {

            // 
            if (input.format === undefined) {
                input.format = "es";
            }

            // 
            if (input.sourcemap === undefined) {
                input.sourcemap = true;
            }

            // 
            const rollupResult = await rollup.rollup({
                input: input.path,
                treeshake: true,
                plugins: [
                    json(),
                    typescript({
                        cacheRoot: cacheRoot,
                        tsconfigDefaults: {
                            "compilerOptions": {
                                "moduleResolution": "node",
                                "target": "es5",
                                "lib": [
                                    "es2018",
                                    "es2017",
                                    "es2016",
                                    "es2015",
                                    "dom"
                                ],
                                "declaration": true,
                                "allowSyntheticDefaultImports": true,
                                "experimentalDecorators": true,
                                "emitDecoratorMetadata": true,
                                "downlevelIteration": true,
                                "noImplicitAny": true,
                                "noImplicitReturns": true,
                                "noImplicitThis": true
                            }
                        },
                        tsconfigOverride: merge(input.tsconfig || {}, {
                            "compilerOptions": {
                                "sourceMap": input.sourcemap
                            }
                        })
                    }),
                    commonjs(),
                    minify({ comments: false }),
                    sourcemaps()
                ]
            });

            // Parse path
            let finfo = path.parse(input.path);
            let mapFile = path.join(finfo.dir, finfo.name + ".js.map");
            let jsFile = path.join(finfo.dir, finfo.name + ".js");

            // 
            const result = await rollupResult.generate({
                format: input.format,
                sourcemapFile: mapFile,
                sourcemap: input.sourcemap
            });

            results.push({
                js: {
                    file: jsFile,
                    content: result.code + `//# sourceMappingURL=./${finfo.name + ".js.map"}`
                },
                map: input.sourcemap ? {
                    file: mapFile,
                    content: result.map
                } : undefined
            });
        }

        return results;
    }
}