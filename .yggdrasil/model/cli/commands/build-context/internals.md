## Logic

# Build Context Command Logic

1. `loadGraph(process.cwd())`
2. `validate(graph, 'all')` — check for structural errors
3. If any errors (severity === 'error'): output errors, exit 1 with "Fix validation errors before building context"
4. Trim node path, strip trailing slash
5. Find node in graph; if not found exit 1
6. `buildContext(graph, nodePath)` — assemble context package
7. `formatContextText(contextPackage)` — render to plain text
8. Read budget thresholds from `graph.config.quality?.context_budget` (defaults: warning 10000, error 20000)
9. Append token count + budget status line
10. Output to stdout
