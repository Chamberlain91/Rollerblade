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
$ rollerblade [options] src1 src2 ... srcN
```

For example, compile to `src/test.js` with sourcemaps via CLI.

```bash
$ rollerblade src/test.ts -s
```

### CLI Configuration

* `-s` or `--sourcemap` to enable writing sourcemaps. Sourcemaps are written next to the output file as `*.js.map`
* `-f` or `--format` to set the rollup output format ( `es`, `cjs`, etc )
* `-o` or `--output` to set desired output file or directory. A directory must be specified if transpiling multiple files.  
**CURRENTLY N/A**

## Javascript Usage

A simple string assumes all defaults ( ES module format, sourcemaps, targeting ES5 )

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
        sourcemap: true,
        target: 'es5',
        format: 'es'
}]).then(results => {
    // Contains the results of transpiling source
});
```

### Javascript Configuration

#### Required
* `input` Required path to source file.

#### Optional
* `output` Required path to source file. Default is input path with `.js` extension.
* `format` to set the rollup output format ( `es`, `cjs`, etc ). Default is `es`.
* `sourcemap` Boolean flag to determine if sourcemaps should be generated. Default is `true`.
* `tsconfig` A custom tsconfig to override any tsconfig.json files and provide specific typescript compilation options for specific files. Default is `undefined`.
* `target` Which generation of javascript to target compilation and attempted downleveling. Defaults to `ES5`.

## Contribution

If you feel like contributing to this project, please put a pull request or whatever. If it is useful to you,I wouldn't mind hearing what you're doing with it. 

Ultimately this is a pet project, I may not have time to maintain it.