---
author:
  - name: Herrington Darkholme
date: 2026-07-19
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Optimizing Tree-sitter for End-to-End ast-grep Performance
  - - meta
    - property: og:url
      content: https://astgrep.com/blog/tree-sitter-end-to-end
  - - meta
    - property: og:description
      content: Why a parser-only speedup made ast-grep slower, and how profiling virtual memory, arena growth, tree traversal, and the full application repaired it.
---

# Optimizing Tree-sitter for End-to-End ast-grep Performance

*Part 4 of 4 — end-to-end validation*

## Thirty percent faster. Slower where it mattered.

The previous post reached what should have been a victory. At that historical
checkpoint, the seven-language parser-only gate put the Rust core roughly
**30% ahead of C**. Then ast-grep used the same runtime to scan a real
TypeScript repository and ran slower than its C-backed build. That
contradiction is the subject of this final post.

The parser benchmark had not lied. It had measured one phase of a larger
system: parse already-loaded source with a ready parser, then stop when the
tree is returned. ast-grep also creates and configures parsers, incurs arena
lifecycles across thousands of files, and traverses every completed tree. The
Rust rewrite had made the measured phase faster while moving new costs into
work the benchmark never saw.

The investigation therefore had to expand one boundary at a time. First, prove
that the ast-grep binary really contained the local runtime. Then trace the
parser's complete lifecycle, follow resident memory to the allocation that
owned it, benchmark the published tree as something an application reads, and
profile the whole worker again as each old hotspot disappeared. Every change
needed a paired Rust control and a correctness gate; otherwise AI could produce
wrong answers faster than I could name them.

At the current endpoint, the seven-language Rust core parses **29.74% faster
than C** and traverses trees **10.16% faster**. On single-threaded opencode
outline, ast-grep uses **22.2% less user CPU** and **21.6% less wall time** than
the C-backed build, with **7.92 MiB** higher peak resident set size (RSS).
Those are separate parser, traversal, and application controls—not percentages
to add together.

The historical “roughly 30%” and the final **29.74%** happen to be close, but
they are not the same measurement. The first belongs to the parser checkpoint
that triggered the application failure. The second is the later, exact
Rust-versus-C rerun after the lifecycle and traversal problems were repaired.

The previous post reported the retained design first. To show where that design
came from, this post now rewinds to the first ast-grep run—before the arena
lifecycle and read-side repairs existed.

## First, prove the contradiction

Before profiling, I had to rule out the boring explanation: perhaps ast-grep
was not actually using the local runtime. I instructed ChatGPT to rebuild it
from my Tree-sitter checkout, verify the Rust arena symbols in the binary,
compare its output, and rerun the outline workload.

The binary was correct. The output matched. The contradiction survived.

I told ChatGPT to stop optimizing and profile the complete lifecycle—not only
`ts_parser_parse`. The parser gate ended when a tree was returned; the
application also paid for parser setup, arena creation and release, and reading
that tree. From here onward, “faster” needed separate evidence for construction,
parsing, traversal, and the complete application.

## The 4 GiB arena was “only virtual” 2,291 times

The first arena reserved a 4 GiB virtual address range with `mmap`. It committed
64 KiB chunks with `mprotect` as the bump cursor advanced, then released the
mapping with `munmap`.

This looked reasonable in the parser benchmark:

- virtual reservation was not resident memory;
- only touched chunks became physical pages;
- one reused parser amortized reserve and release; and
- physical footprint remained small.

Then ast-grep created a parser for each file.

ChatGPT returned with the syscall trace. There it was: the “one-time”
virtual-memory setup was happening once per file. Thousands of times.

On opencode's 2,311 TypeScript files, the custom and normal builds produced:

| System call | Arena build | Normal build |
| --- | ---: | ---: |
| `mmap` | 2,329 | 34 |
| `mprotect` | 10,086 | 38 |
| `munmap` | 2,305 | 23 |

There were 2,291 actual 4 GiB reserve-plus-64-KiB-commit lifecycles. A system
trace followed them from `subtree_pool_ensure_arena` through leaf construction,
parser advance, `ts_parser_parse`, and finally ast-grep's document creation.

