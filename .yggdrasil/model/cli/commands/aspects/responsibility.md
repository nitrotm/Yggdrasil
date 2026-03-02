# Aspects Command Responsibility

**In scope:** `yg aspects`. List all aspects with metadata in YAML format.

- Load graph via `loadGraph(process.cwd())`.
- For each aspect in graph.aspects (sorted by id): output YAML with id, name, description (if present), implies (if present).
- Output format: YAML array to stdout via `yamlStringify`.

**Consumes:** loadGraph (cli/core/loader), findYggRoot (cli/utils).

**Out of scope:** Aspect creation, modification, impact analysis (use `yg impact --aspect`).
