# Build Context Flow

## Business context

Assemble a context package for a node — the exact specification an agent reads before working on that node. Used by `yg build-context` and by agents during preflight.

## Trigger

User runs `yg build-context --node <path>`.

## Goal

Output Markdown document to stdout: assembled context (global, hierarchy, own, relational, aspects, flows) plus token count and budget status.

## Participants

- `cli/commands/validation` — orchestrates loadGraph, validate, buildContext, formatContextMarkdown
- `cli/core/loader` — loads graph from `.yggdrasil/`
- `cli/core/validator` — structural checks; build-context blocks if any errors
- `cli/core/context` — 10-step layer assembly (global, hierarchy, own, relational, aspects, flows)
- `cli/formatters` — formats context package as Markdown

## Paths

### Happy path

Graph loads; validation passes (no errors). Context builder assembles layers; formatter outputs Markdown. Token count and budget status appended.

### Validation errors block

Graph has structural errors (E001–E017). Build-context does not run; user must fix errors first. Output: validation failure message.

### Node not found

User passes `--node <path>` but node does not exist. Operation error; no context assembled.

## Invariants across all paths

- Read-only: build-context never modifies the graph.
- Deterministic: same node + same graph → same output.
