import { join, basename, extname, parse } from "path"
import { existsSync as exists, promises as fs } from "fs"

import defaultCompiler from "./compiler.copy.js"
import typescript from "./compiler.typescript.js"
import markdown from "./compiler.markdown.js"
import scss from "./compiler.scss.js"

export type OutputFile = {
    contents: Buffer | string
    name: string
}

export type CompilerResult = {
    file: OutputFile
    sourcemap?: OutputFile
    meta?: any
}

export type CompilerFunction = (input: string) => Promise<CompilerResult>

// Mapping of compiler functions to associate with input paths
let compilerFunctions = {
    // Sassy Stylesheets
    '.scss': scss.compile,
    '.sass': scss.compile,
    // Typescript
    '.ts': typescript.compile,
    // Markdown
    '.md': markdown.compile
}

async function compile(input: string): Promise<CompilerResult> {

    // Ensure input file exists on disk
    if (!exists(input)) {
        throw new Error(`Unable to compile asset. Input file does not exist: '${input}'`)
    }

    // Get file extension and associated compiler function
    const extension = extname(input) // note: apparently might ignore extensions like .tar.gz
    const compileAsset = compilerFunctions[extension]

    // Did we have an associated compiler function?
    if (compileAsset !== undefined) {
        // ie, typescript -> javascript
        return compileAsset(input)
    } else {
        // ie, file pass through
        return defaultCompiler.compile(input)
    }
}

/**
 * Changes the extension of a file path.
 * @param src The original path
 * @param ext The new extension
 */
export function changeExtension(src: string, ext: string) {
    const fileInfo = parse(src)
    if (ext != "" && !ext.startsWith(".")) { ext = `.${ext}` }
    return join(fileInfo.dir, fileInfo.name + ext)
}

/**
 * Writes an {@link OutputFile} to the specifeid directory.
 * @param file The file to write to disk 
 * @param outDir The output directory
 */
export async function writeFile(file: OutputFile, outDir: string) {

    // Ensure output directory exists
    await fs.mkdir(outDir, { recursive: true })

    // Write file to disk
    const outFile = join(outDir, basename(file.name))
    await fs.writeFile(outFile, file.contents)
}

const utilities = {
    changeExtension,
    writeFile
}

// Export
export default { compile, typescript, markdown, scss, utilities }
export { compile, markdown, typescript, scss, utilities }