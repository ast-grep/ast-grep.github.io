---
author:
  - name: Herrington Darkholme
date: 2026-07-20
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Improving Tree-sitter's GLR Algorithm and Memory Layout
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/tree-sitter-glr-arena
  - - meta
    - property: og:description
      content: How profiling Tree-sitter's GLR stack led to lazy graph materialization, compact arena-backed syntax nodes, and a long series of failed performance experiments.
---

# Improving Tree-sitter's GLR Algorithm and Memory Layout

*Part 3 of 4 — simplification and performance*

If you are arriving here directly: Tree-sitter is the parsing library that
turns source code into syntax trees, and this series follows a rewrite of its
C runtime in Rust for ast-grep, the code-search tool this parser serves. The
working arrangement throughout is that I direct and ChatGPT implements,
occasionally in long autonomous runs launched with a `/goal` prompt.

[The previous post](tree-sitter-rust-migration.md) ended with a Rust runtime I
could finally reason about. That made it safe to return to performance, but not
to repeat `/goal improve the perf by 20%`. This time I asked ChatGPT to trace
one expensive operation at a time and show which allocation, ownership
transfer, or traversal could disappear.

I began with reduction: the moment when the parser replaces several recognized
pieces of syntax with their parent. Reduction sits at the boundary between two
structures that both contain things called “nodes.” On one side is the
temporary **GLR stack graph**, which remembers possible parse histories. On the
other is the **syntax tree** being built for the caller. Following one reduction
through both structures gave the rest of the investigation a path.

The stack produced the clearest discovery of the project: a generalized graph
structure that spends almost its entire life as a straight line. Syntax
storage was less obedient. The tidy instruction “use an arena” unraveled into
several separate design decisions, and most of their first drafts failed.

This post follows the parser-side investigation: why a graph was built for a
line, why delaying it worked, and what the failed experiments taught that the
successful ones could not. As [the overview](tree-sitter-rust-rewrite.md)
previewed, the parser victory at the end of this post does not survive contact
with the application; the final post follows that reversal.

## One reduction connects the stack graph to the syntax tree

