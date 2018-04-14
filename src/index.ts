const path = require('path');
const rollup = require('rollup');
const typescript = require('rollup-plugin-typescript2');
const sourcemaps = require('rollup-plugin-sourcemaps');
const commonjs = require('rollup-plugin-commonjs');
const minify = require('rollup-plugin-babel-minify');
const json = require('rollup-plugin-json');

import merge from 'deepmerge';

export type Input = {
    input: string
    output?: string
    format?: string
    sourcemap?: boolean
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
    }
}

const cacheRoot = path.join(path.resolve(__filename, process.cwd()), '.cache');

export default async function rollerblade(paths: Input[]) {

    if (paths.length == 0) throw new Error("Must specify at least one path to a file.");
    else {

        let results = new Array<Output>();

        // For each file
        for (let input of paths) {

            // 
            if (input.format === undefined) {
                input.format = "es";
            }

            // 
            if (input.sourcemap === undefined) {
                input.sourcemap = false;
            }

            // tsconfig is undefined and target, use default es5
            if (input.tsconfig === undefined && input.target === undefined) {
                input.target = 'es5';
            }

            // Both tsconfig and target is defined, warn
            if (input.target !== undefined && input.tsconfig !== undefined) {
                console.warn('Both target and tsconfig specified, target will be overriden by tsconfig.');
            }

            console.log(input);

            // Parse path
            let finfo = path.parse(input.output || input.input);
            let mapFile = path.join(finfo.dir, finfo.name + ".js.map");
            let jsFile = path.join(finfo.dir, finfo.name + ".js");

            // 
            const rollupResult = await rollup.rollup({
                input: input.input,
                treeshake: true,
                plugins: [
                    json(),
                    typescript({
                        cacheRoot: cacheRoot,
                        useTsconfigDeclarationDir: true,
                        tsconfigDefaults: {
                            "compilerOptions": {
                                "moduleResolution": "node",
                                "target": input.target,
                                "lib": [
                                    "es2018",
                                    "es2017",
                                    "es2016",
                                    "es2015",
                                    "dom"
                                ],
                                "declaration": true,
                                "declarationDir": finfo.dir,
                                "allowSyntheticDefaultImports": true,
                                "experimentalDecorators": true,
                                "emitDecoratorMetadata": true,
                                "downlevelIteration": true,
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

            // 
            const result = await rollupResult.generate({
                format: input.format,
                sourcemapFile: mapFile,
                sourcemap: input.sourcemap
            });

            results.push({
                js: {
                    file: jsFile,
                    content: result.code
                        + (input.sourcemap ? `//# sourceMappingURL=./${finfo.name + ".js.map"}` : '')
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