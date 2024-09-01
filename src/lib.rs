mod dump_tree;
mod utils;
mod wasm_lang;

use wasm_lang::{WasmDoc, WasmLang};
use dump_tree::{dump_one_node, DumpNode, dump_pattern as dump_pattern_impl};
use utils::WasmMatch;

use ast_grep_config::{RuleConfig, SerializableRuleConfig, CombinedScan};
use ast_grep_core::language::Language;
use ast_grep_core::{AstGrep, Node as SgNode};
use serde_wasm_bindgen::from_value as from_js_val;
use std::collections::HashMap;
use std::error::Error;
use tree_sitter as ts;
use wasm_bindgen::prelude::*;

type Node<'a> = SgNode<'a, WasmDoc>;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen(js_name = initializeTreeSitter)]
pub async fn initialize_tree_sitter() -> Result<(), JsError> {
  ts::TreeSitter::init().await
}

#[wasm_bindgen(js_name = setupParser)]
pub async fn setup_parser(lang_name: String, parser_path: String) -> Result<(), JsError> {
  WasmLang::set_current(&lang_name, &parser_path).await
}

#[wasm_bindgen(js_name = findNodes)]
pub fn find_nodes(src: String, configs: Vec<JsValue>) -> Result<JsValue, JsError> {
  let lang = WasmLang::get_current();
  let mut rules = vec![];
  for config in configs {
    let finder = try_get_rule_config(config)?;
    rules.push(finder);
  }
  let combined = CombinedScan::new(rules.iter().collect());
  let root = lang.ast_grep(src);
  let sets = combined.find(&root);
  let ret: HashMap<_, _> = combined.scan(&root, sets, false).matches.into_iter().map(|(id, matches)| {
    let rule = combined.get_rule(id);
    let matches: Vec<_> = matches.into_iter().map(|m| {
      WasmMatch::from_match(m, rule)
    }).collect();
    (rule.id.clone(), matches)
  }).collect();
  let ret = serde_wasm_bindgen::to_value(&ret)?;
  Ok(ret)
}

#[wasm_bindgen(js_name = fixErrors)]
pub fn fix_errors(src: String, configs: Vec<JsValue>) -> Result<String, JsError> {
  let lang = WasmLang::get_current();
  let mut rules = vec![];
  for config in configs {
    let finder = try_get_rule_config(config)?;
    rules.push(finder);
  }
  let combined = CombinedScan::new(rules.iter().collect());
  let doc = WasmDoc::new(src.clone(), lang);
  let root = AstGrep::doc(doc);
  let sets = combined.find(&root);
  let diffs = combined.scan(&root, sets, true).diffs;
  if diffs.is_empty() {
    return Ok(src);
  }
  let mut start = 0;
  let src: Vec<_> = src.chars().collect();
  let mut new_content = Vec::<char>::new();
  for (idx, nm) in diffs {
    let range = nm.range();
    if start > range.start {
      continue;
    }
    let rule = combined.get_rule(idx);
    let fixer = rule.get_fixer()?.expect("rule returned by diff must have fixer");
    let edit = nm.make_edit(&rule.matcher, &fixer);
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

#[wasm_bindgen(js_name = dumpPattern)]
pub fn dump_pattern(src: String, selector: Option<String>) -> Result<JsValue, JsError> {
  let dumped = dump_pattern_impl(src, selector)?;
  let ret = serde_wasm_bindgen::to_value(&dumped)?;
  Ok(ret)
}

fn try_get_rule_config(config: JsValue) -> Result<RuleConfig<WasmLang>, JsError> {
  let config: SerializableRuleConfig<WasmLang> = from_js_val(config)?;
  RuleConfig::try_from(config, &Default::default()).map_err(dump_error)
}

fn dump_error(err: impl Error) -> JsError {
  let mut errors = vec![err.to_string()];
  let mut err: &dyn Error = &err;
  while let Some(e) = err.source() {
    errors.push(e.to_string());
    err = e;
  }
  JsError::new(&format!("{}", errors.join("\n")))
}