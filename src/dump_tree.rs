use serde::{Deserialize, Serialize};
use tree_sitter as ts;
use crate::wasm_lang::WasmLang;
use ast_grep_core::{
  Language, Pattern, Node, StrDoc,
  matcher::PatternNode
};

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DumpNode {
  field: Option<String>,
  kind: String,
  start: Pos,
  end: Pos,
  is_named: bool,
  children: Vec<DumpNode>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Pos {
  row: u32,
  column: u32,
}

impl From<ts::Point> for Pos {
  #[inline]
  fn from(pt: ts::Point) -> Self {
    Pos {
      row: pt.row(),
      column: pt.column(),
    }
  }
}

pub fn dump_one_node(cursor: &mut ts::TreeCursor, target: &mut Vec<DumpNode>) {
  let node = cursor.node();
  let kind = if node.is_missing() {
    format!("MISSING {}", node.kind())
  } else {
    node.kind().to_string()
  };
  let start = node.start_position().into();
  let end = node.end_position().into();
  let field = cursor.field_name().map(|c| c.to_string());
  let mut children = vec![];
  if cursor.goto_first_child() {
    dump_nodes(cursor, &mut children);
    cursor.goto_parent();
  }
  target.push(DumpNode {
    field,
    kind,
    start,
    end,
    children,
    is_named: node.is_named(),
  })
}

fn dump_nodes(cursor: &mut ts::TreeCursor, target: &mut Vec<DumpNode>) {
  loop {
    dump_one_node(cursor, target);
    if !cursor.goto_next_sibling() {
      break;
    }
  }
}

pub fn dump_pattern(query: String, selector: Option<String>) -> DumpPattern {
  let lang = WasmLang::get_current();
  let processed = lang.pre_process_pattern(&query);
  let root = lang.ast_grep(processed);
  let pattern = if let Some(sel) = selector {
    Pattern::contextual(&query, &sel, lang).expect("TODO")
  } else {
    Pattern::new(&query, lang)
  };
  let found = root.root().find(&pattern).expect("FOUND");
  dump_pattern_impl(pattern.node, found.into())
}

fn dump_pattern_impl(pattern: PatternNode, node: Node<StrDoc<WasmLang>>) -> DumpPattern {
  use PatternNode as PN;
  let ts = node.get_ts_node();
  match pattern {
    PN::MetaVar { meta_var: _ } => {
      DumpPattern {
        kind: None,
        meta_var: Some(node.text().into()),
        start: ts.start_position().into(),
        end: ts.end_position().into(),
        is_named: true,
        children: vec![],
      }
    }
    PN::Terminal { is_named, .. } => {
      DumpPattern {
        kind: Some(node.kind().into()),
        meta_var: None,
        start: ts.start_position().into(),
        end: ts.end_position().into(),
        is_named,
        children: vec![],
      }
    }
    PN::Internal { children, .. } => {
      DumpPattern {
        kind: Some(node.kind().into()),
        meta_var: None,
        start: ts.start_position().into(),
        end: ts.end_position().into(),
        is_named: node.is_named(),
        children: children.into_iter().zip(node.children()).map(|(pn, n)| {
          dump_pattern_impl(pn, n)
        }).collect(),
      }
    }
  }
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DumpPattern {
  kind: Option<String>,
  meta_var: Option<String>,
  start: Pos,
  end: Pos,
  is_named: bool,
  children: Vec<DumpPattern>,
}