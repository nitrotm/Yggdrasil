# Status Command Responsibility

**In scope:** `yg status`. Graph health overview with quality metrics.

- Load graph, detect drift, validate.
- Count nodes by type (module, library, service, blackbox). Count structural vs event relations.
- Output sections: Graph name, Nodes (type breakdown + blackbox), Relations (structural, event), Aspects, Flows, Drift (source-drift, graph-drift, full-drift, missing, unmaterialized, ok), Validation (errors, warnings).
- Quality section: artifact fill rate (filled/total slots, percentage), relations per node (avg, max with node path), mapping coverage (mapped/total nodes), aspect coverage (nodes with effective aspects/total).
- Pluralize correctly: 1 module vs 2 modules, 1 library vs 2 libraries.

**Consumes:** loadGraph (cli/core/loader), validate (cli/core/validator), detectDrift (cli/core/drift-detector), collectEffectiveAspectIds (cli/core/context), normalizeMappingPaths (cli/utils), Graph (cli/model).

**Out of scope:** Detailed drift report (use `yg drift`), detailed validation (use `yg validate`).
