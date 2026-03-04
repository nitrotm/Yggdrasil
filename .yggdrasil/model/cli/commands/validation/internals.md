## Logic

# Validation Commands Logic

## validate

1. loadGraph(tolerateInvalidConfig: true)
2. scope = (options.scope ?? 'all').trim() || 'all'
3. validate(graph, scope)
4. Output: nodesScanned; errors (red); warnings (yellow); summary line
5. Exit 1 if any error; else exit 0
