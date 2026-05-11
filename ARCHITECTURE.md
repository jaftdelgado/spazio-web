# Spazio Web — Project Context

## Overview

Spazio Web is a **purely frontend** Next.js application. It connects to an external REST API built in Go. There is no backend logic, no server components, no server actions, and no API routes within this project. Every file uses `'use client'`.

---

## Stack

| Purpose                   | Library                                     |
| ------------------------- | ------------------------------------------- |
| Framework                 | Next.js 16 (App Router)                     |
| Language                  | TypeScript                                  |
| Component library         | HeroUI v3                                   |
| Styling                   | Tailwind CSS v4                             |
| Server state / caching    | TanStack Query                              |
| Forms                     | React Hook Form + Zod + @hookform/resolvers |
| Global state (if needed)  | Zustand                                     |
| Runtime / package manager | Bun                                         |

---

## Architecture

The project combines two patterns:

**Vertical slicing** as the top-level organizer — the codebase is split by feature/module, not by file type. Each module is self-contained and owns its domain, application logic, and infrastructure.

**Hexagonal architecture inside each module** — business logic is isolated from HTTP details through ports (interfaces) and adapters (implementations). The UI never imports from `infra/` directly.

### Layer responsibilities

- `domain/` — entities (TypeScript interfaces), repository interfaces (ports). No dependencies on anything external.
- `application/hooks/` — TanStack Query hooks that orchestrate use cases. They consume the repository interface, not the adapter directly.
- `infra/` — HTTP adapters that implement the repository interface and call the Go API. Also contains mappers (DTO → entity).
- `components/` — React components scoped to the module. Only modules that have a dedicated page include this folder.

### Data flow

```
page.tsx
  └── module component
        └── application hook (TanStack Query)
              └── repository interface (port)
                    └── http-adapter (infra)
                          └── Go REST API
```

---

## Project Structure

```
src/
├── app/                          # Next.js App Router — routing only
│   ├── layout.tsx                # Root layout (providers)
│   ├── page.tsx                  # / landing page
│   ├── explore/
│   │   └── page.tsx              # /explore — public property listing
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          # /auth/login
│   │   └── sign-up/
│   │       └── page.tsx          # /auth/sign-up
│   └── admin/                    # Protected area
│       ├── layout.tsx            # Session guard (client-side redirect)
│       ├── properties/
│       │   └── page.tsx          # /admin/properties
│       ├── visits/
│       │   └── page.tsx          # /admin/visits
│       └── payments/
│           └── page.tsx          # /admin/payments
│
├── modules/                      # Feature modules
│   ├── catalogs/                 # No page — consumed by other modules
│   ├── clauses/                  # No page — consumed by contracts
│   ├── contracts/                # No page — consumed by visits, payments
│   ├── locations/                # No page — consumed by explore, properties
│   ├── payments/                 # Page: /admin/payments
│   ├── properties/               # Pages: /explore, /admin/properties
│   ├── services/                 # No page — consumed by properties
│   ├── uploads/                  # No page — cross-cutting utility
│   ├── users/                    # No page — consumed by auth, admin layout
│   └── visits/                   # Page: /admin/visits
│
├── components/
│   ├── core/                     # HeroUI wrappers (AppButton, AppInput, AppModal, AppTable, AppBadge)
│   └── layout/                   # Navbar, AdminSidebar, PageWrapper
│
├── lib/
│   ├── http/
│   │   └── http-client.ts        # Base HTTP client (configured fetch with auth headers)
│   └── auth/
│       └── auth.ts               # Token storage and session helpers
│
├── config/
│   ├── routes.ts                 # ROUTES constant — all app paths as typed constants
│   └── env.ts                    # Typed environment variables (NEXT_PUBLIC_API_URL, etc.)
│
└── types/
    ├── api.types.ts              # Generic API types: PaginatedResponse<T>, ApiError
    └── common.types.ts           # Shared types across modules
```

---

## Module Structure

Every module follows this internal structure:

```
modules/[module]/
├── domain/
│   ├── [module].entity.ts        # Business entity interface
│   └── [module].repository.ts   # Port interface (what the app can do)
├── application/
│   └── hooks/
│       └── use[Module].ts        # TanStack Query hooks
└── infra/
    ├── [module].http-adapter.ts  # Implements the repository interface
    └── [module].mapper.ts        # Maps API DTO → domain entity
```

Modules with a dedicated page also include:

```
└── components/
    └── [Component].tsx
```

Modules with components: `payments`, `properties`, `visits`.

---

## Naming Conventions

| Type                  | Convention                  | Example                    |
| --------------------- | --------------------------- | -------------------------- |
| Components            | PascalCase                  | `PropertyCard.tsx`         |
| Hooks                 | camelCase with `use` prefix | `useProperties.ts`         |
| Entities              | kebab-case with suffix      | `property.entity.ts`       |
| Repository interfaces | kebab-case with suffix      | `property.repository.ts`   |
| HTTP adapters         | kebab-case with suffix      | `property.http-adapter.ts` |
| Mappers               | kebab-case with suffix      | `property.mapper.ts`       |
| Route constants       | SCREAMING_SNAKE_CASE keys   | `ROUTES.ADMIN.PROPERTIES`  |

---

## Routing

All routes are defined as constants in `src/config/routes.ts` — string literals are never used directly in the codebase.

```typescript
export const ROUTES = {
  HOME: "/",
  EXPLORE: "/explore",
  AUTH: {
    LOGIN: "/auth/login",
    SIGN_UP: "/auth/sign-up",
  },
  ADMIN: {
    PROPERTIES: "/admin/properties",
    VISITS: "/admin/visits",
    PAYMENTS: "/admin/payments",
  },
} as const;
```

---

## Route Protection

Protected routes live under `src/app/admin/`. The `admin/layout.tsx` handles session verification client-side using `useEffect` + `useRouter`. If no valid token is found, the user is redirected to `/auth/login`. No Next.js middleware is used.

---

## Module Dependency Rules

- Modules do not import from each other directly.
- If a page needs data from two modules (e.g. `properties` + `locations`), the composition happens in the `page.tsx` or in the module component via props.
- Shared types that multiple modules need go in `src/types/`.
- `uploads` and `locations` are cross-cutting modules — their hooks can be used anywhere but they have no components of their own.

---

## Key Constraints

- Every component file must have `'use client'` at the top.
- No server components, no server actions, no Next.js API routes.
- Pages (`page.tsx`) contain no logic — they only assemble module components.
- Module components only import from `application/hooks/` — never from `infra/`.
- HTTP adapters are the only files that interact with the Go API.
- HeroUI components are never imported directly into module components — always through `src/components/core/` wrappers.
