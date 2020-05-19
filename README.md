# Rollerblade

## Overview
A tool to shortcut compiling typescript to a single bundle.

## Installation

To install globally for use as CLI

```bash
$ npm install -g rollerblade
```

To install as a build dependancy

```bash
npm install rollerblade tslib
```

## CLI Usage

```bash
rollerblade input [output] --tsconfig mytsconfig.json
```

### CLI Configuration

* `-c` or `--tsconfig` to use custom tsconfig

If the output parameter is not specified, the compiled javascript is placed next to the input file.

## Javascript API

```js
import rollerblade from 'rollerblade'
for (let result of await rollerblade({ input, output, tsconfig })) {
    fs.writeFileSync(result.file, result.text);
}
```

The `config` object passed into rollerblade is formatted like:

```ts
{
    input: string,
    output?: string,
    tsconfig?: string
}
```

You may specifiy one or more config objects to compile multiple bundles via the js API.