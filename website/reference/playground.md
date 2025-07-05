# ast-grep Playground Manual

The [ast-grep playground](/playground.html) is an online tool that allows you to try out ast-grep without installing anything on your machine. You can write code patterns and see how they match your code in real time. You can also apply rewrite rules to modify your code based on the patterns.

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/eQSbypFjXQs?si=NL8AUX9VS_egBMuF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

See the video for a quick overview of the playground.

The playground is a great way to _learn_ ast-grep, _debug_ patterns/rules, _report bugs_ and _showcase_ ast-grep's capabilities.

## Basic Usage

Annotated screenshot of the ast-grep playground:

![ast-grep playground](https://user-images.githubusercontent.com/2883231/268551825-2adfe739-c3d1-48c3-94d7-3c0c40fabbbc.png)

The ast-grep playground has a simple and intuitive layout that consists of four main areas.

### 1. Source Editor

The **source editor** is where you can write or paste the code that you want to search or modify. The source editor supports syntax highlighting and auto-indentation for various languages, such as Python, JavaScript, Java, C#, and more.

:::tip How to Change Language?
You can choose the language of your code from the drop-down menu at the top right corner.
:::

### 2. Source AST Dump

The **source AST dump** is where you can see the AST representation of your source code. The AST dump shows the structure and the [kind and field](/advanced/core-concepts.html#kind-vs-field) of each node in the AST. You can use the AST dump to understand how your code is parsed and how to write patterns that match specific nodes or subtrees.

### 3. Matcher Editor

The **matcher editor** is where you can write the code patterns and rewrite rules that you want to apply to your source code. The matcher uses the same language as your source code. The matcher editor has two tabs: **Pattern** and **YAML**.

- **Pattern** provides an _approachable_ option where you can write the [code pattern](/guide/pattern-syntax.html) that you want to match in your source code. You can also write a rewrite expression that specifies how to modify the matched code in the subeditor below. It roughly emulates the behavior of [`ast-grep run`](/reference/cli/run.html).
- **YAML** provides an _advanced_ option where you can write a [YAML rule](/reference/yaml.html) that defines the pattern and metadata for your ast-grep scan. You can specify the [rule object](/reference/rule.html), id, message, severity, and other options for your rule. It is a web counterpart of [`ast-grep scan`](/reference/cli/scan.html).

### 4. Matcher Info

The **matcher info** is where you can see the information for the matcher section. The matcher info shows different information depending on which tab you are using in the matcher editor: **Pattern** or **YAML**.

- If you are using the **Pattern** tab, the matcher info shows the AST dump of your code pattern like the source AST dump.
- If you are using the **YAML** tab, the matcher info shows the matched meta-variables and errors if your rule is not valid. You can use the matched meta-variables to see which nodes in the source AST are bound to which variables in your pattern and rewrite expression. You can also use the errors to fix any issues in your rule.

---

#### YAML Tab Screenshot

![YAML](https://user-images.githubusercontent.com/2883231/268738518-279f0635-d5af-4b41-87c6-4bd6fa67b135.png)

## Share Results

In addition to the four main areas, the playground also has a **share button** at the bottom right corner. You can use this button to generate a unique URL that contains your source code, patterns, rules, and language settings. You can copy this URL and share it with others who want to try out your ast-grep session.

## View Diffs

Another feature of the ast-grep playground is the **View Diffs** option. You can use this option to see how your source code is changed by your rewrite expression or the [`fix`](/reference/yaml.html#fix) option in your YAML rule.

You can access this option by clicking the **Diff** tab in the source editor area. The Diff tab will show you a unified inline comparison of your original code and your modified code.

![Diff Tab Illustration](https://user-images.githubusercontent.com/2883231/268726696-d5091342-bc07-4859-8c95-abf079221cc2.png)

This is a useful way to check and debug your rule/pattern before applying it to your code base.

## Toggle Full AST Display

Sometimes you need to match code based on elements that are not encoded in AST. These elements are called [unnamed nodes](/advanced/core-concepts.html#named-vs-unnamed) in ast-grep.

ast-grep can represent code using two different types of tree structures: **AST** and **CST**.
**AST**, Abstract Syntax Tree, is a simplified representation of the code _excluding_ unnamed nodes. **CST**, Concrete Syntax Tree, is a more detailed representation of the code _including_ unnamed nodes. We have a standalone [doc page](/advanced/core-concepts.html#ast-vs-cst) for a deep-dive explanation of the two concepts.

In case you need to match unnamed nodes, you can toggle between AST and CST in the ast dumper by clicking the **Show Full Tree** option. This option will show you the full CST of your code, which may be useful for debugging or fine-tuning your patterns and rules.

| Syntax Tree Format | Screenshot                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Named AST          | ![no full](https://user-images.githubusercontent.com/2883231/268730796-57ffb3be-e2e9-4199-8a71-76f1320cebf7.png)   |
| Full CST           | ![full tree](https://user-images.githubusercontent.com/2883231/268730525-ea3b7c71-5389-42e5-abee-fc0d845e4b1b.png) |

## Test Multiple Rules

One of the cool features of the ast-grep playground is that you can test multiple rules at once! This can help you simulate how ast-grep would work in your real projects, where you might have several rules to apply to your code base.

To test multiple rules, you just need to separate them by `---` in the YAML editor. Each rule will have its own metadata and options, and you can see the results of each rule in the Source tab as well as the Diff tab.

Example with [playground link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJyZXdyaXRlIjoibG9nZ2VyLmxvZygkTUFUQ0gpIiwiY29uZmlnIjoiIyBhc3QtZ3JlcCBub3cgc3VwcG9ydHMgbXVsdGlwbGUgcnVsZXMgaW4gcGxheWdyb3VuZCFcbnJ1bGU6XG4gIHBhdHRlcm46IGNvbnNvbGUubG9nKCRBKVxuZml4OlxuICBsb2dnZXIubG9nKCRBKVxuLS0tXG5ydWxlOlxuICBwYXR0ZXJuOiBmdW5jdGlvbiAkQSgpIHsgJCQkQk9EWSB9XG5maXg6ICdjb25zdCAkQSA9ICgpID0+IHsgJCQkQk9EWSB9JyIsInNvdXJjZSI6Ii8vIGNvbnNvbGUubG9nKCkgd2lsbCBiZSBtYXRjaGVkIGJ5IHBhdHRlcm4hXG4vLyBjbGljayBkaWZmIHRhYiB0byBzZWUgcmV3cml0ZS5cblxuZnVuY3Rpb24gdHJ5QXN0R3JlcCgpIHtcbiAgY29uc29sZS5sb2coJ21hdGNoZWQgaW4gbWV0YXZhciEnKVxufVxuXG5jb25zdCBtdWx0aUxpbmVFeHByZXNzaW9uID1cbiAgY29uc29sZVxuICAgLmxvZygnQWxzbyBtYXRjaGVkIScpIn0=):

```yaml
rule:
  pattern: console.log($A)
fix:
  logger.log($A)
---
rule:
  pattern: function $A() { $$$BODY }
fix: 'const $A = () => { $$$BODY }'
```

Screenshot:

![multiple rule](https://user-images.githubusercontent.com/2883231/268735920-e6369832-6fa9-4b64-8975-2e813dc14076.png)

## Test Rule Diagnostics

Finally, the ast-grep playground also has a powerful feature that lets you see how your YAML rule reports diagnostics in the code editor.

This feature is optional, but can be turned on easily. To enable it, you need to specify the following fields in your YAML rule: `id`, `message`, `rule`, and `severity`. The `severity` field should be either `error`, `warning` or `info`, but not `hint`.

The playground will then display the diagnostics in the code editor with red or yellow wavy underlines, depending on the severity level. You can also hover over the underlines to see the message and the rule id for each diagnostic. This feature can help you detect and correct code issues more quickly and effectively.

[Example Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImphdmFzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJyZXdyaXRlIjoibG9nZ2VyLmxvZygkTUFUQ0gpIiwiY29uZmlnIjoiaWQ6IG5vLWNvbnNvbGVcbnJ1bGU6XG4gIHBhdHRlcm46IGNvbnNvbGUuJE1FVEhPRCgkQSlcbm1lc3NhZ2U6IFVuZXhwZWN0ZWQgY29uc29sZVxuc2V2ZXJpdHk6IHdhcm5pbmdcblxuLS0tXG5cbmlkOiBuby1kZWJ1Z2dlclxucnVsZTpcbiAgcGF0dGVybjogZGVidWdnZXJcbm1lc3NhZ2U6IFVuZXhwZWN0ZWQgZGVidWdnZXJcbnNldmVyaXR5OiBlcnJvciIsInNvdXJjZSI6ImZ1bmN0aW9uIHRyeUFzdEdyZXAoKSB7XG4gIGNvbnNvbGUubG9nKCdtYXRjaGVkIGluIG1ldGF2YXIhJylcbn1cblxuY29uc3QgbXVsdGlMaW5lRXhwcmVzc2lvbiA9XG4gIGNvbnNvbGVcbiAgIC5sb2coJ0Fsc28gbWF0Y2hlZCEnKVxuXG5pZiAodHJ1ZSkge1xuICBkZWJ1Z2dlclxufSJ9)

![diagnostics](https://user-images.githubusercontent.com/2883231/268741624-98017dd4-8093-4b11-aa6f-cf7b66e68762.png)
