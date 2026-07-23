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
      content: I Asked ChatGPT to Rewrite Tree-sitter in Rust. Then Things Got Weird.
  - - meta
    - property: og:url
      content: https://astgrep.com/blog/tree-sitter-rust-rewrite
  - - meta
    - property: og:description
      content: The complete adventure of using AI to rewrite Tree-sitter's C core in Rust, simplify it, optimize it, and discover that a faster parser could still make ast-grep slower.
---

# I Asked ChatGPT to Rewrite Tree-sitter in Rust. Then Things Got Weird.

*Part 1 of 4 — the complete adventure*

ast-grep rewrote Tree-sitter in Rust. The current core is faster at parsing,
faster at reading the completed tree, and faster in ast-grep itself.

![Current Rust-versus-C parsing, traversal, ast-grep, and RSS results](/image/blog/00-current-scoreboard.svg)

Rust won every parser and traversal fixture, and ast-grep produced exactly the
same outline. Memory is the tradeoff: the Rust build uses about 8 MiB more in
the ast-grep run. On the much larger TypeScript stress corpus, it peaks at
**91.2 MiB**.

That is the ending. Getting there was another matter.

Every serious ast-grep performance investigation eventually arrived at the
same place: Tree-sitter.

ast-grep could make its rules faster. It could prune work, cache configuration,
and avoid visiting irrelevant syntax. But every file still had to become a
syntax tree first, and Tree-sitter built that tree. The parser was both the
foundation and, increasingly, the ceiling.

I had dreamed about rewriting or deeply optimizing it for years. The dream
usually lasted until I opened the runtime. There was a mature C implementation,
binary compatibility with generated languages, external scanners, error
recovery, incremental parsing, ambiguous grammars, reference-counted trees,
several language bindings, and a small matter of not breaking the enormous
grammar ecosystem built on top of all of it.

For one person, this was not a weekend project. It was a Herculean task wearing
a header file.

So nothing happened.

