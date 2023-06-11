use ast_grep_core::{meta_var::{MetaVarEnv, MetaVariable}, Node as SgNode, NodeMatch as SgNodeMatch, StrDoc};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use crate::wasm_lang::WasmLang;

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

type Node<'a> = SgNode<'a, StrDoc<WasmLang>>;
type NodeMatch<'a> = SgNodeMatch<'a, StrDoc<WasmLang>>;

#[derive(Serialize, Deserialize)]
pub struct WasmNode {
  pub text: String,
  pub range: (usize, usize, usize, usize),
}

#[derive(Serialize, Deserialize)]
pub struct WasmMatch {
  pub node: WasmNode,
  pub env: BTreeMap<String, WasmNode>,
}

impl From<NodeMatch<'_>> for WasmMatch {
  fn from(nm: NodeMatch) -> Self {
    let node = nm.get_node().clone();
    let node = WasmNode::from(node);
    let env = nm.get_env().clone();
    let env = env_to_map(env);
    Self { node, env }
  }
}

fn env_to_map(env: MetaVarEnv<'_, StrDoc<WasmLang>>) -> BTreeMap<String, WasmNode> {
  let mut map = BTreeMap::new();
  for id in env.get_matched_variables() {
    match id {
      MetaVariable::Named(name, _) => {
        if let Some(node) = env.get_match(&name) {
          map.insert(name, WasmNode::from(node.clone()));
        } else if let Some(bytes) = env.get_transformed(&name) {
          let node = WasmNode {
            text: String::from_utf8_lossy(bytes).to_string(),
            range: (0, 0, 0, 0),
          };
          map.insert(name, WasmNode::from(node));
        }
      }
      MetaVariable::NamedEllipsis(name) => {
        let nodes = env.get_multiple_matches(&name);
        let (Some(first), Some(last)) = (nodes.first(), nodes.last()) else {
          continue
        };
        let start = first.start_pos();
        let end = last.end_pos();

        let text = nodes.iter().map(|n| n.text()).collect();
        let node = WasmNode {
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

impl From<Node<'_>> for WasmNode {
  fn from(nm: Node) -> Self {
    let start = nm.start_pos();
    let end = nm.end_pos();
    Self {
      text: nm.text().to_string(),
      range: (start.0, start.1, end.0, end.1),
    }
  }
}
