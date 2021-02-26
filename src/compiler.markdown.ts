import { CompilerResult, OutputFile, changeExtension } from "./index.js"

import { promises as fs } from "fs"
import { basename } from "path"

import frontMatter from "front-matter"
import marked from "marked"
import hljs from "highlight.js"
import katex from "katex"
import { off } from 'process'

marked.setOptions({

    // Use github flavored markdown
    gfm: true,

    // Use hightlight.js to style
    highlight(code, lang) {
        const validLanguage = hljs.getLanguage(lang) ? lang : 'plaintext'
        return hljs.highlight(validLanguage, code).value
    }
})

type LinkTransformFunction = (href: string) => string

// By default, we do not modify links
let linkTransformFn: LinkTransformFunction = x => x

const markdown = {

    async compile(input: string): Promise<CompilerResult> {

        // Read file 
        const contentBuffer = await fs.readFile(input)
        const contents = contentBuffer.toString()

        // Parse front matter and render markdown to html
        const { attributes: meta, body } = frontMatter(contents)
        const html = marked(body)

        const file: OutputFile = {
            name: changeExtension(basename(input), 'html'),
            contents: Buffer.from(html, 'utf8')
        }

        return { meta, file }
    },

    /**
     * Sets a function to override the generated URI's for links.
     * @param transformLink A function to transform the uri of generated links
     */
    setLinkTransform(transformLink: LinkTransformFunction) {
        linkTransformFn = transformLink
    },

    defineCustomBlock(/* todo */) {
        throw new Error("Not implemented exception")
    }
}

function isExternal(url) {
    // source: https://stackoverflow.com/questions/10687099/
    if (url.indexOf('//') === 0) { return true } // URL is protocol-relative (= absolute)
    if (url.indexOf('://') === -1) { return false } // URL has no protocol (= relative)
    if (url.indexOf('.') === -1) { return false } // URL does not contain a dot, i.e. no TLD (= relative, possibly REST)
    if (url.indexOf('/') === -1) { return false } // URL does not contain a single slash (= relative)
    if (url.indexOf(':') > url.indexOf('/')) { return false } // The first colon comes after the first slash (= relative)
    if (url.indexOf('://') < url.indexOf('.')) { return true } // Protocol is defined before first dot (= absolute)
    return false // Anything else must be relative
}

markdown.setLinkTransform(x => x)

// We are using 'any' here to silence the warnings about 
// missing symbols for other Renderer properties...
const extensionRenderer: any = {

    code(code: string, lang: string, escaped: boolean) {

        if (lang == "diagram") {
            return "<canvas width='800' height='600'></canvas>"
        }

        return false
    },

    paragraph(text: string) {

        let offset = 0

        // Match all katex blocks
        const regex = /(\${1,2})([^\$]*)\1/g
        for (let match of [...text.matchAll(regex)]) {

            const displayMode = match[1] == "$$"

            // Render Katex
            const content = katex.renderToString(match[2], {
                throwOnError: false,
                displayMode
            })

            // Compute start and end indices of match
            const start = offset + match.index
            const end = start + match[0].length

            // Replace LaTeX w/ rendered string
            text = text.slice(0, start) + content + text.slice(end)

            // Accumulate offset to compensate for different string length
            offset += content.length - match[0].length
        }

        return `<p>${text}</p>\n`
    },

    image(href: string, title: string, text: string) {

        // Construct attributes (if not falsy)
        let _title = title ? `title='${title}'` : ''
        let _alt = text ? `text='${text}'` : ''

        // Determine if link is external
        let external = isExternal(href)
        if (!external) {
            const transform = linkTransformFn ?? (x => x)
            href = transform(href)
        }

        return `<img src="${href}" ${_title} ${_alt}/>`
    },

    link(href: string, title: string, text: string) {

        if (href) {

            // Determine if link is external
            let external = isExternal(href)

            // Construct attributes (if not falsy)
            let _title = title ? `title='${title}'` : ''
            let _target = external ? `target='blank'` : ''

            if (!external) {
                const transform = linkTransformFn ?? (x => x)
                href = transform(href)
            }

            return `<a href='${href}' ${_title} ${_target}>${text}</a>`
        }

        // Use defaults...?
        return false
    }
}

marked.use({ renderer: extensionRenderer })

// Export types
export default markdown