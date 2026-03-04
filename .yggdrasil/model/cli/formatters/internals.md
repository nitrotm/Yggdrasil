## Constraints

# Formatters Constraints

- **Output format is plain text with XML-like section tags:** The context text formatter wraps each layer in tags (`<global>`, `<hierarchy>`, `<own-artifacts>`, `<aspect>`, `<dependency>`, `<event>`, `<flow>`, `<context-package>`). Attributes on tags encode provenance metadata.
- **Formatter is a pure function:** `formatContextText` receives a `ContextPackage` and returns a string. It performs no I/O, no validation, and no graph modification.
- **Deterministic output:** Sections are emitted in the fixed order defined by `ContextSection[]` (Global, Hierarchy, OwnArtifacts, Aspects, Relational). Within sections, layers appear in their array order. Attribute values are escaped for XML safety.

## Decisions

# Formatters Decisions

**Pure transformation:** Formatters perform no I/O and no validation. They receive structured data and produce text. This keeps the layer deterministic and testable — callers own input validity.

**Context output format:** Plain text with XML-like tags (`<context-package>`, `<global>`, `<aspect>`, etc.) is designed for agent consumption. Tags provide structure and provenance (e.g. `source="flow:Checkout"` for flow-propagated aspects). Content between tags is raw text. Token count in root attributes supports context budget awareness.
