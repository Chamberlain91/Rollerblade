import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import sourceMaps from 'rollup-plugin-sourcemaps'
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser'
import rollup from 'rollup'
import chalk from 'chalk';

import * as p from 'path';

function changeExtension(src: string, ext: string) {
    let fileInfo = p.parse(src);
    return p.join(fileInfo.dir, fileInfo.name + "." + ext);
}

export type Config = {
    input: string
    output?: string,
    tsconfig?: string
}

export type Output = {
    file: string,
    text: string
}

export default async function rollerblade(configs: Config[] | Config) {

    let results = new Array<Output>();

    // Ensure configs is array form
    if (!(configs instanceof Array)) {
        configs = [configs]
    }

    // For each configuration
    for (let config of configs) {

        // Resolve full path
        config.input = p.resolve(config.input);

        // Default output to just renaming .ts to .js
        if (config.output == undefined)
            config.output = changeExtension(config.input, "js");

        // Log progress
        console.log(chalk.cyanBright(`Processing: '${config.input}' -> '${config.output}'`));

        try {

            const bundle = await rollup.rollup({
                // Configure files
                input: config.input,
                output: {
                    file: config.output,
                    sourcemap: true
                },
                // Configure rollup
                treeshake: true,
                // Configure plugins
                plugins: [
                    // Compile TS
                    typescript({
                        // importHelpers: true,
                        removeComments: true,
                        // moduleResolution: 'node',
                        tsconfig: config.tsconfig ?? false,
                        allowSyntheticDefaultImports: true,
                        experimentalDecorators: true,
                        emitDecoratorMetadata: true,
                        inlineSources: true,
                        sourceMap: true,
                        strict: true,
                        target: "ES2018",
                        lib: [
                            "ES2015",
                            "ES2016",
                            "ES2017",
                            "ES2018",
                            "ESNext",
                            "DOM",
                            "DOM.Iterable"
                        ]
                    }),
                    // Compile JS
                    resolve(),
                    commonjs(),
                    terser({
                        compress: {
                            ecma: 2018,
                            unsafe: true,
                            unsafe_math: true,
                            unsafe_arrows: true,
                            unsafe_undefined: true,
                            unsafe_proto: true,
                            unsafe_methods: true,
                        }
                    }),
                    // Emit Source Maps
                    sourceMaps(),
                ]
            });

            // Generate output
            const { output } = await bundle.generate({
                sourcemap: "inline",
                format: "cjs"
            });

            // For each output chunk or asset
            for (const result of output) {

                if (result.type == "asset") {
                    // Is asset
                    console.warn(`Unable to handle asset '${result.fileName}'`);
                } else {

                    // Get source map file name
                    const mapFile = config.output + '.map';
                    const relativeMapFile = p.relative(p.dirname(config.output), mapFile);

                    // Is chunk
                    results.push({
                        file: config.output,
                        text: result.code + `//# sourceMappingURL=${relativeMapFile}`
                    });

                    // Is chunk
                    results.push({
                        file: mapFile,
                        text: JSON.stringify(result.map),
                    });
                }
            }

        } catch (e) {
            // 
            console.error(e);
        }
    }

    return results;
}