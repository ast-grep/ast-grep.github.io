use ast_grep_core::{meta_var::MetaVarEnv, MetaVariable, Node, NodeMatch};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tree_sitter as ts;

#[cfg(feature = "console_error_panic_hook")]
pub fn set_panic_hook() {
  // When the `console_error_panic_hook` feature is enabled, we can call the
  // `set_panic_hook` function at least once during initialization, and then
  // we will get better error messages if our code ever panics.
  //
  // For more details see
  // https://github.com/rustwasm/console_error_panic_hook#readme
  console_error_panic_hook::set_once();
}

#[derive(Serialize, Deserialize)]
pub struct WASMNode {
  pub text: String,
  pub range: (usize, usize, usize, usize),
}

#[derive(Serialize, Deserialize)]
pub struct WASMMatch {
  pub node: WASMNode,
  pub env: BTreeMap<String, WASMNode>,
}

impl From<NodeMatch<'_, ts::Language>> for WASMMatch {
  fn from(nm: NodeMatch<ts::Language>) -> Self {
    let node = nm.get_node().clone();
    let node = WASMNode::from(node);
    let env = nm.get_env().clone();
    let env = env_to_hash_map(env);
    Self { node, env }
  }
}

fn env_to_hash_map(env: MetaVarEnv<'_, ts::Language>) -> BTreeMap<String, WASMNode> {
  let mut map = BTreeMap::new();
  for id in env.get_matched_variables() {
    match id {
      MetaVariable::Named(name) => {
        let node = env.get_match(&name).expect("must exist").clone();
        map.insert(name, WASMNode::from(node));
      }
      MetaVariable::NamedEllipsis(name) => {
        let nodes = env.get_multiple_matches(&name);
        let (Some(first), Some(last)) = (nodes.first(), nodes.last()) else {
          continue
        };
        let start = first.start_pos();
        let end = last.end_pos();

        let text = nodes.iter().map(|n| n.text()).collect();
        let node = WASMNode {
          text,
          range: (start.0, start.1, end.0, end.1),
        };
        map.insert(name, node);
      }
      // ignore anonymous
      _ => continue,
    }
  }
  map
}

impl From<Node<'_, ts::Language>> for WASMNode {
  fn from(nm: Node<ts::Language>) -> Self {
    let start = nm.start_pos();
    let end = nm.end_pos();
    Self {
      text: nm.text().to_string(),
      range: (start.0, start.1, end.0, end.1),
    }
  }
}
