# Core Decisions

**Reference:** docs/idea/engine.md (Context assembly, validation, drift, dependencies)

## Why core is separated from commands

Core implements the deterministic mechanics — the algorithms that operate on the graph. Separating core from commands enables testing domain logic without Commander, process.exit, or stdout/stderr. It also enables potential reuse beyond the CLI — the same graph operations could be consumed by a language server, a web API, or a programmatic SDK without changes to core.

## Why each core component is a separate module

Each component (loader, context-builder, validator, drift-detector, dependency-resolver) has a single responsibility and can be tested, evolved, and understood independently. The loader knows how to scan the filesystem and build the graph; it does not know about context assembly. The validator knows how to check structural integrity; it does not know about drift. This separation makes the codebase navigable and prevents coupling between orthogonal algorithms.

## 5-step context assembly

The algorithm is fixed (docs/idea/engine.md). Order: global, hierarchy, own, aspects, relational (structural deps + events + flows). Each step is mechanical: read declarations, copy content, annotate with YAML metadata. Tools never interpret Markdown content — they copy and annotate. The agent interprets.

## Why determinism matters

The graph is the intended truth. If tools produced different output for the same input, the system would be unreliable. CI, agents, and humans must get identical results. Determinism is the foundation of trust.

## Why core doesn't parse YAML

Separation of concerns. The io layer parses files; core consumes typed structures. Core focuses on graph logic — assembly, validation, dependency resolution. IO focuses on file format. Clear boundary, testable in isolation.
