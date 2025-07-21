---
author:
  - name: Herrington Darkholme
date: 2023-05-17
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Migrating Bevy can be easier with (semi-)automation
  - - meta
    - property: og:url
      content: https://ast-grep.github.io/blog/migrate-bevy.html
  - - meta
    - property: og:description
      content: In this article, we will show you how to make migration easier by using some command line tools.
---

# Migrating Bevy can be easier with (semi-)automation

Using open source software can be a double-edged sword: We enjoy the latest features and innovations, but we hate frequent and sometimes tedious upgrades.

Bevy is a fast and flexible game engine written in Rust. It aims to provide a modern and modular architecture, notably [Entity Component System(ECS)](https://www.wikiwand.com/en/Entity_component_system), that allows developers to craft rich and interactive experiences.
However, the shiny new engine is also an evolving project that periodically introduces breaking changes in its API.
Bevy's migration guide is comprehensive, but daunting. It is sometimes overwhelmingly long because it covers many topics and scenarios.

In this article, we will show you how to make migration easier by using some command line tools such as [`git`](https://git-scm.com/), [`cargo`](https://doc.rust-lang.org/cargo/) and [`ast-grep`](https://ast-grep.github.io/). These tools can help you track the changes, search for specific patterns in your code, and automate API migration. Hope you can migrate your Bevy projects with less hassle and more confidence by following our tips.

----

We will use the utility AI library [big-brain](https://github.com/zkat/big-brain), the second most starred Bevy project on GitHub, as an example to illustrate bumping Bevy version from 0.9 to 0.10.
Upgrading consists of four big steps: **make a clean git branch**, **updating the dependencies**, **running fix commands**, and **fixing failing tests**. And here is a list of commands used in the migration.

* `git`: Manage code history, keep code snapshot, and help you revert changes if needed.
* `cargo check`: Quickly check code for errors and warnings without building it.
* `ast-grep`: Search for ASTs in source and automate code rewrite using patterns or expressions.
* `cargo fmt`: Format the rewritten code according to Rust style guidelines.
* `cargo test`: Run tests in the project and report the results to ensure the program still works.

## Preparation

Before we start, we need to make sure that we have the following tools installed: [Rust](https://rustup.rs/), [git](https://git-scm.com/) and [ast-grep](https://ast-grep.github.io/).

Compared to the other two tools, ast-grep is lesser-known. In short it can do search and replace based on [abstract syntax trees](https://www.wikiwand.com/en/Abstract_syntax_tree). You can install it via [`cargo`](https://crates.io/crates/ast-grep) or [`brew`](https://formulae.brew.sh/formula/ast-grep).

```shell
# install the binary `ast-grep`
cargo install ast-grep
# or use brew
brew install ast-grep
```

### Clone

The first step is to clone your repository to your local machine. You can use the following command to clone the big-brain project:

```sh
git clone git@github.com:HerringtonDarkholme/big-brain.git
```

Note that the big-brain project is not the official repository of the game, but a fork that has not updated its dependencies yet. We use this fork for illustration purposes only.

### Check out a new branch

Next, you need to create a new branch for the migration. This will allow you to keep track of your changes and revert them if something goes wrong. You can use the following command to create and switch to a new branch called `upgrade-bevy`:

```sh
git checkout -b upgrade-bevy
```

> Key take away: make sure you have a clean git history and create a new branch for upgrading.

## Update Dependency

Now it's time for us to kick off the real migration! First big step is to update dependencies. It can be a little bit tricker than you think because of transitive dependencies.

### Update dependencies

Let's change the dependency file `Cargo.toml`. Luckily big-brain has clean dependencies.

Here is the diff:
```diff
diff --git a/Cargo.toml b/Cargo.toml
index c495381..9e99a3b 100644
--- a/Cargo.toml
+++ b/Cargo.toml
@@ -14,11 +14,11 @@ homepage = "https://github.com/zkat/big-brain"
 [workspace]

 [dependencies]
-bevy = { version = "0.9.0", default-features = false }
+bevy = { version = "0.10.0", default-features = false }
 big-brain-derive = { version = "=0.16.0", path = "./derive" }

 [dev-dependencies]
-bevy = { version = "0.9.0", default-features = true }
+bevy = { version = "0.10.0", default-features = true }
 rand = { version = "0.8.5", features = ["small_rng"] }

 [features]
```

### Update lock-file

After you have updated your dependencies, you need to build a new lock-file that reflects the changes. You can do this by running the following command:
```bash
cargo check
```

This will check your code for errors and generate a new Cargo.lock file that contains the exact versions of your dependencies.

### Check Cargo.lock, return to step 3 if necessary

You should inspect your Cargo.lock file to make sure that all your dependencies are compatible and use the same version of Bevy. Bevy is [more a bazaar than a cathedral](https://www.wikiwand.com/en/The_Cathedral_and_the_Bazaar). You may install third-party plugins and extensions from the ecosystem besides the core library. This means that some of these crates may not be updated or compatible with the latest version of Bevy or may have different dependencies themselves, causing errors or unexpected behavior in your code.
If you find any inconsistencies, you can go back to step 3 and modify your dependencies accordingly. Repeat this process until your Cargo.lock file is clean and consistent.

A tip here is to search `bevy 0.9` in the lock file. `Cargo.lock` will list library with different version numbers.

Fortunately, Bevy is the only dependency in big-brain. So we are good to go now!

> Key take away: take advantage of Cargo.lock to find transitive dependencies that need updating.

## (Semi-)Automate Migration

### `cargo check` and `ast-grep --rewrite`

We will use compiler to spot breaking changes and use AST rewrite tool to repeatedly fix these issues.
This is a semi-automated process because we need to manually check the results and fix the remaining errors.

The mantra here is to use automation that maximize your productivity. Write codemod that is straightforward to you and fix remaining issues by hand.

1. `CoreSet`

The first error is quite easy. The compiler outputs the following error.

```shell
error[E0432]: unresolved import `CoreStage`
   --> src/lib.rs:226:13
    |
226 |         use CoreStage::*;
    |             ^^^^^^^^^ use of undeclared type `CoreStage`
```
From [migration guide](https://bevyengine.org/learn/migration-guides/0.9-0.10/):

> The `CoreStage` (... more omitted) enums have been replaced with `CoreSet` (... more omitted). The same scheduling guarantees have been preserved.

So we just need to change the import name. [Using ast-grep is trivial here](https://ast-grep.github.io/guide/introduction.html#introduction).
We need to provide a pattern, `-p`, for it to search as well as a rewrite string, `-r` to replace the old API with the new one. The command should be quite self-explanatory.

```
ast-grep -p 'CoreStage' -r CoreSet -i
```

We suggest to add `-i` flag for `--interactive` editing. ast-grep will display the changed code diff and ask your decision to accept or not.

```diff
--- a/src/lib.rs
+++ b/src/lib.rs
@@ -223,7 +223,7 @@ pub struct BigBrainPlugin;

 impl Plugin for BigBrainPlugin {
     fn build(&self, app: &mut App) {
-        use CoreStage::*;
+        use CoreSet::*;
```


2. `StageLabel`

Our next error is also easy-peasy.

```
error: cannot find derive macro `StageLabel` in this scope
   --> src/lib.rs:269:45
    |
269 | #[derive(Clone, Debug, Hash, Eq, PartialEq, StageLabel, Reflect)]
    |
```

The [doc](https://bevyengine.org/learn/migration-guides/0.9-0.10/#label-types):
> System labels have been renamed to systems sets and unified with stage labels. The `StageLabel` trait should be replaced by a system set, using the `SystemSet` trait as dicussed immediately below.

The command:
```bash
ast-grep -p 'StageLabel' -r SystemSet -i
```

3. `SystemStage`

The next error is much harder. First, the error complains two breaking changes.

```
error[E0599]: no method named `add_stage_after` found for mutable reference `&mut bevy::prelude::App` in the current scope
   --> src/lib.rs:228:13
    |                                                            ↓↓↓↓↓↓↓↓↓↓↓ use of undeclared type `SystemStage`
228 |         app.add_stage_after(First, BigBrainStage::Scorers, SystemStage::parallel());
    |             ^^^^^^^^^^^^^^^ help: there is a method with a similar name: `add_state`
```

Let's see what [migration guide](https://bevyengine.org/learn/migration-guides/0.9-0.10/#stages) said. This time we will give the code example.

```
// before
app.add_stage_after(CoreStage::Update, AfterUpdate, SystemStage::parallel());

// after
app.configure_set(
    AfterUpdate
        .after(CoreSet::UpdateFlush)
        .before(CoreSet::PostUpdate),
);
```

`add_stage_after` is removed and `SystemStage` is renamed. We should use `configure_set` and `before`/`after` methods.

Let's write a command for this code migration.

```bash
ast-grep \
  -p '$APP.add_stage_after($STAGE, $OWN_STAGE, SystemStage::parallel())' \
  -r '$APP.configure_set($OWN_STAGE.after($STAGE))' -i
```

This pattern deserves some explanation.

`$STAGE` and `$OWN_STAGE` are [meta-variables](https://ast-grep.github.io/guide/pattern-syntax.html#meta-variable).

meta-variable is a wildcard expression that can match any single AST node. So we effectively find all `add_stage_after` call. We can also use meta-variables in the rewrite string and ast-grep will replace them with the captured AST nodes. ast-grep's meta-variables are very similar to regular expression's dot `.`, except they are not textual.

However, I found some `add_stage_after`s are not replaced. Nah, ast-grep is [quite dumb](https://github.com/ast-grep/ast-grep/issues/374) that it cannot handle the optional comma after the last argument. So I used another query with a trailing comma.

```shell
ast-grep \
  -p 'app.add_stage_after($STAGE, $OWN_STAGE, SystemStage::parallel(),)' \
  -r 'app.configure_set($OWN_STAGE.after($STAGE))' -i
```

Cool! Now it replaced all `add_stage_after` calls!

```diff
--- a/src/lib.rs
+++ b/src/lib.rs
@@ -225,7 +225,7 @@ impl Plugin for BigBrainPlugin {
-        app.add_stage_after(First, BigBrainStage::Scorers, SystemStage::parallel());
+        app.configure_set(BigBrainStage::Scorers.after(First));
@@ -245,7 +245,7 @@ impl Plugin for BigBrainPlugin {
-        app.add_stage_after(PreUpdate, BigBrainStage::Actions, SystemStage::parallel());
+        app.configure_set(BigBrainStage::Actions.after(PreUpdate));
@@ -253,7 +253,7 @@ impl Plugin for BigBrainPlugin {
-        app.add_stage_after(Last, BigBrainStage::Cleanup, SystemStage::parallel());
+        app.configure_set(BigBrainStage::Cleanup.after(Last));
```

4. `Stage`

Our next error is about [`add_system_to_stage`](https://bevyengine.org/learn/migration-guides/0.9-0.10/#stages). The migration guide told us:


```rust
// Before:
app.add_system_to_stage(CoreStage::PostUpdate, my_system)
// After:
app.add_system(my_system.in_base_set(CoreSet::PostUpdate))
```

Let's also write a pattern for it.

```sh
ast-grep \
  -p '$APP.add_system_to_stage($STAGE, $SYS)' \
  -r '$APP.add_system($SYS.in_base_set($STAGE))' -i
```

Example diff:

```diff
--- a/src/lib.rs
+++ b/src/lib.rs
@@ -243,7 +243,7 @@ impl Plugin for BigBrainPlugin {
-        app.add_system_to_stage(BigBrainStage::Thinkers, thinker::thinker_system);
+        app.add_system(thinker::thinker_system.in_base_set(BigBrainStage::Thinkers));
```

5. `system_sets`

The next error corresponds to the system_sets in [migration guide](https://bevyengine.org/learn/migration-guides/0.9-0.10/#system-sets-bevy-0-9).

```
// Before:
app.add_system_set(
  SystemSet::new()
    .with_system(a)
    .with_system(b)
    .with_run_criteria(my_run_criteria)
);
// After:
app.add_systems((a, b).run_if(my_run_condition));
```

We need to change `SystemSet::new().with_system(a).with_system(b)` to `(a, b)`.
Alas, I don't know how to write a pattern to fix that. Maybe ast-grep is not strong enough to support this. I just change `with_system` manually.
_It is still faster than me scratching my head about how to automate everything._

Another change is to use `add_systems` instead of `add_system_set`. This is a simple pattern!

```sh
ast-grep \
  -p '$APP.add_system_set_to_stage($STAGE, $SYS,)' \
  -r '$APP.add_systems($SYS.in_set($STAGE))' -i
```

This should fix `system_sets`!

6. Last error

Our last error is about `in_base_set`'s type.

```shell
error[E0277]: the trait bound `BigBrainStage: BaseSystemSet` is not satisfied
   --> src/lib.rs:238:60
    |
238 |         app.add_system(thinker::thinker_system.in_base_set(BigBrainStage::Thinkers));
    |                                                ----------- ^^^^^^^^^^^^^^^^^^^^^^^ the trait `BaseSystemSet` is not implemented for `BigBrainStage`
    |                                                |
    |                                                required by a bound introduced by this call
    |
    = help: the following other types implement trait `BaseSystemSet`:
              StartupSet
              bevy::prelude::CoreSet
note: required by a bound in `bevy::prelude::IntoSystemConfig::in_base_set`
```

Okay, `BigBrainStage::Thinkers` is not a base set in Bevy, so we should change it to `in_set`.

```diff
-        .add_system(one_off_action_system.in_base_set(BigBrainStage::Actions))
+        .add_system(one_off_action_system.in_set(BigBrainStage::Actions))
```

**Hoooray! Finally the program compiles! ~~ship it!~~ Now let's test it.**


> Key take away: Automation saves your time! But you don't have to automate everything.

## cargo fmt
Congrats! You have automated code refactoring! But ast-grep's rewrite can be messy and hard to read. Most code-rewriting tool does not support pretty-print, sadly.
A simple solution is to run `cargo fmt` and make the repository neat and tidy.

```
cargo fmt
```

A good practice is to run this command every time after a code rewrite.

> Key take away: Format code rewrite as much as you want.

## Test Our Refactor

### `cargo test`

Let's use Rust's standard test command to verify our changes: `cargo test`.

Oops. we have one test error, not too bad!

```
running 1 test
test steps ... FAILED

failures:

---- steps stdout ----
steps test
thread 'steps' panicked at '`"Update"` and `"Cleanup"` have a `before`-`after` relationship (which may be transitive) but share systems.'
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

Okay, it complains that `Update` and `Cleanup` have a conflicting running order. This is probably caused by `configure_set`.

I should have caught the bug during diff review but I missed that. It is not too late to change it manually.

```diff
--- a/src/lib.rs
+++ b/src/lib.rs
@@ -225,7 +225,7 @@ impl Plugin for BigBrainPlugin {
-        app.configure_set(BigBrainStage::Scorers.after(First));
+        app.configure_set(BigBrainStage::Scorers.in_base_set(First));
@@ -242,12 +242,12 @@ impl Plugin for BigBrainPlugin {
-        app.configure_set(BigBrainStage::Actions.after(PreUpdate));
+        app.configure_set(BigBrainStage::Actions.in_base_set(PreUpdate));
```

Run `cargo test` again?

```

   Doc-tests big-brain

failures:

---- src/lib.rs - (line 127) stdout ----
error[E0599]:
  no method named `add_system_to_stage` found for mutable reference
    `&mut bevy::prelude::App`
  in the current scope
```

We failed doc-test!

Because our ast based tool does not process comments. Lame. :(
We need manually fix them.

```
--- a/src/lib.rs
+++ b/src/lib.rs
@@ -137,8 +137,8 @@
-//!         .add_system_to_stage(BigBrainStage::Actions, drink_action_system)
-//!         .add_system_to_stage(BigBrainStage::Scorers, thirsty_scorer_system)
+//!         .add_system(drink_action_system.in_set(BigBrainStage::Actions))
+//!         .add_system(thirsty_scorer_system.in_set(BigBrainStage::Scorers))
```

**Finally we passed all tests!**

```
test result: ok. 21 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 4.68s
```

## Conclusion

Now we can commit and push our version upgrade to the upstream. It is not a too long battle, is it?

I have created a pull request for reference. https://github.com/HerringtonDarkholme/big-brain/pull/1/files

Reading a long migration guide is not easy, and fixing compiler errors is even harder.

It would be nice if the official guide can contain some automated command to ease the burden. For example, [yew.rs](https://yew.rs/docs/next/migration-guides/yew/from-0_20_0-to-next) did a great job by providing automation in every release note!

To recap our semi-automated refactoring, this is our four steps:

* Keep a clean git branch for upgrading
* Update all dependencies in the project and check lock files.
* Compile, Rewrite, Verify and Format. Repeat this process until the project compiles.
* Run Test and fix the remaining bugs.

I hope this workflow will help you and other programming language developers in the future!
