<p align=center>
  <img src="website/public/logo.svg" alt="ast-grep"/>
</p>

## ast-grep(sg)

ast-grep(sg) is a lightning fast and user friendly tool for code searching, linting, rewriting at large scale.

This is the website source for ast-grep!

## Setup Guide

Unfortunately wasm-pack does not support compiling C dependency with stdlib.
~~We have to use emcc.~~

We have to use web-tree-sitter


~~
1. Install [emcc](https://emscripten.org/docs/getting_started/downloads.html)
2. `rustup target add wasm32-unknown-emscripten`
3. cargo install -f wasm-bindgen-cli
4. EMCC_CFLAGS="-s ERROR_ON_UNDEFINED_SYMBOLS=0 --no-entry"  cargo build --target wasm32-unknown-emscripten
5. wasm-bindgen --target web ../../target/wasm32-unknown-emscripten/debug/ast_grep_wasm.wasm --out-dir pkg

## Reference

https://github.com/MolotovCherry/tree-sitter-wasm
https://github.com/rustwasm/wasm-pack/issues/741
https://stackoverflow.com/questions/67474533/error-in-compiling-rust-into-webassembly-using-emscripten-on-windows
https://github.com/rustwasm/wasm-pack/blob/master/src/command/build.rs
~~

## ast-grep playground

## Pre-requisite

It requires tree-sitter.wasm and tree-sitter-{lang}.wasm available in public directory.

Language specific wasm must be built with the same emcc version of the tree-sitter.wasm.

Mismatching emcc version will raise RuntimeError.

## Reference
* https://github.com/tree-sitter/tree-sitter/issues/1593
* https://github.com/tree-sitter/tree-sitter/issues/1829
