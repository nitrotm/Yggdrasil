# Owner Command Errors

**Propagated from loadGraph:**

- Missing .yggdrasil/: `Error: No .yggdrasil/ directory found. Run 'yg init' first.`

**Command-specific:**

- Path outside project: propagated from normalizeProjectRelativePath: `Path is outside project root: ${rawPath}`.
- Empty path: propagated from normalizeProjectRelativePath: `Path cannot be empty`.

**Generic:** I/O errors — standard Node.js Error, caught and reported to stderr.
