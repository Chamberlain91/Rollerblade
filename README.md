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

or with a `rollerblade.config.json` configuration file in the working directory:

```
$ rollerblade 
```

For example, compile to `src/test.js` with external sourcemaps.

```bash
$ rollerblade src/test.ts -s "external"
```

### CLI Configuration

* `-o` or `--output` to set desired output file.
* `-f` or `--format` to set the module format ( default is `cjs` )
* `-t` or `--target` to set the ECMA version ( default is `es5` )
* `-s` or `--sourcemap` to enable writing sourcemaps.
* `-m` or `--minify` to minify the output file.

By default, output files will be placed adjacent to input files if the `-o` option is not specified.

Furthermore, external sourcemaps are written next to the output file.

## CLI Configuration Files

Simply calling `rollerblade` with no arguments on the command line will search for a `rollerblade.config.json` in the working directory. The contents of this configuration file are identical to the Javascript API objects.

```json
{
  "input": "src/app.ts",
  "output": "index.js",
  "target": "es5"
}
```

**Note** - `rollerblade.config.json` must return either a single confiuration object or an array of configuration objects to allow the compilation of multiple entrypoints.

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
        target: 'es5',
        format: 'cjs',
        sourcemap: 'none',
        minify: false
}]).then(results => {
    // Contains the results of transpiling source
});
```

### Javascript Configuration

#### Required
* `input` Required path to source file.

#### Optional
* `output` Required path to source file. Default is input path with `.js` extension. Default is next to input.
* `target` Which generation of javascript to target compilation and attempted downleveling. Defaults to `es5`.
* `format` to set the rollup output format ( `es`, `cjs`, etc ). Default is `cjs`.
* `minify` Determines if the source be minified. Default is `false`.
* `sourcemap` Determines if sourcemaps should be generated. ( `"inline"`, `"external"`, or `none` )
    Default is disabled with `"none"`.

## Contribution

If you feel like contributing to this project, please put a pull request or whatever. If it is useful to you,I wouldn't mind hearing what you're doing with it. 

Ultimately this is a pet project, I may not have time to maintain it.