# Using ast-grep with AI Tools

This guide outlines several existing methods for leveraging AI with ast-grep.

:::warning Disclaimer
The field of AI is constantly evolving. The approaches detailed here are for reference, and we encourage you to explore and discover the best ways to utilize ast-grep with emerging AI technologies.
:::

## Using ast-grep with Claude Code Skill

This skill teaches Claude how to write and use ast-grep rules to perform advanced code searches. Unlike traditional text-based search (grep, ripgrep), ast-grep understands the structure of your code, allowing you to find patterns like:

- "Find all async functions that don't have error handling"
- "Locate all React components that use a specific hook"
- "Find functions with more than 3 parameters"
- "Search for console.log calls inside class methods"

Clone or download the [ast-grep skill repository](https://github.com/ast-grep/claude-skill) to your Claude Code skills directory:

```bash
# If you have a skills directory configured
cp -r ast-grep ~/.claude/skills/

# Or place it wherever your Claude Code skills are located
```

The skill should be automatically detected by Claude Code. You can verify by checking available skills in Claude Code.

## Simple Prompting in `AGENTS.md`

For everyday development, you can instruct your AI agent to use ast-grep for code searching and analysis. This method is straightforward but requires a model with up-to-date knowledge of ast-grep to be effective. If the model is not familiar with the tool, it may not utilize it as instructed.

You can set a system-level prompt for your AI agent to prioritize ast-grep for syntax-aware searches. Here is an example prompt comes from [this social post](https://x.com/kieranklaassen/status/1938453871086682232).

**Example Prompt:**

> You are operating in an environment where `ast-grep` is installed. For any code search that requires understanding of syntax or code structure, you should default to using `ast-grep --lang [language] -p '<pattern>'`. Adjust the `--lang` flag as needed for the specific programming language. Avoid using text-only search tools unless a plain-text search is explicitly requested.


This approach is best suited for general code queries and explorations within your projects.



## Providing Comprehensive Context to LLMs

Large Language Models (LLMs) with extensive context windows can be made highly effective at using ast-grep by providing them with its complete documentation.

The `llms.txt` file for ast-grep is a compilation of the entire documentation, designed to be fed into an LLM's context. This method significantly reduces the likelihood of the model "hallucinating" or generating incorrect ast-grep rules by giving it a thorough and accurate knowledge base to draw from.

You can find the full `llms.txt` file here: [https://ast-grep.github.io/llms-full.txt](https://ast-grep.github.io/llms-full.txt)

By loading this text into your session with a capable LLM, you can ask more complex questions and receive more accurate and nuanced answers regarding ast-grep's features and usage.

## Advanced Rule Development with MCP and Sub-agents

For more sophisticated and dedicated code analysis tasks, you can use the ast-grep Model Context Protocol (MCP) server. The [ast-grep-mcp](https://github.com/ast-grep/ast-grep-mcp) is an experimental server that connects AI assistants, such as Cursor and Claude Code, with the powerful structural search capabilities of ast-grep. This allows the AI to interact with your codebase in a more structured and intelligent way, moving beyond simple text-based searches.

The MCP server provides a set of tools that enable an AI to develop and refine ast-grep rules through a process of trial and error. This is particularly useful for creating complex rules that may require several iterations to perfect.

The core of this approach is to have the AI follow a systematic process for rule development:

```
## Rule Development Process
1. Break down the user's query into smaller parts.
2. Identify sub rules that can be used to match the code.
3. Combine the sub rules into a single rule using relational rules or composite rules.
4. if rule does not match example code, revise the rule by removing some sub rules and debugging unmatching parts.
5. Use ast-grep mcp tool to dump AST or dump pattern query
6. Use ast-grep mcp tool to test the rule against the example code snippet.
```

This iterative process allows the AI to "think" more like a human developer, refining its approach until the rule is correct. You can view a detailed prompt for this agentic rule development process in the `ast-grep-mcp` repository: [https://github.com/ast-grep/ast-grep-mcp/blob/main/ast-grep.mdc](https://github.com/ast-grep/ast-grep-mcp/blob/main/ast-grep.mdc).