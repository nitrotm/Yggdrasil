# Flow Variants (Agent Awareness) — Design Document

**Date:** 2025-03-01  
**Status:** Approved

---

## Goal

Make agents explicitly aware that flow `description.md` must describe **all variants and branches** of a business process — happy path, exception paths, cancellation paths. Agents currently describe flows shallowly (success path only). No CLI enforcement — guidance via spec and rules only.

---

## Problem

- Agent does not know that `description.md` should document the full scope of a process.
- Result: shallow flow descriptions (happy path only), missing exception/cancellation paths.
- Flow exists because a business process exists, not because a function exists.

---

## Solution

Extend the specification of `description.md` in three places: graph.md (concepts), rules.ts (agent instructions), tools.md (formal spec). One flow directory = one business process with all its paths. No new files or directories.

---

## 1. graph.md Changes

**Location:** Section "Flows: End-to-End Processes" (~line 480).

**Add after** "Content artifacts in the flow directory...":

- One flow directory = one business process with all its paths (happy path, exceptions, cancellations).
- `description.md` describes the full scope of the process, not just the success path.

**Add new subsection "Flow description.md format":**

Required sections:

- `## Business context` — why this process exists
- `## Trigger` — what initiates the process
- `## Goal` — what success looks like
- `## Participants` — nodes involved (align with `flow.yaml` nodes)
- `## Paths` — **required**; must contain at least `### Happy path`; each other business path (cancellation, payment failure, timeout, partial fulfillment) gets its own `### [name]` subsection
- `## Invariants across all paths` — business rules and technical conditions that hold regardless of path

**Example variant names:** `### Payment failed`, `### User cancellation`, `### Timeout`, `### Partial fulfillment`

---

## 2. rules.ts Changes

**Location:** Section 7 (Context Assembly), "Flows — writing flow content" block (~line 198).

**Extend** existing flow content instruction:

- Keep: business-first, user/business perspective.
- Add: `description.md` must describe the full scope of the process — all paths, not just happy path.

**Add new block "Flow description.md — required structure":**

- Checklist: Business context, Trigger, Goal, Participants, Paths, Invariants across all paths.
- Rule: `## Paths` required; minimum `### Happy path`; each other business path (error, cancellation, timeout, etc.) gets its own `### [name]` subsection.
- One flow = one business process with all its variants.

---

## 3. tools.md Changes

**Location:** After `### flow.yaml` subsection (~line 210).

**Add new subsection `### description.md`:**

- Primary flow artifact — describes the business process.
- Required H2 sections: `## Business context`, `## Trigger`, `## Goal`, `## Participants`, `## Paths`, `## Invariants across all paths`.
- `## Paths` must contain at least `### Happy path`; each additional business path gets `### [name]`.
- One flow directory = one business process with all paths (happy path, exceptions, cancellations).

---

## Scope

- **In scope:** graph.md, rules.ts, tools.md
- **Out of scope:** CLI validation, new templates, directory structure changes
- **Existing flows:** Will need manual update to new format (validate, build-context, drift, init)
