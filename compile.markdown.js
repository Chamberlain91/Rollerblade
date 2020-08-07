import { changeExtension, isExternal } from "./helper.js"

import { promises as fs, existsSync } from 'fs'
import { promisify } from "util"

import consolidate from "consolidate"
import frontMatter from "front-matter"
import marked from "marked"
import hljs from "highlight.js"

import chalk from "chalk"

import { Compiler } from "./compile.base.js"
import { extname } from "path"

/**
 * @typedef MarkdownCompileOptions
 * @property {string} input The path to the input file.
 * @property {string?} output The path to the output file.
 * @property {string} templateEngine The name of the template engine known to the consolidate library.
 * @property {string?} template The path to the main template.
 * @property {string?} data Suppliment data to render with markdown file
 */

// Construct custom marked renderer
let renderer = new marked.Renderer({
    gfm: true,
    highlight: function (code, language) {
        const validLanguage = hljs.getLanguage(language) ? language : 'plaintext'
        return hljs.highlight(validLanguage, code).value
    }
})

export const markdownCompiler = new class extends Compiler {

    constructor() {
        super('html', {
            emitMetadata: true,
            templateEngine: 'whiskers',
            data: {}
        })

        // Sets an identity link render
        this.setLocalLinkRenderer(s => s)
    }

    setLocalLinkRenderer(func) {
        // 
        renderer.link = function (href, title, text) {

            if (href) {
                if (isExternal(href)) {
                    // An external (off-site) link
                    return `<a href='${href}' target='_blank'>${text}</a>`
                } else {
                    // In internal (on-site) link
                    return `<a href='${func(href)}'>${text}</a>`
                }
            } else {
                // Was not a valid hyperlink...?
                return text
            }
        }
    }

    canCompile(file) {
        const ext = extname(file)
        return ext == ".md"
    }

    async _build(options) {

        // Read file 
        const contentBuffer = await fs.readFile(options.input)
        const contents = contentBuffer.toString()

        // Parse front matter and markdown content
        const { attributes, body } = frontMatter(contents)
        const html = marked(body, { renderer: renderer })

        const canTemplate = options.template && options.templateEngine
        if (canTemplate) {

            // Add properties to data object
            let data = Object.assign({}, options.data, {
                attr: attributes,
                content: html
            })

            // Write front matter to disk
            if (options.emitMetadata && Object.keys(attributes).length > 0) {
                const metaFile = changeExtension(options.output, 'json')
                console.log('Compile: ' + chalk.cyan(`'${options.input}'`) + ' -> ' + chalk.cyan(`'${metaFile}'`))
                await fs.writeFile(metaFile, JSON.stringify(attributes))
            }

            // Get async/await version of the consolidate template function
            const renderTemplate = promisify(consolidate[options.templateEngine])
            const compiled = await renderTemplate(options.template, data)
            await fs.writeFile(options.output, compiled)
        } else {
            // Write generated html to disk
            await fs.writeFile(options.output, html)
        }
    }

    _validateOptions(options) {
        // Are we pointed at a template file?
        if (options.template) {

            // Validate options.template exist
            if (!existsSync(options.template)) {
                console.error(`Unable to find template file '${options.template}'.`)
            }

            // Validate options.templateEngine, if provided
            if (!(options.templateEngine in consolidate)) {
                console.error(`Unknown template engine '${options.templateEngine}'. Not supported by consolidate.`)
            }
        }
    }
}
