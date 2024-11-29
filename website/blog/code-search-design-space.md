# Design Space for Code Search

* Code Search: A Survey of Techniques for Finding Code https://www.lucadigrazia.com/papers/acmcsur2022.pdf
* Aroma: Code recommendation via structural search https://arxiv.org/pdf/1812.01158
* Deep code search: https://guxd.github.io/papers/deepcs.pdf
  * deep neural network named (Code-Description Embedding Neural Network). Instead
of matching text similarity, CODEnn jointly embeds code snippets and natural language descriptions into a high-dimensional vector space, in such a way that code snippet and its corresponding description have similar vectors. Using the unified vector representation, code snippets related to a natural language query can be retrieved according to their vectors. Semantically related words can also be recognized and irrelevant/noisy keywords in queries can be handled
* FaCoY: a code-to-code search engine: https://www.darkrsw.net/papers/ICSE2018.pdf
  * ... statically finding code fragments which may be semantically similar to user input code. FaCoY
implements a query alternation strategy: instead of directly matching code query tokens with code in the search space, FaCoY first attempts to identify other tokens which may also be relevant in implementing the functional behavior of the input code

* Glean: System for collecting, deriving and working with facts about source code. https://github.com/facebookincubator/glean
* Relationship-Aware code search for JavaScript frameworks: https://taoxie.cs.illinois.edu/publications/fse16-racs.pdf
  * RACS collects a large number of code snippets that use some JavaScript frameworks, mines API usage patterns from the collected code snippets, and represents the mined patterns with method call relationship (MCR) graphs, which capture framework API methods’ signatures and their relationships. Given a natural language (NL) search query issued by a programmer, RACS conducts NL processing to automatically extract an action relationship (AR) graph, which consists of actions and their relationships inferred from the query. In this way, RACS reduces code search to the problem of graph search: finding similar MCR graphs for a given AR graph

* A framework for source code search using program pattern https://web.eecs.umich.edu/~aprakash/papers/paul-prakash-ieeetse94.pdf
  * non-deterministic finite automata, called code pattern automata, to represent relationships between code elements.
* Query by Example in Large-Scale Code Repositories: https://www.researchgate.net/profile/Vipin-Balachandran-2/publication/308729994_Query_by_example_in_large-scale_code_repositories/links/5cf567f54585153c3db18991/Query-by-example-in-large-scale-code-repositories.pdf
  * Abstract Syntax Tree (AST) structural similarity match. The query snippet is converted to an AST, then
its subtrees are compared against AST subtrees of source files in the repository and the similarity values of matching subtrees are aggregated to arrive at a relevance score for each of the source files.

* Semantics-Based Code Search Using Input/Output Examples https://seg.nju.edu.cn/uploadPublication/copyright/1201675797649.pdf
  *  encodes Java methods in code repositories into path constraints via symbolic analysis and leverages SMT solvers to
find the methods whose path constraints can satisfy the given input/output examples
