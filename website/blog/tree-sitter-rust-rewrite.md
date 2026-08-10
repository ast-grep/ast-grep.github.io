---
author:
  - name: Herrington Darkholme
date: 2026-07-22
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: How ast-grep Rewrote Tree-sitter in Rust and Made It 30% Faster
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/tree-sitter-rust-rewrite
  - - meta
    - property: og:description
      content: The complete adventure of using AI to rewrite Tree-sitter's C core in Rust, simplify it, optimize it, and discover that a faster parser could still make ast-grep slower.
---

# How ast-grep Rewrote Tree-sitter in Rust and Made It 30% Faster

*Part 1 of 4 — the complete adventure*

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/cXxH9odZbrQ" title="Rewriting Tree-sitter's C core in Rust with AI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

ast-grep rewrote Tree-sitter's C core in Rust, with AI writing the code. The
new core is faster at parsing, faster at reading the completed tree, and
faster in ast-grep itself. (The title's “30%” is the parser-only number;
end-to-end, ast-grep runs about 22% faster.)

Source repository:
[HerringtonDarkholme/tree-sitter](https://github.com/HerringtonDarkholme/tree-sitter).

Two quick introductions before the numbers. ast-grep — the structural
code-search tool this blog belongs to — searches code by syntax rather than by
text, so every file it touches must first become a syntax tree.
[Tree-sitter](https://tree-sitter.github.io/) is the parser framework that
builds that tree: you give it a grammar definition, and it generates a fast
parser for that language. Born in the editor world, it now powers an enormous
ecosystem of grammars and tools.

![Rust core runtime performance compared with C](/image/blog/00-current-performance.svg)

**Performance and peak RSS.** Throughput is normalized so the unmodified C
build (“C / normal”) scores 100; higher is better. RSS is peak resident
memory, and the raw-parsing row shows it as a range because it varies across
the benchmark's language fixtures. The outline row is ast-grep's real
workload: parse every file in a repository, then walk each completed tree to
extract a structural outline.

| Benchmark | C / normal | Rust | Difference |
| --- | ---: | ---: | ---: |
| Raw parsing | Throughput: 100<br>RSS: 8.48–21.41 MiB | Throughput: <span class="benchmark-positive">129.74</span><br>RSS: <span class="benchmark-negative">8.42–25.70 MiB</span> | <span class="benchmark-positive">+29.74% throughput</span><br><span class="benchmark-negative">+20.0% RSS upper bound</span> |
| Tree traversal | Throughput: 100<br>RSS: 20.38 MiB | Throughput: <span class="benchmark-positive">110.16</span><br>RSS: <span class="benchmark-negative">22.20 MiB</span> | <span class="benchmark-positive">+10.16% throughput</span><br><span class="benchmark-negative">+8.9% RSS</span> |
| Complete ast-grep outline | User CPU: 1.233 s<br>RSS: 26.52 MiB | User CPU: <span class="benchmark-positive">0.960 s</span><br>RSS: <span class="benchmark-negative">34.43 MiB</span> | <span class="benchmark-positive">−22.2% user CPU</span><br><span class="benchmark-negative">+29.8% RSS</span> |

Rust won every parser and traversal fixture, and ast-grep produced exactly the
same outline. Memory is the tradeoff: the Rust build uses about 8 MiB more in
the ast-grep run. On the much larger TypeScript stress corpus — the TypeScript
compiler repository's test-baseline tree, this project's memory torture test —
it peaks at **91.2 MiB**. That figure is a triumph, not a confession: earlier
in the project, the same corpus peaked above 1 GiB.

The result is not a 1:1 replacement for upstream Tree-sitter. It is a narrower
runtime built for AI coding agents that analyze complete file snapshots:

- Existing generated languages and parsers remain compatible.
- Native loading of WebAssembly-compiled languages and incremental old-tree
  reuse were removed.
- Compatibility still requires many raw pointers and `unsafe` blocks.

That boundary keeps the grammar ecosystem useful for agentic coding while
removing editor-specific machinery the target workload does not need.

That is the ending. Getting there was another matter.

## Why Rewrite Tree-sitter?

Every serious ast-grep performance investigation eventually arrived at the
same place: **Tree-sitter**.

ast-grep could make its rules faster. It could prune work, cache configuration,
and avoid visiting irrelevant syntax. But every file still had to become a
syntax tree first, and Tree-sitter built that tree. The parser was both the
foundation and, increasingly, the ceiling.

I had dreamed about rewriting or deeply optimizing it for years. The dream
usually lasted until I opened the runtime. There was a mature C implementation,
binary compatibility, external scanners, error recovery, incremental parsing,
ambiguous grammars, several language bindings, and a small matter of not
breaking the enormous grammar ecosystem built on top of all of it.

For one person, this was not a weekend project. It was a Herculean task wearing
a header file.

_So nothing happened._

Then AI-assisted rewrite attempts started appearing everywhere—[Bun](https://bun.com/blog/bun-in-rust),
[pgrust](https://github.com/malisper/pgrust), and
[Roc](https://rtfeldman.com/rust-to-zig) among them. They did not prove that
rewriting Tree-sitter was wise, make the runtime smaller, or make parser theory
less strange. They showed that the experiment had become cheap enough for one
person to attempt, giving me enough leverage to ask the unreasonable question
and get an answer before the decade ended.

So I instructed ChatGPT to rewrite Tree-sitter's C core in Rust. The project
moved from a compatibility-first translation, through a fast but unreadable
optimization attempt, to a simpler runtime and real parser gains—only to
discover that a faster parser could still make ast-grep slower.

The rest of this post follows that journey: what worked, what had to be
reverted, and what it took to turn a parser benchmark win into an application
win.

## Tree-sitter's Parsing Architecture

Tree-sitter takes source code and produces a syntax tree. Each supported
language begins as a grammar definition that Tree-sitter compiles into
generated parsing tables and lexer code; when this series says “generated
languages,” “generated grammars,” or “generated tables,” it means those
artifacts. At runtime, a lexer turns characters into tokens such as
`identifier`, `+`, and `number`. The parser then uses the generated table and
a stack to decide what each token means.

Most of the time, the table requests one of two operations:

- **shift**: consume a token and push it onto the parser stack;
- **reduce**: recognize that several syntax pieces form a larger grammar rule,
  replace them with one parent, and continue.

If every table entry had one valid answer, the parser could follow one history
with one stack. That is the ordinary **LR** case. Programming-language grammars
occasionally have genuine conflicts: more than one action may remain valid
until additional input reveals which interpretation survives.

Tree-sitter therefore uses **generalized LR (GLR)**. It can follow several
histories at once while sharing their common past in a graph-structured stack.
Think of one road that can briefly fork, then merge again. The graph is
necessary when the grammar is ambiguous. It is considerably less charming
when the parser constructs graph machinery for a road that remains straight.

The other central object is the **subtree**. A shifted token becomes a leaf;
a reduction combines children into an internal syntax node. These values are
created during parsing, shared across stack histories, published as the final
tree, traversed by ast-grep, and eventually released. Optimizing only their
birth while ignoring the rest of that lifetime would later produce a rather
expensive lesson.

That is enough parser theory for the overview.

## First Step: Preserve C Behavior in Rust

The first goal was not elegance. It was parity.

The rewrite contract was deliberately conservative:

- **Use the existing tests as the behavioral oracle.** A plausible Rust
  implementation was not enough; it had to produce the same trees, recovery
  behavior, navigation results, and public API effects.
- **Test the ecosystem, not only handwritten examples.** Existing generated
  grammars and external scanners had to keep working without regeneration or
  source changes.
- **Preserve the binary interface (ABI).** Generated language tables, public C
  functions, layouts, symbols, and calling conventions remained compatible
  while the implementation behind them changed language.
- **Translate before redesigning.** The first Rust version intentionally
  resembled the C control flow so parity failures had a bounded search area.

In one sentence: preserve everything the ecosystem can observe, then make the
inside replaceable.

I instructed ChatGPT to translate the runtime one part at a time: basic
utilities, tree storage, lexing, the parser stack, tree navigation, and finally
the parser loop. The agent read the C and Rust code, wrote patches, fixed
compiler errors, ran tests, and investigated mismatches. I supplied the goals,
constraints, objections, and decisions. The existing implementation and test
suite supplied the answer key.

This distinction matters. I did not personally type a heroic Rust port and then
ask AI to polish the comments. The implementation, profiling, instrumentation,
and much of the experimental code were produced by the agent under my
direction. Without AI, this project would still be an idea I occasionally
mentioned before wisely changing the subject.

The C core had become Rust. It compiled. It passed the tests. Existing grammars
could use it. This was already the kind of result that had looked impossible
when the project was sitting on the shelf.

Naturally, I immediately asked for more.

## Why the First Optimization Attempt Failed

The request was pure vibe coding — one line typed into a `/goal` command. The
process behind it was more careful than that: I directed ChatGPT to use proper
profiling tools, understand the runtime's data layouts and ownership, and look
for algorithmic changes instead of merely polishing individual instructions.
The benchmarks duly crossed the requested line. Then I opened the code and
could not follow it. Layers of overlapping AI-generated optimizations sat on
top of a mechanical C-to-Rust translation, and soon the parser began
segfaulting: no friendly Rust panic, no failed assertion, the process simply
left. A parser that is twenty percent faster and occasionally disappears is
not an optimization. It is a benchmark with a jump scare.

I reverted the optimization work entirely. The twenty percent went with it,
and the performance the project eventually reached came later, from the clean,
layered work described below.
[Part 2](tree-sitter-rust-migration.md) tells this story in full. What matters
here is how it reversed the project: I stopped asking ChatGPT to make the pile
faster and started asking it to make the system explainable.

## Second Step: Reduce Scope and Improve Readability

The cleanup had two parts:

1. delete features and representations outside the target product;
2. turn the retained C-style Rust into code whose ownership and control flow
   could be reasoned about locally.

Neither step promised a heroic benchmark. Both were prerequisites for trusting
the next one.

### Remove Incremental Parsing from the Target Runtime

At first, “rewrite Tree-sitter” implied preserving every feature. Then the
target workload forced a better question: preserving it for whom?

Upstream Tree-sitter is famously useful inside editors. A human inserts one
character, deletes two more, and expects highlighting to update before the next
frame. Incremental parsing lets the runtime reuse the old tree and rebuild only
the affected region. In that world, reparsing the complete file after every
keystroke is needless work.

That was not the world of this branch. ast-grep and the AI coding-agent tools
I cared about operate on complete file snapshots: an agent reads a file,
analyzes or rewrites it, and asks the tool to process the new snapshot. There
is no editor-owned syntax tree advancing one keystroke at a time. A fresh
parse is not a degraded fallback; it is the normal operation.

So I decided to remove incremental old-tree reuse and instructed ChatGPT to do
it. The public parameter remains for compatibility, but this runtime parses
fresh. The machinery for finding and reusing pieces of the old tree — and it
reached into a surprising number of core structures — disappeared from the hot
implementation; [Part 2](tree-sitter-rust-migration.md) inventories exactly
what went.

A second, separate scope cut rode along with it: native loading of
Wasm-compiled grammars. Tree-sitter can compile a grammar to WebAssembly and
load it at runtime — a capability distinct from the browser Wasm build, which
stayed. Native tools set this project's performance target, and runtime Wasm
grammar loading was not part of that workload.

This is not a proposal that upstream Tree-sitter should abandon incremental
parsing. It is a product decision for a narrower runtime aimed at file-at-a-time
analysis and agent tooling. If this branch returns to interactive editor use,
the decision must be reopened. That was the rule: delete only behind a declared
boundary, never because a feature happened to be inconvenient.

Deletion turned out to be the first real optimization technique: remove work
whose use case has already left the building.

### Refactor the Retained Runtime for Maintainability

A line-by-line translation is only readable if the reader already knows the
original line by line. I instructed ChatGPT to break the monolithic,
pointer-heavy port into more idiomatic internal Rust—without making the
ABI-facing types “idiomatic” in ways that would break existing grammars.

The cleanup was less a redesign than a long series of small promotions.
Internal raw-pointer parameters became references or slices wherever their
lifetimes were local and provable; a sentinel pointer meaning “no node here”
became an honest `Option`. Out-parameters turned into return values where the
C ABI did not demand them, large modules split by responsibility so mutation
sat next to the state it changed, and the dense tricks that had to stay —
compact indexes into the tree, pointer arithmetic — were hidden behind narrow,
named operations. Where compatibility was real, the code stayed deliberately
ugly: generated-language layouts and exported functions remained C-shaped,
because another binary had already committed to that shape.

That cleanup made questions answerable: Who owns this piece of the tree? Can
this reference survive when its storage grows? Why does one reduction create a
temporary parser state only to delete it immediately?

The important output was not prettier syntax. It was a runtime organized well
enough that a segfault, invariant failure, or suspicious allocation had an
address in the architecture.

## GLR and Memory-Layout Optimizations

Once I could understand the runtime, I directed ChatGPT back toward
**reduction** — the “reduce” from the architecture section above, and the
operation the parser performs constantly.

That small operation touches both major data structures. It removes the
children from the parser's working stack, then stores them under a new parent in
the syntax tree. The profile showed that Tree-sitter was doing much more work
around those children than the ordinary case required.

The successful changes eventually fell into four simple principles:

- **Avoid work for uncommon cases.** About 99% of the observed parser stack was
  one straight path, so the parser no longer builds a graph until the input
  actually forks. Work needed mainly for editing is also kept out of a fresh
  parse when possible.
- **Make allocation cheap, and indexes small.** Asking the general-purpose
  allocator for every internal syntax node is expensive. An arena obtains a
  growing block and serves many nodes from it. Separately, compact indexes
  reduce the bytes moved between the parser stack and the tree.
- **Do repeated work once.** The parser prepares common grammar lookups ahead of
  time, and the tree reader avoids looking up the same children repeatedly.
- **Give the simplest cases a short path.** One parser action is handled
  directly, and ordinary ASCII input avoids the full character-decoding path.
  The complete fallback remains available whenever the simple path does not
  apply.

```text
ordinary parse: keep one stack path
real ambiguity: switch to the full graph
```

The 99% number described the problem, but not the solution. I directed ChatGPT
(in research mode rather than coding mode, this time) to review academic work
on generalized parsers, and the result pointed to an older lesson: do not
build the general structure until the input actually needs it. The arena was a
separate idea and required its own experiments. The linear stack avoided graph
bookkeeping; the arena reduced calls to the general allocator. Making the
indexes smaller was yet another layout choice, and it did not become faster
automatically. Several versions lost before the pieces paid for themselves.

The important result: ordinary parsing stopped paying the full price of rare
ambiguity and of separate allocation for every internal syntax node.

For a moment, the parser benchmarks looked excellent.

Then I asked ChatGPT to build ast-grep against it.

## End-to-End Performance Findings

The agent ran that binary across opencode, a real TypeScript repository. At
that point, the parser-only benchmark put this Rust implementation roughly
**30% ahead of the C runtime**.

The application was slower.

How could a parser become thirty percent faster while the application became
slower?

The parser benchmark had reused one parser. ast-grep created parsers for
thousands of files, then walked every completed tree to extract its outline.
The benchmark had measured only the middle of that journey.

The first arena reserved a huge virtual memory region every time a parser was
created. It did not immediately consume all that physical memory, which had
made the design look harmless. Across a repository, however, that reservation
happened thousands of times, and each one cost real work: a fresh round of
reserve-and-release syscalls, plus the page-fault and page-table churn behind
them, repeated for every file. That churn — not parsing — was the CPU
regression on the opencode corpus. I directed ChatGPT to replace the
reservation with an ordinary small allocation that grew only when needed.

That removed one problem and exposed another: memory. On the separate
TypeScript stress corpus, measured with one ast-grep worker throughout, the
arena's early growth strategy kept old blocks alive and pushed peak memory to
**1.04 GiB**. Getting from there to the final **91.2 MiB** took several rounds
of arena surgery — including one twist where the memory I kept telling ChatGPT
to reclaim turned out not to be the memory actually being wasted.
[Part 4](tree-sitter-end-to-end.md) has the traces and the culprit; I will not
spoil the reveal here.

The completed tree had one more surprise. Compact indexes helped while building
it, but ast-grep had to look them up while reading it. Some parser time had
simply moved into tree traversal. ChatGPT changed the tree reader to look up
each group of children once instead of repeatedly, recovering that cost.

Those repairs — ordinary allocation instead of a per-parser virtual-memory
ceremony, and a tree reader that resolves each group of children once — closed
the regression, and together with a later round of parser-side tuning they
became the numbers at the top of this post: the outline run finishing with
**22.2% less user CPU** than the C build. The end-to-end failure did not
invalidate the parser work. It invalidated the old meaning of “worked.” From
then on, a performance result needed to cover parsing, memory, reading the
tree, and the complete application lifecycle.

There was no single magic patch behind these results. Some changes saved parser
time, some prevented a memory disaster, and others recovered time while reading
the completed tree. This overview keeps the principles that connect the
individual experiments; the detailed posts take them apart.

## Lessons from the AI-Assisted Rewrite

At the beginning, AI increased the amount of code a single instruction could
set in motion. That was enough to make the rewrite possible and nowhere near
enough to make it good.

The early loop looked like this:

```text
/goal improve the perf by 20%
        -> a great deal of plausible code
        -> a confusing benchmark
        -> another plausible patch
```

Later it looked like this:

```text
find the expensive work
        -> explain why it happens
        -> change one mechanism
        -> compare with the previous Rust revision
        -> test the complete application
        -> retain, revise, or reject
```

ChatGPT did not gradually become infallible. I gradually learned enough
about the runtime to give it narrower problems, challenge bundled assumptions,
and demand evidence at the correct boundary. The segfaulting early speedup, the
arena's memory explosion, and the slower application all arrived behind
reasonable-looking code and encouraging local results. Profiles and tests had
to catch what both of us missed.

By the end, the collaboration had found its proper division of labor. ChatGPT
could explore implementation space at a pace I could never match by hand. My
job was to keep narrowing the question until profiles, invariants, and
end-to-end controls could answer it. Speed made the expedition possible;
evidence decided which parts returned.

That is the whole adventure. The remaining posts slow it down:

1. [Rewriting Tree-sitter's C Core in Rust: Migration and Compatibility](tree-sitter-rust-migration.md)
   covers the migration itself, the `/goal` run and its revert, what this
   branch deleted, and how the compatibility boundary survived.
2. [Improving Tree-sitter's GLR Algorithm and Memory Layout](tree-sitter-glr-arena.md)
   explains why the parser built a graph for an almost-always-linear workload,
   then follows the many decisions hidden inside “use an arena.”
3. [Optimizing Tree-sitter for End-to-End ast-grep Performance](tree-sitter-end-to-end.md)
   contains the memory traces, the traversal investigation, the benchmark
   rules — and a further round of parser-side optimization (lookup indexes,
   single-action dispatch) driven by the application profile.

The short version is that AI gave me the chance to move a load-bearing wall.
The rest of the project was discovering, one benchmark at a time, everything
else that wall had been holding up.
