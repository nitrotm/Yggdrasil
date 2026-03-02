# Impact Command Errors

**Propagated from loadGraph:**

- Missing .yggdrasil/: `Error: No .yggdrasil/ directory found. Run 'yg init' first.`

**Command-specific:**

- Node not found: `Node not found: ${nodePath}` — when --node path does not exist in graph.
- Aspect not found: `Aspect not found: ${aspectId}` — when --aspect id does not exist.
- Flow not found: `Flow not found: ${flowName}` — when --flow name does not exist.
- Mode validation: `Specify exactly one of: --node, --aspect, --flow` — when 0 or >1 modes given.

**Generic:** I/O errors — standard Node.js Error, caught and reported to stderr.
