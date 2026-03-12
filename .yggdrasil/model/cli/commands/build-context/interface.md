# Build Context Command Interface

| Function | Signature | Command | Options |
| -------- | --------- | ------- | ------- |
| registerBuildCommand | (program: Command) => void | build-context | --node (required), --full (optional) |

**Return:** void. Contract: errors to stderr, process.exit(1) on failure.

**--full flag:** When set, appends full artifact file contents after the YAML context map. Files are collected from all registry sections (nodes, aspects, flows), deduplicated, and rendered via `formatFullContent`.

## Failure Modes

**Propagated from loadGraph:**

- Missing .yggdrasil/: `Error: No .yggdrasil/ directory found. Run 'yg init' first.`

**Command-specific:**

- Node not found: exits when node path does not exist in graph.
- Validation errors: blocks build-context if graph has structural errors (E001-E017) affecting this node's context (own node, ancestors, relation targets and their ancestors). Unrelated errors in other nodes are ignored.

**Generic:** I/O errors — standard Node.js Error, caught and reported to stderr.
