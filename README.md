# Rollerblade

## Overview
A command line tool and npm module to shortcut compiling typescript, markdown and scss into individual bundles.

## Installation

To install globally for use as CLI

```bash
$ npm install -g rollerblade
```

To install as a build dependancy

```bash
npm install rollerblade
```

## CLI Usage

```bash
rollerblade <input> [outputDir]
```

Note: Source maps are automatically placed next to the output file with `.map` appended to the output file name.

Multiple invocations are needed in order to compile multiple bundles.

### Example

```sh
rollerblade ./src/index.scss ./out
rollerblade ./src/index.ts ./out
```

## Javascript API

To use rollerblade with Node, you must import the function using ES modules syntax.

or
```js
import { compile } from 'rollerblade'
```

This async `compile` function accepts a single string argument as the path to a file. The function returns a results object  defined below:

```ts
{
    files: Array<{filename: string, buffer: Buffer}>,
    meta: any
}
```

### Supported 'Compilers'

#### Sassy Stylesheets `[.scss, .sass]`

Generates a bundled `.css` via [Node Sass][nodesass].

#### Typescript `[.ts]`

Generates a bundled `.js` via [esbuild][esbuild].
 
#### Markdown `[.md]`

Generates a `.html` file and extracts yaml metadata via [marked][marked] and [front-matter][frontmatter].

#### Anything Else [.*]

Files without a 'compiler' are simply read into memory.

### Example

```js
import { compile, helpers as util } from "rollerblade"
import { basename, join } from "path"
import { promises as fs } from "fs"

const outputDir = "./out"

async function emitFile(input) {

    // Wait for result to complete
    let { files, meta } = await compile(input)

    // Write files to disk (may include source maps)
    for (let { filename, buffer } of files) {
        let outFile = util.getOutputFilename(filename, outputDir)
        fs.writeFile(outFile, buffer.toString())
    }

    // Emit metadata
    if (meta) {
        let metaFile = util.getOutputFilename(input, outputDir, 'json')
        fs.writeFile(metaFile, JSON.stringify(meta))
    }
}

// Create out directory
util.ensureDirectory(outputDir, true)

// Compile Sassy Stylesheet
emitFile("src/style/index.scss")

// Compile Typescript
emitFile("src/script/index.ts")

// Compile Markdown
emitFile("src/document.md")

// Compile Generic (ie, Copy file)
emitFile("src/asset.txt")
```

[frontmatter]: https://www.npmjs.com/package/front-matter
[nodesass]: https://www.npmjs.com/package/node-sass
[esbuild]: https://github.com/evanw/esbuild
[marked]: https://github.com/markedjs/marked