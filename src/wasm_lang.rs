use std::str::FromStr;

use ast_grep_core::language::Language;
// use ast_grep_core::MetaVariable;
use ast_grep_language as L;
use tree_sitter as ts;
use wasm_bindgen::prelude::*;
use std::sync::Mutex;
use std::borrow::Cow;

#[derive(Clone, Copy)]
pub enum WasmLang {
  JavaScript,
  TypeScript,
  // not so well supported lang...
  Bash,
  C,
  CSharp,
  Cpp,
  Go,
  Html,
  Java,
  Php,
  Python,
  Ruby,
  Rust,
  Toml,
  Yaml,
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
      "bash" => Bash,
      "c" => C,
      "csharp" => CSharp,
      "cpp" => Cpp,
      "go" => Go,
      "html" => Html,
      "java" => Java,
      "php" => Php,
      "python" => Python,
      "ruby" => Ruby,
      "rust" => Rust,
      "toml" => Toml,
      "yaml" => Yaml,
      _ => return Err(NotSupport(s.to_string()))
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

#[derive(Clone)]
struct StubLang;
impl Language for StubLang {
  fn get_ts_language(&self) -> tree_sitter::Language {
    unreachable!("stub should not be called for get_ts_language")
  }
}

macro_rules! execute_lang_method {
  ($me: path, $method: ident, $($pname:tt),*) => {
    use WasmLang as W;
    match $me {
      W::C => L::C.$method($($pname,)*),
      W::CSharp => L::CSharp.$method($($pname,)*),
      W::Go => L::Go.$method($($pname,)*),
      W::Html => L::Html.$method($($pname,)*),
      W::Java => L::Java.$method($($pname,)*),
      W::JavaScript => L::JavaScript.$method($($pname,)*),
      W::Python => L::Python.$method($($pname,)*),
      W::Rust => L::Rust.$method($($pname,)*),
      W::TypeScript => L::TypeScript.$method($($pname,)*),
      _ => StubLang.$method($($pname,)*),
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
  // impl_lang_method!(extract_meta_var, (source: &str) => Option<MetaVariable>);
  // impl_lang_method!(expando_char, () => char);

  // fn pre_process_pattern<'q>(&self, query: &'q str) -> Cow<'q, str> {
  //   execute_lang_method! { self, pre_process_pattern, query }
  // }

  // TODO revert this ascii hack
  // expando char can only be ascii for web tree_sitter due to
  // incompatible text encoding between Rust and DOMString
  fn expando_char(&self) -> char {
    'x'
  }
  fn pre_process_pattern<'q>(&self, query: &'q str) -> Cow<'q, str> {
    // use stack buffer to reduce allocation
    let mut buf = [0; 4];
    let expando = self.expando_char().encode_utf8(&mut buf);
    // TODO: use more precise replacement
    let replaced = query.replace(self.meta_var_char(), expando);
    Cow::Owned(replaced)
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