The parser had slightly reduced user-space parse CPU. It had also become an
enthusiastic virtual-memory benchmark.

The conclusion changed again. The parser-only measurements were not necessarily
false; their lifecycle was incomplete. Good news, in the grim sense: the first
end-to-end disaster now had a concrete cause. Concrete causes can be removed.

ast-grep would later reuse parser instances, but caching could not be the core
runtime's excuse. Constructing a parser still had to be a reasonable operation
for every other caller. The allocator itself had to stop turning each new
parser into a 4 GiB virtual-memory ceremony.

![Parser microbenchmark lifecycle versus repository-wide application lifecycle](/image/blog/03-parser-lifecycle.svg)

## Ordinary allocation removed the VM lifecycle

I instructed ChatGPT to replace the 4 GiB virtual reservation with on-demand
allocation. A parser now starts with only the arena header. Its first syntax
record allocates **256 KiB** with `malloc`, and later growth rounds the required
size to the next power of two. The arena no longer needed a fixed virtual
address because subtree handles were offsets from its current base.

The first implementation could not yet grow that block with `realloc`. Subtree
handles survived a move, but some temporary `SubtreeArray` values—growable
scratch arrays used to collect child handles during reductions—still stored raw
addresses inside the arena. If `realloc` moved the block, those addresses would
point into the old allocation.

As an interim solution, growth allocated a larger block and copied the used
bytes into it. The old block remained in a `retired` chain so its raw addresses
would stay valid. This removed the per-file `mmap` and `mprotect` calls, but it
kept every previous arena generation alive.

That retention was expensive. As the arena grew geometrically, the retired
chain accumulated all earlier capacities. On TypeScript's `tests/baselines`
corpus with one ast-grep worker, those old blocks—not the live syntax tree—drove
peak RSS to about **1.04 GiB**. Removing the VM lifecycle had fixed CPU overhead
by creating a much larger memory problem.

## Relative offsets made `realloc` safe

Removing the retired chain required every live arena reference to survive a
change of base address. Subtree handles already did. ChatGPT converted the
remaining arena-backed arrays from raw addresses to byte offsets, resolving
each offset against the arena's current base when accessed. Reusable scratch
buffers that did not need arena storage moved to their own `malloc`/`realloc`
allocations.

Once no live reference depended on the old base, the arena itself could grow
with `realloc`. A forced-relocation test moved the allocation and verified that
existing subtree handles and child arrays still resolved correctly. Old arena
generations were no longer necessary: one allocation represented the current
arena, and one release could free it.

This reduced peak RSS from about 1.04 GiB to **492.2 MiB**. The retired chain
was gone, so it could no longer explain the remaining half gigabyte. Something
inside a single parse was advancing the live arena far beyond the 150 MiB gate.
Dead subtree nodes looked like the obvious suspect. The next allocation profile
showed that they were not.

## I instructed ChatGPT to optimize the wrong garbage

A 273,957-byte TypeScript fixture advanced the arena bump cursor to
**474,329,448 bytes**, forcing a 512 MiB capacity. Instrumentation showed that
all large-arena boundaries had one owner, so published trees were not retaining
the space.

At my direction, ChatGPT first tried reclaiming uniquely owned nodes at the top
of the bump stack. The peak barely moved. The next candidate restored exact
reference counts, cascading release, and node-record free lists. The peak still
hovered around 494 MiB.

Two increasingly sophisticated node-reclamation designs. The same roughly 494
MiB peak. Again? Either the instrumentation was wrong or the entire explanation
was wrong. I stopped the fix loop and asked ChatGPT to count every byte of bump
progress by allocation class.

Allocation counters finally ended the argument:

| Allocation class | Bump progress |
| --- | ---: |
| Temporary `SubtreeArray` capacities | 468.2 MB |
| Everything else combined | about 1.9 MB |

The GC question changed immediately. The problem was no longer “How do dead
subtree nodes return arena space?” It was “Why do temporary child-array
capacities never get reused during this one parse?” Same RSS graph. Completely
different design axis.

The pathological parse created and replaced large temporary child buffers.
Because the arena was bump-only, superseded capacities remained physical until
the next parse epoch even when the logical array had moved on.

