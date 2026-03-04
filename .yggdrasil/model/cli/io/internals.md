## Constraints

# IO Constraints

- **Paths:** All parser functions accept absolute file paths. Callers (core, commands) resolve from project root or yggRoot.
- **YAML:** Uses `yaml` package. Throws on parse errors. No schema validation beyond required fields.
- **Artifact reader:** Skips binary extensions (.png, .jpg, .pdf, .zip, etc.). Excludes node.yaml by default. Sorts output by filename for determinism.
- **Drift state:** Format is node-path → hash (string) or DriftNodeState { hash, files? }. Stored in .yggdrasil/.drift-state. Commit to repo.
- **Journal:** Stored in .yggdrasil/.journal.yaml. Gitignored. Archive format: journals-archive/.journal.YYYYMMDD-HHmmss.yaml.
- **Knowledge scope:** scope must be 'global' | { tags: string[] } | { nodes: string[] }. Tags and nodes must resolve.

## State

# IO State Files

## .drift-state

YAML file at `.yggdrasil/.drift-state`. Maps node paths to `DriftNodeState` objects:

```
<node-path>:
  hash: <sha256-hex>       # canonical hash of all tracked files (source + graph)
  files:                    # per-file hashes for granular change detection
    <relative-path>: <sha256-hex>
```

Written by `drift-sync` command via `writeDriftState`. Read by `detectDrift` via `readDriftState`. Legacy format (node-path mapped to a plain string hash) is silently skipped during reads. This file should be committed to the repository so drift baselines persist across sessions.

## .journal.yaml

YAML file at `.yggdrasil/.journal.yaml`. Contains an `entries` array of `JournalEntry`:

```
entries:
  - at: <ISO-8601 timestamp>
    target: <optional node path>
    note: <text>
```

Written by `journal-add` via `appendJournalEntry`. Read by `journal-read` via `readJournal`. Returns empty array if file is missing or unparseable. This file is gitignored — it is session-local working state.

## journals-archive/

Directory at `.yggdrasil/journals-archive/`. Created on first archive. Contains timestamped copies of archived journals:

- Filename format: `.journal.YYYYMMDD-HHmmss.yaml`
- Created by `journal-archive` via `archiveJournal`, which renames (moves) the active `.journal.yaml` into this directory.
- UTC timestamps are used for the filename.

## Decisions

# IO Decisions

**Separation of I/O from domain:** Parsers and stores live in io/ so that cli/core (loader, drift-detector) and cli/commands can remain focused on domain logic. All filesystem access, YAML parsing, and operational state persistence are centralized here.

**Graceful degradation for operational files:** readDriftState and readJournal return empty structures on missing files — these are optional operational metadata. Parsers for config and graph structure throw on invalid input, since those are required for correct operation.
