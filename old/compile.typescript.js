import { Compiler } from "./compile.base.js"
import { extname, join } from "path"
import { tmpdir } from "os"
import { promises as fs } from "fs"
import esbuild from "esbuild"
import crypto from "crypto"

export const typescriptCompiler = new class extends Compiler {

    constructor() {
        super('js', {
            tsconfig: undefined
        })
    }

    canCompile(file) {
        const ext = extname(file)
        return ext == ".ts"
    }

    validateOptions(options) {
        super.validateOptions(options)

        // Validate options.tsconfig exist if specified
        if (options.tsconfig && !fs.existsSync(options.tsconfig)) {
            console.error(`Unable to find tsconfig '${options.tsconfig}'.`)
        }
    }

    async _build(options) {

        let dir = tmpdir()
        let name = crypto.randomBytes(16).toBase64(true)

        var file = join(dir, name)

        // Compile JS bundle
        await esbuild.build({
            entryPoints: [options.input],
            outfile: file,
            tsconfig: options.tsconfig,
            sourcemap: true,
            minify: true,
            bundle: true
        })

        console.log({ dir, name, file })

        // 
        const buffer = await fs.readFile(file)
        const sourcemapBuffer = await fs.readFile(file + ".map")

        return {
            output: { buffer, filname = options.output },
            sourcemap: { sourcemapBuffer, filname = options.output + ".map" }
            // meta?
        }
    }
}