# Editor Integration


## Neovim

The recommended setup is using lspconfig.

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
