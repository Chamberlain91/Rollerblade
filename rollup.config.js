// 
import typescript from '@rollup/plugin-typescript'
// 
import { terser } from 'rollup-plugin-terser'
import commonjs from 'rollup-plugin-commonjs'

import { join } from 'path'

function config(src, out, banner = "") {

    return {
        input: join('./', src),
        output: {
            file: join('./', out),
            banner: banner,
            format: 'cjs'
        },
        plugins: [
            // Compile TS
            typescript({
                tsconfig: false,
                allowSyntheticDefaultImports: true,
                downlevelIteration: true,
                target: "ES5",
                strict: true
            }),
            // Process JS
            commonjs(),
            terser()
        ]
    }
}

export default [
    config("src/index.ts", "index.js"),
    config("src/cli.ts", "bin/rollerblade", "#!/usr/bin/env node")
]