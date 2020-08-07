import { Compiler } from "./compile.base.js"
import { extname } from "path"
import esbuild from "esbuild"

export const typescriptCompiler = new class extends Compiler {

    constructor() {
        super('js', {
            tsconfig: undefined
        })
    }

    canCompile(file) {
        const ext = extname(file)
        return ext == ".ts"
    }

    async _build(options) {

        // Compile JS bundle
        await esbuild.build({
            entryPoints: [options.input],
            outfile: options.output,
            tsconfig: options.tsconfig,
            sourcemap: true,
            minify: true,
            bundle: true
        })

        return {
            input: options.input,
            output: options.output
        }
    }

    _validateOptions(options) {
        // Validate options.tsconfig exist if specified
        if (options.tsconfig && !fs.existsSync(options.tsconfig)) { console.error(`Unable to find tsconfig '${options.tsconfig}'.`) }
    }
}

// export async function compileTypescript(config) {

//     // Convert simple string input to basic config object
//     if (typeof (config) === "string") {
//         config = { input: config }
//     }

//     // Default output to just renaming .ts to .js
//     if (config.output == undefined)
//         config.output = changeExtension(config.input, "js")

//     // Log progress
//     console.log('Compile Typescript: ' + chalk.cyan(`'${config.input}'`) + ' -> ' + chalk.cyan(`'${config.output}'`))

//     // Compile JS bundle
//     await esbuild.build({
//         entryPoints: [config.input],
//         outfile: config.output,
//         tsconfig: config.tsconfig,
//         sourcemap: true,
//         minify: true,
//         bundle: true
//     })
// }