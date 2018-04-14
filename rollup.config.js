import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import json from 'rollup-plugin-json';

import { join } from 'path';

function config(src, out, fmt, banner = "") {

    return {
        input: join('./', src),
        output: {
            file: join("./", out),
            banner: banner,
            format: fmt
        },
        plugins: [
            json(),
            typescript({
                cacheRoot: ".cache",
                useTsconfigDeclarationDir: true
            }),
            commonjs(),
            uglify()
        ]
    };
}

export default [
    config("src/index.ts", "index.js", "cjs"),
    config("src/cli.ts", "bin/rollerblade", "cjs", "#!/usr/bin/env node")
];