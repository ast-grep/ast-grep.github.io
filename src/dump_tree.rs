use serde::{Deserialize, Serialize};
use crate::wasm_lang::{WasmDoc, WasmLang};
use ast_grep_core::{
  matcher::PatternNode, AstGrep, Language, Node, Pattern
};
use wasm_bindgen::prelude::JsError;
use web_tree_sitter_sg::{Point, TreeCursor};

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

impl From<Point> for Pos {
  fn from(point: Point) -> Self {
    Self {
      row: point.row(),
      column: point.column(),
    }
  }
}

pub fn dump_one_node(cursor: &mut TreeCursor, target: &mut Vec<DumpNode>) {
  let node = cursor.current_node();
  let kind = if node.is_missing() {
    format!("MISSING {}", node.type_())
  } else {
    format!("{}", node.type_())
  };
  let start = node.start_position().into();
  let end = node.end_position().into();
  let field = cursor.current_field_name().map(|c| format!("{}", c));
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

fn dump_nodes(cursor: &mut TreeCursor, target: &mut Vec<DumpNode>) {
  loop {
    dump_one_node(cursor, target);
    if !cursor.goto_next_sibling() {
      break;
    }
  }
}

pub fn dump_pattern(query: String, selector: Option<String>) -> Result<PatternTree, JsError> {
  let lang = WasmLang::get_current();
  let processed = lang.pre_process_pattern(&query);
  let doc = WasmDoc::try_new(processed.to_string(), lang)?;
  let root = AstGrep::doc(doc);
  let pattern = if let Some(sel) = selector {
    Pattern::contextual(&query, &sel, lang)?
  } else {
    Pattern::try_new(&query, lang)?
  };
  let found = root.root().find(&pattern).ok_or_else(|| JsError::new("pattern node not found"))?;
  let ret = dump_pattern_tree(root.root(), found.node_id(), &pattern.node);
  Ok(ret)
}

fn dump_pattern_tree(node: Node<WasmDoc>, node_id: usize, pattern: &PatternNode) -> PatternTree {
  if node.node_id() == node_id {
    return dump_pattern_impl(node, pattern)
  }
  let children: Vec<_> = node.children().map(|n| dump_pattern_tree(n, node_id, pattern)).collect();
  let ts = node.get_inner_node().0;
  let text = if children.is_empty() {
    Some(node.text().into())
  } else {
    None
  };
  let kind =  if ts.is_missing() {
    format!("MISSING {}", node.kind())
  } else {
    node.kind().to_string()
  };
  PatternTree {
    kind,
    start: ts.start_position().into(),
    end: ts.end_position().into(),
    is_named: node.is_named(),
    children,
    text,
    pattern: None,
  }
}

fn dump_pattern_impl(node: Node<WasmDoc>, pattern: &PatternNode) -> PatternTree {
  use PatternNode as PN;
  let ts = node.get_inner_node().0;
  let kind =  if ts.is_missing() {
    format!("MISSING {}", node.kind())
  } else {
    node.kind().to_string()
  };
  match pattern {
    PN::MetaVar { .. } => {
      let lang = node.lang();
      let expando = lang.expando_char();
      let text = node.text().to_string();
      let text = text.replace(expando, "$");
      PatternTree {
        kind,
        start: ts.start_position().into(),
        end: ts.end_position().into(),
        is_named: true,
        children: vec![],
        text: Some(text),
        pattern: Some(PatternKind::MetaVar),
      }
    }
    PN::Terminal { is_named, .. } => {
      PatternTree {
        kind,
        start: ts.start_position().into(),
        end: ts.end_position().into(),
        is_named: *is_named,
        children: vec![],
        text: Some(node.text().into()),
        pattern: Some(PatternKind::Terminal),
      }
    }
    PN::Internal { children, .. } => {
      let children = children.iter().zip(node.children()).map(|(pn, n)| {
        dump_pattern_impl(n, pn)
      }).collect();
      PatternTree {
        kind,
        start: ts.start_position().into(),
        end: ts.end_position().into(),
        is_named: true,
        children,
        text: None,
        pattern: Some(PatternKind::Internal),
      }
    }
  }
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
enum PatternKind {
  Terminal,
  MetaVar,
  Internal,
}


#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PatternTree {
  kind: String,
  start: Pos,
  end: Pos,
  is_named: bool,
  children: Vec<PatternTree>,
  text: Option<String>,
  pattern: Option<PatternKind>,
}