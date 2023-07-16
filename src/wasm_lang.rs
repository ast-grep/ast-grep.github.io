use std::str::FromStr;

use ast_grep_core::language::Language;
use ast_grep_core::meta_var::MetaVariable;
use ast_grep_core::replacer::IndentSensitive;
use ast_grep_core::source::{Content, Doc, Edit, TSParseError};
use ast_grep_language as L;
use std::borrow::Cow;
use std::ops::Range;
use std::sync::Mutex;
use tree_sitter as ts;
use tree_sitter::{InputEdit, Node, Parser, ParserError, Point, Tree};
use wasm_bindgen::prelude::*;

#[derive(Clone, Copy)]
pub enum WasmLang {
  JavaScript,
  TypeScript,
  Tsx,
  // not so well supported lang...
  C,
  CSharp,
  Cpp,
  Dart,
  Go,
  Html,
  Java,
  Python,
  Ruby,
  Rust,
  Scala,
}

use WasmLang::*;

#[derive(Debug)]
pub struct NotSupport(String);

impl std::error::Error for NotSupport {}

impl std::fmt::Display for NotSupport {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "Language {} is not supported.", self.0)
  }
}

impl FromStr for WasmLang {
  type Err = NotSupport;
  fn from_str(s: &str) -> Result<Self, Self::Err> {
    Ok(match s {
      "javascript" => JavaScript,
      "typescript" => TypeScript,
      "tsx" => Tsx,
      "c" => C,
      "csharp" => CSharp,
      "cpp" => Cpp,
      "dart" => Dart,
      "go" => Go,
      "html" => Html,
      "java" => Java,
      "python" => Python,
      "ruby" => Ruby,
      "rust" => Rust,
      "scala" => Scala,
      _ => return Err(NotSupport(s.to_string())),
    })
  }
}

static TS_LANG: Mutex<Option<ts::Language>> = Mutex::new(None);
static LANG: Mutex<WasmLang> = Mutex::new(JavaScript);

impl WasmLang {
  pub async fn set_current(lang: &str, parser_path: &str) -> Result<(), JsError> {
    let lang = WasmLang::from_str(lang)?;
    let mut curr_lang = LANG.lock().expect_throw("set language error");
    *curr_lang = lang;
    setup_parser(parser_path).await?;
    Ok(())
  }

  pub fn get_current() -> Self {
    *LANG.lock().expect_throw("get language error")
  }
}

async fn setup_parser(parser_path: &str) -> Result<(), JsError> {
  let mut parser = ts::Parser::new()?;
  let lang = get_lang(parser_path).await?;
  parser.set_language(&lang)?;
  let mut curr_lang = TS_LANG.lock().expect_throw("set language error");
  *curr_lang = Some(lang);
  Ok(())
}

#[cfg(target_arch = "wasm32")]
async fn get_lang(parser_path: &str) -> Result<ts::Language, JsError> {
  let lang = web_tree_sitter_sg::Language::load_path(parser_path)
    .await
    .map_err(ts::LanguageError::from)?;
  Ok(ts::Language::from(lang))
}

#[cfg(not(target_arch = "wasm32"))]
async fn get_lang(_path: &str) -> Result<ts::Language, JsError> {
  unreachable!()
}

macro_rules! execute_lang_method {
  ($me: path, $method: ident, $($pname:tt),*) => {
    use WasmLang as W;
    match $me {
      W::C => L::C.$method($($pname,)*),
      W::Cpp => L::Cpp.$method($($pname,)*),
      W::CSharp => L::CSharp.$method($($pname,)*),
      W::Dart => L::Dart.$method($($pname,)*),
      W::Go => L::Go.$method($($pname,)*),
      W::Html => L::Html.$method($($pname,)*),
      W::Java => L::Java.$method($($pname,)*),
      W::JavaScript => L::JavaScript.$method($($pname,)*),
      W::Python => L::Python.$method($($pname,)*),
      W::Ruby => L::Ruby.$method($($pname,)*),
      W::Rust => L::Rust.$method($($pname,)*),
      W::Scala => L::Scala.$method($($pname,)*),
      W::TypeScript => L::TypeScript.$method($($pname,)*),
      W::Tsx => L::Tsx.$method($($pname,)*),
    }
  }
}

macro_rules! impl_lang_method {
  ($method: ident, ($($pname:tt: $ptype:ty),*) => $return_type: ty) => {
    #[inline]
    fn $method(&self, $($pname: $ptype),*) -> $return_type {
      execute_lang_method!{ self, $method, $($pname),* }
    }
  };
}

impl Language for WasmLang {
  fn get_ts_language(&self) -> ts::Language {
    TS_LANG
      .lock()
      .expect_throw("get language error")
      .clone()
      .expect_throw("current language is not set")
  }

