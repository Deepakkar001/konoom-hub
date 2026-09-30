# Cursor Handoff: Konoom Central Hub

## Active Project

Primary project:

`C:\Users\deepa\Downloads\konoom-central-hub\konoom-hub`

There is a second related project at:

`C:\Users\deepa\Downloads\konoom-central-hub (1)\konoom-hub1`

Do not merge the two projects automatically. `konoom-hub` is the active project for the latest work described below.

## Application

Next.js App Router application for the Konoom CEMAC Inter-Wallet Remittance Central Hub. It has two role-scoped experiences:

- Hub Admin: `/hub/*`
- Partner Admin: `/partner/*`

Authentication is handled by `src/lib/auth-context.tsx` and protected routes use `src/components/feature/RouteGuard.tsx`.

## Work Completed

### Centralized Login

The login page at `src/app/login/page.tsx` was changed to a single centralized login:

- Removed Hub Admin / Partner Admin role tabs.
- Removed demo account shortcuts.
- Removed prefilled email and password values.
- Submitted email is matched against the stored users collection.
- The role is resolved from the matched user's stored role.
- The user is redirected automatically to `/hub/dashboard` or `/partner/dashboard`.
- Visible demo wording was removed from the login and app shell.

The role-aware login implementation is in `src/lib/services/auth-service.ts`.

### Browser-Persisted Data

A browser storage data layer was added in:

- `src/lib/services/browser-store.ts`
- `src/lib/use-data-revision.ts`

On first access, seed data from `src/lib/mock-data.ts` is copied into `localStorage` collections:

- `konoom_hub_data_partners`
- `konoom_hub_data_users`
- `konoom_hub_data_corridors`
- `konoom_hub_data_transactions`

The following services now read and write browser-persisted data:

- `auth-service.ts`
- `dashboard-service.ts`
- `partner-service.ts`
- `user-service.ts`
- `corridor-service.ts`
- `transaction-service.ts`

Existing page APIs were preserved. Pages continue calling services instead of accessing storage directly.

### Live UI Refresh

`useDataRevision()` subscribes to browser data changes. The browser store emits a custom event in the current tab and listens for the native `storage` event across tabs.

Live refresh subscriptions were added to:

- Hub dashboard
- Corridor management
- Partner list and partner detail
- User management
- Reconciliation
- Partner dashboard
- Partner configuration
- Partner profile
- Transaction table
- Transaction detail

When a supported record is created or updated, affected screens reload their existing service query automatically.

### Reset Seed Data

System Settings now includes a Local Data section:

- File: `src/app/hub/settings/page.tsx`
- Action: Restore initial data
- Implementation: `resetBrowserData()` from `src/lib/services/browser-store.ts`

This clears persisted collections and causes subscribed screens to reseed from `mock-data.ts`.

### Notifications

The notification bell in `src/components/layout/Topbar.tsx` is now interactive:

- Four seeded operational notifications.
- Warning, success, info, and danger styles.
- Unread count and indicators.
- Mark all as read.
- Mark individual notification as read.
- Close button and outside-click dismissal.
- Responsive dropdown sizing.

Notification state is currently component-local and is not persisted to browser storage.

### Branding

A combined branding component exists at:

`src/components/layout/BrandLockup.tsx`

The current implementation uses the combined asset:

`public/images/Centralhub.png`

The sidebar uses the `stacked` variant. Current styling intentionally:

- Uses the full sidebar branding width.
- Uses a 56px logo band inside the 76px header.
- Has rounded clipped corners.
- Has a small top-only inset (`pt-1`).
- Does not add a duplicate white background behind the image because the source asset already includes its own white branding surface.

The older asset `public/images/logoy.png` also exists but the current combined sidebar logo points to `Centralhub.png`.

## Important Architecture Decisions

- Keep pages calling service functions; do not introduce direct `localStorage` reads in page components.
- Keep browser storage access guarded by `typeof window !== "undefined"` so server rendering remains safe.
- Keep session storage for the active login session separate from operational data storage.
- Never store real passwords in browser storage.
- The browser storage layer is local to the browser/device. It supports current-tab updates and cross-tab updates, but not synchronization across different users or devices.
- A future backend can replace the service implementations without requiring page rewrites.

## Seed Data and Login

Seed users are defined in `src/lib/mock-data.ts`. Current active credentials are email-based and the role is derived from the matching stored user record.

The current `konoom-hub` seed values include users such as:

- `michael@konoom.com`
- `sarah@konoom.com`
- `john@konoom.td`
- `amina@konoom.cm`

Passwords are only validated as a minimum-length local placeholder. This is not production authentication.

## Validation Completed

The following command has passed after the latest implementation:

```text
npm run build
```

The build compiled successfully, TypeScript completed, and all application routes generated successfully.

Focused editor diagnostics also passed for the touched storage, service, refresh, settings, notification, and branding files.

## Known Limitations

- Browser storage is not a shared backend.
- No WebSocket or Server-Sent Events connection exists.
- Transaction data currently has search/detail behavior but no complete transaction-creation workflow.
- Notification data is currently seeded in `Topbar.tsx`, not stored in the browser data repository.
- Some dashboard chart values remain deterministic presentation values rather than being calculated from every persisted transaction.
- Existing repository lint has unrelated pre-existing warnings/errors in untouched files. Production build and TypeScript validation pass.

## Related Project: konoom-hub1

`konoom-hub1` contains features not currently merged into `konoom-hub`:

- `src/lib/i18n/i18n-context.tsx`
- `src/lib/i18n/messages.ts`
- English, French, and Spanish translation dictionaries.
- `src/components/ui/LanguageSelect.tsx`
- `src/components/feature/BrandLogo.tsx`
- `src/components/feature/AuthFooter.tsx`
- `src/lib/app-info.ts`
- Version injection in `next.config.ts`.
- Typed authentication error codes.
- Asset: `public/brand/centralhub-logo.png`

`konoom-hub` is ahead on browser persistence, live refresh, centralized login behavior, notification dropdown, reset controls, and the latest branding layout.

## Recommended Next Steps

1. Add a proper transaction create/update flow through the browser repository.
2. Move notifications into a persisted collection and connect them to mutations.
3. Replace static dashboard chart values with calculations from persisted transactions.
4. Add a visible data-store status or last-updated indicator.
5. Add localization from `konoom-hub1` only after deciding which project is the source of truth.
6. Replace browser storage with API calls and WebSockets when a backend is available.
