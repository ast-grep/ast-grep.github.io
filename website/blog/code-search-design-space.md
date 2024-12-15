# Design Space for Code Search

Code search is a critical tool for developers, enabling them to find, understand, and reuse existing code.

ast-grep at its core is a code search tool: other features like linting and rewriting are all derived from the basic code search functionality.


This blog is a recap of a great review paper: Code Search: A Survey of Techniques for Finding Code https://www.lucadigrazia.com/papers/acmcsur2022.pdf


We will not cover all the details in the paper, but focus on specifically the design space for code search tool. These factors are:
1. Query design
2. Indexing
3. Retrieval


## Query Design

The starting point of every search is a query. We define a query as an explicit expression of the
intent of the user of a code search engine. This intent can be expressed in various ways, and
different code search engines support different kinds of queries.

The designers of a code search
engine typically aim at several goal when deciding what kinds of queries to support:
• Ease. A query should be easy to formulate, enabling users to use the code search engine
without extensive training. If formulating an effective query is too difficult, users may get
discouraged from using the code search engine.
• Expressiveness. Users should be able to formulate whatever intent they have when searching
for code. If a user is unable to express a particular intent, the search engine cannot find the
desired results.
• Precision. The queries should allow specifying the intent as unambiguously as possible. If the
queries are imprecise, the search is likely to yield irrelevant results.



These three goals are often at odds with each other.


##  PREPROCESSING AND EXPANSION OF QUERIES

The query provided by a user may not be the best possible query to obtain the results a user
expects. One reason is that natural language queries suffer from the inherent imprecision of natural
language. Another reason is that the vocabulary used in a query may not match the vocabulary
used in a potential search result. For example, a query about “container” is syntactically different
from “collection”, but both refer to similar concepts. Finally, a user may initially be unsure what
exactly she wants to find, which can cause the initial query to be incomplete.
To address the limitations of user-provided queries, approaches for preprocessing and expanding
queries have been developed. We discuss these approaches by focusing on three dimensions: (i)
the user interface, i.e., if and how a user gets involved in modifying queries, (ii) the information
used to modify queries, i.e., what additional source of knowledge an approach consults, and (iii)
the actual technique used to modify queries. Table 1 summarizes different approaches along these
three dimensions, and we discuss them in detail in the following.

##  INDEXING OR TRAINING, FOLLOWED BY RETRIEVAL OF CODE

The perhaps most important component of a code search engine is about retrieving code examples
relevant for a given query. The vast majority of approaches follows a two-step approach inspired
by general information retrieval: At first, they either index the data to search through, e.g., by
representing features of code examples in a numerical vector, or train a model that learns representations of the data to search through. Then, they retrieve relevant data items based on the
pre-computed index or the trained model. To simplify the presentation, we refer to the first phase
as “indexing” and mean both indexing in the sense of information retrieval and training a model
on the data to search through.
The primary goal of indexing and retrieval is effectiveness, i.e., the ability to find the “right” code
examples for a query. To effectively identify these code examples, various ways of representing
code and queries to compare them with each other have been proposed. A secondary goal, which
is often at odds with achieving effectiveness, is efficiency. As users typically expect code search
engines to respond within seconds [108], building an index that is fast to query is crucial. Moreover,
as the code corpora to search through are continuously increasing in size, the scalability of both
indexing and retrieval is important as well [4].
We survey the many different approaches to indexing, training and retrieval in code search
engines along four dimensions, as illustrated in Figure 4. Section 4.1 discuss what kind of artifacts a
search engine indexes. Section 4.2 describes different ways of representing the extracted information.
Section 4.3 presents techniques for comparing queries and code examples with each other. Table 2
summarizes the approaches along these first three dimensions. Finally, Section 4.4 discusses different
levels of granularity of the source code retrieved by search engines.


## Representing the Information for Indexing
* Individual Code Elements: Representing code as sets of individual elements, such as tokens or function calls, without considering their order or relationships.
* Sequences of Code Elements: Preserving the order of code elements by extracting sequences from Abstract Syntax Trees (ASTs) or control flow graphs.
* Relations between Code Elements: Extracting and representing relationships between code elements, such as parent-child relationships, method calls, and data flow.

ast-grep index the individual code elements

## Representing the Information for Retrieval

Techniques to Compare Queries and Code

* Feature Vectors: Algorithmically extracted feature vectors represent code and queries as numerical vectors. Standard distance measures like cosine similarity or Euclidean distance are used to compare these vectors.
* Machine Learning-Based Techniques: End-to-end neural learning models embed both queries and code into a joint vector space, allowing for efficient retrieval based on learned representations.
* Database-Based Techniques: General-purpose databases, such as NoSQL or relational databases, store and retrieve code examples based on precise matches to the query.
* Graph-Based Matching: Code and queries are represented as graphs, and graph similarity scores or rewrite rules are used to match them.
* Solver-Based Matching: SMT solvers are used to match queries against code examples by solving constraints that describe input-output relationships.



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
