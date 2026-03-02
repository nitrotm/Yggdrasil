# Owner Command Interface

Public API consumed by cli/entry. Named exports only.

| Function | Signature | Command | Options |
| -------- | --------- | ------- | ------- |
| registerOwnerCommand | (program: Command) => void | owner | --file (required) |

**Also exported:**

- `findOwner(graph: Graph, projectRoot: string, rawPath: string): OwnerResult` — resolves file to owning node. Used by owner command.

**Return:** void for registerOwnerCommand. Contract: errors to stderr, process.exit(1) on failure.
