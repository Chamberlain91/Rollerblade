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
rollerblade [options] input output
```

### Options

* `input` - Files must be one of `.ts`, `.scss` or `.sass` and `.md` file for transpilation. all other extensions will result in the file simply being copied to the output.
* `output` - Must be a directory (identified by the trailing slash) or a file. 

Note: Source maps are automatically placed next to the output file with `.map` appended to the output file name.

Multiple invocations are needed in order to compile multiple bundles.

#### Sassy Stylesheets `[.scss, .sass]`

No configurable options.

#### Typescript `[.ts]`

##### `--tsconfig` or `-c`
Path to a typescript config file. (optional)
 
##### Markdown `[.md]`

##### `--template` or `-t`
Path to the template file. If omitted, the template pass is skipped.

##### `--templateEngine` or `-e`
One of the template engines known to [consolidate][consolidate]. (default: 'whiskers')
 
## Javascript API

To use rollerblade with Node, you must import the function using ES modules syntax.

```js
import rollerblade from 'rollerblade'
```

This `rollerblade` function accepts a `config` object to descript how to process the asset. All assets require specfying `input` and `output`. The rules are the same as the command line.

```ts
{
    input: string,
    output: string
}
```

### Options

#### Sassy Stylesheets `[.scss, .sass]`

No configurable options.

#### Typescript `[.ts]`

`tsconfig`
Path to a typescript config file. (optional)
 
#### Markdown `[.md]`

Markdown files are compiled from `.md` to `.html`. The conversion supports yaml front matter and templating via [consolidate][consolidate]. This data is exposed to the template via a local property named `attr`. 

The front matter is also emitted to disk by placing it next to the output file with `.json` extension.

##### template
Path to the template file. If omitted, the template pass is skipped.

##### templateEngine
One of the template engines known to [consolidate][consolidate]. (default: 'whiskers')

##### data
A javascript object to pass into the template as local data. A top-level property with the name `content` will be overriden with the generated HTML, so avoid using this properly for local data.

### Example

For example, to compile both a typescript file and a stylesheet.

```js
import rollerblade from "rollerblade"

// Compile stylesheet
rollerblade({
    input: "src/style/index.scss",
    output: "out/"
})

// Compile typescript
rollerblade({
    input: "src/script/index.ts",
    // tsconfig: ".tsconfig",
    output: "out/"
})

// Compile markdown (via whiskers template)
rollerblade({
    input: "src/document.md",
    output: "out/",
    // Template (optional)
    data: { title: "Rollerblade Template" },
    templateEngine: "whiskers", // default is whiskers, so may be omitted
    template: "src/template.html"
})

// Compile generic asset (ie, a simple copy)
rollerblade({
    input: "src/asset.txt",
    output: "out/"
})
```

`src/template.html`

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
</head>

<body>
    {content}
</body>

</html>
```

[consolidate]: https://github.com/tj/consolidate.js