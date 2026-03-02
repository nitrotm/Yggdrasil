# Deps Command Interface

| Function | Signature | Command | Options |
| -------- | --------- | ------- | ------- |
| registerDepsCommand | (program: Command) => void | deps | --node (required), --depth (optional int), --type (structural, event, all; default all) |

**Return:** void. Contract: errors to stderr, process.exit(1) on failure.
