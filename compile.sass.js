import { changeExtension } from "./helper.js";
import { promises as fs } from "fs";
import { promisify } from "util";
import chalk from "chalk";
import sass from "node-sass";

export async function compileSass(config) {

    // Convert simple string input to basic config object
    if (typeof (config) === "string") {
        config = { input: config }
    }

    // Default output to just renaming .scss or .sass to .css
    if (config.output == undefined)
        config.output = changeExtension(config.input, "css")

    // Log progress
    console.log('Compile SASS: ' + chalk.cyan(`'${config.input}'`) + ' -> ' + chalk.cyan(`'${config.output}'`))

    // 
    const render = promisify(sass.render);
    let result = await render({
        file: config.input,
        outFile: config.output,
        sourceMapRoot: "./",
        outputStyle: "compressed",
        sourceMapContents: true,
        sourceMap: true
    })

    // Write transformed CSS to disk
    await fs.writeFile(config.output, result.css.toString());

    // Write CSS source map to disk
    if (result.map) {
        await fs.writeFile(config.output + ".map", result.map.toString());
    }
}