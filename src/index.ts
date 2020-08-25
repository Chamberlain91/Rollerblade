import { existsSync, promises as fs } from "fs"
import { extname, join, basename } from "path"

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
    if (!existsSync(input)) {
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
 * 
 * @param outDir The output directory
 * @param file The file to write to disk 
 */
async function writeFile(outDir: string, file: OutputFile) {
    // Ensure output directory exists
    await fs.mkdir(outDir, { recursive: true })
    // Write file to disk
    const outFile = join(outDir, basename(file.name))
    console.log(outFile)
    await fs.writeFile(outFile, file.contents)
}

// Export
export default { compile, writeFile, typescript, markdown, scss }
export { compile, writeFile, markdown, typescript, scss }