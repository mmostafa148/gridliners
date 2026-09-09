# Gridliners Awards

The bilingual English/Arabic frontend for the Gridliners Awards programme. This repository contains the public website, awards and finalists archive, voting experience, participant account area, and demonstration entry workflow.

Live demo: [gridliners-omega.vercel.app](https://gridliners-omega.vercel.app/)

## Current status

This is a presentation and product-validation build. The interface and user journeys are implemented, but the application currently uses typed fixtures and an in-memory mock service layer instead of production infrastructure.

The following integrations must be replaced before a production launch:

- Authentication and session management
- Persistent database and file storage
- Card and cash-payment processing
- Email delivery and password-reset messages
- Voting OTP delivery and verification
- Enquiry and newsletter submission delivery

Demo passwords, OTP codes, payment responses, uploaded filenames, and form submissions are intentionally non-production. Do not use the mock implementations to store real user, payment, or submission data.

## Requirements

- Node.js 22
- pnpm 10

Enable pnpm through Corepack if it is not already available:

```bash
corepack enable
corepack prepare pnpm@10.0.0 --activate
```

## Local setup

```bash
git clone https://github.com/mmostafa148/gridliners.git
cd gridliners
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3100](http://localhost:3100). The default route redirects to the English site; Arabic pages are available under `/ar`.

## Demo access

All three accounts use the password `gridliners`.

| Account | Purpose |
| --- | --- |
| `studio@qamar.design` | Fully populated English account with projects, entries, billing records, and awards |
| `noor.alshammari@example.com` | Arabic account for right-to-left layouts and Arabic content |
| `yara@soukaloud.com` | Empty account for first-time-user and empty-state flows |

Public-voting OTP code: `204815`.

These credentials exist only for the demo and must be removed when production authentication and OTP delivery are connected.

## Environment variables

Copy `.env.example` to `.env.local`. The project has safe demo defaults, so no environment variable is required for a basic local run.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical public origin used by metadata and share images |
| `NEXT_PUBLIC_ADOBE_FONTS_KIT_ID` | Adobe Fonts kit that provides the Presicav display family |
| `MOCK_SESSION_SECRET` | Signs demo-session cookies; use a unique value outside local development |
| `NEXT_PUBLIC_MOCK_PERSIST` | Set to `1` to persist supported mock state in local storage |
| `NEXT_PUBLIC_MOCK_LATENCY` | Adds simulated API latency in milliseconds |
| `NEXT_PUBLIC_MOCK_ERROR_RATE` | Simulated read-error rate from `0` to `1` |
| `NEXT_PUBLIC_ENABLE_DEV_ROUTES` | Set to `1` to expose development-only routes in a deployed environment |
| `NEXT_DIST_DIR` | Optional alternate Next.js build directory |

Never commit `.env.local` or production secrets.

## Commands

```bash
pnpm dev          # Development server on port 3100
pnpm lint         # ESLint, RTL safety, and translation-key checks
pnpm typecheck    # TypeScript validation
pnpm build        # Optimized production build
pnpm start        # Serve a production build on port 3100
```

## Project structure

- `src/app` — localized routes, layouts, metadata, and server actions
- `src/components` — public, account, shared, and UI components
- `src/lib/api` — service contracts and the current mock implementations
- `src/lib/fixtures` — demonstration content and user scenarios
- `src/messages` — English and Arabic translations
- `public` — brand assets and temporary presentation media

The UI consumes the contracts in `src/lib/api/services.ts`. Production services should implement those contracts so the screens do not need to be rewritten when the backend is connected.

## Quality checks

Pull requests and pushes to `main` run install, lint, type checking, and the production build through GitHub Actions. Run the same checks locally before opening a pull request:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Deployment

The live demo is hosted on Vercel. The production project should set `NEXT_PUBLIC_SITE_URL` to its canonical domain and use a unique `MOCK_SESSION_SECRET` while the mock authentication layer remains enabled.
