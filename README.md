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
npm install rollerblade tslib
```

**Note:** Including `tslib` here seemed to be necessary for some reason, but I would like for all dependencies behind rollerblade.

## CLI Usage

```bash
rollerblade input [output] --tsconfig mytsconfig.json
```

### CLI Configuration

Parameter `input` must be a `.ts`, `.scss` or `.sass` file and `output` will be either `.js` or `.css`. Omission of `output` will result in the compiled stylesheet or javascript placed next to the input file. Source maps are automatically placed next to the output file with `.map` appended to the output file name.

* `-c` or `--tsconfig` to use custom tsconfig during typescript compilation

Multiple invocations of the CLI are needed in order to compile multiple bundles or you must use the Javascript API.

## Javascript API

```js
import rollerblade from 'rollerblade'
```

The `rollerblade` function accepts one or more `config` objects and returns a promise for one or more `output` objects.

The `config` objects are formatted like:

```ts
{
    input: string,
    output?: string,
    tsconfig?: string
}
```

The `output` objects are formatted like:

```ts
{
    file: string,
    text: string
}
```

### Example

For example, to compile both a typescript file and a stylesheet.

```js
const rollerblade = require("rollerblade");
const fs = require("fs");

(async () => {

    for (let { file, text } of await rollerblade([
        { input: "src/script/index.ts" },
        { input: "src/style/index.scss" }
    ])) {
        // Write each generated file to disk
        // In this example 4 files. Two compiled bundles
        // and two source maps.
        fs.writeFileSync(file, text);
    }

})()
```