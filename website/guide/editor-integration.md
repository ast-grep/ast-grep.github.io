# Editor Integration

## VSCode

We have a preview version of [VSCode extension](https://marketplace.visualstudio.com/items?itemName=ast-grep.ast-grep-vscode&ssr=false#overview) in the market place.


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