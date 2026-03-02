# Core Constraints

## No direct filesystem access

All file I/O goes through cli/io. Core functions receive typed data structures, not file paths to read. This keeps core testable with in-memory data and decoupled from filesystem layout.

## No process-level side effects

Core never calls process.exit, process.stdout.write, or process.stderr.write. Functions return results or throw errors. Callers (commands) decide how to present results and handle failures. This ensures core can be consumed by any caller, not just the CLI.

## Functions throw on error, never swallow

When core encounters an invalid state — missing node, broken relation, cycle in structural dependencies — it throws. Core never silently returns partial results or logs warnings to stderr. The caller is always informed of failures explicitly.

## Determinism

Same graph state always produces same context package, validation result, and drift report. No heuristics, no guessing, no repository search.

## Context assembly algorithm (fixed order)

For node N at path P with aspects A, buildContext executes in this order:

1. GLOBAL — config.yaml (stack, standards)
2. HIERARCHY — artifacts of each ancestor (root down to parent of N)
3. OWN — N's node.yaml (raw from disk) and N's content artifacts (all .md matching config)
4. ASPECTS — for each aspect in A (union from hierarchy + own + flow blocks, expanded via implies), content of matching aspect
5. RELATIONAL — for each structural relation: target's structural_context artifacts (or fallback: all configured artifacts), annotate with consumes/failure from relation; for each event relation: event name + consumes; for each participating flow: flow artifacts

## Broken references block

buildContext throws if relation target missing. validate reports E004 for broken relations. resolveDeps throws on cycles.

## Token heuristic

estimateTokens uses ~4 chars/token. Budget thresholds from config.quality.context_budget.

## Structural relations acyclic

uses, calls, extends, implements must not form cycles. emits, listens may cycle (event relations do not create dependency edges). Cycles involving at least one blackbox node are tolerated.
