# Status Command Errors

**Propagated from loadGraph:**

- Missing .yggdrasil/: `Error: No .yggdrasil/ directory found. Run 'yg init' first.`

**No command-specific errors.** All errors propagate from loadGraph, detectDrift, validate.

**Generic:** I/O errors — standard Node.js Error, caught and reported to stderr.
