import { promises as fs } from "fs"
import { basename } from "path"

export default {
    
    async compile(input: string) {

        const buffer = await fs.readFile(input)
        const filename = basename(input)

        return {
            files: [{ buffer, filename }],
            meta: undefined
        }
    }
}