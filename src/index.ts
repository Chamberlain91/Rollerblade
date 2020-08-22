import { existsSync, readdirSync, mkdirSync } from "fs"
import { extname, dirname, join, basename } from "path"
import chalk from "chalk"

// 
import { changeExtension, isExternalURL } from "./helper.js"
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

/**
 * Ensures the directory structure leading to the specified file exists and is created if it does not exist.
 * @param file A path to some file
 */
function ensureDirectory(file: string, isDirectory: boolean = false) {
    // note: shamelessly ripped from rollup
    const dir = isDirectory ? file : dirname(file)
    try {
        readdirSync(dir)
    } catch (err) {
        ensureDirectory(dir)
        try {
            mkdirSync(dir)
        } catch (err2) {
            if (err2.code !== 'EEXIST') {
                throw err2
            }
        }
    }
}

/**
 * Remaps a filename to a new directory with (optionally) a different extension.
 */
function getOutputFilename(input: string, outputDir: string, extension?: string) {
    let output = join(outputDir, basename(input))
    if (extension) { output = changeExtension(output, extension) }
    return output
}

const rollerblade = {

    // 
    async compile(input: string): Promise<CompilerResult> {

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
    },

    // Helper functions
    helpers: {
        ensureDirectory,
        changeExtension,
        getOutputFilename,
        isExternalURL,
    },

    // Emit each asset compiler object directly.
    typescript,
    markdown,
    scss,
}

// Default export
export default rollerblade

// Named exports
export const { compile, helpers } = rollerblade
export { markdown, typescript, scss }