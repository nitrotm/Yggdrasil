# Impact Command Logic

## Mode selection

1. Parse options: --node, --aspect, --flow, --simulate. Exactly one mode required.
2. If 0 or >1 modes: exit 1 with usage error.

## --node mode

1. `loadGraph(process.cwd())`. Trim node path, strip trailing slash.
2. Find node; if not found exit 1.
3. `collectReverseDependents(graph, node)` — scan all structural relations for target match.
4. `buildTransitiveChains(node, direct, allDependents, reverse)` — BFS from target, build chains.
5. `collectDescendants(graph, nodePath)` — recursive children.
6. `collectEffectiveAspectIds(graph, node)` — own + hierarchy + flow + implies.
7. Co-aspect nodes: other nodes sharing any effective aspect (exclude self and descendants).
8. If --simulate: `runSimulation(graph, affectedPaths, projectRoot)`.

## --aspect mode

1. Find aspect by id in `graph.aspects`.
2. For every node: `collectEffectiveAspectIds`; if contains target aspect, add to affected.
3. Determine attribution: own (in node.aspects), hierarchy (ancestor), flow (via flow.aspects), implied (via implies chain).
4. If --simulate: `runSimulation`.

## --flow mode

1. Find flow by name or path in `graph.flows`.
2. Collect declared participants + `collectDescendants` for each.
3. If --simulate: `runSimulation`.

## runSimulation

1. `loadGraphFromRef(projectRoot, 'HEAD')` — baseline.
2. `detectDrift(graph)` — current drift state.
3. For each affected node: `buildContext` current + baseline, compare tokens, report budget delta.
