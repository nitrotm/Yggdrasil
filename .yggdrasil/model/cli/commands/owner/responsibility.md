# Owner Command Responsibility

**In scope:** `yg owner --file <path>`. Resolve a file path to its owning graph node.

- Load graph via `loadGraph(process.cwd())`.
- `findOwner(graph, projectRoot, rawPath)`: normalize input path using `normalizeProjectRelativePath`, then compare against node mappings via `normalizeMappingPaths`. Matching: exact file match, directory containment, or path prefix.
- Output: `${file} -> ${nodePath}` or `${file} -> no graph coverage`.

**Consumes:** loadGraph (cli/core/loader), normalizeMappingPaths, normalizeProjectRelativePath (cli/utils), Graph, OwnerResult (cli/model).

**Out of scope:** Context building, validation, drift detection.
