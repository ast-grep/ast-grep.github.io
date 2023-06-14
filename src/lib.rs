mod dump_tree;
mod utils;
mod wasm_lang;

use wasm_lang::{WasmDoc, WasmLang};

use ast_grep_config::{RuleWithConstraint, SerializableRuleCore};
use ast_grep_core::language::Language;
use ast_grep_core::replacer::Fixer;
use ast_grep_core::{AstGrep, Node as SgNode};
use dump_tree::{dump_one_node, DumpNode};
use utils::WasmMatch;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use serde_wasm_bindgen::from_value as from_js_val;
use std::convert::TryFrom;
use tree_sitter as ts;
use wasm_bindgen::prelude::*;

type Node<'a> = SgNode<'a, WasmDoc>;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Serialize, Deserialize)]
pub struct WASMConfig {
  rule: Value,
  fix: Option<String>,
  constraints: Option<Value>,
  utils: Option<Value>,
}

impl TryFrom<JsValue> for WASMConfig {
  type Error = JsError;
  fn try_from(value: JsValue) -> Result<Self, Self::Error> {
    Ok(from_js_val(value)?)
  }
}

impl WASMConfig {
  fn into_matcher(self, lang: WasmLang) -> Result<RuleWithConstraint<WasmLang>, JsError> {
    let config = SerializableRuleCore {
      language: lang,
      rule: serde_json::from_value(self.rule)?,
      constraints: self.constraints.map(serde_json::from_value).transpose()?,
      utils: self.utils.map(serde_json::from_value).transpose()?,
    };
    Ok(config.get_matcher(&Default::default())?)
  }
}

#[wasm_bindgen(js_name = initializeTreeSitter)]
pub async fn initialize_tree_sitter() -> Result<(), JsError> {
  ts::TreeSitter::init().await
}

#[wasm_bindgen(js_name = setupParser)]
pub async fn setup_parser(lang_name: String, parser_path: String) -> Result<(), JsError> {
  WasmLang::set_current(&lang_name, &parser_path).await
}

#[wasm_bindgen(js_name = findNodes)]
pub fn find_nodes(src: String, config: JsValue) -> Result<JsValue, JsError> {
  let lang = WasmLang::get_current();
  let config = WASMConfig::try_from(config)?;
  let finder = config.into_matcher(lang)?;
  let root = lang.ast_grep(src);
  let ret: Vec<_> = root.root().find_all(finder).map(WasmMatch::from).collect();
  let ret = serde_wasm_bindgen::to_value(&ret)?;
  Ok(ret)
}

#[wasm_bindgen(js_name = fixErrors)]
pub fn fix_errors(src: String, config: JsValue) -> Result<String, JsError> {
  let lang = WasmLang::get_current();
  let mut config = WASMConfig::try_from(config)?;
  let fixer = config
    .fix
    .take()
    .expect_throw("fix is required for rewriting");
  let fixer = Fixer::try_new(&fixer, &lang)?;
  let doc = WasmDoc::new(src.clone(), lang);
  let root = AstGrep::doc(doc);
  let finder = config.into_matcher(lang)?;
  let edits: Vec<_> = root.root().replace_all(finder, fixer);
  let mut new_content = Vec::<char>::new();
  let mut start = 0;
  let src: Vec<_> = src.chars().collect();
  for edit in edits {
    new_content.extend(&src[start..edit.position]);
    new_content.extend(&edit.inserted_text);
    start = edit.position + edit.deleted_length;
  }
  // add trailing statements
  new_content.extend(&src[start..]);
  Ok(new_content.into_iter().collect())
}

fn convert_to_debug_node(n: Node) -> DumpNode {
  let mut cursor = n.get_ts_node().walk();
  let mut target = vec![];
  dump_one_node(&mut cursor, &mut target);
  target.pop().expect_throw("found empty node")
}

#[wasm_bindgen(js_name = dumpASTNodes)]
pub fn dump_ast_nodes(src: String) -> Result<JsValue, JsError> {
  let lang = WasmLang::get_current();
  let doc = WasmDoc::new(src, lang);
  let root = AstGrep::doc(doc);
  let debug_node = convert_to_debug_node(root.root());
  let ret = serde_wasm_bindgen::to_value(&debug_node)?;
  Ok(ret)
}

#[wasm_bindgen(js_name = preProcessPattern)]
pub fn pre_process_pattern(query: String) -> Result<String, JsError> {
  let lang = WasmLang::get_current();
  Ok(lang.pre_process_pattern(&query).into())
}
