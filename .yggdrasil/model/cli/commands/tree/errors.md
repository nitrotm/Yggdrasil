# Tree Command Errors

**Propagated from loadGraph:**

- Missing .yggdrasil/: `Error: No .yggdrasil/ directory found. Run 'yg init' first.`

**Command-specific:**

- Path not found: `Error: path '${path}' not found` — when --root specifies a path that does not exist in the graph.

**Generic:** I/O errors — standard Node.js Error, caught and reported to stderr.
