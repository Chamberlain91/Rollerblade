import { existsSync } from "fs"
import { extname } from "path"
import chalk from "chalk"

import defaultCompiler from "./compiler.copy.js"
import typescript from "./compiler.typescript.js"
import markdown from "./compiler.markdown.js"
import scss from "./compiler.scss.js"

export type OutputFile = {
    filename: string,
    buffer: Buffer
}

export type CompilerResult = {
    files: OutputFile[],
    meta: any
}

export type CompilerFunction = (input: string) => Promise<CompilerResult>

// Mapping of compiler functions to associate with input paths
let compilerFunctions: { [extension: string]: CompilerFunction } = {
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

    // Log progress
    console.log('Processing: ' + chalk.cyan(`'${input}'`))

    // Did we have an associated compiler function?
    if (compileAsset !== undefined) {
        // ie, typescript -> javascript
        return compileAsset(input)
    } else {
        // ie, file pass through
        return defaultCompiler.compile(input)
    }
}

// Export
export default { compile, typescript, markdown, scss }
export { compile, markdown, typescript, scss }