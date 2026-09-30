# Graph Report - konoom-hub  (2026-09-29)

## Corpus Check
- 79 files · ~44,922 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 345 nodes · 1334 edges · 15 communities (11 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]

## God Nodes (most connected - your core abstractions)
1. `useI18n()` - 71 edges
2. `cn()` - 34 edges
3. `readCollection()` - 32 edges
4. `useToast()` - 30 edges
5. `useDataRevision()` - 29 edges
6. `delay()` - 29 edges
7. `translateKnown()` - 26 edges
8. `clone()` - 25 edges
9. `Topbar()` - 23 edges
10. `Card()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `SummaryPill()` --calls--> `cn()`  [EXTRACTED]
  src/app/hub/partners/page.tsx → src/lib/cn.ts
- `CreateUserModal()` --calls--> `useI18n()`  [EXTRACTED]
  src/app/hub/users/page.tsx → src/lib/i18n/i18n-context.tsx
- `Home()` --calls--> `useAuth()`  [EXTRACTED]
  src/app/page.tsx → src/lib/auth-context.tsx
- `HubProfilePage()` --calls--> `useAuth()`  [EXTRACTED]
  src/app/hub/profile/page.tsx → src/lib/auth-context.tsx
- `HubTransactionsPage()` --calls--> `useI18n()`  [EXTRACTED]
  src/app/hub/transactions/page.tsx → src/lib/i18n/i18n-context.tsx

## Communities (15 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (51): COLORS, CorridorBarChart(), CustomTooltip(), TABS, TrendChart(), PartnerConfigurationPage(), CorridorsPage(), HubDashboardPage() (+43 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (40): metadata, Home(), Topbar(), AuthContext, AuthContextValue, AuthProvider(), useAuth(), formatRelative() (+32 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (57): PARTNERS, TRANSACTIONS, Granularity, HubDashboardStats, PaginatedResult, PartnerCorridorConfig, PartnerDashboardStats, TransactionFilters (+49 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (13): AuthFooter(), BrandLogo(), RouteGuard(), BrandLockup(), HUB_NAV, NavItem, PARTNER_NAV, Sidebar() (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (20): I18nContext, I18nContextValue, I18nProvider(), ar, arCore, Dir, en, enCore (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (19): CorridorDraft, CorridorSettingsForm(), FREQUENCIES, AUDIT_EVENTS, buildTimeline(), CORRIDORS, COUNTRIES, genTransactions() (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (17): Active Project, Application, Branding, Browser-Persisted Data, Centralized Login, code:text (npm run build), Cursor Handoff: Konoom Central Hub, Important Architecture Decisions (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (12): FilterBar(), SearchInput(), PHRASES, STATUS_KEYS, PartnerStatus, TransactionStatus, WebUserStatus, SummaryPill() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.2
Nodes (9): Architecture — built for backend reuse, code:bash (npm install), code:bash (npm run build), code:block3 (src/), Connecting a real backend, Design notes, Getting started, Konoom Central Hub — Web Portal (+1 more)

## Knowledge Gaps
- **77 isolated node(s):** `eslintConfig`, `nextConfig`, `config`, `metadata`, `STEP_KEYS` (+72 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useI18n()` connect `Community 0` to `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 7`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 3` to `Community 0`, `Community 1`, `Community 4`, `Community 5`, `Community 7`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `config` to the rest of the system?**
  _77 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._