# Validation Commands Interface

Public API consumed by cli/entry. Named exports only.

| Function | Signature | Command | Options |
| -------- | --------- | ------- | ------- |
| registerValidateCommand | (program: Command) => void | validate | --scope (default: all). Uses tolerateInvalidConfig. |

**Return:** void. Registers subcommand on the Commander program.

**Contract:** Errors to stderr, process.exit(1) on failure. Implements patterns/command-error-handling.
