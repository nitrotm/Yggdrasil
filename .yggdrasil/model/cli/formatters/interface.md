# Formatters Interface

Public API consumed by cli/commands/validation (build-context).

## context-text.ts (primary)

- `formatContextText(pkg: ContextPackage): string`
  - Converts a context package to plain text with XML-like tags.
  - Input: `ContextPackage` from cli/model.
  - Output: plain text. Tags: `<context-package>`, `<global>`, `<hierarchy>`, `<own-artifacts>`, `<aspect name="..." id="..." source="node|flow:Name">`, `<dependency>`, `<flow>`. Content between tags is raw text (no CDATA, no escaping).
  - Pure transformation — no I/O, no validation.

## context-text.ts (YAML format, v2)

- `formatContextYaml(data: ContextMapOutput): string`
  - Converts a `ContextMapOutput` to YAML (paths-only mode, default for v2).
  - Input: `ContextMapOutput` from cli/model.
  - Output: YAML string. Top-level keys: `meta`, `project`, `node`, `hierarchy` (omitted if empty), `dependencies` (omitted if empty), `artifacts`.
  - Uses `yaml` library's `stringify` with `lineWidth: 0` (no wrapping).
  - Pure transformation — no I/O, no validation.

- `formatFullContent(files: Array<{ path: string; content: string }>): string`
  - Formats file contents for `--full` mode, appended after the YAML section.
  - Input: array of file path/content pairs.
  - Output: `---` separator followed by each file wrapped in XML-style tags (`<path>content</path>`). Returns empty string if no files.
  - Pure transformation — no I/O, no validation.

## markdown.ts (legacy)

- `formatContextMarkdown(pkg: ContextPackage): string`
  - Converts a context package to Markdown. Used by tests.
  - Output: Markdown with `##` sections, `###` layer labels.

## Failure Modes

No thrown errors — pure transformation. Callers must ensure valid `ContextPackage` input.

- Invalid or malformed `ContextPackage` may produce incomplete or misleading output; no validation is performed.
- No I/O — no filesystem or network errors.
- No recovery behavior — caller responsibility.
