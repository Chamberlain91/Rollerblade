import { Compiler } from "./compile.base.js"
import { promises as fs } from "fs"

export const defaultCompiler = new class extends Compiler {

    constructor() {
        super(undefined, {})
    }

    async _build(options) {
        await fs.copyFile(options.input, options.output)
        return {
            input: options.input,
            output: options.output
        }
    }

    canCompile() {
        return true
    }
} 