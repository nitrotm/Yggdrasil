# Context Builder Responsibility

Assembles context packages for nodes — the 6-step layer assembly used by `yg build-context`.

**In scope:**

- **buildContext(graph, nodePath)**: Primary API. Returns ContextPackage with layers, sections, mapping, tokenCount.
- **6-step assembly**: (1) global config, (2) hierarchy ancestors, (3) own (node.yaml from disk + configured artifacts from node), (4) relational (structural_context per decisions/002 or fallback), (5) aspects by tag, (6) flows (node + ancestors).
- **Token estimation**: ~4 chars/token heuristic via estimateTokens (no tokenizer dependency).
- **Layer builders** (exported for tests): `buildGlobalLayer`, `buildHierarchyLayer`, `buildOwnLayer`, `buildStructuralRelationLayer`, `buildEventRelationLayer`, `buildAspectLayer`, `collectAncestors`.
- **filterArtifactsByConfig**: Internal; filters artifacts by config.artifacts keys.
- **buildFlowLayer**: Internal; builds flow layer from FlowDef artifacts.
- **buildSections**: Internal; groups layers into sections (Global, Hierarchy, OwnArtifacts, Dependencies, Aspects, Flows). Adds "Materialization Target" own layer when mapping exists.
- **collectParticipatingFlows**: Internal; returns flows where node or any ancestor is in flow.nodes.
- **Relation type sets**: STRUCTURAL_RELATION_TYPES (uses, calls, extends, implements), EVENT_RELATION_TYPES (emits, listens). Relations not in either set are skipped.

**Out of scope:**

- Graph loading (cli/core/loader)
- Validation (cli/core/validator)
