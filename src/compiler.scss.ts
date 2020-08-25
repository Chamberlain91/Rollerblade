import { changeExtension } from "./helper.js"
import { CompilerResult } from "./index.js"
import { promisify } from "util"
import { basename } from "path"
import sass from "node-sass"

// Convert node-sass render function to promise/await
const render = promisify(sass.render)

const scss = {

    async compile(input: string): Promise<CompilerResult> {

        const fileName = changeExtension(basename(input), 'css')

        // 
        let result = await render({
            file: input,
            outFile: fileName,
            sourceMapRoot: "./",
            outputStyle: "compressed",
            sourceMapContents: true,
            sourceMap: true
        })

        return {

            // The transpiled file
            file: {
                name: fileName,
                contents: result.css
            },

            // The sourcemap of the transpiled file
            sourcemap: {
                name: fileName + ".map",
                contents: result.map
            }
        }
    }
}

export default scss