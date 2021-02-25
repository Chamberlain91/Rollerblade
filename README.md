# Rollerblade

A command line tool and npm package to shortcut compiling typescript and scss bundles as well as compile markdown into minified HTML with front-matter. 

## Overview

Note: *This is not and likely will never be as customizable as a build tool like webpack or rollup, but should be simpler (and possibly faster) to use for projects that do not require such a pipeline.*

This utility was written and tested against `Node 14.8.X`.

### Installation

To install globally for use as CLI

```bash
$ npm install -g rollerblade
```

To install as a package

```bash
npm install rollerblade
```

### CLI Usage

```bash
rollerblade <input> [outputDir]
```

If the `outputDir` argument is not given, it will write into the current directory.

Multiple invocations are needed in order to compile multiple bundles.

Note: *Source maps are automatically placed next to the output file with `.map` appended to the output file name.*

#### Example

```sh
rollerblade ./src/index.scss ./out
rollerblade ./src/index.ts ./out
```

### Javascript API

To use rollerblade with Node, you must import the function using ES modules syntax.

```js
import { compile } from 'rollerblade'
```

This async `compile` function accepts a single string argument as the path to a file. The function returns a results object as defined below:

```ts
{
    file: { name: string, contents: Buffer | string },
    sourcemap?: { name: string, contents: Buffer | string },
    meta?: any
}
```

#### Supported 'Compilers'

##### Sassy Stylesheets `[.scss, .sass]`

Generates a bundled `.css` via [Node Sass][nodesass].

##### Typescript `[.ts]`

Generates a bundled `.js` via [esbuild][esbuild].
 
##### Markdown `[.md]`

Generates a minified `.html` file and extracts yaml metadata via [marked][marked] and [front-matter][frontmatter].

This compiler step is extended to support code highlighting and rendering LaTeX.

###### LaTeX Support
In order to render LaTex, this compilation step uses [KaTeX](https://github.com/KaTeX/KaTeX) within `$` and `$$` blocks.  
*You will need to include their stylesheet for proper styling.*

###### Code Highlighting Support
The markdown parser supports code highlighting via [highlight.js](https://github.com/highlightjs/highlight.js).  
*You will need to include one of their stylesheets for proper styling.*

##### Anything Else [.*]

Files without a 'compiler' are simply read into memory to allow byte-for-byte copies.

#### Example

```js
import { basename, extname, join, dirname, relative } from "path"
import { compile, utilities } from "rollerblade"
import { promises as fs } from "fs"

const { writeFile } = utilities

const sourceDir = "./src"
const outputDir = "./out"

async function compileFile(input) {

    // Construct source path
    input = join(sourceDir, input)

    // Wait for result to complete
    let { file, sourcemap, meta } = await compile(input)

    // Ensure same structured output directory exists
    let dir = join(outputDir, relative(sourceDir, dirname(input)))
    await fs.mkdir(dir, { recursive: true })

    // Write file to disk
    writeFile(file, dir)

    // Write sourcemap (if exists)
    if (sourcemap) {
        writeFile(sourcemap, dir)
    }

    // Write metadata as json (if exists)
    if (meta) {
        writeFile({
            name: basename(input, extname(input)) + ".json",
            contents: JSON.stringify(meta)
        }, dir)
    }
}

// Compile Sassy Stylesheet
compileFile("style/index.scss")

// Compile Typescript
compileFile("script/index.ts")

// Compile Markdown
compileFile("document.md")

// Compile Generic (ie, Copy file)
compileFile("asset.txt")
```

[frontmatter]: https://www.npmjs.com/package/front-matter
[nodesass]: https://www.npmjs.com/package/node-sass
[esbuild]: https://github.com/evanw/esbuild
[marked]: https://github.com/markedjs/marked