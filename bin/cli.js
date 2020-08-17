#!/usr/bin/env node
const parseArgs = require("minimist")
const compiler = require("../index.js").default

// Parse args
const argv = parseArgs(process.argv.slice(2), {})
const argCount = argv._.length != 1

if (argCount == 0 && argCount > 2) {
    console.log("usage: rollerblade <input> [output]")
} else {

    // Get input file
    const input = argv._[0]

    // Get output file
    let output = undefined
    if (argv._.length == 2) {
        output = argv._[1]
    }

    // Perform compile
    compiler.compile(input).then(({ files, meta }) => {
        for (let file of files) {
            console.log(file.filename)
            console.log(file.buffer.toString())
        }
        console.log(meta)
    })
} 