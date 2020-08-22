// src/helper.ts
import path2 from "path";
function changeExtension(src, ext) {
  let fileInfo = path2.parse(src);
  return path2.join(fileInfo.dir, fileInfo.name + "." + ext);
}
function isExternalURL(url) {
  if (url.indexOf("//") === 0) {
    return true;
  }
  if (url.indexOf("://") === -1) {
    return false;
  }
  if (url.indexOf(".") === -1) {
    return false;
  }
  if (url.indexOf("/") === -1) {
    return false;
  }
  if (url.indexOf(":") > url.indexOf("/")) {
    return false;
  }
  if (url.indexOf("://") < url.indexOf(".")) {
    return true;
  }
  return false;
}

// src/compiler.copy.ts
import {promises as fs2} from "fs";
import {basename} from "path";
var compiler_copy_default = {
  async compile(input) {
    const buffer = await fs2.readFile(input);
    const filename = basename(input);
    return {
      files: [{buffer, filename}],
      meta: void 0
    };
  }
};

// src/compiler.typescript.ts
import {basename as basename2, join} from "path";
import {promises as fs4} from "fs";
import {tmpdir} from "os";
import esbuild2 from "esbuild";
import crypto2 from "crypto";
let pathToConfig = void 0;
const typescript = {
  useConfiguration(file) {
    pathToConfig = file;
  },
  async compile(input) {
    const output = changeExtension(basename2(input), "js");
    let dir = tmpdir();
    let name = crypto2.randomBytes(16).toString("base64");
    var tempfile = join(dir, name);
    await esbuild2.build({
      entryPoints: [input],
      outfile: tempfile,
      tsconfig: pathToConfig,
      sourcemap: true,
      minify: true,
      bundle: true
    });
    const buffer = await fs4.readFile(tempfile);
    const sourcemapBuffer = await fs4.readFile(tempfile + ".map");
    let files = [
      {filename: output, buffer},
      {filename: output + ".map", buffer: sourcemapBuffer}
    ];
    return {files, meta: void 0};
  }
};
var compiler_typescript_default = typescript;

// src/compiler.markdown.ts
import {promises as fs6} from "fs";
import {basename as basename3} from "path";
import frontMatter from "front-matter";
import marked2 from "marked";
import hljs from "highlight.js";
let renderer = new marked2.Renderer({
  gfm: true,
  highlight: function(code, lang) {
    const validLanguage = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(validLanguage, code).value;
  }
});
const markdown = {
  async compile(input) {
    const output = changeExtension(basename3(input), "html");
    const contentBuffer = await fs6.readFile(input);
    const contents = contentBuffer.toString();
    const {attributes, body} = frontMatter(contents);
    const html = marked2(body, {renderer});
    return {
      files: [{filename: output, buffer: Buffer.from(html, "utf8")}],
      meta: attributes
    };
  },
  setLinkTransform(transformLink) {
    renderer.link = function(href, title, text) {
      let _title = title ? `title='${title}'` : "";
      if (href) {
        return `<a href='${transformLink(href)}' ${_title}>${text}</a>`;
      } else {
        return text;
      }
    };
  },
  defineCustomBlock() {
    throw new Error("Not implemented exception");
  }
};
markdown.setLinkTransform((h) => h);
var compiler_markdown_default = markdown;

// src/compiler.scss.ts
import {promisify} from "util";
import {basename as basename4} from "path";
import sass from "node-sass";
const render = promisify(sass.render);
const scss = {
  async compile(input) {
    const output = changeExtension(basename4(input), "css");
    let result = await render({
      file: input,
      outFile: output,
      sourceMapRoot: "./",
      outputStyle: "compressed",
      sourceMapContents: true,
      sourceMap: true
    });
    let files = [
      {filename: output, buffer: result.css}
    ];
    if (result.map) {
      files.push({filename: output + ".map", buffer: result.map});
    }
    return {files, meta: void 0};
  }
};
var compiler_scss_default = scss;

// src/index.ts
import {existsSync, readdirSync, mkdirSync} from "fs";
import {extname, dirname} from "path";
import chalk2 from "chalk";
let compilerFunctions = {
  ".scss": compiler_scss_default.compile,
  ".sass": compiler_scss_default.compile,
  ".ts": compiler_typescript_default.compile,
  ".md": compiler_markdown_default.compile
};
function makeDirectoryPath(file) {
  const dir = dirname(file);
  try {
    readdirSync(dir);
  } catch (err) {
    this.makeDirectoryPath(dir);
    try {
      mkdirSync(dir);
    } catch (err2) {
      if (err2.code !== "EEXIST") {
        throw err2;
      }
    }
  }
}
var src_default = {
  async compile(input) {
    if (!existsSync(input)) {
      throw new Error(`Unable to compile asset. Input file does not exist: '${input}'`);
    }
    const extension = extname(input);
    const compileAsset = compilerFunctions[extension];
    console.log("Processing: " + chalk2.cyan(`'${input}'`));
    if (compileAsset !== void 0) {
      return compileAsset(input);
    } else {
      return compiler_copy_default.compile(input);
    }
  },
  helpers: {
    makeDirectoryPath,
    changeExtension,
    isExternalURL
  },
  typescript: compiler_typescript_default,
  markdown: compiler_markdown_default,
  scss: compiler_scss_default
};
export {
  src_default as default
};
