# Validation Commands Errors

**Propagated from loadGraph:**

- Missing .yggdrasil/: `Error: No .yggdrasil/ directory found. Run 'yg init' first.`
- model/ does not exist: `Directory .yggdrasil/model/ does not exist. Run 'yg init' first.`

**validate:** No command-specific errors; propagates from loadGraph, validate.

**Generic:** I/O errors -- standard Node.js Error, caught and reported to stderr.
