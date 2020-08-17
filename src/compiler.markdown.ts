import { changeExtension } from "./helper"
import { promises as fs } from "fs"
import { basename } from "path"

import frontMatter from "front-matter"
import marked from "marked"
import hljs from "highlight.js"

// Construct custom marked renderer
let renderer = new marked.Renderer({
    gfm: true,
    highlight: function (code, lang) {
        const validLanguage = hljs.getLanguage(lang) ? lang : 'plaintext'
        return hljs.highlight(validLanguage, code).value
    }
})

export type LinkTransformFunction = (href: string) => string

const markdown = {

    async compile(input: string) {
        const output = changeExtension(basename(input), 'html')

        // Read file 
        const contentBuffer = await fs.readFile(input)
        const contents = contentBuffer.toString()

        // Parse front matter and render markdown to html
        const { attributes, body } = frontMatter(contents)
        const html = marked(body, { renderer: renderer })

        return {
            files: [{ filename: output, buffer: Buffer.from(html, 'utf8') }],
            meta: attributes
        }
    },

    /**
     * Sets a function to override the generated URI's for links.
     * @param transformLink A function to transform the uri of generated links
     */
    setLinkTransform(transformLink: LinkTransformFunction) {

        // Replaces the link renderer
        renderer.link = function (href, title, text) {

            // Construct title attribute (if not falsy)
            let _title = title ? `title='${title}'` : ''

            if (href) {
                // In internal (on-site) link
                return `<a href='${transformLink(href)}' ${_title}>${text}</a>`
            } else {
                // Was not a valid hyperlink...?
                return text
            }
        }
    },

    defineCustomBlock(/* todo */) {
        throw new Error("Not implemented exception")
    }
}

// By default, do not modify links
markdown.setLinkTransform(h => h)

// Export types
// export const { compile, defineCustomBlock, setLinkRenderer } = markdown
export default markdown