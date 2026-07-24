---
author:
  - name: Herrington Darkholme
date: 2026-07-21
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: "Rewriting Tree-sitter's C Core in Rust: Migration and Compatibility"
  - - meta
    - property: og:url
      content: https://astgrep.com/blog/tree-sitter-rust-migration
  - - meta
    - property: og:description
      content: How an AI-assisted migration moved Tree-sitter's runtime from C to Rust while preserving its retained ABI, generated grammars, and external scanners.
---

# Rewriting Tree-sitter's C Core in Rust: Migration and Compatibility

*Part 2 of 4 — migration, subtraction, and readability*

## The hard part began after the rewrite worked

The overview told the whole adventure. This post slows down the rewrite itself:
how the migration stayed compatible, why the first performance campaign became
untrustworthy, what this branch deleted, and how the surviving runtime became
Rust I could reason about.

The sequence matters. ChatGPT first translated the runtime conservatively
behind the existing tests and C **application binary interface (ABI)**. Then a
multi-day `/goal improve the perf by 20%` run produced fast, opaque code—and
segfaults. I stopped the performance work, removed features outside the
fresh-snapshot workload, and instructed ChatGPT to rewrite the remainder for
humans.

That stage ended with a Rust runtime near C performance. Existing grammars and
external scanners still worked through the retained ABI, while ownership and
control flow could finally be followed one subsystem at a time. Before tracing
the migration, the next section establishes the small amount of LR and GLR
vocabulary it needs.

