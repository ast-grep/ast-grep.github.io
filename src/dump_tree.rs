use tree_sitter as ts;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DebugNode {
  field: Option<String>,
  kind: String,
  start: (usize, usize),
  end: (usize, usize),
  is_named: bool,
  children: Vec<DebugNode>,
}

#[inline]
fn pos_to_tuple(pos: ts::Point) -> (usize, usize) {
  (pos.row() as usize, pos.column() as usize)
}

pub fn dump_one_node(cursor: &mut ts::TreeCursor, target: &mut Vec<DebugNode>) {
  let node = cursor.node();
  let kind = if node.is_missing() {
    format!("MISSING {}", node.kind())
  } else {
    node.kind().to_string()
  };
  let start = pos_to_tuple(node.start_position());
  let end = pos_to_tuple(node.end_position());
  let field = cursor.field_name().map(|c| c.to_string());
  let mut children = vec![];
  if cursor.goto_first_child() {
    dump_nodes(cursor, &mut children);
    cursor.goto_parent();
  }
  target.push(DebugNode {
    field,
    kind,
    start,
    end,
    children,
    is_named: node.is_named(),
  })
}

fn dump_nodes(cursor: &mut ts::TreeCursor, target: &mut Vec<DebugNode>) {
  loop {
    dump_one_node(cursor, target);
    if !cursor.goto_next_sibling() {
      break
    }
  }
}
