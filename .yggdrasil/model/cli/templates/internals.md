## Logic

# Templates Logic

## installRulesForPlatform

- Switch on platform: cursor → installForCursor; claude-code → installForClaudeCode; etc.; default → installForGeneric
- Each installForX: ensure target dir exists; write rules file (AGENT_RULES_CONTENT) with platform-specific wrapper (frontmatter, section markers, etc.)

## ensureAgentRules

- mkdir .yggdrasil; writeFile agent-rules.md with AGENT_RULES_CONTENT

## Platform-specific paths

- cursor: .cursor/rules/yggdrasil.mdc

- claude-code, aider, gemini, amp: ensureAgentRules; then platform-specific file (CLAUDE.md, etc.) imports or embeds agent-rules

- generic: .yggdrasil/agent-rules.md

## Init copy

- graph-schemas/*.yaml → .yggdrasil/schemas/ (during init, not in this node's logic)

## Decisions

# Templates Decisions

**Hand-tuned content:** Agent rules content is explicitly maintained by humans. The rules.ts comment states: "Canonical agent rules content — hand-tuned, do not generate programmatically." This ensures the operating manual reflects deliberate design decisions.

**Intent capture mandate:** The rules enforce "CAPTURE INTENT, BUT NEVER INVENT IT" — agents must permanently record the user's "why" (business reason, rationale) in graph artifacts when provided, but never infer or hallucinate it. This makes the graph the semantic meaning layer (Intent → Graph → Outputs) and protects against chat context evaporation.

**Platform-specific installation:** Each agent platform has its own conventions for rules location. The platform.ts module centralizes this mapping so `yg init --platform <name>` works consistently across IDEs.

**Default config as template:** DEFAULT_CONFIG provides a minimal valid config.yaml that adopters can customize. It mirrors config.yaml schema but is a string constant for embedding. Defines 4 node types (module, service, library, infrastructure) and 3 artifacts (responsibility.md, interface.md, internals.md). Chose 3 artifacts over the previous 8 because responsibility + interface + internals capture the three essential layers (WHAT, HOW TO USE, HOW IT WORKS + WHY) without forcing adopters to maintain rarely-used artifact types. The `infrastructure` node type was added for guards, middleware, interceptors, and other components that affect blast radius but are invisible in call graphs.
