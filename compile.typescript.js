import { changeExtension } from "./helper.js";
import esbuild from "esbuild"
import chalk from "chalk";

export async function compileTypescript(config) {

    // Convert simple string input to basic config object
    if (typeof (config) === "string") {
        config = { input: config }
    }

    // Default output to just renaming .ts to .js
    if (config.output == undefined)
        config.output = changeExtension(config.input, "js")

    // Log progress
    console.log('Compile Typescript: ' + chalk.cyan(`'${config.input}'`) + ' -> ' + chalk.cyan(`'${config.output}'`))

    // Compile JS bundle
    await esbuild.build({
        entryPoints: [config.input],
        outfile: config.output,
        tsconfig: config.tsconfig,
        sourcemap: true,
        minify: true,
        bundle: true
    });
}