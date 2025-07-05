---
author:
  - name: Herrington Darkholme
search: false
date: 2025-03-23
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: ast-grep gets more LLM support!
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/more-llm-support.html
  - - meta
    - property: og:description
      content: ast-grep is getting even better with enhanced Large Language Model (LLM) support. This exciting development opens up new possibilities for developers to analyze, understand, and transform code more efficiently. Let's dive into the details of these new features.
---

# ast-grep Gets More LLM Support!

## Leveling Up Code Analysis with AI

ast-grep, the powerful tool for structural code search, is getting even better with enhanced Large Language Model (LLM) support. This exciting development opens up new possibilities for developers to analyze, understand, and transform code more efficiently. Let's dive into the details of these new features.

## `llms.txt` Support

ast-grep now supports a new file format, [`llms.txt`](https://llmstxt.org/), designed to work seamlessly with LLMs. It is also on [llmstxthub](https://llmstxthub.com/websites/ast-grep) for easy access to the latest files.

A key challenge for large language models is their limited ability to process extensive website content. They often struggle with the complexity of converting full HTML pages, which include navigation, advertisements, and JavaScript, into a simplified text format that LLMs can effectively use.

On the other hand, ast-grep faces challenges due to the limited training data available for LLMs. Because of this, LLMs often confuse ast-grep with other similar tools, even when provided with accurate prompts. Furthermore, despite ast-grep's comprehensive online documentation, LLM search capabilities don't guarantee accurate retrieval of information on rule writing. This hinders ast-grep's widespread adoption in the AI era.

`llms.txt` addresses this by providing models with comprehensive context, enhancing their [in-context learning](https://arxiv.org/abs/2301.00234) and improving the accuracy of their output. It is particularly effective with models that have large context windows, such as [Google’s Gemini](https://aistudio.google.com/).

![Example Usage with $GOOG Gemini](/image/blog/gemini.jpeg)

<center><i><sub>Example llms.txt usage with Gemini. The full doc reduces model hallucination.</sub></i></center>

The general usage of `llms.txt` is as follows:

1. Visit [https://ast-grep.github.io/llms-full.txt](https://ast-grep.github.io/llms-full.txt) and copy the full documentation text
2. Paste these documents into your conversation with your preferred AI chatbot
3. Ask AI questions about ast-grep

## AI-powered Codemod Studio

[Codemod.com](https://codemod.com/) is a long-time [contributor](https://go.codemod.com/ast-grep-contributions) [supporter](https://github.com/ast-grep/ast-grep?tab=readme-ov-file#sponsor) of ast-grep and has recently introduced a new feature called [Codemod Studio](https://app.codemod.com/studio).

The studio introduces an AI assistant which is is a game-changer for writing ast-grep rules. This interactive environment allows you to use natural language to describe the code patterns you want to find, and then the AI will help you write the corresponding ast-grep rule. Here's how it works:

- **Describe your goal**: In plain English, explain what you want to achieve with your ast-grep rule (e.g., "Find all instances of `console.log`").
- **AI assistance**: The AI analyzes your description and suggests an appropriate ast-grep pattern.
- **Refine and test**: You can then refine the generated rule, test it against your codebase, and iterate until it meets your needs.

This innovative approach democratizes ast-grep rule creation, making it accessible to developers of all skill levels, even without previous experience with ast-grep.

## GenAI Script Support

Microsoft’s GenAI Script supports [ast-grep](https://microsoft.github.io/genaiscript/reference/scripts/ast-grep/)!

> [GenAIScript](https://microsoft.github.io/genaiscript/) is a scripting language that integrates LLMs into the scripting process using a simplified JavaScript syntax. Supported by our VS Code GenAIScript extension, it allows users to create, debug, and automate LLM-based scripts.

Notably, GenAIScript provides a wrapper around `ast-grep` to search for patterns within a script's AST and transform that AST. This enables the creation of highly efficient scripts that modify source code by precisely targeting specific code elements.

## Upcoming MCP Support

Looking ahead, ast-grep has a plan to support [Model Context Protocol](https://modelcontextprotocol.io) (MCP). This upcoming feature will further enhance the integration of LLMs with ast-grep, enabling even more sophisticated code analysis and transformation.

MCP will provide a standardized interface for LLMs to interact with ast-grep, streamlining the process of analyzing and transforming code. Some of the key features of ast-grep MCP include:

- List all ast-grep's [resources](https://modelcontextprotocol.io/docs/concepts/resources) in the project: rules, utils, and test cases.
- Orchestrate the LLM's actions by providing predefined [prompts](https://modelcontextprotocol.io/docs/concepts/prompts) and workflows.
- Provide [tools](https://modelcontextprotocol.io/docs/concepts/tools) to create/validate rules and search the codebase.

See the tracking GitHub issue [here](https://github.com/ast-grep/ast-grep/issues/1895)

## Conclusion

ast-grep's integration of LLMs, including `llms.txt`, Codemod Studio, and GenAI Script, represents a significant leap forward in code analysis. With the promise of MCP on the horizon, ast-grep is poised to become an indispensable tool for developers seeking to harness the power of AI to understand, transform, and elevate their code. The future of code analysis is here, and it's powered by ast-grep.
