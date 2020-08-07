import { existsSync, readdirSync, mkdirSync } from "fs"
import { changeExtension } from "./helper.js"
import chalk from "chalk"
import path from "path"

// Shamelessy ripped from rollup
function ensurepath(filepath) {
    const dir = path.dirname(filepath)
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

export class Compiler {

    constructor(extension, defaults) {
        this.extension = extension
        this.defaults = defaults
    }

    canCompile(file) {
        throw new Error("Override canCompile to implement correctly!")
    }

    async compile(options) {

        // 
        options = this._populateOptions(options)

        // Log progress
        console.log('Compile: ' + chalk.cyan(`'${options.input}'`) + ' -> ' + chalk.cyan(`'${options.output}'`))

        // Validate options
        this._validateOptions(options)

        // Ensure path to output does exist
        ensurepath(options.output)

        // Perform build operation
        this._build(options)
    }

    _populateOptions(options) {

        // Ensure object is specified
        if (options == null || options == undefined || typeof options != 'object') {
            throw new Error("Unable to compile. Argument was not an options object.")
        }

        // Constructs a copy of the options object populated with defaults
        options = Object.assign({}, this.defaults, options)

        // Ensure input it set and a valid path on disk
        if (!options.input) { throw new Error("Unable to compile. No input file specified.") }
        if (!existsSync(options.input)) { throw new Error(`Unable to compile. Input file does not exist: '${options.input}'`) }

        // Ensure output is set and is formatted with trailing slash
        if (!options.output) { throw new Error("Unable to compile. No output directory specified.") }

        // Appears to be a directory
        if (options.output.endsWith('/')) {
            // Rewrite output to point to output file
            options.output = options.output + path.basename(options.input)
        }
        
        // Change extension to explicit extension
        if (this.extension) {
            options.output = changeExtension(options.output, this.extension)
        }

        return options
    }

    async _validateOptions(options) {
        // Does nothing
    }

    async _build(options) {
        throw new Error("Override _build to implement correctly!")
    }
} 