  impl_lang_method!(meta_var_char, () => char);
  impl_lang_method!(extract_meta_var, (source: &str) => Option<MetaVariable>);
  impl_lang_method!(expando_char, () => char);

  fn pre_process_pattern<'q>(&self, query: &'q str) -> Cow<'q, str> {
    execute_lang_method! { self, pre_process_pattern, query }
  }
}

#[derive(Clone)]
pub struct Wrapper {
  inner: Vec<char>,
}

impl Content for Wrapper {
  type Underlying = char;
  fn parse_tree_sitter(
    &self,
    parser: &mut Parser,
    tree: Option<&Tree>,
  ) -> std::result::Result<Option<Tree>, ParserError> {
    let s: String = self.inner.iter().cloned().collect();
    parser.parse(&s, tree)
  }
  fn accept_edit(&mut self, edit: &Edit<Self>) -> InputEdit {
    let start_byte = edit.position;
    let old_end_byte = edit.position + edit.deleted_length;
    let new_end_byte = edit.position + edit.inserted_text.len();
    let mut input = self.inner.to_vec();
    let start_position = pos_for_char_offset(&input, start_byte);
    let old_end_position = pos_for_char_offset(&input, old_end_byte);
    input.splice(start_byte..old_end_byte, edit.inserted_text.clone());
    let new_end_position = pos_for_char_offset(&input, new_end_byte);
    InputEdit::new(
      start_byte as u32,
      old_end_byte as u32,
      new_end_byte as u32,
      &start_position,
      &old_end_position,
      &new_end_position,
    )
  }
  fn get_text<'a>(&'a self, node: &Node) -> Cow<'a, str> {
    // dummy for wasm tree!
    node.utf8_text(&[]).expect("get_text should work")
  }
  fn get_range(&self, range: Range<usize>) -> &[char] {
    &self.inner[range]
  }
  fn decode_str(src: &str) -> Cow<[Self::Underlying]> {
    Cow::Owned(src.chars().collect())
  }
  fn encode_bytes(bytes: &[Self::Underlying]) -> Cow<str> {
    Cow::Owned(bytes.iter().collect())
  }
}

impl IndentSensitive for Wrapper {
  const TAB: Self::Underlying = '\t';
  const SPACE: Self::Underlying = ' ';
  const NEW_LINE: Self::Underlying = '\n';
}

fn pos_for_char_offset(input: &[char], offset: usize) -> Point {
  debug_assert!(offset <= input.len());
  let (mut row, mut col) = (0, 0);
  for &c in input.iter().take(offset) {
    if '\n' == c {
      row += 1;
      col = 0;
    } else {
      col += 1;
    }
  }
  Point::new(row, col)
}

#[derive(Clone)]
pub struct WasmDoc {
  lang: WasmLang,
  source: Wrapper,
}

impl WasmDoc {
  pub fn new(src: String, lang: WasmLang) -> Self {
    let source = Wrapper {
      inner: src.chars().collect(),
    };
    Self { source, lang }
  }
}

impl Doc for WasmDoc {
  type Lang = WasmLang;
  type Source = Wrapper;
  fn parse(&self, old_tree: Option<&Tree>) -> std::result::Result<Tree, TSParseError> {
    let mut parser = Parser::new()?;
    let ts_lang = self.lang.get_ts_language();
    parser.set_language(&ts_lang)?;
    if let Some(tree) = self.source.parse_tree_sitter(&mut parser, old_tree)? {
      Ok(tree)
    } else {
      Err(TSParseError::TreeUnavailable)
    }
  }
  fn get_lang(&self) -> &Self::Lang {
    &self.lang
  }
  fn get_source(&self) -> &Self::Source {
    &self.source
  }
  fn get_source_mut(&mut self) -> &mut Self::Source {
    &mut self.source
  }
  fn from_str(src: &str, lang: Self::Lang) -> Self {
    Self {
      lang,
      source: Wrapper {
        inner: src.chars().collect(),
      },
    }
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use tree_sitter_rust;

  // https://github.com/tree-sitter/tree-sitter-rust/issues/82
  // sadly, this does not test what tree-sitter-wasm actually does
  // wasm uses UTF16 which counts different "error cost" than utf8
  // native tree-sitter can use parse_with_utf16 :(
  #[test]
  fn test_process_pattern() {
    let mut curr_lang = TS_LANG.lock().expect_throw("set language error");
    *curr_lang = Some(tree_sitter_rust::language().into());
    drop(curr_lang);
    let grep = WasmLang::Rust.ast_grep("fn test() { Some(123) }");
    let root = grep.root();
    assert!(root.find("Some($A)").is_some());
  }
}
