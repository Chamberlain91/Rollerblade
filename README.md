# Rollerblade

## Overview
A command line tool and npm module to shortcut compiling typescript and sass into individual bundles.

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
rollerblade input [output]
```

### CLI Configuration

Parameter `input` must be a `.ts`, `.scss` or `.sass` file and `output` will be either `.js` or `.css`. Omission of `output` will result in the compiled stylesheet or javascript placed next to the input file. Source maps are automatically placed next to the output file with `.map` appended to the output file name.

#### [.ts]

* `-c` or `--tsconfig` optional path to tsconfig for typescript compilation

Multiple invocations of the CLI are needed in order to compile multiple bundles or you must use the Javascript API.

## Javascript API

```js
import rollerblade from 'rollerblade'
```

The `rollerblade` function accepts one or more `config` objects.

The `config` objects are formatted like:

```ts
{
    input: string,
    output?: string,
    tsconfig?: string
}
```

### Example

For example, to compile both a typescript file and a stylesheet.

```js
import { compile } from "rollerblade"
 
let files = [
    "src/script/index.ts",
    "src/style/index.scss"
]

for (let input of files) {
    compile({ input, output: './out' })
}
```