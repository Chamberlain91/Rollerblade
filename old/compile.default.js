import { Compiler } from "./compile.base.js"
import { promises as fs } from "fs"

export const defaultCompiler = new class extends Compiler {

    constructor() {
        super(undefined, {})
    }

    canCompile() {
        return false
    }

    async _build(options) {
        const buffer = await fs.readFile(options.input)
        return {
            output: { buffer, filename: options.output },
            // no sourcemap,
            // no meta
        }
    }
} 