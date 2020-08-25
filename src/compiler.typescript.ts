import { changeExtension } from "./helper.js"
import { CompilerResult } from "./index.js"
import { basename, join } from "path"
import { promises as fs } from "fs"
import { tmpdir } from "os"
import esbuild from "esbuild"
import crypto from "crypto"

function getTemporary(name) {
    // const name = crypto.randomBytes(16).toString('base64')
    return join(tmpdir(), name)
}

const typescript = {

    async compile(input: string): Promise<CompilerResult> {

        // 
        const fileName = changeExtension(basename(input), 'js')
        const mapName = fileName + ".map"

        // Get a random temporary file to write esbuild results into
        const tempFile = getTemporary(fileName)
        const tempMapFile = tempFile + ".map"

        // Compile JS bundle to temporary file
        await esbuild.build({
            entryPoints: [input],
            outfile: tempFile,
            sourcemap: true,
            minify: true,
            bundle: true
        })

        // Load temporary files back into memory
        const fileBuffer = await fs.readFile(tempFile)
        const mapBuffer = await fs.readFile(tempMapFile)

        // Delete temporary files
        await fs.unlink(tempFile)
        await fs.unlink(tempMapFile)

        return {
            // The transpiled (TS -> JS) file
            file: { name: fileName, contents: fileBuffer },
            // The sourcemap of the transpiled file
            sourcemap: { name: mapName, contents: mapBuffer }
        }
    }
}

export default typescript