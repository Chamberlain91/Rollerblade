# Rollerblade

## Overview
Rollerblade is a shortcut utility for using Typescript and Rollup together with minimal configuration.

## Installation

To install globally for use as CLI

```bash
$ npm i -g rollerblade
```

To install as a build dependancy

```bash
npm i rollerblade -D
```

## CLI Usage

```
$ rollerblade [options] src
```

or with a configuration file in the working directory

```
$ rollerblade 
```

For example, compile to `src/test.js` with sourcemaps via CLI.

```bash
$ rollerblade src/test.ts -m "external"
```

### CLI Configuration

* `-m` or `--sourcemap` to enable writing sourcemaps.
* `-f` or `--format` to set the module format ( default is `iife` )
* `-t` or `--target` to set the ECMA version ( default is `es5` )
* `-o` or `--output` to set desired output file.

By default, `rollerblade` will output files adjacent to input file if the `-o` option is not specified.

External sourcemaps are written next to the output file as `.js.map`.

## Javascript API

Simply specifying the path to a file will use all defaults.

```js
import rollerblade from 'rollerblade'
rollerblade(['src/test.ts']).then(results => {
    // Contains the results of transpiling source
});
```

The following is equivalent to the above:

```js
import rollerblade from 'rollerblade'

rollerblade([{
        input: 'src/test.ts',
        output: 'bin/test.js',
        sourcemap: undefined,
        target: 'es5',
        format: 'iife'
}]).then(results => {
    // Contains the results of transpiling source
});
```

**Note** - The `rollerblade` function accepts an array to allow the compilation of multiple entrypoints or targets. For example `client` and `server` or for cross platform builds where one may use `umd` and the other `es` modules.

### JSON Configuration

#### Required
* `input` Required path to source file.

#### Optional
* `output` Required path to source file. Default is input path with `.js` extension.
* `format` to set the rollup output format ( `es`, `cjs`, etc ). Default is `iife`.
* `sourcemap` Determine if sourcemaps should be generated. Options are `"inline"`, `"external"`, or `undefined`. Default is disabled with `undefined`.
* `tsconfig` A custom tsconfig to override any tsconfig.json files and provide specific typescript compilation options for specific files. Default is `undefined`.
* `target` Which generation of javascript to target compilation and attempted downleveling. Defaults to `ES5`.

## Configuration Files

Using the Javascript configuration options for the JS API or a empty CLI call, you can specify configuration in a `rbconfig.json` file or a `rollerblade` field in your `package.json`.

For example:

```json
{
  "name": "rollerblade-test",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "rollerblade",
    "prestart": "npm run build",
    "start": "node ."
  },
  "dependencies": {},
  "devDependencies": {
    "rollerblade": "^0.1.7"
  },
  "rollerblade": {
    "input": "src/app.ts",
    "output": "index.js",
    "target": "es5"
  }
}
```

or in `rbconfig.json`

```json
{
  "input": "src/app.ts",
  "output": "index.js",
  "target": "es5"
}
```

**Note** - The `rollerblade` field or `rbconfig.json` accepts an array of these configuration objects to allow the compilation of multiple entrypoints. Examples mentioned above.

## Contribution

If you feel like contributing to this project, please put a pull request or whatever. If it is useful to you,I wouldn't mind hearing what you're doing with it. 

Ultimately this is a pet project, I may not have time to maintain it.