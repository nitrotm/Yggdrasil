# Tree Command Interface

| Function | Signature | Command | Options |
| -------- | --------- | ------- | ------- |
| registerTreeCommand | (program: Command) => void | tree | --root (optional path), --depth (optional int) |

**Return:** void. Contract: errors to stderr, process.exit(1) on failure.
