import { existsSync, readdirSync, mkdirSync } from "fs"
import { changeExtension } from "./helper.js"
import chalk from "chalk"
import { dirname, basename } from "path"

// Shamelessy ripped from rollup
function ensurepath(filepath) {
    const dir = dirname(filepath)
    try {
        readdirSync(dir)
    } catch (err) {
        ensurepath(dir)
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
 * @typedef OutputFile
 * @property {string} filename Name of the file to write to disk
 * @property {Buffer} buffer Contents to write to disk
 */

/**
 * @typedef CompilerOutput
 * @property {OutputFile} output
 * @property {OutputFile?} sourcemap
 * @property {any} meta
 */

export class Compiler {

    constructor(extension, defaults) {
        this.extension = extension
        this.defaults = defaults
    }

    canCompile(file) {
        throw new Error("Override canCompile to implement correctly!")
    }

    validateOptions(options) {
        // Ensure input it set and a valid path on disk
        if (!options.input) { throw new Error("Unable to compile. No input file specified.") }
        if (!existsSync(options.input)) { throw new Error(`Unable to compile. Input file does not exist: '${options.input}'`) }
    }

    async compile(options) {

        // Ensure object is specified
        if (options == null || options == undefined || typeof options != 'object') {
            throw new Error("Unable to compile. Argument was not an options object.")
        }

        // Constructs a copy of the options object populated with defaults
        options = Object.assign({}, this.defaults, options)

        // Log progress
        console.log('Compile: ' + chalk.cyan(`'${options.input}'`))

        // Validate options
        this.validateOptions(options)

        // Get only the filename
        options.output = basename(this.input)

        // Change extension to explicit extension (if provided)
        if (this.extension) {
            options.output = changeExtension(options.output, this.extension)
        }

        // Perform build operation
        return this._build(options)
    }

    /**
     * @returns {CompilerOutput} The results
     */
    async _build(options) {
        throw new Error("Override _build to implement correctly!")
    }
}