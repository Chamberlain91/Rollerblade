import { OutputFile } from "./index.js"
import { changeExtension } from "./helper.js"
import { promisify } from "util"
import { basename } from "path"
import sass from "node-sass"

// Convert node-sass render function to promise/await
const render = promisify(sass.render)

const scss = {

    async compile(input: string) {

        const output = changeExtension(basename(input), 'css')

        //  
        let result = await render({
            file: input,
            outFile: output,
            sourceMapRoot: "./",
            outputStyle: "compressed",
            sourceMapContents: true,
            sourceMap: true
        })

        // The compile CSS file
        let files: OutputFile[] = [
            { filename: output, buffer: result.css }
        ]

        // The sourcemap of SCSS -> CSS
        if (result.map) {
            files.push({ filename: output + ".map", buffer: result.map })
        }

        return { files, meta: undefined }
    }
}

export default scss