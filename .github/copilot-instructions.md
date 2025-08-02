# GitHub Copilot Instructions

## Repository Overview

This repository contains the documentation website source code for **ast-grep**, a lightning-fast and user-friendly tool for code searching, linting, and rewriting at large scale. The website is built using VitePress and serves as the comprehensive documentation hub for the ast-grep project.

## Technology Stack

- **Frontend Framework**: VitePress (static site generator based on Vue.js)
- **Programming Languages**: 
  - TypeScript/JavaScript (website functionality)
  - Rust (WASM compilation for in-browser ast-grep functionality)
- **Package Manager**: **pnpm** (NOT npm - this is important!)
- **Build Tools**: 
  - wasm-pack (for Rust to WASM compilation)
  - Vite (bundling and development server)
  - Vue TypeScript compiler (vue-tsc)
- **Linting/Formatting**: 
  - oxlint (JavaScript/TypeScript linting)
  - dprint (code formatting)

## Important: Package Manager Usage

**⚠️ This repository uses pnpm instead of npm!**

Always use `pnpm` commands:
- `pnpm install` (not `npm install`)
- `pnpm run dev` (not `npm run dev`)
- `pnpm run build` (not `npm run build`)

The project has a `pnpm-lock.yaml` file and is configured to work specifically with pnpm.

## Development Setup

1. **Prerequisites**: 
   - Install Rust toolchain
   - Install wasm-pack: `cargo install wasm-pack`
   - Install pnpm: `npm install -g pnpm`

2. **Initial Setup**:
   ```bash
   # Build WASM package
   wasm-pack build --target web
   
   # Install dependencies
   pnpm install
   
   # Start development server
   pnpm dev
   ```

3. **Development Workflow**:
   - For WASM changes: Rebuild with `wasm-pack build --target web`
   - For website changes: Use `pnpm dev` for hot reloading
   - Visit `localhost:5173` for development preview

## Project Structure

```
├── src/                    # Rust source code for WASM bindings
├── website/                # VitePress website source
│   ├── .vitepress/        # VitePress configuration
│   ├── guide/             # User guide documentation
│   ├── reference/         # API and CLI reference
│   ├── catalog/           # Rule examples by language
│   ├── playground.md      # Interactive playground page
│   └── index.md           # Homepage
├── pkg/                   # Generated WASM package (git-ignored)
├── Cargo.toml            # Rust dependencies
├── package.json          # Node.js dependencies and scripts
└── pnpm-lock.yaml        # pnpm lockfile
```

## Available Scripts

- `pnpm dev`: Start development server with hot reloading
- `pnpm build`: Build production website
- `pnpm serve`: Preview production build locally
- `pnpm lint`: Run linting (oxlint + dprint)
- `pnpm lint:fix`: Fix linting issues automatically

## Coding Guidelines

### For TypeScript/JavaScript:
- Use TypeScript for type safety
- Follow Vue 3 Composition API patterns
- Prefer `async/await` over promises
- Use `const` over `let` when possible
- Follow existing code style (enforced by oxlint and dprint)

### For Rust:
- Focus on WASM bindings and web-compatible APIs
- Use `wasm-bindgen` for JavaScript interop
- Keep WASM bundle size optimized
- Handle errors gracefully for web environment

### For Documentation:
- Use clear, concise language
- Include code examples for concepts
- Test examples in the playground when possible
- Maintain consistent formatting across pages

## WASM Integration

The repository includes Rust code that compiles to WebAssembly to provide ast-grep functionality in the browser:

- Rust source in `src/`
- Compiled to `pkg/` directory (git-ignored)
- Imported as optional dependency: `"ast-grep-wasm": "file:./pkg/"`
- Used in playground and interactive features

## Common Tasks

### Adding New Documentation:
1. Create markdown files in appropriate `website/` subdirectory
2. Update navigation in `website/.vitepress/config.ts`
3. Test locally with `pnpm dev`

### Updating WASM Functionality:
1. Modify Rust code in `src/`
2. Rebuild with `wasm-pack build --target web`
3. Test integration in browser features

### Adding Dependencies:
- Use `pnpm add <package>` for runtime dependencies
- Use `pnpm add -D <package>` for development dependencies
- Update Rust dependencies in `Cargo.toml` if needed

## Build and Deployment

The website is automatically deployed via GitHub Actions:
1. Builds WASM package with `wasm-pack`
2. Installs dependencies with `pnpm`
3. Builds website with `pnpm build`
4. Deploys to GitHub Pages

## Best Practices

1. **Always use pnpm** instead of npm
2. Test WASM changes thoroughly in browser
3. Maintain documentation quality and accuracy
4. Follow existing naming conventions
5. Update navigation when adding new pages
6. Ensure examples work in the playground
7. Keep build times reasonable by optimizing WASM size
8. Use TypeScript types for better developer experience

## Troubleshooting

- **WASM not loading**: Rebuild with `wasm-pack build --target web`
- **Dependencies issues**: Delete `node_modules` and run `pnpm install`
- **Build failures**: Check that wasm-pack and pnpm are properly installed
- **Playground not working**: Ensure tree-sitter WASM files are in `website/public/`