For the complete project in one sitting, start with
[the adventure overview](tree-sitter-rust-rewrite.md). The optional
[LR/GLR appendix](#appendix-how-lr-and-glr-work) retains the detailed parser
walkthrough.

## Before rewriting it: what Tree-sitter actually runs

Tree-sitter is easy to encounter as an API: give it source code and a language,
receive a concrete syntax tree. Under that API is a generated table interpreter.

A Tree-sitter language starts as a grammar. The generator compiles that grammar
into lexer logic, parse tables, and static metadata. Those generated artifacts
are distributed with the language. At runtime, the core library does not study
the grammar again; it executes the tables against the source text.

The execution pipeline has two main parts. The **lexer** turns source bytes into
tokens. The **parser** combines those tokens into syntax nodes. Tree-sitter's
parser is based on **LR parsing**, which reads input left to right and recognizes
larger grammar constructs bottom-up. It keeps a numbered parse state, looks at
the next token—the **lookahead**—and uses `(state, lookahead)` to select an
action:

- **shift** consumes the token, creates its syntax leaf, and enters another
  state;
- **reduce** replaces a recognized sequence with one parent subtree, then uses
  the goto table to find the state after that parent; and
- **accept** returns the completed tree.

![An LR parser uses the lookahead token and one stack state to choose one shift, reduce, or accept action](/image/blog/01-lr-concept.svg)

The stack is the parser's memory. It records both the states reached so far and
the recognized syntax between them. A shift extends that history. A reduction
walks backward over part of it, takes the corresponding syntax values as
children, and pushes their new parent.

Programming-language grammars do not always offer one safe action. A table cell
may permit several actions until more input resolves the choice. **Generalized
LR**, or **GLR**, keeps those possibilities alive as separate stack
**versions**. Their shared past is stored once in a **graph-structured stack
(GSS)**; versions fork at a conflict and can merge when they later reach a
compatible state.

![A GLR parser forks logical stack versions at a conflict, shares their history in a graph, then discards or merges versions](/image/blog/01-glr-concept.svg)

That creates two different node systems inside Tree-sitter. `StackNode`s belong
to the parser's temporary control history. A `Subtree` is Tree-sitter's compact
internal reference to recognized syntax: either a token or a parent built by a
reduction. Stack links carry these references, and GLR versions may share both
structures, but their ownership and allocation rules are different.

This was the machine being rewritten: lexer execution, generated-table lookup,
LR actions, GLR histories, syntax construction, error recovery, and the public
tree API. The algorithm could not be treated as a black box, because the later
performance work would reach into almost every one of those boundaries.

## First: change the language, not the behavior

Before ChatGPT translated the first subsystem, I gave the migration a narrow
contract:

- the existing tests would remain unchanged and serve as the first behavioral
  oracle;
- generated grammars and external scanners would keep working;
- public layouts and calling conventions would stay compatible; and
- the first Rust implementation would resemble the C closely enough to debug
  failures by comparison.

The unchanged suite gave the translation a fixed target, but it could not prove
every ecosystem boundary. After the cutover, ChatGPT added Rust-versus-C
comparisons over real language fixtures, ABI checks, and an ast-grep integration
gate. Those tests asked whether generated grammars and downstream users still
saw the same runtime, not merely whether its internal units passed.

Tests changed only later, when the branch deliberately removed incremental
parsing and native Wasm-language loading. Those edits recorded a new product
boundary; they did not make the original translation easier to pass.

The order mattered. First, reproduce the C runtime in Rust closely enough that
a failing test still pointed somewhere useful. Redesigning ownership, control
flow, and representation at the same time would have made every mismatch a
murder mystery with three suspects and no witnesses.

Only after parity would the private internals be rewritten into code a human
could reason about. The first pass protected behavior. The later pass protected
the next engineer—including me. The performance campaign between them would
demonstrate, rather forcefully, why both were necessary.

## Translation proceeded one subsystem at a time

The C runtime carried years of hard-won behavior around lexing, included
ranges, external scanners, error recovery, tree editing, changed ranges, query
execution, and public navigation. Replacing all of it in one heroic commit
would have made every failure equally mysterious.

I knew this because I had already tried broader AI-assisted rewrites. Without
clear layers, the agent gradually lost its place in the system: translated
pieces stopped agreeing about their assumptions, failures no longer pointed to
one boundary, and each follow-up prompt inherited a state neither of us could
describe precisely. The rewrite became uncontrollable long before it became
complete.

Layering was the correction, not the original plan. This time I instructed
ChatGPT to migrate the core in this order:

1. **Allocation helpers, `Point`, `Length`, `ErrorCost`, and Unicode.** These
   are the small values and low-level services used everywhere else: source
   positions, byte and row extents, recovery cost, text decoding, and memory
   allocation.
2. **`Subtree` representation and ownership.** A subtree is Tree-sitter's
   internal syntax value, either a token leaf or a parent produced by a
   reduction. This layer defines how syntax is stored, shared, and released.
3. **Generated-language tables.** These are the grammar-specific symbols,
   states, actions, lexing functions, and metadata that the runtime interprets.
4. **Lexer execution.** The lexer reads source input and asks the generated
   language logic which token comes next.
5. **The GLR stack.** `StackHead`, `StackNode`, and `StackLink` represent active
   parse versions, their shared histories, and the subtrees recognized between
   parser states.
6. **`Tree`, `Node`, `TreeCursor`, and changed ranges.** These types expose the
   completed syntax tree and let callers navigate or compare it.
7. **The parser and reduction loop.** This final layer coordinates lexing,
   table lookup, stack operations, syntax construction, recovery, and
   acceptance.

At each layer, the Rust initially stayed close to the C. This was not the final
style, but it was a useful debugging instrument: recognizably equivalent
control flow kept a parity failure inside a bounded search area.

Once the final parser layer crossed over, Rust owned the active runtime. The
browser WebAssembly build followed, and this branch retired its obsolete pure-C
build path. Native loading of Wasm-compiled grammars was later removed because
the target workload did not use it. A narrow C compatibility layer remained,
but parsing, lexing, tree operations, and storage now came from Rust.

That does not mean the C boundary disappeared. Rust implements the runtime side
of the retained C ABI; existing generated parsers, external scanners, and
callers remain compiled consumers of that boundary.

## The C boundary had to survive the Rust rewrite

Generated Tree-sitter languages are already-compiled artifacts. They communicate
with the runtime through an **ABI**: the exported symbol names, calling
conventions, and exact layouts that compiled code expects to find. Changing the
implementation from C to Rust did not grant permission to move that boundary.

The retained parser, tree, and generated-language interfaces therefore kept
their C ABI. Rust types crossing that boundary use `#[repr(C)]`, and
layout-sensitive structures are checked for the expected size. Behind the
boundary, private Rust types are free to change. At the boundary, “more
idiomatic” can mean “binary incompatible,” which is a remarkably expensive
style preference.

There is a useful difference between “C-shaped because the agent has not cleaned
it up” and “C-shaped because another binary has already baked this layout into
its data.” The former invites another instruction. The latter invites tea and a
size assertion.

This guarantee applies to the interfaces the branch retained. Removing native
Wasm-language loading was an explicit product and API change, not something
hidden inside the C-to-Rust translation.

## The benchmark crossed twenty percent. Then the parser crashed.

Once the port passed its compatibility gates, I gave ChatGPT a much broader
instruction: `/goal improve the perf by 20%`. I supplied the major directions—
profile the runtime, understand its data layouts, and consider algorithmic as
well as local changes—while the agent implemented and measured candidates.

The `/goal` run continued through several days and nights with little human
supervision. ChatGPT profiled the runtime, implemented candidates, ran the
gates, and used the results to choose the next change. In the narrow sense, it
worked: the benchmark eventually crossed the twenty-percent target.

Meanwhile, ownership paths, layout experiments, and fast paths accumulated
faster than I could build a reliable model of them. Then the resulting parser
began segfaulting. The autonomous run had produced a winning benchmark and an
artifact I could not trust. A twenty-percent result is not an asset when nobody
can explain which invariant bought it or which input will make it crash.

So I stopped the performance work. Before asking for another optimization, I
needed to reduce the runtime's scope and make its remaining ownership rules
locally understandable. The following deletion and readability work was not
routine polish after the rewrite; it was how the rewrite regained a trustworthy
baseline.

## The feature list had to meet the actual workload

The [adventure overview](tree-sitter-rust-rewrite.md#remove-incremental-parsing-from-the-target-runtime)
explains the product boundary: editors benefit from incremental reuse, while
this ast-grep branch parses complete snapshots. Here, the interesting part is
what that decision removed from the runtime.

I instructed ChatGPT to delete the incremental path while keeping `old_tree` in
the parser API for compatibility. The parser no longer retains the previous
root or computes included-range differences in preparation for reuse. Its
`ReusableNode` cursor—which walked the old tree looking for a subtree valid at
the current state and position—disappeared.

That deletion continued into the hot loop. Lookahead selection stopped asking
whether an old subtree could replace fresh lexing. The special path for
breaking a reusable parent back into stack entries disappeared, as did the
incremental-only reduction path and the pending-link metadata it required in
the GLR stack. Fresh lexing and one ordinary reduction ownership path became
the only way through the parser.

Dormant stack experiments, failed optimization scaffolding, obsolete build
paths, and native Wasm-language loading followed. These were explicit product
cuts, not advice for upstream Tree-sitter. If this branch returns to interactive
editor use, incremental parsing must be designed back in rather than quietly
assumed.

## Then came the second rewrite: this one was for humans

Once behavior was stable, the C-shaped translation had completed its mission.
It was now possible to make the code explain itself.

No grand redesign followed. Instead, ChatGPT made a long series of small,
measured changes. Raw pointer conventions became ordinary Rust references,
slices, return values, and explicit optional states where the ABI allowed it.
Ownership operations gained names, mutation moved closer to the state it
changed, and the parser's major responsibilities separated into focused
modules.

The patches were intentionally small. Each could be reviewed, tested,
benchmarked, and blamed. A sweeping “make this idiomatic” rewrite would have
been much harder to trust—and this project had already tried that genre.

Gradually, the module structure began to tell the runtime story. The parser
asks the lexer for a token, looks up actions through the language, manipulates
histories through the stack, and builds subtrees. The accepted subtree becomes
a tree; nodes and cursors expose public views over it. Recovery and balancing
remain visible phases rather than surprising appendices inside one enormous
function.

The goal was not maximum Rust flavor. It was local reasoning. A reader should
be able to answer:

- Who owns this buffer?
- Is this subtree handle borrowed, copied, or moved?
- Does this function operate on one stack path or enumerate a graph?
- Which types are frozen by ABI and which are private implementation details?

When those answers became easier, performance work became easier too. The same
refactor that hides pointer arithmetic behind a subtree handle also creates one
place to measure handle resolution. The stack module makes version churn
visible. The reduction module reveals the child-collection lifecycle. Readable
code did not automatically run faster, but it made expensive behavior harder
to disguise as inevitability.

## Readability still had to answer to the stopwatch

Compact runtime types punish well-intentioned abstraction.

One experiment replaced the compact eight-byte `Subtree` representation—a
C-style union whose field access required `unsafe`—with a direct, explicit Rust
enum. It was pleasant to inspect and sixteen bytes wide. Parse time increased
by **19.74%**. The CPU was apparently unmoved by the improved semantic clarity.

The answer was not to abandon readable APIs. It was to separate interface from
representation. Internal methods could expose meaningful operations while the
hot handle remained compact and private.

That became the general rule for cleanup:

1. preserve the retained behavior and ABI;
2. compare the change with the immediately preceding Rust implementation;
3. keep clarity improvements that remain within noise;
4. isolate compact or unsafe representation code behind narrow boundaries; and
5. revert abstractions whose runtime cost overwhelms their maintenance value.

Rust-versus-C measurements answered a broad question: had the rewrite reached
competitive performance? Rust-to-Rust measurements answered the local one:
did this change help? Confusing those controls makes a fast C implementation a
very elaborate coin flip for judging a Rust refactor.

## What survived the rewrite

The strange part is that the performance campaign became useful only after I
stopped it. Its failure exposed the missing prerequisite: a runtime whose
behavior could be preserved and whose internals could be understood at the
same time.

That is what survived this stage. The Rust core kept the retained ecosystem
boundary: existing generated grammars and external scanners still worked
through the public C ABI. Incremental old-tree reuse and native loading of Wasm
grammars remained explicit exclusions for this fresh-snapshot branch. Inside
that boundary, the private machinery could finally be followed one subsystem
at a time. At the last complete checkpoint before the later stack and arena
work, Rust and C were at practical parity when the tested languages were
weighted equally.

That was enough to change the next question. I no longer had to ask, “Did the
translation preserve Tree-sitter?” I could ask, “Why does this particular
mechanism run on every parse?” The new module boundaries made allocations,
ownership transfers, stack-version churn, and repeated table work visible
enough to investigate rather than merely inherit.

The next post follows the first large answer. Profiling made stack allocation
and reduction bookkeeping worth investigating; a runtime audit then found that
**98.898% of released graph nodes had only one predecessor**. The generalized
stack was built for forks, but its measured released-node population was
overwhelmingly linear. Continue with
[Improving Tree-sitter's GLR Algorithm and Memory Layout](tree-sitter-glr-arena.md).

## Appendix: How LR and GLR work

The rewrite story above needs only the short model: generated tables choose
parser actions, a stack records the recognized history, and GLR can preserve
several histories when one answer is not yet safe. This appendix builds the
complete model from one tiny expression.

### A parser is a table interpreter with a stack

Source code does not become a syntax tree in one magical jump. First, the
**lexer** groups characters into tokens. For this tiny expression:

```text
1 + 2
```

the lexer might produce:

```text
number("1")   "+"   number("2")   end-of-file
```

The parser then decides how those tokens fit the grammar. This toy grammar has
two rules:

```text
expression -> number
expression -> expression "+" number
```

An LR parser does not search those rules from scratch at runtime. A parser
generator has already analyzed the grammar and compiled its decisions into two
closely related tables:

- the **action table** says what to do with the next token: shift it, reduce a
  rule, accept the file, or report an error;
- the **goto table** says which state to enter after a reduction has produced a
  grammar symbol such as `expression`.

A parser **state** is a compact summary of the history that matters for the
next decision. It is not a source position and it is not a syntax-tree node. A
state means something closer to “I have recognized enough of these grammar
rules that these tokens could legally come next.” The generated table assigns
that summary a small integer because comparing prose in the hot loop would be
an ambitious performance strategy.

At runtime the parser therefore needs only:

- one **lookahead token**, meaning the next token it has not consumed;
- one stack of numbered states; and
- syntax values representing the input already recognized.

For the toy grammar, an illustrative fragment of the generated tables could
look like this. The exact state numbers do not matter; generated grammars choose
them.

| State | Next `number` | Next `+` | Next end-of-file | Goto `expression` |
|---|---|---|---|---|
| `0` | shift to `3` | error | error | `2` |
| `2` | error | shift to `4` | accept | — |
| `3` | error | reduce `expression -> number` | reduce `expression -> number` | — |
| `4` | shift to `5` | error | error | — |
| `5` | error | reduce `expression -> expression "+" number` | reduce `expression -> expression "+" number` | — |

The pair `(top state, lookahead token)` selects one action:

- **shift**: consume the lookahead, turn it into a leaf subtree, and push the
  state named by the table;
- **reduce**: pop the recognized right-hand side of a grammar rule, create one
  parent subtree, and use the goto table to push the rule's left-hand side;
- **accept**: return the finished tree; and
- **recover**: do something principled with invalid input instead of falling
  dramatically onto the floor.

A shift advances the input. A reduction does **not**. This distinction is the
engine of LR parsing, so it is worth following the complete expression.

1. State `0` sees `number("1")`. The table says **shift to 3**. The parser
   consumes `1` and pushes its leaf subtree.
2. State `3` sees `+`. The table says **reduce
   `expression -> number`**. The parser pops one recognized symbol, wraps it in
   an `expression`, uncovers state `0`, and asks
   `goto(0, expression)`. The answer is state `2`. The `+` is still waiting;
   reductions reorganize recognized input rather than consuming new input.
3. State `2` sees `+` and shifts to state `4`.
4. State `4` sees `number("2")` and shifts to state `5`.
5. State `5` sees end-of-file and reduces the three recognized symbols
   `expression "+" number` to one `expression`.
6. State `2` now sees end-of-file and accepts.

The stack is the parser's memory between those table lookups. Conceptually, it
alternates states with recognized syntax:

```text
state 0 -- expression("1") --> state 2 -- "+" --> state 4
```

The current state is at the right. A reduction walks left over as many grammar
symbols as the rule contains, builds their parent, then follows one goto edge
back to the right. A three-child rule pops three syntax values; it does not pop
three bytes or necessarily three tokens, because one child may already
represent a large expression.

![Six LR actions turn the token stream 1 + 2 into one expression](/image/blog/01-lr-shift-reduce.svg)

The repeated lookaheads are the important part of the trace. Rows 1, 3, and 4
shift, so the lookahead changes in the following row. Rows 2 and 5 reduce, so
`+` and end-of-file appear twice: once while the stack is reorganized and again
for the next table decision. The stack column shows syntax values sandwiched
between states, while the final column shows whether that action created a leaf
or combined existing children into a parent.

#### Tree-sitter stores two different kinds of node

Tree-sitter calls the syntax value attached to a token or completed grammar
rule a **subtree**. A leaf subtree might represent `2`. An internal subtree
might represent the entire `1 + 2`.

The parser stack has nodes too, but they are not syntax nodes. A Tree-sitter
**stack node** stores a parse state and bookkeeping about that point in the
parse. Its backward link to the preceding stack node carries the subtree that
was recognized between the two states. Physically, one linear history looks
roughly like this:

```text
current stack node (state 4)
    -- subtree "+" --> stack node (state 2)
    -- subtree expression("1") --> stack node (state 0)
```

That backward direction is useful: the parser constantly starts at the current
head and pops toward older history. Parse states answer “what may happen next?”
Syntax subtrees answer “what did I recognize to get here?” Mixing the two kinds
of node produces extremely confusing conversations about allocation. I know
because I held several.

### GLR: when the table answers “both”

The toy action table has at most one answer in each cell. Real programming-
language grammars occasionally refuse to be so cooperative. A table cell may
contain a **shift/reduce conflict**—either consume the lookahead or finish a
rule first—or a **reduce/reduce conflict**, where two rules could both finish.

Imagine the parser has recognized `1 + 2` and sees `*`. One interpretation
reduces the addition first. Another shifts `*` first and lets multiplication
bind more tightly. A conventional grammar usually resolves this example with
precedence, but it illustrates the physical choice. Tree-sitter grammars can
also declare conflicts intentionally, especially where a few more tokens will
make the correct interpretation obvious.

A conflict does not necessarily mean the final source is ambiguous. It only
means the parser cannot safely decide **yet**. One possibility may fail on the
next token; two possibilities may later reach equivalent parser states; or both
may survive until Tree-sitter compares precedence, error cost, and other parse
quality information.

**Generalized LR**, or GLR, means following several valid LR histories at once.
At a conflict, the parser performs every permitted action. A shift branch
consumes the token. A reduction branch keeps the same lookahead, rewrites the
top of its stack, and consults the table again. The branches are now at
different states and may even be at different input positions.

Tree-sitter calls each active history a stack **version**. “Version” sounds like
a complete copied stack, but it is mostly a head: a reference to the newest
stack node plus metadata used to compare and manage that possibility.

#### Sharing history turns the stack into a graph

Copying the complete stack at every conflict would be expensive, so versions
share their common history. The result is a **graph-structured stack**, or GSS:
stack nodes point backward, several heads can share the same older nodes, and a
later node can have more than one predecessor when compatible histories merge.
A link between two stack nodes carries the subtree recognized by that
transition.

Operationally, it is less mystical than its name:

- **push** creates a new head and links it to its predecessor;
- **pop** walks backward across links and collects their subtrees;
- **fork** gives two versions different heads over the same older prefix; and
- **merge** gives one compatible destination alternate predecessor links
  instead of keeping duplicate future work.

![A linear LR history forks into two GLR versions, shares its prefix, and merges again](/image/blog/01-lr-to-glr.svg)

Read the arrows backward from each head. Before the conflict there is one
chain. After it, two heads point into the same green prefix; the parser did not
copy that prefix. When both histories later arrive at the same state and input
position, one destination can retain links to both predecessors. The shape is
now a graph even though every individual path through it is still an ordinary
LR stack.

This changes reduction. In a linear stack, reducing a rule with three children
has one obvious answer: walk back three links. In a graph-structured stack,
there may be several three-link paths. The parser must enumerate them, build a
parent for each valid child sequence, and merge equivalent destinations. The
graph is what preserves correctness when syntax is genuinely uncertain.

It also explains the performance question taken up by the next post. Most real
input spends very little time forked, yet an eager GLR implementation can still
allocate graph nodes, maintain versions, probe for merges, and prepare for
multiple pop paths on every deterministic shift and reduction.