The retained fix reused those temporary buffers. A **free list** is a collection
of blocks that are no longer in use but can satisfy a later allocation. Here,
64 lists cover the small child-array capacities the parser commonly requests.
When an array grows and leaves its old buffer behind, that block enters the list
for its exact capacity. The next array requesting the same capacity takes the
block instead of advancing the arena's bump cursor.

The lists are intrusive: because a released block no longer contains live
children, its first four bytes store the arena offset of the next available
block. This needs neither a separate bookkeeping allocation nor a raw pointer
that would break if the arena moved. Reuse starts only after the arena exceeds
**16 MiB**; ordinary small parses keep the simpler bump-only path, and published
arenas remain immutable.

Peak RSS on the same one-worker ast-grep corpus fell to **91.2 MiB**, below the
150 MiB gate. Parse throughput decreased by **1.10%** across languages. I kept
the change because an order-of-magnitude application memory correction was
worth a one-percent parser cost.

Ninety-one point two MiB. Below the gate. The project was alive again.

This is not subtree garbage collection. It is scratch-buffer reuse, selected
because the profile named scratch buffers.

Memory was finally below its gate. That still did not settle the original CPU
contradiction, because the parser benchmark stopped exactly where ast-grep's
next phase began: reading the completed tree.

## Construction was only half of the tree's career

The arena representation gave every subtree a four-byte relative offset.
Smaller handles reduced traffic while the parser built the tree, but readers
now had to add the arena base to each handle before accessing a node. The parse
benchmark measured the benefit and stopped before paying that read cost.

I instructed ChatGPT to add a separate traversal benchmark. It parsed each
fixture once outside the timed region, then repeatedly walked the completed tree
in preorder while reading data typical of an ast-grep consumer:

- kind ID;
- byte range;
- named-node status; and
- error-node status.

The first four-byte indexed version was **2.40% slower** than the pre-arena Rust
representation across all seven languages. The parser had become faster by
making its output slower to read.

One possible response was to convert the accepted tree into a second,
reader-optimized representation. That would add a full tree pass and duplicate
representation logic, so I deferred it while the arena layout was still
changing. Two later changes made the arena records less wasteful:

- **Internal nodes stopped reserving leaf storage.** A full leaf may need bytes
  from an external scanner or an error lookahead character. A parent node never
  uses either, so internal and leaf records received separate shapes instead of
  sharing one record large enough for both.
- **Column dependence became lazy.** Some tokens depend on their starting
  column, and Tree-sitter's editing APIs may need to know whether a parent
  contains one. The old path propagated that fact into every new parent during
  reduction. The new path keeps it on leaves and reconstructs the parent's
  answer from its children only when the editing code asks.

When ChatGPT reran the same traversal benchmark after those changes, the
complete kernel was **1.71% faster** than the pre-arena control. This was an
endpoint comparison, not a claim that either change alone caused the gain. It
was enough to rule out an expensive representation conversion.

The new profile still found repeated work in child iteration. One cursor step
resolved the same parent handle several times: to check the child count, obtain
the current child, and read the next child's padding. Published arenas do not
move, so the iterator could resolve the parent's child slice once and keep that
pointer for the duration of the operation.

That narrow cache improved traversal throughput by **5.43%**, with all seven
languages positive. In a later outline run, after ast-grep began reusing parser
instances across files, it used **1.12% less user CPU**, added a noise-sized
0.62 MiB of RSS, and produced byte-identical output.

I asked ChatGPT to try two broader caching optimizations. Both failed and were
removed:

- Caching a 36-byte bundle of size, padding, flags, and other metadata for every
  child regressed traversal by **1.71%**.
- Returning a smaller parent-setup bundle—child pointer, child count, and
  production ID—regressed traversal by **1.20%** in every language.

Both experiments copied more data through the iterator than their avoided
lookups were worth. The retained optimization caches only the resolved child
address, and only for the cursor operation during which that address is known
to remain valid.

With parser construction, arena memory, and tree traversal now measured
separately, I asked ChatGPT to profile the complete ast-grep worker again. By
then, parser reuse had also changed the application's execution pattern.

## Parser reuse moved the hotspot again

