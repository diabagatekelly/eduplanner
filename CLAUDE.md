# Claude Instructions — Eduplanner

## ALWAYS READ THESE FILES FIRST

Before doing any work in this codebase, read:

1. **`CODEBASE_CONTEXT.md`** — Full architectural context: tech stack, patterns, anti-patterns, Redux shape, API layer, types, known issues, refactor goals. Read this to understand how the app works without re-exploring.

2. **`FILE_INDEX.md`** — Complete index of every file with its purpose. Use this to find files directly instead of running grep/glob searches. Includes a "Quick Lookup by Feature" section at the bottom.

3. **`REFACTOR_PLAN.md`** — The master refactor plan. Check current layer progress, branch strategy, and sub-task checklist before starting any work. Update checkboxes as tasks are completed.

Do not explore the codebase from scratch. Do not run broad glob or grep searches if the file location is already in FILE_INDEX.md. Read the context docs first, then go directly to the relevant files.

---

## Project Overview

**Eduplanner** is a Next.js 15 + React 19 + TypeScript frontend for an Islamic education management platform. It has:
- Teacher/student role system
- Activities (subjects/courses) with Quran, Language, and Misc flashcard types
- Spaced repetition (SRS) card progression
- Redux Toolkit for state management
- Tailwind CSS for styling
- Jest + Cypress for testing
- REST API backend at `http://localhost:8080` (separate repo)

---

## Current State: Major Refactor In Progress

This codebase has significant issues that are being systematically refactored. Key problems (full list in CODEBASE_CONTEXT.md):

- TypeScript `strict: false` — types are weak
- sessionStorage used as source of truth alongside Redux
- No Axios interceptors — auth token not injected into requests
- No form validation library (no zod/react-hook-form)
- No error boundaries or centralized error handling
- `window.location.reload()` used for state refresh
- Fake 100% test coverage via `/* istanbul ignore */`
- Magic strings for activity types, card types, status values
- `{...childArgs}` untyped props spreading throughout

---

## Working Guidelines

### Code Style
- TypeScript: once refactored, `strict: true` — no `any`
- Component style: functional components with explicit typed props interfaces
- File naming: kebab-case (already in use)
- Path alias: `@/*` maps to `src/*`

### State Management Direction (Refactor Target)
- Redux → UI state only (auth status, modals)
- Server state → React Query (data fetching, caching, mutations)
- sessionStorage → eliminated in favor of React Query cache + httpOnly cookies for auth

### Testing Standards
- No `/* istanbul ignore */` workarounds
- Unit tests: meaningful assertions, not just coverage
- E2E: cover critical user flows (login, create activity, add card, student management)

### Before Making Changes
1. Read CODEBASE_CONTEXT.md and FILE_INDEX.md
2. Use FILE_INDEX.md to find the exact files to edit
3. Read those files before modifying them
4. Understand the current pattern before replacing it
5. Make focused changes — don't refactor adjacent code unless asked

### Refactor Tracking
When the refactor plan is finalized, it will be documented here or in a separate `REFACTOR_PLAN.md`. Always check what phase of the refactor we're in before starting work.

---

## Finalized Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth | **next-auth v5** (credentials provider) | Wraps existing backend; OAuth providers addable later without backend refactor |
| Server state | **React Query v5** | Cache invalidation replaces `window.location.reload()`, no sessionStorage needed |
| Global state | **None (Redux removed)** | next-auth covers auth state, React Query covers server state, `useState` covers UI state |
| Forms | **React Hook Form v7 + Zod v4** | Type-safe, uncontrolled, schema-validated |
| Styling | **Tailwind v4** (upgrade in Layer 0) | CSS-first config — upgrade early to avoid double migration |
| Error feedback | **sonner** toasts | Replaces inline `message` state pattern |
| Error safety | **react-error-boundary** | Global + per-section boundaries |
| API mocking | **MSW v2** | Network-level mocking replaces `jest.mock()` |
| TypeScript | **strict: true** | Catch real bugs |
| E2E tests | **Defer Cypress upgrade + expansion** | Post-refactor backlog |

## Branch Strategy

```
main (production — never commit directly)
  └── refactor/main  ← all sub-branches target here
        ├── refactor/layer-0-tooling
        ├── refactor/layer-1-typescript
        ├── refactor/layer-2-auth
        ├── refactor/layer-3-state
        ├── refactor/layer-4-forms
        ├── refactor/layer-5-errors
        ├── refactor/layer-6-components
        ├── refactor/layer-7-tests
        └── refactor/layer-8-performance
```

Every sub-branch PRs into `refactor/main`. Final `refactor/main → main` when all layers are done.
**Never push to `main` directly. This is a production app.**
