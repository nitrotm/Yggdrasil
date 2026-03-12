# Build Context Flow

## Business context

Assemble a context package for a node — the exact specification an agent reads before working on that node. Used by `yg build-context` and by agents during preflight.

## Trigger

User runs `yg build-context --node <path> [--full]`.

## Goal

Output YAML context map to stdout: structured metadata (token count, budget status), node info, hierarchy, dependencies, and artifact registry. With `--full`, append full artifact file contents.

## Participants

- `cli/commands/build-context` — orchestrates loadGraph, validate, buildContext, toContextMapOutput, formatContextYaml, formatFullContent
- `cli/core/loader` — loads graph from `.yggdrasil/`
- `cli/core/validator` — structural checks; build-context blocks if errors affect the node's context
- `cli/core/context` — 5-step layer assembly (global, hierarchy, own, aspects, relational); relational merges structural dependencies and flows into one section; aspects include flow.aspects for participating flows; toContextMapOutput converts to structured map
- `cli/formatters` — formats context map as YAML; formats full file contents

## Paths

### Happy path

Graph loads; validation passes (no errors affecting this node's context). Context builder assembles layers; formatter outputs YAML context map. With `--full`, artifact file contents appended.

### Validation errors block

Graph has structural errors (E001-E017) affecting this node's context. Build-context does not run; user must fix errors first. Unrelated errors in other nodes are ignored.

### Node not found

User passes `--node <path>` but node does not exist. Operation error; no context assembled.

## Invariants across all paths

- Read-only: build-context never modifies the graph.
- Deterministic: same node + same graph → same output.
