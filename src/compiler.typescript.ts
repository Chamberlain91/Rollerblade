import { changeExtension } from "./helper.js"
import { basename, join } from "path"
import { OutputFile } from "./index.js"
import { promises as fs } from "fs"
import { tmpdir } from "os"
import esbuild from "esbuild"
import crypto from "crypto"

let pathToConfig: string | undefined = undefined

const typescript = {

    useConfiguration(file: string) {
        pathToConfig = file
    },

    async compile(input: string) {

        const output = changeExtension(basename(input), 'js')

        // Get a random temporary file to write esbuild results into
        let dir = tmpdir()
        let name = crypto.randomBytes(16).toString('base64')
        var tempfile = join(dir, name)

        // Compile JS bundle
        await esbuild.build({
            entryPoints: [input],
            outfile: tempfile,
            tsconfig: pathToConfig,
            sourcemap: true,
            minify: true,
            bundle: true
        })

        // 
        const buffer = await fs.readFile(tempfile)
        const sourcemapBuffer = await fs.readFile(tempfile + ".map")

        // The compiled javascript and sourcemap file
        let files: OutputFile[] = [
            { filename: output, buffer },
            { filename: output + ".map", buffer: sourcemapBuffer }
        ]

        return { files, meta: undefined }
    }
}

export default typescript