# ast-grep Playground Manual

The [ast-grep playground](/playground.html) is an online tool that allows you to try out ast-grep without installing anything on your machine. You can write code patterns and see how they match your code in real time. You can also apply rewrite rules to modify your code based on the patterns.

The playground is a great way to _learn_ ast-grep, _debug_ patterns/rules, _report bugs_ and _showcase_ ast-grep's capabilities.

## Basic Usage

The ast-grep playground has a simple and intuitive layout that consists of four main parts:

![ast-grep playground](https://user-images.githubusercontent.com/2883231/268551825-2adfe739-c3d1-48c3-94d7-3c0c40fabbbc.png)


1. The **source editor** is where you can write or paste the code that you want to search or modify. You can choose the language of your code from the drop-down menu at the top right corner. The source editor supports syntax highlighting and auto-indentation for various languages, such as Python, JavaScript, Java, C#, and more.

2. The **source AST dump** is where you can see the AST representation of your source code. The AST dump shows the structure and the [kind and field](/advanced/core-concepts.html#kind-vs-field) of each node in the AST. You can use the AST dump to understand how your code is parsed and how to write patterns that match specific nodes or subtrees.

3. The **matcher editor** is where you can write the code patterns and rewrite rules that you want to apply to your source code. The matcher uses the same language as your source code. The matcher editor has two tabs: **Pattern** and **Rule**.
    - The **Pattern** tab is where you can write the code pattern that you want to match in your source code. You can also write a rewrite expression that specifies how to modify the matched code in the subeditor below.
    - The **Rule** tab is where you can write a YAML file that defines the metadata and options for your ast-grep rule. You can specify the name, description, languages, severity, and other parameters for your rule.

4. The **matcher AST dump** is where you can see the AST representation of your code patterns and rewrite rules. The matcher AST dump shows how your patterns and rules are parsed and how they match or modify the nodes in the source AST.


## Share Results

In addition to these four parts, the playground also has a **share button** at the bottom right corner. You can use this button to generate a unique URL that contains your source code, patterns, rules, and language settings. You can copy this URL and share it with others who want to see or try out your ast-grep session.

## View Diffs

TODO

## Toggle Full AST Display

TODO

## Test Multiple Rules

TODO

## Test Rule Diagnostics

TODO