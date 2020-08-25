#!/usr/bin/env node
import { basename, extname } from "path"
import parseArgs from "minimist"
import chalk from "chalk"

import compiler from "../out/index.js"

// Parse args
const argv = parseArgs(process.argv.slice(2), {})
const args = argv._

if (args.length == 0 || args.length > 2) {
    // Emit usage help
    console.log(chalk.cyan("usage: ") + "rollerblade <input> [outputDir]")
} else {

    // Get input file
    const input = args[0]

    // Get output directory
    let outputDir = '.'
    if (args.length == 2) {
        outputDir = args[1]
    }

    // Log progress
    console.log('Processing: ' + chalk.cyan(`'${input}'`))

    // Perform compile
    compiler.compile(input).then(async ({ file, sourcemap, meta }) => {

        // Write transpiled file to disk
        await compiler.writeFile(outputDir, file)

        // Write sourcemap to disk (if exists)
        if (sourcemap) {
            await compiler.writeFile(outputDir, sourcemap)
        }

        // Write metadata (ex, yaml frontmatter) to disk (if exists)
        if (meta) {
            await compiler.writeFile(outputDir, {
                name: basename(file.name, extname(file.name)) + ".json",
                contents: Buffer.from(JSON.stringify(meta), 'utf8')
            })
        }
    })
}