Then the stories started appearing. Bun described its AI-assisted
[Zig-to-Rust migration](https://bun.com/blog/bun-in-rust), while
[pgrust](https://github.com/malisper/pgrust) explored an AI-assisted PostgreSQL
rewrite and Roc documented a
[Rust-to-Zig migration](https://rtfeldman.com/rust-to-zig). None proved that
rewriting Tree-sitter was wise. They showed that such experiments had become
cheap enough for one person to attempt.

AI did not make the runtime smaller, and it certainly did not make parser
theory less strange. It gave me enough leverage to ask the unreasonable
question and get an answer before the decade ended.

So I instructed ChatGPT to rewrite Tree-sitter's C core in Rust.

The first rule was conservative: change the language, not the behavior.
ChatGPT translated one part at a time, checking each step against the existing
tests and real grammars. The public interface stayed compatible, and the first
Rust version followed the C code closely enough to compare when something
broke. Translate first. Redesign later.

The rewrite was only the beginning. As soon as the Rust core passed those
tests, I gave ChatGPT another instruction: `/goal improve the perf by 20%`.
It returned a version that the benchmarks said was roughly twenty percent
faster. For one brief moment, this looked absurdly easy.

Then I tried to understand the code. I could not. The mechanical C-to-Rust port
had accumulated layers of overlapping optimizations, and soon the parser began
segfaulting. I now had a speedup I could neither explain nor trust. So the
mission changed: stop optimizing, delete the features this AI-first runtime did
not need, and rewrite the remaining C-style Rust into code I could reason about.

Only after that cleanup did I return to performance. Profiles and academic
parser research led to two major changes: keep the common parser stack linear,
and allocate syntax nodes from shared blocks of memory. That produced real
parser gains—and then ast-grep became slower. The investigation had to expand
beyond the parser benchmark into memory, tree traversal, and the complete
application lifecycle. The parser, it turned out, was only the first half of
the adventure.

The three posts after this one contain the layouts, algorithms, profiles, and
failed candidates. This post is the entire adventure for everyone who quite
reasonably does not want to spend an evening tracing parser memory by hand.

![The rewrite adventure from translation to end-to-end validation](/image/blog/00-adventure-map.svg)

## First, what kind of machine was I rewriting?

Tree-sitter takes source code and produces a syntax tree. A lexer turns
characters into tokens such as `identifier`, `+`, and `number`. The parser then
uses a generated table and a stack to decide what each token means.

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

That is enough parser theory for the overview. The first technical deep dive
builds the complete model from a tiny expression and follows it into GLR.

## The first rewrite: make C behavior appear in Rust

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

I instructed ChatGPT/Codex to translate the runtime one part at a time: basic
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

The new core preserved the C ABI, generated parsers, external scanners, public
tree behavior, and bindings. The first Rust implementation also preserved a
great deal of the C implementation's shape. That was intentional: when parity
failed, similar control flow made the difference findable.

The C core had become Rust. It compiled. It passed the tests. Existing grammars
could use it. This was already the kind of result that had looked impossible
when the project was sitting on the shelf.

Naturally, I immediately asked for more.

## Then I typed `/goal improve the perf by 20%`

The target was vibe coding in its purest form. The method was more deliberate.
I directed ChatGPT to use proper profiling tools, understand the runtime's data
layouts and ownership, and look for algorithmic changes instead of merely
polishing individual instructions. The agent traced those paths, proposed
implementations, and produced patches across the stack, subtree storage, and
parser loop. I chose the major directions; the agent explored and implemented
them. But the code arrived faster than I could build a mental model of
everything it was changing.

The performance measurements at the time said it had worked. They crossed the
requested line: roughly twenty percent.

This should have been the triumphant ending.

Instead, I opened the code.

The parser was now a layer of AI-generated optimization over a mechanical
C-to-Rust translation. The individual changes looked plausible. Together they
were unreadable. I could not explain which ownership rule made a pointer valid,
which fast path preserved GLR behavior, or which benchmark result belonged to
which overlapping experiment. The number said “faster.” The code said nothing
I could safely repeat.

Then the worst thing happened: segfaults.

Not a friendly Rust panic with a useful stack trace. Not a failed assertion
pointing at an invariant. The process simply left. Somewhere inside a parser
full of shared subtrees, compatibility boundaries, stack links, and optimized
unsafe code, an address had become fiction.

What was I supposed to debug? I could not explain what the code was doing, let
alone why it had decided to leave the process.

A parser that is twenty percent faster and occasionally disappears is not an
optimization. It is a benchmark with a jump scare.

The performance number had arrived before understanding. That reversed the
project. I stopped asking ChatGPT to make the pile faster and started asking it
to make the system explainable.

## The second rewrite: delete, then make the remainder readable

The cleanup had two parts:

1. delete features and representations outside the target product;
2. turn the retained C-style Rust into code whose ownership and control flow
   could be reasoned about locally.

Neither step promised a heroic benchmark. Both were prerequisites for trusting
the next one.

### Delete the lifecycle this runtime does not serve

At first, “rewrite Tree-sitter” implied preserving every feature. Then the
target workload forced a better question: preserving it for whom?

Upstream Tree-sitter is famously useful inside editors. A human inserts one
character, deletes two more, and expects highlighting to update before the next
frame. Incremental parsing lets the runtime reuse the old tree and rebuild only
the affected region. In that world, reparsing the complete file after every
keystroke is needless work.

That was not the world of this branch.

ast-grep and the AI coding-agent tools I cared about operate on complete file
snapshots. An agent reads a file, analyzes or rewrites it, and asks the tool to
process the new snapshot. There is no editor-owned syntax tree advancing one
keystroke at a time. A fresh parse is not a degraded fallback; it is the normal
operation.

Once those workloads sat next to each other, the boundary became clear:

- **Complete snapshots, not keystrokes.** Fresh parsing would be the intended
  path, so editor-specific old-tree reuse did not belong in every core parser
  structure.
- **Native tools set the performance target.** The browser WebAssembly build
  remained, but native loading of Wasm-compiled language grammars was removed;
  neither defined this optimization workload.
- **Keep the public contract stable.** Existing callers could retain the same
  API even when this implementation stopped using an old tree during parsing.

So I decided to remove incremental old-tree reuse and instructed ChatGPT to do
it. The public parameter remains for compatibility, but this runtime parses
fresh. The machinery for finding and reusing pieces of the old tree disappeared
from the hot implementation.

This is not a proposal that upstream Tree-sitter should abandon incremental
parsing. It is a product decision for a narrower runtime aimed at file-at-a-time
analysis and agent tooling. If this branch returns to interactive editor use,
the decision must be reopened. That was the rule: delete only behind a declared
boundary, never because a feature happened to be inconvenient.

Deletion turned out to be the first real optimization technique: remove work
whose use case has already left the building.

### Rewrite the retained C-style Rust for humans

A line-by-line translation is only readable if the reader already knows the
original line by line. I instructed ChatGPT to break the monolithic,
pointer-heavy port into more idiomatic internal Rust—without making the
ABI-facing types “idiomatic” in ways that would break existing grammars.

The cleanup followed another small set of rules:

- **Make ownership visible.** Internal raw-pointer parameters became references
  or slices where their lifetimes were local and provable.
- **Represent absence explicitly.** Sentinel pointers and magic states became
  `Option` or named states.
- **Return values normally.** Out-parameters became return values when the C ABI
  did not require them.
- **Localize mutation.** Large modules split by responsibility, and changes to
  state moved closer to the code responsible for that state.
- **Hide density behind readable operations.** Frequently copied tree
  references stayed compact, but pointer arithmetic and ownership rules
  acquired narrow APIs and names.
- **Keep compatibility ugly where it is real.** Generated-language layouts and
  exported functions remained C-shaped because another binary had already
  committed to that shape.

That cleanup made questions answerable: Who owns this piece of the tree? Can
this reference survive when its storage grows? Why does one reduction create a
temporary parser state only to delete it immediately?

The important output was not prettier syntax. It was a runtime organized well
enough that a segfault, invariant failure, or suspicious allocation had an
address in the architecture. Only then could performance work become more than
high-speed archaeology.

## The actual performance work: make the common case simple

Once I could understand the runtime, I directed ChatGPT back toward
**reduction**, the operation the parser performs constantly. A reduction takes
a few pieces of syntax the parser has already recognized and combines them into
one larger piece. For example, `a`, `+`, and `b` become an addition expression.

That small operation touches both major data structures. It removes the
children from the parser's working stack, then stores them under a new parent in
the syntax tree. The profile showed that Tree-sitter was doing much more work
around those children than the ordinary case required.

The successful changes eventually fell into four simple principles:

- **Avoid work for uncommon cases.** About 99% of the observed parser stack was
  one straight path, so the parser no longer builds a graph until the input
  actually forks. Work needed mainly for editing is also kept out of a fresh
  parse when possible.
- **Make allocation cheap, and references small.** Asking the general-purpose
  allocator for every internal syntax node is expensive. An arena obtains a
  growing block and serves many nodes from it. Separately, compact references
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
Pro to review academic work on generalized parsers, and the result pointed to
an older lesson: do not build the general structure until the input actually
needs it. The arena was a separate idea and required its own experiments. The
linear stack avoided graph bookkeeping; the arena reduced calls to the general
allocator. Making references smaller was yet another layout choice, and it did
not become faster automatically. Several versions lost before the pieces paid
for themselves.

The exact representations and failed alternatives belong in the later posts.
The important result here is simpler: ordinary parsing stopped paying the full
price of rare ambiguity and separate allocation for every internal syntax node.

For a moment, the parser benchmarks looked excellent.

Then I asked ChatGPT to build ast-grep against it.

## The parser got faster. ast-grep got slower.

The agent ran that binary across opencode, a real TypeScript repository. At
that historical checkpoint, the parser-only benchmark put this Rust
implementation roughly **30% ahead of the C runtime**.

The application was slower.

How could a parser become thirty percent faster while the application became
slower?

The parser benchmark had reused one parser. ast-grep created parsers for
thousands of files, then walked every completed tree to extract its outline.
The benchmark had measured only the middle of that journey.

The first arena reserved a huge virtual memory region every time a parser was
created. It did not immediately consume all that physical memory, which had made
the design look harmless. Across a repository, however, reserve and release
happened thousands of times. I directed ChatGPT to replace it with an ordinary
small allocation that grew only when needed.

The CPU failure appeared on opencode. The memory sequence below used a separate
TypeScript stress corpus with one ast-grep worker, held constant from the first
1.04 GiB result through the final 91.2 MiB result.

That removed one problem and exposed another. Old arena blocks remained alive
when the storage grew, pushing a serial run to **1.04 GiB** of memory. ChatGPT
changed the internal references so the arena could move as it grew and the old
blocks could be released. The peak fell to about **492 MiB**.

Still far too much.

The obvious suspect was dead syntax nodes. I directed ChatGPT through two
attempts to reclaim them; neither changed the result. Only after I asked the
agent to count memory by purpose did the real answer appear: **468.2 MB**
belonged to temporary child buffers, not the tree nodes I had told it to
reclaim. The agent reused those buffers and brought the peak down to
**91.2 MiB**.

The completed tree had one more surprise. Compact indexes helped while building
it, but ast-grep had to look them up while reading it. Some parser time had
simply moved into tree traversal. ChatGPT changed the tree reader to look up
each group of children once instead of repeatedly, recovering that cost.

The end-to-end failure did not invalidate the parser work. It invalidated the
old meaning of “worked.” From then on, a performance result needed to cover
parsing, memory, reading the tree, and the complete application lifecycle.

There was no single magic patch behind these results. Some changes saved parser
time, some prevented a memory disaster, and others recovered time while reading
the completed tree. The detailed posts and performance ledger separate the
individual experiments; this overview keeps the principles that connect them.

## The real change was how I worked with AI

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

ChatGPT/Codex did not gradually become infallible. I gradually learned enough
about the runtime to give it narrower problems, challenge bundled assumptions,
and demand evidence at the correct boundary. The segfaulting early speedup, the
arena's memory explosion, and the slower application all arrived behind
reasonable-looking code and encouraging local results. Profiles and tests had
to be less impressionable than either participant.

By the end, the collaboration had found its proper division of labor. ChatGPT
could explore implementation space at a pace I could never match by hand. My
job was to keep narrowing the question until profiles, invariants, and
end-to-end controls could answer it. Speed made the expedition possible;
evidence decided which parts returned.

That is the whole adventure. The remaining posts slow it down:

1. [The C-to-Rust migration, feature scope, and readability rewrite](tree-sitter-rust-migration.md)
   explains LR/GLR carefully, decides what this branch retains, and shows how
   the compatibility boundary survived.
2. [The simplification and performance campaign](tree-sitter-glr-arena.md)
   explains why the parser built a graph for an almost-always-linear workload,
   then follows the many decisions hidden inside “use an arena.”
3. [The ast-grep reality check](tree-sitter-end-to-end.md) contains
   the memory traces, traversal investigation, benchmark rules, and final
   performance lessons.

The short version is that AI gave me a chance to move the load-bearing wall.
The rest of the project was discovering, one benchmark at a time, which roof
beam had come with it.
