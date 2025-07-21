---
author:
  - name: Herrington Darkholme
date: 2025-06-21
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: ast-grep's Journey to AI Generated Rules
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/ast-grep-agent.html
  - - meta
    - property: og:description
      content: Advancements in AI have made it possible to generate ast-grep rules with a well-written prompt.
---

# ast-grep's Journey to AI Generated Rules

ast-grep is a command-line tool that empowers developers to find and replace code with precision. It operates directly on the syntax tree (AST), the true structure of your code. While powerful, writing ast-grep rules is a hurdle that requires grokking the tool.

This project has always been about designed and built as a tool for human beings, not for AI hype. But ast-grep been [exploring how to use Al](/blog/more-llm-support.html) to improve the human experience. This is the story of my journey into using Al to generate YAML rules.

## Why ast-grep Rules are Hard for AI

Generating ast-grep rules is not an easy task,especially for AI. First, ast-grep is a relatively new tool, so Large Language Models have not been extensively trained on its specific syntax, leading to hallucinations or a complete lack of understanding. While [in-context learning](https://www.prompthub.us/blog/in-context-learning-guide) can help an LLM grasp the basic syntax, it often fails to address the problem of [compounding errors](https://arxiv.org/abs/2505.24187v1).

This is particularly true for ast-grep, where rules are frequently composed of smaller, [atomic rules](/guide/rule-config/atomic-rule.html). Human developers often need to debug these smaller rules through [trial and error](/advanced/faq.html#my-pattern-does-not-work-why), and pay extra attention to how they are orchestrated into a [working composition](/advanced/faq.html#my-rule-does-not-work-why). For an LLM, a small mistake in one part of the rule can snowball into a completely incorrect rule. Quoting from the paper [Faith and Fate](https://arxiv.org/abs/2305.18654):

> _These tasks require breaking problems down into sub-steps and synthesizing these steps into a precise answer._

This explains why a simple LLM ask won't work for ast-grep. However, recent advancements in "thinking" and "agentic" models, which can correct their mistakes, may [reduce the probability of such errors](https://arxiv.org/abs/2501.15602v2). This makes it a good time to give AI-powered ast-grep rule generation another try.


## The First Foray a Year Ago

My initial attempt, about a year ago, was a lesson in humility. I tried to build an agent using [DSPy](https://dspy.ai/) with a rigid, fixed pipeline: generate use cases, create code examples, describe the rule in natural language, translate that description to an ast-grep rule, and finally, verify it.

The results were, to put it mildly, not good.

The models I was using are mostly free-tier APIs from [Ollama](https://ollama.com/) and [aistudio](https://aistudio.google.com)(thank [$GOOG](https://finance.yahoo.com/quote/GOOG/)). They struggled to adhere to a consistent output format. They often failed to generate correct code examples, let alone valid ast-grep rules. The limited context windows meant I couldn't even provide sufficient instructions to guide them properly. It felt like I was missing two crucial pieces: a way for the agent to refine a rule based on search result feedback, and a method to dynamically break down complex requests into smaller, manageable rules. The agent architecture could solve these, but the underlying models could not.

## One Year After: Better Models, Better Agents

Fast forward to today. The landscape has changed dramatically. Modern LLMs boast long context windows and a much-improved ability to follow complex instructions. Armed with these new capabilities and inspired by [Anthropic's new guide](https://www.anthropic.com/engineering/building-effective-agents), I tried again.

This time, I discovered that a complex agent framework wasn't necessary. AI programming tools like [Cursor](https://www.cursor.com/) have sufficient agent frameworks for tool developers. The secret sauce was something far simpler: prompt engineering. And by "[prompt engineering](https://www.promptingguide.ai/)", I don't mean any framework or trick. It's just writing a clear, human-readable manual for both human and Al.

Before the prompt engineering, however, I saw some interesting failure modes across different models that somehow reflects different LLM vendors' training setup. All of them did a decent job of interpreting the user's intent and creating relevant code examples, but their approaches to rule generation were wildly different.

*   **OpenAI O3** hallucinated with wild abandon. It invented syntax that looked more like [CodeQL](https://codeql.github.com/) or [jscodeshift](https://github.com/facebook/jscodeshift), completely ignoring the ast-grep documentation available online. It couldn't recover from tool errors and would quickly give up on using the tools I gave it. It felt like OpenAI's pretraining dataset glanced at my documentation, decided it knew better, and threw it in the bin. (Oops, like how OpenAI treated my resume)

*   **Gemini** was a bit more grounded. Its hallucinations were at least in the right ballpark, borrowing syntax from a [related but more established](/advanced/tool-comparison.html#semgrep) tool, [Semgrep](https://semgrep.dev/). (Thanks for the flattery, again, $GOOG). It also showed a decent ability to recover from errors but had a stubborn streak, preferring to invent its own ast-grep cli commands rather than using the [MCP](https://modelcontextprotocol.io) tools I [provided](https://github.com/ast-grep/ast-grep-mcp).
*   **Claude 4** was the most promising out of the box. It correctly identified ast-grep and produced syntactically valid rules. Looks like Anthropic's training data is indexing ast-grep's doc! Hoooray! However, it struggled with subtle semantic details that would make a rule functionally correct. To its credit, it tried very hard, retrying the tools I gave it over and over with different inputs, demonstrating a dogged persistence the others lacked.

## Prompting AI Agents like Teaching a Human

After iterating on the prompt, I found that all three models could perform remarkably well. The key was to treat the prompt not as a magic incantation, but as a straightforward instruction manual.

The core of my final prompt gives the Al a simple, five-step plan:

1.  First, clearly understand the user's request.
2.  Next, write a simple code snippet that the user wants to find.
3.  Then, write an ast-grep rule that precisely matches that code snippet.
4.  [Test the rule](https://github.com/ast-grep/ast-grep-mcp/blob/b69eb5391bd93d46ef3dec07de814c3c39675c8f/main.py#L33-L57) against the example to ensure it works as expected.
5.  Finally, [search](https://github.com/ast-grep/ast-grep-mcp/blob/b69eb5391bd93d46ef3dec07de814c3c39675c8f/main.py#L72-L82) the codebase with the verified rule.

This clear, step-by-step process turned erratic geniuses into more reliable assistants. By breaking the problem down and providing a verification loop, I gave the models the structure they needed to succeed. You can see the full prompt in the [sg-mcp GitHub repository](https://github.com/ast-grep/ast-grep-mcp/blob/main/ast-grep.mdc).

The end result is quite impressive, see the [demo video](https://youtube.com/shorts/2hah-9N5YQ8?si=bzl6PF2tuFbBwXpL) below. No speed up, but with music and cats. (It is oddly satisfactory to watch AI generating the rules while I myself is nodding like the kitty in the video)

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/2hah-9N5YQ8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


This journey has reinforced a core belief: Al's true power isn't about replacing the developer, but about building better tools for them. It also demonstrates that the best way to teach an AI, with the progress of more capable Large Language Models, is not through complex frameworks or rigid pipelines, but through clear, human-readable instructions.

By teaching an Al to write rules, I hope it makes ast-grep more accessible, more powerful, and easier to use.
Happy grepping!
