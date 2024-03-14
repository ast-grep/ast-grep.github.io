# Editor Integration

ast-grep is a **command line tool** for structural search/replace. But it can be readily integrated into your editors and streamline your workflow.

This page introduces several **editors** that has ast-grep support.

## VSCode

ast-grep has an official [VSCode extension](https://marketplace.visualstudio.com/items?itemName=ast-grep.ast-grep-vscode&ssr=false#overview) in the market place.

To get a feel of what it can do, see the introduction on YouTube!

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/1ZM4RfIvWKc?si=aLbGyLlvN9ttneq2" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

### Features

The ast-grep VSCode is an extension to bridge the power of ast-grep and the beloved editor VSCode.
It includes two parts:

* a UI for ast-grep CLI and
* a client for ast-grep LSP.

### Structural Search

Use [pattern](https://ast-grep.github.io/guide/pattern-syntax.html) to structural search your codebase.

| Feature         | Screenshot                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| Search Pattern  | <img src="https://github.com/ast-grep/ast-grep-vscode/blob/main/readme/search-pattern.png?raw=true">     |
| Search In Folder| <img src="https://github.com/ast-grep/ast-grep-vscode/blob/main/readme/search-in-folder.png?raw=true">  |

### Structural Replace

Use pattern to [replace](https://ast-grep.github.io/guide/rewrite-code.html) matching code.

| Feature         | Screenshot                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| Replace Preview | <img src="https://github.com/ast-grep/ast-grep-vscode/blob/main/readme/replace.png?raw=true">             |
| Commit Replace  | <img src="https://github.com/ast-grep/ast-grep-vscode/blob/main/readme/commit-replace.png?raw=true">     |

### Diagnostics and Code Action

*Require LSP setup*

Code linting and code actions require [setting up `sgconfig.yml`](https://ast-grep.github.io/guide/scan-project.html) in your workspace root.

| Feature         | Screenshot                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| Code Linting    | <img src="https://github.com/ast-grep/ast-grep-vscode/blob/main/readme/linter.png?raw=true">               |


## Neovim

### nvim-lspconfig

The recommended setup is using [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig).

```lua
local configs = require 'lspconfig.configs'
configs.ast_grep = {
  default_config = {
    cmd = {'sg', 'lsp'};
    filetypes = {'typescript'};
    single_file_support = true;
    root_dir = nvim_lsp.util.root_pattern('.git', 'sgconfig.yml');
  };
}
```

### coc.nvim

Please see [coc-ast-grep](https://github.com/yaegassy/coc-ast-grep)

You need to have coc.nvim installed for this extension to work. e.g. vim-plug:

```vim
Plug 'yaegassy/coc-ast-grep', {'do': 'yarn install --frozen-lockfile'}
```

### telescope.nvim

[telescope-sg](https://github.com/Marskey/telescope-sg) is the ast-grep picker for telescope.nvim.

Usage:

```vim
Telescope ast_grep
```

[telescope-ast-grep.nvim](https://github.com/ray-x/telescope-ast-grep.nvim) is an alternative plugin that provides ast-grep functionality enhancements.


## More Editors...

More ast-grep editor integration will be supported by the community!
Your contribution is warmly welcome.

