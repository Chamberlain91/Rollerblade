import { CompilerResult } from "./index.js"
import { promises as fs } from "fs"
import { basename } from "path"

export default {

    async compile(input: string): Promise<CompilerResult> {

        const contents = await fs.readFile(input)
        const name = basename(input)

        return {
            file: { contents, name }
        }
    }
}