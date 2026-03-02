# Deps Command Responsibility

**In scope:** `yg deps --node <path> [--depth N] [--type structural|event|all]`. Show dependency tree for a node.

- Load graph via `loadGraph(process.cwd())`. Trim --node, strip trailing slash.
- `formatDependencyTree(graph, nodePath, { depth, relationType })`. Output text + newline.
- --type filters: structural (uses/calls/extends/implements), event (emits/listens), all (default).

**Consumes:** loadGraph (cli/core/loader), formatDependencyTree (cli/core/dependency-resolver).

**Out of scope:** Reverse dependencies (use `yg impact`), transitive chain analysis.
