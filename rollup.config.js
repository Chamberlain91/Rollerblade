import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
// import minify from 'rollup-plugin-babel-minify';
import json from 'rollup-plugin-json';

import { join } from 'path';

const plugins = [
    json(),
    typescript({ cacheRoot: ".cache" }),
    commonjs(),
    // minify({ comments: false }),
];

function config(src, out, fmt, banner = "") {

    return {
        input: join('./', src),
        output: {
            file: join("./", out),
            // sourcemap: true,
            banner: banner,
            format: fmt
        },
        plugins: plugins
    };
}

export default [
    config("src/index.ts", "index.js", "cjs"),
    config("src/cli.ts", "bin/rollerblade", "cjs", "#!/usr/bin/env node")
];