The original outline path constructed and configured a parser for every file.
ast-grep then began retaining parser instances across files handled by the same
worker, so repeated parser and language setup could be amortized. This did not
replace the allocator fix—the runtime still needed sane construction—but it
removed redundant application work that ast-grep controlled. In the next
profile, `set_language` fell from a former 15.8% of worker CPU to 0.11%. The
change worked so well that it exposed the next layer:

| Exclusive area | Worker CPU |
| --- | ---: |
| Parser action interpreter | 17.5% |
| Lexing | 15.7% |
| Subtree construction | 13.6% |
| Tree-cursor traversal | 11.6% |
| Parser stack operations | 10.4% |
| Reduction functions | 5.2% |

The profile sent the investigation back into the parser. The result most
directly enabled by parser reuse was table lookup: its preparation cost could
now be amortized across files. Generated tables group symbols sharing a value,
then use a short linear scan. I first instructed ChatGPT to try cache-like and
group-skipping ideas. They were small, unstable, or negative across the full
language set.

The retained mechanism was not a cache. When a parser installs a language, it
materializes direct lookup arrays for the mappings otherwise stored in the
grammar's compressed small-state tables. The arrays are parser-private and
sparse: states that already have direct table entries need no duplicate. They
answer two different questions:

- a **nonterminal goto index** maps the parent symbol produced by a reduction
  to the parser's next state, removing compressed scans and improving parse
  throughput by **2.18%**;
- a **terminal/action index** maps the current lookahead token to its shift,
  reduce, or other parser action, improving parse throughput by **1.42%**.

The terminal index also reduced parser-cached opencode outline user CPU from an
average 1.233 seconds to 1.172 seconds—about **5.0%**—but increased application
RSS by **5.88 MiB**. The generated language ABI and checked-in parser sources
remained unchanged; the opaque parser owned the projection.

That last detail matters. A benchmark-corpus-specific cache learns recent
access history and may merely memorize the experiment. A complete sparse
projection represents every real mapping in the installed language. Its cost
does not depend on whether opencode happens to ask the same question tomorrow.

### Let one action remain one action

The action interpreter exposed a second common case. Most parse-table entries
contain exactly one action, but the runtime still entered a loop designed for
several actions and initialized bookkeeping that only generalized parsing
needed.

The retained path dispatches one shift, reduce, accept, or recovery action
directly. Entries with several actions still use the complete GLR dispatcher.
Against the immediately preceding Rust revision, this improved parse
throughput by **2.78%** across the seven-language corpus, with no meaningful
change in peak RSS.

### Let ordinary ASCII remain ordinary

Lexing was still 15.7% of the worker profile, and its generic advance routine
runs for essentially every source byte. Most bytes were ordinary UTF-8 ASCII,
already inside the current input chunk and inside the source range ast-grep had
asked Tree-sitter to parse.

I instructed ChatGPT to add a guarded runtime path for that case: advance the
byte and column directly, then load the next byte without entering the full
seek-and-decode path. Newlines, non-ASCII input, chunk boundaries,
included-range boundaries, and other encodings still use the complete path.
Against the immediately preceding Rust revision, the shortcut improved parse
throughput by **2.70%** across all seven languages, with no meaningful peak RSS
change.

The change stayed inside the runtime. I deferred modifications to generated
lexers because users bring grammar artifacts produced by many generator
versions and toolchains; this repository's corpus cannot prescribe how every
external grammar must be regenerated.

The profile suggested all three changes; it did not prove any of them. Each
result still had to beat the immediately preceding Rust revision across the
complete language corpus. By this point, that distinction between a promising
profile and a retained optimization governed every performance claim.

## The benchmark rules stopped being optional

By this point the experiment ledger was as important as any individual fast
path. The early `/goal improve the perf by 20%` phase had produced overlapping
changes whose results were hard to attribute. Now every AI-generated candidate
had to answer a narrower brief:

- What exact operation disappears?
- Which immediately preceding Rust revision is the control?
- Which invariant could the optimization accidentally skip?
- Which corpus and lifecycle exercise the change?
- What result kills the idea?

