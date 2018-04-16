import typescript from 'rollup-typescript';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import tsc from 'typescript';

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
            typescript({ typescript: tsc }),
            commonjs(),
            uglify()
        ]
    };
}

export default [
    config("src/index.ts", "index.js", "cjs"),
    config("src/cli.ts", "bin/rollerblade", "cjs", "#!/usr/bin/env node")
];