# Tree Command Responsibility

**In scope:** `yg tree [--root <path>] [--depth N]`. Print graph structure as tree.

- Load graph via `loadGraph(process.cwd())`.
- If `--root`: validate path exists in graph; if not, exit 1 `path '${path}' not found`. Root = [node]. No project name header.
- Else: roots = top-level nodes (parent === null), sorted alphabetically. Print project name header.
- Tree rendering: connector (├── or └──), node name, [type], aspects list, blackbox flag, relation count. Recurse children respecting depth limit.

**Consumes:** loadGraph (cli/core/loader), GraphNode (cli/model).

**Out of scope:** Graph navigation beyond tree display, dependency resolution.