The agent could still write the patch and run the machinery. It could no longer
declare victory with a fast number from a different architecture. Each
candidate used the immediately preceding Rust revision as its control; C
answered the broad rewrite question, not whether one new Rust branch helped.
The gate covered 40 checked-in fixtures across C++, Go, Java, JavaScript,
Python, Rust, and TypeScript. Samples used process CPU time, calibrated
duration, medians, standard deviation, and a five-percent
coefficient-of-variation limit.

Correctness gates included core fixtures, ABI checks, ast-grep integration,
recovery-heavy cases, cursor parity, and byte-identical output. Performance
results were classified as:

- **retain**: broad, reproducible improvement with acceptable complexity;
- **revise**: the diagnosis survived but the mechanism did not; or
- **reject**: record the result and remove the code.

This protected the project from its most persuasive adversary: a short
benchmark run that agreed with me.

The accepted syntax is temporarily a directed acyclic graph (DAG) when several
parents share a subtree. Before publication, Tree-sitter's balancing pass walks
that graph and reshapes deeply nested repeated syntax. One worklist-reuse
experiment made that pass appear **2.01% faster**, but skipped descendants that
were reachable through more than one ancestor. The invariant-preserving version
measured **-0.18%**. A dedicated shared-ancestor test now guards that failure.
The missing work had been the optimization.

That sentence could summarize an alarming number of performance projects.

## What “faster” finally meant

By the final checkpoint, “faster” no longer meant one green parser chart. It
meant a stack of decisions whose benefits had survived at different scales:

- Rust owns the runtime behind the existing C/generated-language ABI.
- The common deterministic suffix avoids materializing GLR stack nodes.
- Subtrees use dense four-byte tagged arena-relative offsets.
- Internal records and hot metadata are specialized selectively.
- Parser-private sharing avoids published-tree atomic costs.
- Child arrays remain coallocated for locality but recycle under demonstrated
  pressure.
- Published cursor operations cache only proven short-lived resolutions.
- Parser-private sparse indexes accelerate compressed table lookup without
  changing generated languages.
- A guarded ASCII path removes common runtime lexer work.

The final checkpoint keeps those scopes separate:

| Scope | Current retained result |
| --- | ---: |
| Parser throughput | **+29.74%** versus C, equal weight per language |
| Tree traversal | **+10.16%** versus C, equal weight per language |
| opencode outline, Rust versus C-backed build, one worker | **22.2% less user CPU**, **21.6% less wall time**, **+7.92 MiB peak RSS** |

The ast-grep comparison produced byte-identical output. These numbers are not
additive, and the C comparisons do not attribute the total gap to any one
patch. Individual changes still require same-session Rust-to-Rust controls;
parser throughput, traversal, application CPU, and RSS answer different
questions.

That may be the most important lesson from the rewrite. “Faster” is not a
property of a data structure in isolation. It is a claim about a workload, a
lifecycle, a control revision, and a set of costs one has chosen not to hide.

The parser microbenchmark had not lied. It had measured one phase under a
reused-parser lifecycle. The application gate exposed the missing costs:
per-file VM setup, retained arena generations, temporary child-buffer pressure,
and published-tree reads. Each correction expanded the claim until “faster”
described the workload that actually mattered.

I began by instructing ChatGPT to replace C with Rust. I ended by directing
investigations into graph laziness, arena identity, ownership phases,
virtual-memory syscalls, cursor lifetimes, compressed parse tables, and one
TypeScript file capable of consuming 474 MB of bump progress before breakfast.

The rewrite made the runtime easier to change. The experiments made it harder
to fool.

AI made the exploration dramatically faster. It did not decide which result
was correct. The 4 GiB VM storm, the false refcount win, and the invalid
balancing optimization all arrived as plausible code. Only application traces,
invariant tests, and paired performance gates turned fast code generation into
engineering progress.

For the complete project in one sitting, return to
[the adventure overview](tree-sitter-rust-rewrite.md).

If you followed the rewrite from the first impossible prompt, through the
segfaults, the graph that was usually a line, the arena that kept inventing new
ways to lose, and finally back into ast-grep, thank you for coming along. This
adventure ended with a faster system, but the more valuable result was learning
how to keep asking what “faster” actually meant. There will always be another
profile. At least the next expedition starts with a better map.
