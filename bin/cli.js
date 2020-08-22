#!/usr/bin/env node
import compiler from "../out/index.js"
import parseArgs from "minimist"
import { writeFileSync } from "fs"
import { join } from "path"

// Parse args
const argv = parseArgs(process.argv.slice(2), {})
const argCount = argv._.length != 1

if (argCount == 0 && argCount > 2) {
    console.log("usage: rollerblade <input> [outputDir]")
} else {

    // Get input file
    const input = argv._[0]

    // Get output directory
    let outputDir = '.'
    if (argv._.length == 2) {
        outputDir = argv._[1]
    }

    // Perform compile
    compiler.compile(input).then(({ files, meta }) => {
        // Write each generated file to disk
        for (let file of files) {
            // Get output path and ensure the directory exists
            let output = join(outputDir, file.filename)
            compiler.helpers.makeDirectoryPath(output)
            // Write generated file to disk
            writeFileSync(output, file.buffer.toString())
        }
        // ... what do with meta?
        // console.log(meta)
    })
} 