[The previous post explained LR and GLR in
detail](tree-sitter-rust-migration.md#appendix-how-lr-and-glr-work). The
compact recap: an LR parser selects shift, reduce, or accept from
`(parse state, lookahead)` and advances one stack. **GLR**—Generalized
LR—exists because real grammars sometimes leave several actions valid at once;
instead of guessing, the parser carries every candidate parse forward until
more input settles the question, and all of those candidates share one
graph-structured stack.

Tree-sitter calls each of those candidates a **version**. Each version has a
`StackHead`, but copying a version does not copy its complete history. The heads
point into a shared graph of `StackNode`s instead.

Each `StackNode` records a parse state and input position. A backward
`StackLink` identifies a predecessor and carries the `Subtree` recognized on
that transition—either a token leaf or a reduction-created internal subtree.
This makes one distinction essential:

- the **stack graph** remembers possible parser histories;
- the **subtree graph** contains the syntax those histories have built.

The generated parse table drives both. A **shift** recognizes one token and
pushes its leaf subtree. A **reduce** walks backward over one or more links,
collects their subtrees as children, builds an internal subtree, and pushes it
in the corresponding goto state. If several actions or pop paths are valid, the
runtime retains several versions. Compatible versions can merge when they
permit the same continuation: the same state and position, the same error cost
(a running measure of how much error recovery a version has needed), and the
same external-scanner state (an external scanner is a grammar's hand-written
lexer extension for context-sensitive tokens). Their incoming links preserve
the distinct histories.

![Tree-sitter shifts, branches into versions, reduces backward through links, and merges compatible histories](/image/blog/02-glr-stack-actions.svg)

Rejected versions are not merely removed from a list. Releasing their heads can
release an entire private stack history and the speculative subtrees stored on
its links. Shared history survives because another head or link still owns it.

Now follow one concrete reduction: a stack version whose parse table says to
reduce two children. Its `StackHead` points to the current `StackNode`, and the
links below that node contain the recent syntax, leading toward older parser
states.

![A reduction replacing two stack children with one parent](/image/blog/02-reduction-pop.svg)

The diagram shows the logical stack from older to newer; in memory, Tree-sitter
stores the links in the opposite direction so a reduction can walk backward
from the current top. Tree-sitter starts a **DFS pop cursor** at the version's
current node. The cursor holds the current stack node, the accumulated child
**handles**—a handle is a compact value, an index or other stand-in for a
pointer, that names a subtree without being its address—and the remaining
grammar-child count. It follows two links backward, collects the subtrees
carried by those links, and stops at the predecessor state underneath them.

If a node has several backward links, the history has forked. Tree-sitter copies
the cursor and follows every route. Each completed route produces its own
temporary stack version. The parser builds a parent from that route's children,
looks up what state should follow that new parent, and pushes it. Compatible
versions can then merge again.

Because competing versions can share the same speculative syntax, subtrees are
reference-counted: each owner registers its interest, and a subtree is freed
only when its last owner lets go. The pop path retained every collected child
before releasing the old stack links, so each child survived the ownership
transfer into its new parent.
On a single linear path, those reference-count operations were a compensating
increment and decrement; on a branching pop, they were required for correctness.

This is why the generalized machinery exists. If histories really fork, the
DFS cursor must explore them, their results must continue as separate versions,
shared syntax must stay alive, and compatible versions may later merge. Every
part has a job. The allocation question was whether every part needed to appear
before a fork existed.

## The allocation profile found a graph waiting for a fork

Rather than asking for speed again, I asked ChatGPT for an audit: distribute
the parser's allocation costs by mechanism. The instrumented Rust runtime
parsed the seven-language performance corpus—40 checked-in source files,
called **fixtures**, across C++, Go, Java, JavaScript, Python, Rust, and
TypeScript, the suite behind
[the previous post's](tree-sitter-rust-migration.md) Rust-versus-C parity
checks—with one
validation parse and one measured parse per file. The counters covered both
passes; percentages and means describe the same complete corpus. The audit
pointed first at the GLR stack:

| Observation | Result |
| --- | ---: |
| Logical stack nodes created | 1,139,623 |
| Released nodes with one predecessor | 98.898% |
| Mean predecessor-link count | 1.011 |
| Unused inline link-slot writes | about 127.4 MB |

Now the numbers had a mechanism behind them. A node with one predecessor offers
one route backward. **98.898%** of released nodes had exactly that shape, and
the mean was only **1.011** links per node. These were shape counters, not a
claim that 98.898% of CPU time was deterministic. They showed that, within the
measured released-node population, the generalized representation was
overwhelmingly carrying linear history.

That meant the ordinary reduction still paid for the entire generalized
journey:

- the DFS cursor was created but never copied;
- retaining the children and later releasing their old links produced a `+1`
  followed by `-1`;
- one temporary version was created, moved back into the original version's
  array slot, and removed;
- the parser checked for another version to merge with, but none existed; and
- the parent was pushed through a 160-byte graph node with room for eight
  histories, while using one (the appendix shows this record's exact layout).

The **127.4 MB** of unused link-slot writes—cumulative write traffic across
both corpus passes, not memory held at any one moment—was the physical
receipt: records prepared room for alternate histories that never arrived.
Tree-sitter was carrying mountaineering equipment through an airport because
there might eventually be a hill.

The machinery was correct. It was simply arriving before ambiguity or recovery
needed it. Once that connection was visible, the 160-byte stack node stopped
looking like a respectable data structure and started looking like evidence.

The audit also changed how I directed ChatGPT. Earlier prompts had asked for
performance and received plausible local optimizations. Now I could name the
work to remove: the unbranched search, the canceling ownership operations, the
temporary version, the empty merge check, and the mostly unused graph record.

I asked ChatGPT to shrink each graph record, attach a cheaper linear tail,
specialize the reduction path, and reuse the search's temporary storage. Each
made some part of the journey cheaper while keeping the journey. The benchmark
remained unimpressed: the best of the four moved the forty-fixture gate by
less than a point—and even that shrank from +1.09% to +0.58% on the longer
confirmation run—while every variant regressed at least one language,
sometimes by double digits. The naive linear tail was the worst offender,
losing 23–43% per language. The ledger's verdict on the whole category:
making one branch cheaper rarely moves total parse time.

That changed the question from “How cheaply can the common case use the graph?”
to “Why should the graph exist before the parse branches?”

## The literature offered a principle, not a patch

At this point I sent ChatGPT to the library: survey the GLR research and report
what still applied. Most of the ideas
were less new than expected. The messy `/goal improve the perf by 20%` phase had
already tried rough versions of many of them. Others required changing grammars,
generators, or generated parsers, which would break the rule that existing
Tree-sitter languages must continue to work unchanged.

The review was still useful because it removed dead ends. It gave names to old
experiments, separated runtime ideas from ecosystem-wide redesigns, and left
one principle that fit both the profile and the product boundary.

The useful principle I took from
[Elkhound](https://people.eecs.berkeley.edu/~necula/Papers/elkhound_cc04.pdf)
was **lazy structure**: use the cheapest representation that matches the
parser's current reality. Build the generalized representation only when
ambiguity makes it necessary, then return to cheap execution when the ambiguity
ends.

This was different from putting a fast branch inside the old GLR operation. A
fast branch still allocates the graph object and enters its ownership machinery.
Lazy structure means that work never begins.

The literature supplied the principle; the profile supplied the reason to trust
it. Nearly 99% of the measured stack nodes had only one way backward. The common
case was not a simpler graph. It was not a graph yet.

## The deterministic window: delay the graph

The design that came out of those conversations keeps recent, unambiguous
parser progress in a compact linear list. I called that list the
**deterministic window**. The complete GLR graph still existed underneath it,
ready for the cases that genuinely needed branching.

![A linear deterministic window becoming the full GLR graph](/image/blog/02-deterministic-window.svg)

While there is only one active version to advance:

- a shift appends one compact window entry;
- an eligible reduction moves the top `k` subtree handles into their parent and
  replaces that suffix with one goto-state entry; and
- no `StackNode`, DFS pop cursor, temporary `StackHead` version, or merge probe
  is created.

The compact record happened to be one quarter the size of the eager graph node,
but size was not the main idea. The important saving was the lifecycle that
never happened: no graph allocation, no temporary version, and no compensating
retain/release pair.

When a multi-action cell, recovery, acceptance, stack-version mutation, or
graph traversal appears, the parser **materializes** the window: it expands the
list into the **same graph it would previously have built eagerly** and
continues through the existing GLR implementation. Syntax-tree construction
does not change. Parsing rules do not change. Only the time at which the
parser pays for its generalized history changes.

That distinction made the design tractable. This was not a second parser with
similar behavior. It was the old parser with delayed representation.

## The safety rules were deliberately boring

The first version followed three conservative rules:

1. Stay linear only while there is exactly one active, non-error stack version.
2. Before a multi-action cell, acceptance, recovery step, stack-pop traversal
   beyond the window, version mutation, or diagnostic logger, build the complete
   graph and use the existing code.
3. When ambiguity disappears, begin another empty linear window instead of
   trying to compress the old graph retroactively.

Anything not explicitly proven safe took the old path. That left some possible
speed on the table, but produced a much better failure mode: an unsupported case
became ordinary GLR execution, not a new kind of wrong parse.

It also avoided a tuning heuristic. Mostly deterministic languages keep long,
cheap windows. Conflict-heavy languages create short ones and naturally behave
more like the old parser. No guessed threshold decides whether a grammar is
“worth optimizing.”

Finally, delayed work must remain exactly equivalent to eager work. Debug builds
checked that expanding a window reproduced the same parser state and saved
path metrics—position, error cost, node count, and dynamic precedence—and that
subtree ownership moved once at each boundary. Those checks are debug-build
machinery; the governing principle is simpler: **postpone the representation,
never the correctness.**

## The deterministic window improved parsing by about nine percent

I asked ChatGPT to run a paired same-session A/B benchmark with window entry
enabled and disabled: seven languages, five repetitions, and a minimum sample
time of 200 ms per fixture, so short files were timed over many runs instead of
one noisy one. That pairing discipline governs every number in this post: each
candidate is measured against the immediately preceding Rust revision in the
same session, and must pass the correctness gates before it stays. The final
post spells out the [full benchmark rules](tree-sitter-end-to-end.md); this
summary is enough to read the tables here.

| Language | Throughput change |
| --- | ---: |
| C++ | +2.04% |
| Go | +2.54% |
| Java | +4.22% |
| JavaScript | +13.17% |
| Python | +11.99% |
| Rust | +14.38% |
| TypeScript | +15.72% |
| **Seven-language geometric mean** | **+9.01%** |

This was an implementation gate, not a universal nine-percent claim: some
fixture samples were noisier than the stricter variance limit later adopted
for published results. Still, every language improved, and the combined result
was well beyond the observed pair noise. The correctness, recovery, ownership,
and forced-materialization checks all ran again and held, so the
implementation stayed.

The result succeeded where the local shortcuts had failed because it removed
the generalized phase from the common path instead of making that phase a
little cheaper. A GLR parser may need a graph eventually; it does not need to
represent its entire life as one. The linear case deserves a linear physical
representation.

## Once the graph quieted down, syntax storage took the profile

The deterministic window removed most stack-graph allocation from the common
path. A new profile left syntax-node creation as the largest remaining source
of allocator traffic. Every reduction still created an internal syntax node,
and at this checkpoint each one owned an independent variable-sized allocation.
Storage—not parser control flow—became the next target.

The next instruction sounded beautifully precise:

> Put heap-backed subtrees in one contiguous arena and refer to them by index.

Several conversations later, that one tidy sentence turned out to be half a
dozen design decisions wearing a trench coat.

An arena says where allocations share storage and lifetime. It does not decide
whether references are pointers or indexes, whether records move, where
children live, how sharing is detected, or what happens when the tree is
returned to its caller. I had initially asked ChatGPT for one answer. Useful
progress began when I separated the decisions.

One methodological confession applies to this whole era, so it is stated here
once. The experiment history did not preserve a clean Rust pair for either
per-node allocation versus a direct-pointer arena or direct pointers versus
arena-relative indexes. I therefore cannot assign a standalone throughput gain
to “the arena” or “the index.” The arena amortized allocator calls and enabled
the later handle and ownership designs; those later changes were measured
individually, and only they carry honest percentages.

I can give away the design that survived before visiting the wreckage. One
growable allocation holds many syntax records. Compact four-byte tagged arena
offsets name them. An internal node keeps its child handles beside its own
record. Sharing is tracked differently while parsing than after the tree is
returned to its caller. The failed experiments below explain why every clause
of that design exists.

### “Use an arena” was not one design axis

For this runtime, the arena question separated into six decisions:

![The separable decisions hidden inside an arena design](/image/blog/02-arena-design-axes.svg)

- **Handle:** how the parser refers to a syntax node—hot in both size and
  lookup cost, because handles are copied through the parser stack and stored
  in every parent's child list.
- **Storage:** where the node's actual bytes live, anywhere from one heap
  allocation per node to one contiguous arena.
- **Record shape:** what exactly is stored for one node, since a token leaf
  and an internal parent need different information.
- **Children:** where a parent keeps its variable-length list of child
  handles, which affects both construction and later traversal.
- **Movement:** what is allowed to move—growing one allocation may move its
  base, and a design must say which movement its handles can survive.
- **Lifetime:** when memory can be reused—node by node the moment each dies,
  or in bulk when a larger region is reclaimed.

The experiment sections below introduce the candidate designs for each axis as
they become relevant.

These decisions are separable but coupled. Handle form constrains movement;
child placement affects locality and reclamation. The experiments therefore
varied one primary decision at a time while minimizing the collateral
representation changes. The handle came first, because a growable contiguous
allocation is useful only if its references survive growth.

The original C runtime had already made one coherent set of choices. Its
eight-byte `Subtree` either contained a compact leaf directly or held a stable
pointer to one heap allocation. Full leaves used a small reuse pool; each
internal parent owned one allocation containing its child handles immediately
before a general heap header. Atomic reference counts reclaimed those
allocations individually and also guarded copy-on-write mutation. Because
addresses never moved after construction, direct pointers remained valid for
the node's lifetime.

### Indexes enabled movement; they did not create throughput

The conservative candidate kept the existing eight-byte handle. That value
either contained a small token leaf directly or pointed to a larger record.
Small leaves remained unchanged; only the pointer to a larger record became a
byte offset from the start of the arena:

```text
heap_address = arena_base + index
```

This allowed the allocator to move the complete arena block while growing it
without invalidating references. It did not make record access faster. A
pointer already held the final address; an index required adding the arena's
current base address first.

As the confession above records, no clean index-versus-pointer throughput
delta exists, and the available measurements provided no evidence that the
index improved throughput. I retained it as relocation infrastructure, not as
a speedup.

That conclusion mattered because the upper 32 bits of the handle looked
available, and the temptation was hard to resist: pack frequently read
metadata there—symbol, child count, and flags—so reduction might avoid
resolving the arena record. ChatGPT built it, and I ran two quick screening
benchmarks against the immediately preceding Rust revision, using the nine
reduction-heavy Go and Java fixtures. The packed version lost every fixture:
**-2.31%** and **-2.76%**, averaging **-2.54%**. I rejected it before the full
forty-fixture gate.

The packed handle duplicated truth without removing the second memory lookup.
Internal nodes still needed padding, size, error cost, precedence, descendant
counts, scanner flags, repeat depth, and children from their records. The new
path added masks, coherence work, and register pressure. Thirty-two empty bits
were available. Thirty-two free bits were not.

The narrower follow-up worked. While a reduction combined its children's
metadata, the runtime looked up each record once and kept a temporary local
view. The stored record remained the single source of truth. That improved
the forty-fixture geometric mean by **2.04%** over the preceding index-only
Rust implementation. With repeated resolution out of the hot loop, the next
question was how much handle data the parser needed to move in the first place.

### Four-byte handles changed the amount of data moved

The denser candidate made every `Subtree` a four-byte tagged,
arena-relative byte offset:

```text
0                              null
(byte offset | 1)              compact 8-byte leaf record
nonzero even byte offset       full leaf or internal record

record address = arena base + (handle & !1)
```

The tag does not describe the child's grammar type. It distinguishes two
physical record layouts. A compact leaf is an eight-byte packed record; full
leaves and internal nodes begin with the larger common heap header. An accessor
must know which layout it is reading before it interprets those bytes.

The runtime could load a tag from the arena record instead. That would add a
dependent memory read to hot operations such as reading a symbol or size: first
resolve and inspect the record, then choose the layout and read the requested
field. The handle already has a free low bit because every record offset is
aligned, so carrying the layout answer there avoids that preliminary load.
Full leaves and internal nodes share the common header and are distinguished
after it is resolved.

Compact leaves still existed, but their eight-byte payload moved from the
handle into the arena. The parser paid an extra lookup when reading one. In
exchange, every stack payload and child array moved four bytes per subtree
instead of eight.

Internal children remained coallocated with their parent:

```text
[u32 child handles][alignment padding][internal header]
```

The **internal header** is the fixed-size record for the parent syntax node. It
stores facts such as the parent's symbol, size, flags, child count, and summary
metadata. The child list is variable-sized, so it sits immediately before that
header.

**Coallocated** means the arena reserves both parts as one block: the child
handles first, followed by the parent's header. The children are still separate
syntax nodes; only their handles are stored beside the parent metadata. One
allocation cursor advance therefore creates the complete parent record, and
later code can reach its children without following a pointer to another
allocation.

The reduction path could still move its finished child buffer directly into
the parent's final storage. Against the preceding eight-byte indexed-handle
implementation, the paired benchmark measured **+1.88%** across the
forty-fixture geometric mean.
Six languages improved; TypeScript's -0.23% remained within ordinary run-to-run
variation. The four-byte handle stayed.

The tag does not halve the addressable arena. Record alignment already makes
every valid byte offset even, so the low bit carries the record-kind tag without
discarding an otherwise usable offset bit. The handle therefore covers almost
the complete 4 GiB `u32` byte-offset domain. A wider offset would not improve
locality, throughput, or **resident set size (RSS)**, the process's resident
pages. A wider offset can be revisited on the day a real input reaches the
limit; until then, the small handle is a feature, not a frugality to apologize
for. The handle width was settled; the location of the handles inside each
parent was not.

### The children rejected a cleaner address

Keeping children beside their parent makes later reuse of individual blocks
awkward, so I asked ChatGPT to try one global child-index array. Each internal
record would store the beginning and end of its section in that array instead
of keeping children beside its header.

The first version unfairly copied temporary children into final ranges and
inflated peak RSS. The corrected version reserved exact final ranges for
deterministic reductions; only branching GLR reductions used temporary buffers.
Memory recovered. Throughput did not. The serious implementation regressed
**2.72%** across the forty-fixture geometric mean, with Go, Java, Rust, and C++
losing more than four percent each.

The common path had exchanged one local
`[children][padding][header]` construction for two storage reservations,
distant pages, and another address calculation during traversal. The cleaner
lifetime layout was a worse access layout. I rejected it and instructed
ChatGPT to restore coallocation. That settled where children lived. It did not
settle what the runtime should do when branches stopped owning them.

### Removing reference counts produced a magnificent wrong answer

The arena changed what a reference count could accomplish. When a count reached
zero, the record's bytes still could not be returned individually; the arena
reclaims storage as a whole. But the count had another job that remained
essential: it told Tree-sitter whether a syntax node had one owner and could be
modified in place. A shared node had to be copied first.

The first experiment preserved only that second job. ChatGPT replaced the count
with a sticky `shared` bit: once a node gained a second owner, it remained
marked as shared, and releasing an owner did nothing. Removing the count updates
appeared to improve parse throughput by **8.28%** across the forty-fixture
geometric mean. Then the timeout test failed.

The GLR stack had shared some nodes only temporarily while it explored
competing parses. After losing branches were discarded, the accepted tree could
be the sole owner again, but the sticky bit still remembered the earlier
sharing. That mattered because of a pass Tree-sitter runs at the finish line:
deeply repetitive syntax—statement after statement, item after item—parses
into lopsided, deeply nested subtrees, so before returning the tree,
Tree-sitter runs a **balancing pass** that restructures those runs into a
flatter shape. Balancing rewrites nodes in place, which is safe only for
nodes it uniquely owns; anything shared must be copied first. Too many nodes
looked shared, balancing skipped work it needed to perform, and the stress
case timed out. The impressive benchmark had measured a parser that was
avoiding required work.

ChatGPT then walked the accepted syntax graph and reconstructed which nodes were
actually shared before balancing. Correctness returned, but the version that
kept atomic sharing markers throughout parsing measured **-0.32%** against the
exact atomic-reference-count control. Removing the counts alone was not a safe
throughput win.

That failure exposed a better boundary. During parsing, the arena belongs to one
parser thread, so its nodes use cheap `Cell<bool>` sharing markers—a
non-thread-safe flag—and rejected branches do not trigger per-node release
cascades. Before balancing, the accepted-graph walk restores the exact sharing
information that mutation needs. After the tree is published and may cross
threads, each node switches to a relaxed `AtomicBool` copy-on-write marker—a
thread-safe flag—while one atomic owner count keeps the complete arena
allocation alive.

This phase-specific design improved parse throughput by **3.35%** against exact
atomic reference counting, with no meaningful change in peak RSS. It removed
thread-safe bookkeeping from the private parse phase without weakening the
uniqueness check. Individual dead records still occupied arena space until the
complete allocation was released, however. That left one final lifetime
question: should a collector recover those holes?

### Garbage collection arrived before there was garbage worth collecting

Four-byte tagged offsets made a moving collector possible in principle, and
curiosity won. ChatGPT implemented the simplest copying-collector experiment,
often called **semispace collection**: after a successful parse, copy the
accepted tree into fresh space, rewrite its indexes, and discard the old
parser-private arena.

All tests passed and both versions produced identical trees. The forty-fixture
geometric mean regressed **37.45%**, and peak RSS rose while the old and copied
trees coexisted. The benchmark deleted each tree before the next parse, so the
control could already **rewind** the complete arena: reset its allocation
cursor back to the start, freeing everything it held in one step. The
collector copied every live syntax occurrence and reclaimed nothing useful.

Negative 37.45% is not a subtle hint. It is a benchmark clearing its throat and
asking everyone to leave.

This did not prove that collection could never help a conflict-heavy or
long-lived workload. It proved that unconditional publication-time copying was
the wrong schedule. Copying every tree just as it was returned to the caller
needed evidence of actual dead-space pressure, not a theoretical invitation
from the index format.

### Where the arena landed

After all of those branches, the retained design was concrete:

- one allocation starts small, grows on demand, and holds many syntax records;
- every subtree is named by a four-byte tagged arena-relative offset;
- a parent's child handles stay beside the parent for locality;
- reduction looks up each child's metadata once instead of repeatedly;
- sharing uses parser-private `Cell<bool>` markers, then published
  `AtomicBool` markers; and
- no garbage collector runs on the fresh-parse path.

Here is the final comparison against the original C representation:

| Design decision | Original Tree-sitter | Retained arena design |
| --- | --- | --- |
| **Handle** | Eight-byte inline-leaf-or-pointer value | Four-byte tagged arena-relative byte offset |
| **Storage** | Compact leaves in the handle; one heap allocation per full leaf or internal parent, with a small pool for reusable leaf records | One growable arena allocation containing compact leaves, full leaves, and internal parents |
| **Record shape** | Compact leaf in the handle; one general heap header with variant storage for internal-node or full-leaf data | Eight-byte compact-leaf record; specialized internal and full-leaf records after a common heap header |
| **Children** | Eight-byte child handles immediately before the parent's header in the same allocation | Four-byte child handles immediately before the parent's header in the same arena block |
| **Movement** | A completed heap node has a stable address, so its direct pointers remain valid | The private arena may move while growing; relative offsets remain valid. A published arena no longer moves |
| **Lifetime** | Atomic per-node reference counts establish uniqueness and recursively free or pool unreachable records | Parser-private sharing markers, exact accepted-graph reconstruction, published copy-on-write markers, and one owner count for bulk arena lifetime; no collector |

There is still no honest single “arena speedup” to print beside that list—the
confession from the start of this era stands. The
evidence supports the individual choices, not an invented sum of their
percentages.

## What the experiments actually established

The final design was not the original arena idea with a few details polished.
It was what remained after profiles, failed layouts, correctness traps, and
paired controls removed the attractive mistakes. If I could hand one sentence
to someone starting the same fight, it would be this: profile for the work
that should not exist rather than the code that merely runs hot, and treat any
benchmark number that arrives without its paired control as a rumor. Everything
below survived that rule:

- deterministic execution stays linear until real ambiguity needs a graph;
- four-byte tagged arena offsets reduce bytes moved through stacks and child
  arrays;
- arena allocation amortizes allocator calls, without claiming a standalone
  arena or index throughput result;
- children remain beside their parent because locality beat cleaner global
  ranges;
- reduction resolves child metadata once into a short-lived local view;
- parser-private and published trees use different sharing mechanisms.

At the combined checkpoint, the parser-only gate put Rust roughly **30% ahead
of C**. Readers checking the arithmetic will notice that the paired gains
documented here—9.01%, 2.04%, 1.88%, and 3.35%—do not compound to thirty
percent; the rest of the distance from the migration's near-parity baseline
accumulated across the unpaired arena and index-era transitions covered by the
earlier confession. The application result went the other way. The final post
follows that contradiction through lifecycle, resident memory, traversal, and
the follow-up parser work revealed by the application profile:
[Optimizing Tree-sitter for End-to-End ast-grep Performance](tree-sitter-end-to-end.md).

For the complete project in one sitting, start with
[the adventure overview](tree-sitter-rust-rewrite.md).

---

*The story ends here. What follows is reference material: how Tree-sitter's GLR
machinery is actually implemented—record layouts, handle encoding, and the
lifecycle of a stack node. For the theory side, how LR and GLR work at all, see
[the previous post's appendix](tree-sitter-rust-migration.md#appendix-how-lr-and-glr-work).*

## Appendix: Tree-sitter's GLR implementation, end to end

The main narrative explains why these objects mattered to the optimization.
This appendix follows what the runtime actually does with them.

There are two points in time to keep separate. The eager GLR path below is the
machinery I asked ChatGPT to profile before adding the deterministic window. At
that checkpoint, `Subtree` was an eight-byte inline-leaf-or-pointer value. The
later arena changed syntax handles into four-byte tagged offsets, and the window
delayed creation of many stack nodes. Neither change removed the generalized
path. When ambiguity or recovery needs a graph, the current runtime still
materializes and enters this same machinery.

### The object model: heads, nodes, links, and syntax

The full **graph-structured stack**—the shared graph used by GLR—has four
layers:

```text
Stack
  -> StackHead for each parse version
       -> current StackNode
            -> StackLink { predecessor StackNode, Subtree }
```

The names are dangerously similar, so here is the precise distinction:

| Object | What it represents | What it owns |
| --- | --- | --- |
| `Stack` | The complete GLR execution state | All version heads, pop scratch space, a small node pool, and now the deterministic window |
| `StackHead` | One active, paused, or halted parse possibility | Its current node and version-specific recovery and external-scanner state |
| `StackNode` | One parser configuration: state, input position, and accumulated path measurements | Up to eight predecessor links |
| `StackLink` | One way of arriving at the current configuration | A predecessor-node reference and the syntax subtree recognized on that step |
| `Subtree` | Recognized syntax: either a token leaf or a reduction-created parent | Its syntax metadata and, for a parent, references to its children |

![The physical relationship among a stack head, stack node, stack link, and subtree](/image/blog/02-gss-runtime-layout.svg)

The conceptual side—why stack nodes and subtrees are different kinds of node,
and why versions fork and merge—is built up in
[the previous post's appendix](tree-sitter-rust-migration.md#appendix-how-lr-and-glr-work).
The implementation consequence matters most here: syntax lives on the
**link**, not in the stack node, and links are stored backward
(`current StackNode -- StackLink{subtree} --> predecessor StackNode`). Backward
links make a reduction natural—begin at the current head, walk toward older
states, and collect syntax from the links along the way—and they allow
sharing: two histories that reach the same state and input position can be
kept as two links on one current node, sharing the configuration that has the
same future without erasing either past.

### What a materialized stack node costs

At the measured checkpoint, a `StackNode` occupied 160 bytes:

```text
StackNode — 160 bytes
+--------------------------------------------------------------+
| state | position | links[8] | link_count | ref_count          |
| error_cost | node_count | dynamic_precedence                  |
+--------------------------------------------------------------+

StackLink — 16 bytes
+----------------------------+
| predecessor pointer        |
| Subtree value              |
+----------------------------+
```

The eight inline link slots consumed 128 bytes. A normal push initialized all
eight and then filled slot zero with its only predecessor. The other seven were
reservations for a merge that, according to the audit, almost never arrived.

The remaining fields are cached facts about the complete path ending at that
node. [`stack_node_new`](https://github.com/HerringtonDarkholme/tree-sitter/blob/subtree-arena-gc/lib/src_rust/stack/stack_node.rs) copies the
predecessor's input position, error cost, visible-node count, and dynamic
precedence—a grammar-provided preference used to rank competing parses—then
adds the new subtree's contribution. Version comparison and lexer positioning
can therefore read the answer from the top instead of walking the whole
history.

`StackNode::ref_count` tracks ownership inside the stack graph. A version head
or a successor link can keep a node alive. Because this graph is mutated only
by its parser, the current Rust implementation uses an ordinary integer rather
than an atomic counter. When the count reaches zero, release walks backward,
releasing link subtrees and predecessor nodes. Up to fifty dead node blocks sit
in a small reuse pool; excess blocks return to the allocator.

That pool saves some allocator calls. It does not save rewriting the 160-byte
record or performing the ownership transfers. Reusing the suitcase still means
packing all eight pockets.

### The action interpreter decides what happens next

[`parser_advance`](https://github.com/HerringtonDarkholme/tree-sitter/blob/subtree-arena-gc/lib/src_rust/parser/advance.rs) advances one version.
It begins with three facts cached in the head: parser state, input position, and
the most recent token from grammar-specific scanning code. From there it obtains
a **lookahead**—the next token, not yet consumed—and asks the generated grammar
table what to do for `(state, lookahead)`.

A shift consumes the lookahead and returns to the outer parse loop. A reduction
does **not** consume it. The parser builds a parent, enters the grammar's goto
state—the table's answer for what follows that completed construct—and asks the
table about the same lookahead again. Several reductions can therefore happen
before the next token moves at all.

The current interpreter has a direct path for a table entry with one action. A
multi-action entry enters the general dispatcher and materializes the
deterministic window first, because several valid actions may create topology
that a linear array cannot express.

```text
one version + one lookahead
          |
          v
  table(state, symbol)
      |           |
    shift       reduce
  consume token  keep token, change state, consult table again
      |
  accept / pause / recover / continue
```

### Shift: put one recognized token on one edge

The lexer returns a leaf `Subtree`. [`parser_shift`](https://github.com/HerringtonDarkholme/tree-sitter/blob/subtree-arena-gc/lib/src_rust/parser/actions.rs)
normalizes its `extra` flag—**extras** are grammar-designated tokens such as
whitespace and comments that may appear anywhere without belonging to a
rule—and calls `stack_push` with the next
state.

On the generalized path, `stack_push` creates a `StackNode`. Link zero points to
the old head and carries the token subtree; the version head moves to the new
node. The old node is not copied. It remains the shared past.

```text
before:
head -> state 14

shift identifier, next state 27

after:
head -> state 27 --{identifier leaf}--> state 14
```

With the deterministic window enabled, the same shift appends a compact entry
instead. The graph node above exists only if a later operation materializes the
window.

### Conflict: versions name futures, links preserve pasts

When the grammar permits several actions, Tree-sitter represents each current
possibility with a `StackHead`; the previous post's appendix covers why forking
beats copying. At the implementation level, creating another version retains
the same current node rather than copying any nodes beneath it.

```text
version 0 head --+
                 +--> shared current node --> shared history
version 1 head --+
```

The versions can then advance differently. Reductions can also discover several
valid backward paths through a node with multiple links; each distinct pop
result receives a version anchored at the predecessor where that path ended.
The head array is therefore the changing frontier. The graph below it is the
persistent history shared by that frontier.

Recovery uses version copying too, but for a different reason: it tries several
ways to resume progress and later ranks or merges the results. The representation
is the same even when the source of nondeterminism is a syntax error rather than
a grammar conflict.

### Reduce: enumerate backward paths, then build parents

A reduce action contains a grammar symbol and a child count. On the generalized
path, [`parser_reduce`](https://github.com/HerringtonDarkholme/tree-sitter/blob/subtree-arena-gc/lib/src_rust/parser/actions.rs) first asks
`stack_pop_count` for every valid path containing that many non-extra syntax
values.

The pop is a depth-first traversal implemented by
[`stack_iter`](https://github.com/HerringtonDarkholme/tree-sitter/blob/subtree-arena-gc/lib/src_rust/stack/pop.rs):

1. Start one iterator at the selected version's head node.
2. Follow links backward and collect each link's subtree.
3. When a node has alternate links, clone the iterator state for those paths.
4. Count ordinary syntax toward the reduction length. Extras—the whitespace
   and comment tokens defined in the shift step above—travel with the result
   without counting as the requested children.
5. At the requested depth, reverse the collected handles into source order and
   return a `StackSlice`.
6. If different paths end at different predecessor nodes, create a version for
   each distinct endpoint.

The retained subtree handles in each slice keep the children alive after the
old stack ownership is released. This is the retain/release pair that looked so
suspicious in a deterministic parse: it is necessary for a branching graph,
but cancels itself when there was only one path.

For each result, the parser removes trailing extras, constructs the parent
subtree, and asks the grammar's goto table for the state reached after that
parent. It pushes the parent, then pushes any trailing extras back above it.

```text
head -> S3 --{right child}--> S2 --{left child}--> S1
                 reduce two children
                           |
                           v
head -> goto(S1, Parent) --{Parent(left, right)}--> S1
```

If several graph paths produce competing child lists for the same reduction,
Tree-sitter compares how much error recovery they required, the grammar's
preference between them, and their structure before retaining the preferred
parent. If reductions create additional versions, those versions are later
renumbered or merged into the active frontier.

### Merge: share the future without forgetting the alternatives

Two active versions can merge only when their current configurations are
compatible: the same state and byte position, the same error cost, and
equivalent state from any grammar-specific scanner. Those checks matter because
a merge promises that both versions can make the same decisions from now on.

[`stack_merge`](https://github.com/HerringtonDarkholme/tree-sitter/blob/subtree-arena-gc/lib/src_rust/stack.rs) keeps one current node and adds the
other node's predecessor links to it. It does **not** link one current node to
the other; that would invent a parser step that never occurred.

```text
before:

head A -> current A --{tree A}--> past A
head B -> current B --{tree B}--> past B

after:

head A -> shared current --{tree A}--> past A
                         \--{tree B}--> past B
```

`stack_node_add_link` rejects duplicate links, recursively combines equivalent
predecessor configurations, retains genuinely new predecessors and subtrees,
and caps the inline alternatives at eight. The second head is then removed.
Later reductions see both histories by following both links.

This is the heart of the graph-structured stack: sharing happens at a parser
configuration with a common future, while the incoming edges preserve the
different syntax histories that reached it.

### Pause, reject, recover, and release

A version with no valid action is first paused, not immediately destroyed. If
another version advances successfully, a cleanup-and-ranking step called
**condensation** can discard the paused one. If every promising version is
paused, Tree-sitter resumes the best one and enters error recovery.

[`parser_condense_stack`](https://github.com/HerringtonDarkholme/tree-sitter/blob/subtree-arena-gc/lib/src_rust/parser/advance.rs) is the frontier's
customs desk. Condensation removes
halted versions, compares versions by recovery cost and progress, merges
compatible ones, caps the number of survivors, and decides whether a paused
version must be recovered or can be discarded.

Removing a version releases its `StackHead`. That decrements the top node's
reference count. If it reaches zero,
[`stack_node_release`](https://github.com/HerringtonDarkholme/tree-sitter/blob/subtree-arena-gc/lib/src_rust/stack/stack_node.rs) releases every
link's subtree and predecessor reference, then continues backward through nodes
that also become unreachable.

This is why rejecting one GLR version can release an entire speculative syntax
branch. The stack links were its owners. Shared nodes and subtrees remain alive
because another head, link, or syntax parent still refers to them.

There are therefore two separate ownership systems:

- stack-node references keep possible parser **histories** alive;
- subtree references keep recognized **syntax** alive.

They touch at `StackLink::subtree`, but they answer different questions. Mixing
them up makes rejection look like accidental tree destruction. Separating them
makes the release cascade exactly what it should be: the proof that no surviving
parse can reach that speculative work.

### Where the deterministic window fits

The optimized runtime does not replace this GLR implementation. It places the
deterministic window—also described as a linear suffix of the stack—above it:

```text
materialized shared graph <- base node | compact deterministic entries -> head
```

As long as there is one active version and an operation needs no graph topology,
shift and reduce work inside that window. A conflict, recovery operation, graph
walk, version mutation, or diagnostic logger first materializes the window,
converting every entry into the equivalent `StackNode` chain. The generalized
code then proceeds unchanged.

After condensation leaves one healthy active version, the window can begin
again above the surviving materialized graph. The optimization is therefore
not a second parser and not a restricted grammar mode. It is delayed payment:
ordinary code avoids buying graph objects, while genuinely generalized code
receives the exact graph it expected all along.
