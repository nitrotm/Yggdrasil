# Expense Tracker — Yggdrasil Example

Mini SaaS example for [Yggdrasil](https://github.com/krzysztofdudek/Yggdrasil): a full-stack expense tracking app with a mature semantic graph.

## Features

- **Auth:** Register, login (JWT)
- **Expenses:** CRUD with category, amount, date
- **Categories:** Predefined + custom (Free: 5 custom max)
- **Budgets:** Monthly limits per category
- **Reports:** Summary by category
- **Subscription:** Free (50 expenses/month) / Pro (unlimited) — mock upgrade

## Stack

- **API:** Fastify, TypeScript, SQLite (better-sqlite3)
- **Web:** Vite, React 19, React Router 7
- **Shared:** Zod validation, types

## Run

```bash
cd examples/expense-tracker
npm install
npm run dev
```

- API: <http://localhost:3000>
- Web: <http://localhost:5173> (proxies /api to API)

## Structure

```
.yggdrasil/     # Semantic graph (nodes, aspects, flows)
apps/
  api/          # REST API
  web/          # React SPA
packages/
  shared/       # Types, validation
```

## Yggdrasil

This example demonstrates a mature graph: nodes for each API service and web module, responsibility artifacts, and flows for business processes. Run `yg validate` and `yg build-context --node <path>` to explore.
