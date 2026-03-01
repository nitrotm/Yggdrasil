# Drift Flow

## Business context

Detect and sync divergence between the graph and mapped source files. Drift means code changed but graph artifacts were not updated. Used by agents during preflight and wrap-up.

## Trigger

User runs `yg drift [--scope <path>]` or `yg drift-sync --node <path>`.

## Goal

**Drift:** Report state per node (ok, drift, missing, unmaterialized). **Drift-sync:** Update `.yggdrasil/.drift-state` with current file hashes for the specified node.

## Participants

- `cli/commands/drift` — orchestrates loadGraph, detectDrift, syncDriftState
- `cli/core/loader` — loads graph (mappings for hash resolution)
- `cli/core/drift-detector` — computes hashes, compares to baseline; consumes cli/io for readDriftState, writeDriftState

## Paths

### Happy path (drift)

Graph loads; drift-detector hashes mapped files, compares to `.drift-state`. Output: per-node state (ok/drift/missing/unmaterialized). No writes.

### Happy path (drift-sync)

Graph loads; user specified `--node <path>`. Drift-detector computes current hash, writes to `.drift-state`. Output: confirmation.

### Node not found

User passes `--node <path>` for drift-sync but node does not exist. Operation error; no sync.

### Unmaterialized node

Node has no mapping; drift-sync is a no-op (nothing to hash). State remains unmaterialized.

## Invariants across all paths

- Drift: read-only; never modifies graph or .drift-state.
- Drift-sync: writes only `.yggdrasil/.drift-state`; never modifies graph artifacts or source files.
