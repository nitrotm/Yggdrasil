# Build Context Command Responsibility

**In scope:** `yg build-context --node <path>`. Assemble and output context package for a node.

- Load graph via `loadGraph(process.cwd())`. Trim node path, strip trailing slash.
- Validate graph first: `validate(graph, 'all')`. If any errors (severity 'error'), block build-context and report validation failure.
- `buildContext(graph, nodePath)` — assemble 5-layer context package (global, hierarchy, own, aspects, relational).
- `formatContextText(contextPackage)` — format as plain text with XML-like tags.
- Append token count and budget status (ok/warning/error based on config thresholds).
- Output to stdout.

**Consumes:** loadGraph (cli/core/loader), buildContext (cli/core/context), validate (cli/core/validator), formatContextText (cli/formatters).

**Out of scope:** Context assembly algorithm (cli/core/context), formatting logic (cli/formatters), validation rules (cli/core/validator).
