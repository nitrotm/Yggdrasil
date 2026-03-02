# Impact Command Interface

| Function | Signature | Command | Options |
| -------- | --------- | ------- | ------- |
| registerImpactCommand | (program: Command) => void | impact | --node, --aspect, --flow (mutually exclusive, one required), --simulate |

**Also exported:**

- `collectReverseDependents(graph: Graph, targetNode: GraphNode): { direct, allDependents, reverse }` — builds reverse dependency map from structural relations.
- `buildTransitiveChains(targetNode, direct, allDependents, reverse): string[][]` — BFS chains excluding target.
- `collectDescendants(graph: Graph, nodePath: string): string[]` — hierarchy children recursively.

**Return:** void for registerImpactCommand. Contract: errors to stderr, process.exit(1) on failure.
