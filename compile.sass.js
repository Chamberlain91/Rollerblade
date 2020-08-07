import { Compiler } from "./compile.base.js"
import { promises as fs } from "fs"
import { promisify } from "util"
import { extname } from "path";
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

        // Write transformed CSS to disk
        await fs.writeFile(options.output, result.css.toString())

        // Write CSS source map to disk
        if (result.map) {
            await fs.writeFile(options.output + ".map", result.map.toString())
        }
    }
}
