import { Compiler } from "./compile.base.js"
import { promisify } from "util"
import { extname } from "path"
import sass from "node-sass"

export const sassCompiler = new class extends Compiler {

    constructor() {
        super('css', {})
    }

    canCompile(file) {
        const ext = extname(file)
        return ext == ".scss" || ext == ".sass"
    }

    async _build(options) {

        // 
        const render = promisify(sass.render)
        let result = await render({
            file: options.input,
            outFile: options.output,
            sourceMapRoot: "./",
            outputStyle: "compressed",
            sourceMapContents: true,
            sourceMap: true
        })

        let output = {
            output: {
                filename: options.output,
                buffer: result.css
            }
        }

        if (result.map) {
            output.sourcemap = {
                filename: options.output + ".map",
                buffer: result.map
            }
        }

        return output
    }
}
