# API Usage

* While it is possible to write sophisticated ast-grep rule to match AST, programmatic usage can push the limits of ast programming further.
* Currently, ast-grep supports two programming language bindings:
  * [JavaScript](#javascript)
  * [Python](#python)
* You can also use ast-grep-core directly as a Rust library.

## Introduction to ast-grep Programmatic API Documentation

While ast-grep offers the ability to craft complicated rules, it is hard to do arbitrary AST manipulation. More specifically, you may find it hard to:
* replace a list of nodes respectively, based on their content
* conditionally replace a node based on its content and surrounding nodes
* count the number/order of nodes that match a certain pattern
* compute the replacement string based on the matched nodes

ast-grep's programmatic API is designed to solve these problems! You can do arbitrary AST manipulation in popular programming languages!

## Language Bindings

Currently, ast-grep provides seamless integration with two programming languages:

- **JavaScript:** Dive into the world of AST manipulation with the JavaScript binding. [Explore JavaScript API](#javascript)

- **Python:** Leverage the power of ast-grep through the Python binding. [Discover Python API](#python)

## Rust Library Integration

For those who prefer the robustness of Rust, ast-grep-core can be used directly as a Rust library. This option offers a direct and efficient way to incorporate ast-grep into your Rust projects.

## Getting Started

Whether you are a seasoned developer or a newcomer to AST programming, this documentation is designed to guide you through every step. From setting up your environment to advanced usage scenarios, we've got you covered.

Let's embark on a journey of unlocking the full potential of AST manipulation with ast-grep's Programmatic API!