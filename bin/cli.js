#!/usr/bin/env node
import { compile } from "../index.js"
import parseArgs from "minimist"

var argv = parseArgs(process.argv.slice(2), {
    alias: {
        c: 'tsconfig',
        t: 'template', e: 'templateEngine'
    }
})

if (argv._.length == 0 || argv._.length > 2) {
    console.log("usage: escompile <input> [output]")
    console.log("[*.ts]")
    console.log("--tsconfig or -c <path>")
    console.log("    (optional) Specify a path to a tsconfig.json (optional)")
} else {

    // Get input file
    const input = argv._[0]

    // Get output file
    let output = undefined
    if (argv._.length == 2) {
        output = argv._[1]
    }

    let options = { input, output }

    // Typescript options
    if (argv.tsconfig) { options.tsconfig = argv.tsconfig }

    // Markdown options
    options.emitMetadata = argv.emitMetadata
    if (argv.template) {
        options.template = argv.template
        options.templateEngine = argv.templateEngine
    }

    // Perform compile/build
    compile(options)
} 