import { defaultCompiler } from "./compile.default.js"
import { typescriptCompiler } from "./compile.typescript.js"
import { markdownCompiler } from "./compile.markdown.js"
import { sassCompiler } from "./compile.sass.js"
import { existsSync } from "fs"

const compilers = [
    typescriptCompiler,
    markdownCompiler,
    sassCompiler
]

export default async function compile(options) {

    // Ensure input it set and a valid path on disk
    if (!options.input) { throw new Error("Unable to compile. No input file specified.") }
    if (!existsSync(options.input)) { throw new Error(`Unable to compile. Input file does not exist: '${options.input}'`) }

    // Find an asset compiler suitable for this resource
    let compiler = compilers.find(c => c.canCompile(options.input))
    if (!compiler) { compiler = defaultCompiler }
    await compiler.compile(options)
}

export {
    compile,
    typescriptCompiler,
    markdownCompiler,
    sassCompiler
}
