# Konoom Central Hub — Web Portal

A Next.js (App Router + TypeScript + Tailwind v4) web portal for the Konoom
CEMAC Inter-Wallet Remittance Central Hub, covering both the **Hub Admin**
console and the **Partner Admin** console behind a single, role-aware login.

This is a **frontend-only build** — there is no backend yet. Every
screen is fully interactive and backed by a realistic mock data + service
layer, while being structured so that
wiring up the real API later is a small, mechanical change (see
"Connecting a real backend" below).

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll land on the login screen.

To build and run a production bundle:

```bash
npm run build
npm run start
```

## What's implemented

**Common**
- Centralized login with role resolution from the account credentials, session
  persisted for the browser tab, role-scoped route guards and navigation.

**Hub Admin**
- Dashboard — KPIs (partners, transactions, remittance value, settlement,
  liquidity, corridors, web users), Daily/Weekly/Monthly trend chart,
  volume-by-corridor chart, partner and recent-transaction snapshots.
- Partners — search/filter list, 5-step onboarding wizard (Partner details →
  Contact → Access/API → Settlement bank → Review & submit), partner detail
  page with Overview / Configuration (per-corridor FX, fees, limits) /
  Access & API / Settlement Bank / Transactions / Audit Log tabs,
  activate/deactivate.
- Corridors — enable/disable corridors, FX rate, service charge, limits.
- Transactions — searchable, filterable, paginated log with a full
  transaction detail + timeline view.
- Web Users — list, filter, create (Hub Admin or Partner Admin) with an
  invite modal.
- Settlement, Reconciliation, Reports, System Settings — functional
  supporting screens.

**Partner Admin**
- Dashboard scoped to the logged-in partner's own data.
- Partner Profile — view/edit own organization + contact details.
- Configuration — view enabled corridors (hub-controlled terms) and manage
  own API callback URL / IP whitelist.
- Transactions — own transaction log + detail view.

## Architecture — built for backend reuse

The point of this structure is that **pages and components never talk to
mock data directly.** They call functions in `src/lib/services/*`, which
today return seeded/in-memory data with simulated latency, and tomorrow can
issue real HTTP requests — with no change required in any page or component.

```
src/
  lib/
    types.ts              — domain types (Partner, Transaction, Corridor, …)
                             shaped to match the intended future API responses
    mock-data.ts           — deterministic seed data (CEMAC countries,
                             partners, 140 transactions, corridors, users)
    services/
      auth-service.ts       — login/logout
      dashboard-service.ts   — hub + partner KPIs and trend series
      partner-service.ts     — partner CRUD, activate/deactivate
      transaction-service.ts — search/filter/paginate, get by id
      user-service.ts        — web user list/create
      corridor-service.ts    — corridor list/update
      util.ts                — delay() simulated latency helper
    auth-context.tsx       — React context wrapping the auth service
    toast-context.tsx      — notification system
    format.ts              — currency/date/number formatting

  components/
    ui/                    — Button, Field, Card, Modal, Tabs, StatusChip, …
    layout/                — Sidebar (role-aware nav), Topbar
    charts/                — TrendChart, CorridorBarChart (Recharts)
    feature/                — StatCard, RouteGuard, TransactionTable,
                              TransactionDetail, FilterBar, Pagination

  app/
    login/
    hub/            (role-guarded layout + Sidebar)
      dashboard/ partners/ partners/new/ partners/[id]/
      corridors/ transactions/ transactions/[id]/ users/
      settlement/ reconciliation/ reports/ settings/
    partner/        (role-guarded layout + Sidebar)
      dashboard/ profile/ configuration/ transactions/ transactions/[id]/
```

### Connecting a real backend

When the Central Hub backend is ready, integration is a matter of rewriting
the **bodies** of the functions in `src/lib/services/*` to call your API
(e.g. `fetch('/api/partners')`) instead of reading from `mock-data.ts` —
the function names and return types (`Partner`, `Transaction`,
`PaginatedResult<T>`, etc., from `lib/types.ts`) are already the intended
API contract, so no page or component should need to change.

Suggested order:
1. `auth-service.ts` → real `/auth/login`, store a real token instead of a
   mock session (swap `sessionStorage` for an httpOnly cookie set by the
   backend).
2. `partner-service.ts`, `transaction-service.ts`, `corridor-service.ts`,
   `user-service.ts`, `dashboard-service.ts` → point each function at the
   matching REST/GraphQL endpoint.
3. Remove `delay()` calls (they only exist to simulate network latency in
  the local build).
4. If the backend's field names differ from `lib/types.ts`, adjust the
   mapping inside the service function — not the components.

## Design notes

- Deep navy + signal blue, with the Konoom gold used sparingly as an accent
  (active nav indicator, key highlights) — carried over from the Central
  Hub visual identity in the requirement spec.
- Self-hosted Inter (via `@fontsource-variable/inter`) — no external font
  CDN dependency, so it builds and renders identically anywhere.
- All amounts are seeded data in XAF (CEMAC franc); currency formatting is
  centralized in `lib/format.ts`.
