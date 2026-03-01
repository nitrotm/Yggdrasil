# Drift Commands Logic

## drift command

1. loadGraph(process.cwd())
2. scope = (options.scope ?? 'all').trim() || 'all'
3. If scope !== 'all': validate node exists; validate node has mapping (else exit 1)
4. scopeNode = scope === 'all' ? undefined : scope
5. detectDrift(graph, scopeNode)
6. printReport(report, driftedOnly):
   - Split entries into two sections via classifyForSection():
     - Source section: source-drift, full-drift, missing, unmaterialized (+ ok unless --drifted-only)
     - Graph section: graph-drift, full-drift (+ ok unless --drifted-only)
   - For each section: print header, then per entry: status tag + nodePath, then changedFiles filtered by category
   - Summary: source-drift, graph-drift, full-drift, missing, unmaterialized counts. "(N ok hidden)" when --drifted-only, else ok count.
7. Exit 1 if any drift/missing/unmaterialized; else exit 0

## drift-sync command

1. loadGraph(process.cwd())
2. nodePath = --node (required), trim, strip trailing slash
3. syncDriftState(graph, nodePath)
4. Output "Synchronized: ${nodePath}" (green), hash line (previous 8 chars -> current 8 chars)
5. Exit 0
