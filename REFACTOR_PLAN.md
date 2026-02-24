# Eduplanner — Major Refactor Plan

> Living document. Update status as tasks are completed.
> This is a production app. No existing functionality may break.
> All work targets the `refactor/main` feature branch, never `main` directly.

---

## Finalized Architecture Decisions

| Concern | Old | New | Rationale |
|---------|-----|-----|-----------|
| Auth | Custom sessionStorage + Redux | **next-auth** (credentials provider) | Wraps existing backend login; OAuth providers addable later without backend changes |
| Server state | Redux + sessionStorage | **React Query v5** | Industry standard, cache invalidation replaces `window.location.reload()` |
| Auth UI state | Redux `isAuthenticated` | **next-auth `useSession()`** | Eliminated by next-auth — no Redux needed |
| UI state (modals, etc.) | Redux | **local `useState`** | Modals are already local — nothing truly global left |
| Global state library | **Redux Toolkit** | **Remove entirely** | No remaining use case once auth + server state are handled |
| Forms | Manual `useState` per field | **React Hook Form v7** | Less boilerplate, better performance (uncontrolled) |
| Validation | None (backend only) | **Zod v4** | Type-safe schemas, shared with TypeScript types |
| Styling | Tailwind v3 | **Tailwind v4** | CSS-first config, upgrade early to avoid double migration |
| Token injection | Missing entirely | **Axios interceptor** using next-auth session token | Consistent auth on all outbound requests |
| Error feedback | Inline `message` state per component | **`sonner` toast library** | Centralized, consistent, single pattern |
| Error boundaries | None | **React Error Boundary** (global + per section) | Prevent full-app crashes |
| API mocking (tests) | `jest.mock('../api/controller')` | **MSW v2** | Network-level mocking, works across unit + E2E |
| E2E tests | Cypress 13 (sparse) | Cypress 13 (stay, expand post-refactor) | Defer version bump to post-refactor |
| TypeScript | `strict: false` | **`strict: true`** | Catch real bugs, improve maintainability |

---

## Branch Strategy

```
main (production — never commit directly)
  └── refactor/main  (long-lived feature branch — target for all sub-branches)
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

### Rules
- Each `refactor/layer-*` branch PRs into `refactor/main` (not `main`)
- Within a layer, individual sub-tasks can be separate branches if desired: `refactor/layer-0-nextjs-upgrade`, `refactor/layer-0-tailwind-upgrade`, etc.
- Every merge to `refactor/main` must pass all existing tests
- The app must remain runnable and functionally correct at every merge point
- No layer may remove existing functionality until the replacement is fully working
- Final PR: `refactor/main → main` when all layers are complete and regression-tested

---

## Dependency Map (Layer Prerequisites)

```
Layer 0 (Tooling)
  └── Layer 1 (TypeScript)
        ├── Layer 2 (Auth)
        │     └── Layer 3 (State)
        │           ├── Layer 4 (Forms)
        │           ├── Layer 5 (Errors)
        │           └── Layer 6 (Components)
        │                 └── Layer 7 (Tests)
        │                       └── Layer 8 (Performance)
        └── Layer 4 (Forms) [also needs Layer 3]
```

Layers 4, 5, 6 can be worked in parallel once Layer 3 is complete. Layer 7 should be last among 4–7.

---

## Packages Being Added

| Package | Version | Layer | Purpose |
|---------|---------|-------|---------|
| `next-auth` | v5 (Auth.js) | 2 | Authentication |
| `@auth/core` | latest | 2 | next-auth v5 peer |
| `@tanstack/react-query` | ^5.90 | 3 | Server state management |
| `@tanstack/react-query-devtools` | ^5.90 | 3 | Dev tooling |
| `react-hook-form` | ^7.71 | 4 | Form state management |
| `zod` | ^4.3 | 4 | Schema validation |
| `@hookform/resolvers` | latest | 4 | RHF + Zod integration |
| `sonner` | latest | 5 | Toast notifications |
| `msw` | ^2.x | 7 | API mocking for tests |
| `@next/bundle-analyzer` | latest | 8 | Bundle size analysis |
| `prettier` | latest | 0 | Code formatting |
| `eslint-config-prettier` | latest | 0 | ESLint + Prettier compatibility |
| `@tailwindcss/postcss` | ^4.x | 0 | Tailwind v4 PostCSS plugin |

## Packages Being Removed

| Package | Layer | Reason |
|---------|-------|--------|
| `redux` | 3 | Replaced by React Query + next-auth |
| `@reduxjs/toolkit` | 3 | Same |
| `react-redux` | 3 | Same |
| `tailwindcss` (v3) | 0 | Replaced by v4 |

---

## Layer 0: Dependency Upgrades & Tooling Foundation

**Goal**: Establish the correct modern baseline. All subsequent layers build on this.
**Branch**: `refactor/layer-0-tooling` (or multiple sub-branches per task)
**Risk**: Medium — package upgrades can surface unexpected breakage. Run tests after each sub-task.

### 0.1 — Next.js 15 → 16
**Sub-branch**: `refactor/layer-0-nextjs`

- [ ] Run the official codemod: `npx @next/codemod@canary upgrade latest`
- [ ] Audit output — the codemod handles async `params` in server components automatically
- [ ] Verify `app/[username]/page.tsx` and all dynamic route pages — if any receive `params` as server-side props (not via `useParams()`), ensure they are `async` and `await params`
- [ ] Remove `--turbopack` flag from `dev` script in `package.json` (Turbopack is now default)
- [ ] Fix `npm run lint` script: change `next lint` → `eslint .` (the `next lint` command is removed in v16)
- [ ] Check `next.config.js` — remove any deprecated options surfaced by codemod
- [ ] Verify no parallel route slots (`@slot` directories) that would need `default.js` files (none expected based on current structure)
- [ ] Run `npm run build` — confirm clean build
- [ ] Run `npm test` — confirm all tests pass

**Notes**:
- `next.config.js` currently only uses `env: { ... }` — no webpack config, so Turbopack default is safe
- No `middleware.ts` in this codebase so middleware→proxy rename is not applicable
- `next/legacy/image` is deprecated — not currently used, but don't use it in future

---

### 0.2 — ESLint 9 → 10 + Flat Config
**Sub-branch**: `refactor/layer-0-eslint`

- [ ] Upgrade ESLint to v10: `npm install -D eslint@latest`
- [ ] Install `@eslint/js`: `npm install -D @eslint/js`
- [ ] Install `eslint-config-prettier`: `npm install -D eslint-config-prettier`
- [ ] Create `eslint.config.js` (flat config) at project root:
  ```js
  import js from '@eslint/js'
  import nextPlugin from '@next/eslint-plugin-next'
  import prettier from 'eslint-config-prettier'

  export default [
    js.configs.recommended,
    {
      plugins: { '@next/next': nextPlugin },
      rules: { ...nextPlugin.configs.recommended.rules }
    },
    prettier
  ]
  ```
- [ ] Delete `.eslintrc.json`
- [ ] Update `package.json` lint script: `"lint": "eslint ."`
- [ ] Run `npm run lint` — fix any newly surfaced rule violations
- [ ] Verify Husky pre-commit hook still runs lint correctly

**Notes**:
- ESLint v10 completely ignores `.eslintrc.json` — leaving it would give a false sense of security
- `next lint` CLI removal is also handled in 0.1 — these two steps are coupled

---

### 0.3 — Add Prettier
**Sub-branch**: `refactor/layer-0-prettier` (can combine with 0.2)

- [ ] Install: `npm install -D prettier`
- [ ] Create `.prettierrc`:
  ```json
  {
    "semi": false,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5",
    "printWidth": 100
  }
  ```
- [ ] Create `.prettierignore`: `.next/`, `node_modules/`, `coverage/`, `public/`
- [ ] Run `npx prettier --write src/` — format entire codebase once
- [ ] Update Husky pre-commit: run `prettier --check .` before commit
- [ ] Add `format` script to `package.json`: `"format": "prettier --write src/"`

**Notes**:
- The one-time format run will create a large diff. Commit this separately with message `style: format entire codebase with prettier` so it doesn't pollute meaningful commit diffs.

---

### 0.4 — TypeScript 5.2 → 5.9
**Sub-branch**: `refactor/layer-0-typescript` (can combine with Layer 1)

- [ ] Upgrade: `npm install -D typescript@latest`
- [ ] Enable `"strict": true` in `tsconfig.json`
- [ ] Run `npx tsc --noEmit` — collect the full list of type errors (do NOT fix them here)
- [ ] Document count and categories of errors (this becomes the Layer 1 task list)
- [ ] The codebase should still build and run — TypeScript errors are compile-time only; Next.js will still run with errors present during development
- [ ] Commit with message `chore: upgrade TypeScript to 5.9, enable strict mode (errors deferred to Layer 1)`

**Notes**:
- Strict mode enables: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, etc.
- Expected error categories: missing types, `any` usage, possibly-undefined access, uninitialized variables
- DO NOT add `// @ts-ignore` or `// @ts-expect-error` to pass — that defeats the purpose

---

### 0.5 — Tailwind CSS v3 → v4
**Sub-branch**: `refactor/layer-0-tailwind`

- [ ] Run the upgrade tool: `npx @tailwindcss/upgrade` (handles ~80% automatically)
- [ ] Install new packages: `npm install tailwindcss@latest @tailwindcss/postcss`
- [ ] Update `postcss.config.js`:
  ```js
  // Before
  plugins: { tailwindcss: {}, autoprefixer: {} }
  // After
  plugins: { "@tailwindcss/postcss": {} }
  ```
  (Tailwind v4 bundles autoprefixer — separate autoprefixer package can be removed)
- [ ] Migrate `tailwind.config.ts` → `@theme {}` block in `globals.css`:
  - Custom `fontSize` config → CSS variables in `@theme`
  - Delete `tailwind.config.ts` after migration
- [ ] Update `globals.css`:
  - Replace `@tailwind base; @tailwind components; @tailwind utilities;` → `@import "tailwindcss";`
  - Add `@theme { }` block with custom font sizes
- [ ] Verify `@layer components` with `@apply` still works (it does in v4, but audit)
- [ ] Manually audit class renames in all component files:
  - `shadow-sm` → `shadow-xs`, `shadow` → `shadow-sm`
  - `rounded-sm` → `rounded-xs`, `rounded` → `rounded-sm`
  - `blur-sm` → `blur-xs`, `blur` → `blur-sm`
  - `outline-none` → `outline-hidden`
  - `ring` (was 3px) → `ring-3` (v4 `ring` is now 1px)
  - `ring-offset-*` → `ring-offset-*` (unchanged but verify)
  - Default border color changed from `gray-200` → `currentColor` — audit all bare `border` classes
- [ ] Fix `!important` suffix position: `!flex` → `flex!`, `!hidden` → `hidden!`, etc. (grep for `className="[^"]*![a-z]`)
- [ ] Fix arbitrary CSS variable syntax: `bg-[--var]` → `bg-(--var)`
- [ ] Visual regression check — open each page and compare against screenshots from before
- [ ] Run `npm run build` — confirm no Tailwind compilation errors

**Notes**:
- The `npx @tailwindcss/upgrade` tool handles most class renames automatically
- Content detection is automatic in v4 — no `content: []` config needed
- `tailwind.config.ts` can be deleted entirely after CSS migration

---

### 0.6 — Minor/Patch Version Bumps
**Sub-branch**: combine with any 0.x branch

- [ ] `npm install react@latest react-dom@latest` (19.1 → 19.2)
- [ ] `npm install axios@latest` (1.8 → 1.13)
- [ ] `npm install @headlessui/react@latest` (2.2.1 → 2.2.9)
- [ ] `npm install @reduxjs/toolkit@latest react-redux@latest` (bump before removing in Layer 3)
- [ ] `npm install -D @testing-library/react@latest` (16.3.0 → 16.3.2)
- [ ] Run full test suite after all bumps: `npm test`

---

### Layer 0 Definition of Done
- [ ] `npm run build` passes cleanly
- [ ] `npm test` passes (all existing tests green)
- [ ] `npm run lint` passes with new flat config
- [ ] `npm run dev` starts and app is visually correct
- [ ] All pages render correctly, no visual regressions in Tailwind classes
- [ ] TypeScript errors are catalogued but build is not blocked

---

## Layer 1: TypeScript — Full Type Safety

**Goal**: Every file compiles under `strict: true` with no errors. No `any`, no implicit types.
**Branch**: `refactor/layer-1-typescript`
**Prerequisite**: Layer 0 complete
**Risk**: Low — type-only changes do not affect runtime behavior

### 1.1 — Typed Redux (Pre-Removal)
*(Redux still exists at this stage — properly type it before Layer 3 removes it)*

- [ ] Add `RootState` and `AppDispatch` types to `store/store.ts`
- [ ] Create typed hooks: `useAppSelector` and `useAppDispatch` in a `src/store/hooks.ts` file
- [ ] Replace all bare `useSelector` / `useDispatch` calls with typed versions
- [ ] Add proper return types to all action creators in `authActions.ts` and `userActions.ts`

### 1.2 — Fix Component Prop Types
*(Highest priority — `{...childArgs}` is the root cause of cascading type issues)*

- [ ] Audit every component that uses `{...childArgs}` or accepts untyped spreads
- [ ] Define explicit `interface Props { ... }` for every component
- [ ] Start with popup components — `popup.tsx` and all `*Popup.tsx` files
- [ ] Then list components (`lists-ui.tsx`, `activities-list.tsx`, `cards-list.tsx`, `students-list.tsx`)
- [ ] Then form components (all in `components/forms/`)
- [ ] Then feature components (`dashboard.tsx`, `view-activity.tsx`, `add-activity.tsx`, etc.)
- [ ] Remove all `// @ts-ignore` and `// @ts-expect-error` comments

### 1.3 — Fix ICard Discriminated Union
- [ ] Rewrite `types/ICard.ts` as a proper discriminated union:
  ```typescript
  type ICard = IQuranJuzCard | IQuranSurahCard | ILanguageVocabCard | ILanguageGrammarCard | IMiscCard
  // Each variant has: type: 'QuranJuz' | 'QuranSurah' | 'LanguageVocab' | 'LanguageGrammar' | 'Misc'
  ```
- [ ] Update all switch/if statements that check card type to use the discriminant field
- [ ] Verify `formatCardName.ts` uses proper narrowing

### 1.4 — Add Activity Type and Card Type Constants
- [ ] Create `src/lib/constants/activityTypes.ts`:
  ```typescript
  export const ACTIVITY_TYPES = { QURAN: 'Quran', LANGUAGE: 'Language', MISC: 'Misc' } as const
  export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES]
  ```
- [ ] Create `src/lib/constants/cardTypes.ts` with card type constants
- [ ] Replace all hardcoded `"Quran"`, `"Language"`, `"Arabic-Language"` strings with these constants
- [ ] Grep for remaining magic strings after replacement

### 1.5 — Fix Remaining Strict Mode Errors
- [ ] Work through the full error list from `tsc --noEmit` captured in 0.4
- [ ] Fix `strictNullChecks` violations (add null guards, optional chaining)
- [ ] Fix `noImplicitAny` violations (type all parameters and return values)
- [ ] Fix `strictPropertyInitialization` violations
- [ ] Update `tsconfig.json` to include test files in type checking (remove test files from `exclude`)

### 1.6 — Type API Responses
- [ ] Review actual backend API response shapes
- [ ] Update `IApiResponse.ts` to accurately reflect what the backend returns
- [ ] Add proper return types to all `controller.ts` functions
- [ ] Remove `any` from `service.ts` method signatures

### 1.7 — Route Params Types
- [ ] Verify `IParams.ts` types work with Next.js 16's async params
- [ ] Update any server component page files that receive `params` as props

### Layer 1 Definition of Done
- [ ] `npx tsc --noEmit` reports zero errors
- [ ] Zero `any` types in source (excluding `node_modules`)
- [ ] Zero `// @ts-ignore` or `// @ts-expect-error` comments
- [ ] `npm test` still passes (tests may need minor type fixes)
- [ ] `npm run build` clean

---

## Layer 2: Authentication Overhaul

**Goal**: Real, secure auth using next-auth. No sessionStorage. Token injected into all API requests automatically.
**Branch**: `refactor/layer-2-auth`
**Prerequisite**: Layer 1 complete
**Risk**: HIGH — touches login, logout, session, and all protected routes. Must test exhaustively.
**Safety note**: Implement new auth system alongside existing system, switch over once verified, then remove old system.

### 2.1 — Install and Configure next-auth v5

- [ ] Install: `npm install next-auth@beta` (v5 / Auth.js — first-class App Router support)
- [ ] Create `src/auth.ts` at the root of `src/`:
  ```typescript
  import NextAuth from 'next-auth'
  import Credentials from 'next-auth/providers/credentials'
  import { loginUser } from '@/api/controller'

  export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
      Credentials({
        credentials: {
          userId: { label: 'User ID' },
          password: { label: 'Password', type: 'password' }
        },
        authorize: async (credentials) => {
          const response = await loginUser({
            userId: credentials.userId as string,
            password: credentials.password as string
          })
          if (response?.status === 200) {
            return response.data.details.user  // IUser from backend
          }
          return null
        }
      })
    ],
    callbacks: {
      jwt({ token, user }) {
        if (user) token.user = user  // persist IUser in JWT
        return token
      },
      session({ session, token }) {
        session.user = token.user as any  // expose to useSession()
        return session
      }
    },
    pages: {
      signIn: '/login'
    }
  })
  ```
- [ ] Create `src/app/api/auth/[...nextauth]/route.ts`:
  ```typescript
  import { handlers } from '@/auth'
  export const { GET, POST } = handlers
  ```
- [ ] Add `AUTH_SECRET` to `.env.local`: `AUTH_SECRET=<generate with: openssl rand -base64 32>`
- [ ] Add to `.env.test`: `AUTH_SECRET=test-secret`

### 2.2 — Add SessionProvider to Root Layout
- [ ] Wrap root layout body with `SessionProvider` from `next-auth/react`
- [ ] This enables `useSession()` in all client components

### 2.3 — Add Axios Interceptor for Token Injection
- [ ] Update `src/api/service.ts` — add a request interceptor:
  ```typescript
  // Interceptor gets current session token and attaches to Authorization header
  axiosInstance.interceptors.request.use(async (config) => {
    const session = await getSession()  // from next-auth/react
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }
    return config
  })
  ```
- [ ] Update the JWT callback in `auth.ts` to expose the backend token as `accessToken`
- [ ] Verify all API calls now include the Authorization header

### 2.4 — Update Login Flow
- [ ] Update `login-form.tsx` to use next-auth's `signIn('credentials', { ... })` instead of calling `loginUser()` + `setAuthToken()` manually
- [ ] Remove direct `loginUser()` call from login form
- [ ] Remove `dispatch(setAuthToken(...))` from login form
- [ ] Handle next-auth's error responses (returns `{ error: string }` on failure)
- [ ] On success, next-auth handles redirect automatically (or use `callbackUrl`)

### 2.5 — Update Logout Flow
- [ ] Replace all logout handling with next-auth's `signOut()` function
- [ ] `signOut()` clears the next-auth session cookie automatically
- [ ] Remove manual `dispatch(removeAuthToken())` and `sessionStorage.clear()`

### 2.6 — Move Route Protection to Middleware
- [ ] Create `src/middleware.ts` (Next.js 16: will need to rename to `proxy.ts` per v16 — NOTE: Next.js 16 renames `middleware` to `proxy`. Confirm during 0.1 codemod output.)

  **Actually**: Next.js 16 renames the file to `proxy.ts` with export renamed from `middleware` to `proxy`. Create accordingly:
  ```typescript
  // src/proxy.ts (Next.js 16)
  import { auth } from '@/auth'

  export const proxy = auth((req) => {
    const isAuthenticated = !!req.auth
    const pathname = req.nextUrl.pathname
    const isPublicRoute = ['/', '/home', '/login', '/register'].includes(pathname)

    if (!isAuthenticated && !isPublicRoute) {
      return Response.redirect(new URL('/login', req.url))
    }
    if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      return Response.redirect(new URL(`/${req.auth.user.username}`, req.url))
    }
  })

  export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
  }
  ```
- [ ] Remove the entire `Reloader` component from `layout.tsx` (its only job was auth checking)
- [ ] Remove `useMounted()` from `layout.tsx`
- [ ] Remove `hasToken()` and `hasExpired()` dispatch calls from `layout.tsx`
- [ ] Remove `populateUser()` dispatch from `layout.tsx`

### 2.7 — Clean Up Auth Actions and Reducers
*(Do not delete yet — `authReducer` and `authActions` will be removed in Layer 3 with Redux)*
- [ ] Mark `setAuthToken`, `removeAuthToken`, `hasToken`, `hasExpired`, `populateUser` as deprecated with `@deprecated` JSDoc
- [ ] Remove sessionStorage writes from these actions (next-auth manages the session now)
- [ ] The full removal happens in Layer 3

### 2.8 — Update `layout.tsx`
- [ ] Remove `'use client'` from `layout.tsx` — it can now be a Server Component
- [ ] Remove `Provider` (Redux) — temporarily keep if Layer 3 isn't done yet, but plan to remove
- [ ] Remove `Reloader` component entirely
- [ ] Add `SessionProvider` wrapper (needed for client components to use `useSession()`)
- [ ] Remove `useMounted`, `usePathname`, `useRouter` imports from layout

### 2.9 — Fix Token Expiration
- [ ] Remove `hasExpired()` date-check hack (checks if date changed since login, not JWT expiry)
- [ ] next-auth handles session expiry via the `maxAge` config option
- [ ] Set `maxAge` in next-auth config to match backend token lifetime
- [ ] Add session refresh handling if backend supports refresh tokens

### Layer 2 Definition of Done
- [ ] Login works end-to-end with next-auth credentials provider
- [ ] Logout clears session correctly
- [ ] Unauthenticated users are redirected to `/login` (server-side via proxy/middleware)
- [ ] Authenticated users are redirected away from `/login` and `/register`
- [ ] All API calls include `Authorization: Bearer <token>` header
- [ ] No `sessionStorage` usage for auth (grep for `sessionStorage` — should return zero results in auth-related files)
- [ ] `npm run build` clean
- [ ] `npm test` passes

---

## Layer 3: State Management Refactor

**Goal**: Remove Redux entirely. React Query owns all server/async state. next-auth owns auth state. Local `useState` owns UI state.
**Branch**: `refactor/layer-3-state`
**Prerequisite**: Layer 2 complete (next-auth provides token for API calls)
**Risk**: HIGH — touches almost every component. Migrate incrementally: install React Query, convert one feature at a time, remove Redux last.

### 3.1 — Install React Query
- [ ] Install: `npm install @tanstack/react-query @tanstack/react-query-devtools`
- [ ] Create `src/lib/query-client.ts`:
  ```typescript
  import { QueryClient } from '@tanstack/react-query'
  export const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 1000 * 60, retry: 1 },
      mutations: { retry: 0 }
    }
  })
  ```
- [ ] Add `QueryClientProvider` to `layout.tsx` (alongside or replacing Redux `Provider`)
- [ ] Add `ReactQueryDevtools` for development

### 3.2 — Create Query Keys
- [ ] Create `src/lib/query-keys.ts` with typed query key factory:
  ```typescript
  export const queryKeys = {
    user: (userId: string) => ['user', userId] as const,
    activities: (userId: string) => ['activities', userId] as const,
    activity: (userId: string, name: string) => ['activity', userId, name] as const,
    cards: (userId: string, activityName: string) => ['cards', userId, activityName] as const,
    students: (userId: string) => ['students', userId] as const,
    student: (studentId: string) => ['student', studentId] as const,
  }
  ```

### 3.3 — Create Query Hooks (Read Operations)
Create `src/hooks/` directory with the following:

- [ ] `src/hooks/use-user.ts` — `useUser(userId)` wrapping `findUser()`
- [ ] `src/hooks/use-activities.ts` — `useActivities(userId)` — get user's activities from user query
- [ ] `src/hooks/use-activity.ts` — `useActivity(userId, activityName)` — single activity with cards
- [ ] `src/hooks/use-students.ts` — `useStudents(userId)` — teacher's linked students
- [ ] `src/hooks/use-student.ts` — `useStudent(studentId)` — single student detail

### 3.4 — Create Mutation Hooks (Write Operations)
- [ ] `src/hooks/use-activity-mutations.ts`:
  - `useCreateActivity()` — calls `createActivity()`, invalidates activities query on success
  - `useEditActivity()` — calls `editActivity()`, invalidates
  - `useDeleteActivity()` — calls `deleteActivity()`, invalidates
- [ ] `src/hooks/use-card-mutations.ts`:
  - `useCreateCards()` — calls `createCards()`, invalidates cards query
  - `useEditCard()` — calls `editAnyCardAttr()`, invalidates
  - `useEditCardStage()` — calls `editCardStage()`, invalidates
  - `useResetCardStage()` — calls `resetCardStage()`, invalidates
  - `useActivateCard()` — calls `activateCard()`, invalidates
  - `useDeleteCard()` — calls `deleteCard()`, invalidates
  - `useRequestCardReview()` — calls `requestCardReview()`, invalidates
- [ ] `src/hooks/use-student-mutations.ts`:
  - `useLinkStudent()` — calls `linkAccount()`, invalidates students query
  - `useUnlinkStudent()` — calls `unlinkAccount()`, invalidates

### 3.5 — Migrate Components to React Query (Feature by Feature)

**Order** (low risk → high risk):

- [ ] **Dashboard** — Replace Redux `userReducer` selector with `useSession()` for user identity + `useActivities()` / `useStudents()` for data
- [ ] **Activities List** — Replace Redux activities with `useActivities(userId)`
- [ ] **Activity Detail / View Activity** — Replace with `useActivity(userId, activityName)`
- [ ] **Cards List** — Replace with cards from `useActivity()` result
- [ ] **Students List** — Replace with `useStudents(userId)`
- [ ] **Student Detail** — Replace with `useStudent(studentId)`
- [ ] **Add Activity** — Replace `dispatch(createUserActivity(...))` with `useCreateActivity()` mutation
- [ ] **Delete Activity** — Replace `dispatch(removeUserActivity(...))` with `useDeleteActivity()` mutation
- [ ] **Card mutations** — Replace all `dispatch(createUserCard/editUserCard/removeUserCard)` with mutation hooks
- [ ] **Student mutations** — Replace `dispatch(addNewStudent/removeStudent)` with mutation hooks

### 3.6 — Remove `window.location.reload()` Calls
- [ ] Grep for `window.location.reload` — should find 2+ instances
- [ ] Replace each with `queryClient.invalidateQueries({ queryKey: queryKeys.xyz(...) })`
- [ ] Verify data refreshes correctly after each mutation without page reload

### 3.7 — Remove Redux Entirely
Once all components have been migrated off Redux:

- [ ] Delete `src/store/` directory entirely
- [ ] Remove `redux`, `@reduxjs/toolkit`, `react-redux` from `package.json`
- [ ] Remove `Provider` from `layout.tsx`
- [ ] Remove all `useSelector`, `useDispatch`, `dispatch()` calls
- [ ] Remove all `import ... from '@/store/*'` imports
- [ ] Grep for any remaining Redux imports — should be zero
- [ ] Run `npm install` to clean up `node_modules`

### 3.8 — Update SessionStorage (Full Removal)
- [ ] Grep for `sessionStorage` — should return zero results after Redux + auth overhaul
- [ ] Verify no direct `sessionStorage.getItem/setItem` calls remain
- [ ] Remove `user_data` and `user_token` and `created_on` key references

### Layer 3 Definition of Done
- [ ] Zero `import` statements referencing `@/store/` or `react-redux` or `@reduxjs/toolkit`
- [ ] Zero `sessionStorage` usage (except Cypress test hack — handle separately in Layer 7)
- [ ] Zero `window.location.reload()` calls
- [ ] All data loads via React Query hooks
- [ ] Optimistic updates or proper invalidation after every mutation
- [ ] `npm test` passes (tests will need updating for React Query — partial task, completed in Layer 7)
- [ ] `npm run build` clean
- [ ] All pages function correctly end-to-end

---

## Layer 4: Forms & Validation

**Goal**: Type-safe, schema-validated forms. Proper inline error UX. Less boilerplate.
**Branch**: `refactor/layer-4-forms`
**Prerequisite**: Layer 1 (typed interfaces), Layer 3 (mutation hooks to submit to)
**Risk**: Medium — form behavior changes are visible to users. Test each form carefully.

### 4.1 — Install Dependencies
- [ ] `npm install react-hook-form zod @hookform/resolvers`

### 4.2 — Define Zod Schemas
Create `src/lib/schemas/`:

- [ ] `src/lib/schemas/auth.schemas.ts`:
  ```typescript
  import { z } from 'zod'
  export const loginSchema = z.object({
    email: z.email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
  export const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    accountType: z.enum(['teacher', 'student'])
  })
  export type LoginFormData = z.infer<typeof loginSchema>
  export type RegisterFormData = z.infer<typeof registerSchema>
  ```
- [ ] `src/lib/schemas/activity.schemas.ts` — name, description, points, hasCards
- [ ] `src/lib/schemas/card.schemas.ts` — discriminated union schema per card type
- [ ] `src/lib/schemas/profile.schemas.ts` — edit profile fields

### 4.3 — Migrate Login Form
- [ ] Replace all `useState` field state in `login-form.tsx` with `useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })`
- [ ] Use `register()` for inputs, `formState.errors` for inline error messages
- [ ] Use `formState.isSubmitting` to disable submit button
- [ ] Remove manual `isLoading` state

### 4.4 — Migrate Register Form
- [ ] Same pattern as login — `registerSchema`, `useForm`, `register()`, `formState.errors`

### 4.5 — Migrate Add Activity Form
- [ ] Replace `useState` fields with `useForm<ActivityFormData>({ resolver: zodResolver(activitySchema) })`
- [ ] Add inline validation for name (required), points (number, min 0), description

### 4.6 — Migrate Card Forms (3 forms)
- [ ] `add-quran-card-form.tsx` — schema validates Juz/Surah selection, required fields per level
- [ ] `add-language-card-form.tsx` — schema validates vocab/grammar, word required
- [ ] `add-misc-card-form.tsx` — schema validates content required

### 4.7 — Migrate Edit Profile Form
- [ ] In `user-profile.tsx` — replace field state with `useForm`

### 4.8 — Migrate Search User Form
- [ ] `search-user-form.tsx` — email validation via Zod `z.email()`

### Layer 4 Definition of Done
- [ ] Zero manual `useState` field state in any form component
- [ ] Every form has inline error messages below invalid fields
- [ ] Submit buttons disabled when `formState.isSubmitting`
- [ ] All schemas in `src/lib/schemas/` — no inline validation logic
- [ ] `npm test` passes for form components
- [ ] Forms work end-to-end in the browser

---

## Layer 5: Error Handling & UX Feedback

**Goal**: No app-crashing unhandled errors. Consistent, accessible feedback for all user actions.
**Branch**: `refactor/layer-5-errors`
**Prerequisite**: Layer 3 (React Query's `isError`/`error` states available)
**Risk**: Low-Medium — additive changes

### 5.1 — Add React Error Boundaries
- [ ] Install: `npm install react-error-boundary`
- [ ] Create `src/components/error-boundary.tsx` with a reusable boundary component
- [ ] Add global boundary in `layout.tsx` wrapping `{children}`
- [ ] Add section-level boundaries around: activities section, cards section, students section
- [ ] Error fallback UI should show a friendly message + "Try again" button that calls `resetErrorBoundary()`

### 5.2 — Add Toast Notifications (sonner)
- [ ] Install: `npm install sonner`
- [ ] Add `<Toaster />` to `layout.tsx`
- [ ] Create `src/lib/toast.ts` with typed helpers:
  ```typescript
  import { toast } from 'sonner'
  export const notify = {
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
    loading: (msg: string) => toast.loading(msg),
  }
  ```

### 5.3 — Replace Inline Message State with Toasts
- [ ] Grep for `const [message, setMessage] = useState` — replace each instance
- [ ] In mutation hooks' `onSuccess`/`onError` callbacks: call `notify.success()` / `notify.error()`
- [ ] Remove `message` state and its corresponding render (`{message && <p>...}`) from all components

### 5.4 — Handle React Query Error States
- [ ] For every `useQuery` call that renders data, handle `isError` state:
  - Show an error message + retry button (calls `refetch()`)
  - Do not just render empty/nothing on error
- [ ] For every mutation's `onError`, call `notify.error(error.message)`

### 5.5 — Add Empty States
- [ ] `activities-list.tsx` — distinct "No activities yet" empty state vs loading vs error
- [ ] `cards-list.tsx` — "No cards in this category" per tab
- [ ] `students-list.tsx` — "No students linked yet" for teachers

### 5.6 — Add Skeleton Screens
- [ ] Install or build skeleton components (Tailwind `animate-pulse` is sufficient)
- [ ] `activities-list.tsx` — skeleton while `isLoading`
- [ ] `cards-list.tsx` — skeleton while `isLoading`
- [ ] `students-list.tsx` — skeleton while `isLoading`
- [ ] Dashboard — skeleton for user info while loading

### 5.7 — Remove Cypress Window Hack
- [ ] `layout.tsx` has `if (window.Cypress) { window.store = store }` — remove this (Redux is gone, window hack is gone)
- [ ] If Cypress tests need store access, use MSW interceptors instead (Layer 7)

### Layer 5 Definition of Done
- [ ] No unhandled promise rejections in browser console during normal use
- [ ] All mutations show a success or error toast
- [ ] All loading states show skeleton UI (not empty/flash)
- [ ] All error states show a retry option
- [ ] `npm test` passes

---

## Layer 6: Component Architecture

**Goal**: Clean, well-composed components. Minimal `"use client"` footprint. Typed, predictable interfaces.
**Branch**: `refactor/layer-6-components`
**Prerequisite**: Layers 1–5 complete
**Risk**: Medium — structural changes. Test each refactored component before moving on.

### 6.1 — Convert `layout.tsx` to Server Component
- [ ] By this point: no Redux Provider, no Reloader, SessionProvider is the only wrapper needed
- [ ] Remove `'use client'` from `layout.tsx`
- [ ] `SessionProvider` must be in a client boundary — create `src/components/session-provider.tsx`:
  ```typescript
  'use client'
  import { SessionProvider } from 'next-auth/react'
  export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>
  }
  ```
- [ ] Import `AuthProvider` in the now-server `layout.tsx`

### 6.2 — Refactor the Popup/Modal System
Current problem: `popup.tsx` dispatches to modal type by string — no type safety, untrackable props.

- [ ] Define a typed modal system using discriminated unions:
  ```typescript
  type ModalProps =
    | { type: 'deleteAccount'; userId: string }
    | { type: 'deleteActivity'; activityName: string; userId: string }
    | { type: 'linkAccount'; teacherId: string; student: IUser }
    | { type: 'unlinkAccount'; teacherId: string; studentId: string }
    | { type: 'manageCard'; card: ICard; activityName: string; userId: string }
    | { type: 'validate'; message: string; onConfirm: () => void }
  ```
- [ ] Replace `popup.tsx` string switch with typed component that narrows on `props.type`
- [ ] Update every call site to pass typed `ModalProps` instead of `{ modalType: string, ...childArgs }`
- [ ] All popup components receive explicit, typed props

### 6.3 — Refactor the List Router
- [ ] Same approach as modals — replace `lists-ui.tsx` string dispatch with typed component selection
- [ ] Or simply eliminate the router and use the specific list components directly at call sites

### 6.4 — Extract Business Logic into Custom Hooks
- [ ] Audit large components for logic that can be extracted
- [ ] Create `src/hooks/use-activity-page.ts` — activity page state + action logic
- [ ] Create `src/hooks/use-dashboard.ts` — dashboard data assembly
- [ ] Components should only contain JSX + minimal event wiring — no API call logic inline

### 6.5 — Reduce `"use client"` Footprint
- [ ] Audit every `'use client'` directive — ask: does this component actually need browser APIs or event handlers?
- [ ] Candidates for Server Components:
  - `breadcrumbs.tsx` — only uses `usePathname()` which has a server equivalent
  - `footer.tsx` — purely static
  - List containers (pass data down to client list items)
- [ ] Where `'use client'` is needed, push it down to the smallest possible component

### 6.6 — Fix `useMounted()` Usage
- [ ] Each usage of `useMounted()` is guarding some sessionStorage or window access
- [ ] With sessionStorage removed (Layer 3), most `useMounted()` usages should be gone
- [ ] For any remaining cases (Headless UI transitions, etc.) — use `next/dynamic` with `ssr: false` instead
- [ ] Delete `useMounted.tsx` once no usages remain

### 6.7 — Add Teacher/Student Route Guards
- [ ] Teacher-only pages (`/students`) currently check `accountType` inside the component
- [ ] Move to layout level: create a teacher-only layout or use a guard in the proxy/middleware
- [ ] Student-only logic should also be at layout/proxy level

### 6.8 — Clean Up Miscellaneous Anti-Patterns
- [ ] Remove all `window.location.reload()` (should be done in Layer 3, verify here)
- [ ] Remove commented-out Quran sort code in `cards-list.tsx`
- [ ] Remove `list-analysis.txt` from the `components/lists/` directory (not source code)
- [ ] Remove all unused imports (TypeScript strict mode will have caught most)

### Layer 6 Definition of Done
- [ ] Zero `{...childArgs}` or untyped prop spreads
- [ ] Zero string-switched modal/list dispatchers
- [ ] All popup components have explicit typed props
- [ ] `layout.tsx` is a Server Component
- [ ] `useMounted()` deleted (or has ≤1 legitimate use case)
- [ ] `npm test` passes
- [ ] All pages function correctly end-to-end

---

## Layer 7: Testing Overhaul

**Goal**: Real test coverage. Tests that actually verify behavior. No fake 100%.
**Branch**: `refactor/layer-7-tests`
**Prerequisite**: All layers 0–6 complete (tests must reflect final architecture)
**Risk**: Low — test-only changes don't affect runtime

### 7.1 — Upgrade Jest 29 → 30
- [ ] `npm install -D jest@latest`
- [ ] Fix all deprecated matcher aliases (codemod available: `jest-codemods`):
  - `toBeCalled()` → `toHaveBeenCalled()`
  - `toBeCalledWith()` → `toHaveBeenCalledWith()`
  - `toBeCalledTimes()` → `toHaveBeenCalledTimes()`
  - `lastCalledWith()` → `toHaveBeenLastCalledWith()`
  - etc. (grep for `toBeCalled` and `toReturn` variants)
- [ ] Fix `SpyInstance` type → `jest.Spied<typeof fn>`
- [ ] Fix any `window.location` mocking affected by JSDOM 26 upgrade
- [ ] Update `jest.config.ts` if any options changed in v30
- [ ] Run `npm test` — fix any v30 breaking changes

### 7.2 — Install and Configure MSW
- [ ] `npm install -D msw`
- [ ] Create `src/specs/mocks/handlers.ts` with MSW request handlers for all API endpoints:
  ```typescript
  import { http, HttpResponse } from 'msw'
  export const handlers = [
    http.get('/user/login', () => HttpResponse.json({ message: null, details: { user: mockUser } })),
    http.post('/user/register', () => HttpResponse.json({ ... })),
    // ... all endpoints
  ]
  ```
- [ ] Create `src/specs/mocks/server.ts` (Node environment for Jest):
  ```typescript
  import { setupServer } from 'msw/node'
  import { handlers } from './handlers'
  export const server = setupServer(...handlers)
  ```
- [ ] Update `jest.setup.ts` to start/stop MSW server:
  ```typescript
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
  ```
- [ ] Replace `jest.mock('../api/controller')` with MSW handlers in all test files

### 7.3 — Update Test Utilities
- [ ] Update `src/specs/util.tsx` — replace Redux `Provider` wrapper with React Query `QueryClientProvider` wrapper
- [ ] Add next-auth `SessionProvider` mock wrapper
- [ ] Create `createTestQueryClient()` helper with aggressive caching disabled for tests

### 7.4 — Remove All `/* istanbul ignore */` Comments
- [ ] Grep for `istanbul ignore` — fix the underlying testability issue instead of suppressing
- [ ] Most cases: the code was untestable because it accessed `window.Cypress` or `sessionStorage` — these are now gone

### 7.5 — Rewrite Tests for New Architecture
For each test file in `src/specs/`:

- [ ] `specs/app/login/login.test.tsx` — use MSW for API mock, test next-auth `signIn()` flow
- [ ] `specs/app/register/register.test.tsx` — use MSW, test registration + redirect
- [ ] `specs/app/[username]/dashboard.test.tsx` — mock `useSession()`, wrap in QueryClientProvider
- [ ] `specs/components/forms/` — test React Hook Form validation, submit behavior
- [ ] `specs/components/lists/` — test loading/empty/error states
- [ ] `specs/components/popups/` — test new typed popup props
- [ ] Remove `specs/store/` entirely (Redux is gone)

### 7.6 — Fix Coverage Configuration
- [ ] Lower coverage threshold from fake 100% to meaningful targets:
  ```js
  coverageThreshold: {
    global: { branches: 80, functions: 85, lines: 85, statements: 85 }
  }
  ```
- [ ] Add coverage exclude for test utilities, mock files, type-only files:
  ```js
  coveragePathIgnorePatterns: ['src/specs/', 'src/types/', 'src/lib/constants/']
  ```

### 7.7 — Write Missing Test Coverage
- [ ] Auth flow (login, logout, session expiry)
- [ ] React Query hooks (useUser, useActivities, mutation hooks)
- [ ] Form validation (each Zod schema validates correctly)
- [ ] Error boundary rendering
- [ ] Toast notifications on success/error
- [ ] Teacher-only route access control

### Layer 7 Definition of Done
- [ ] `npm test` passes with zero `istanbul ignore` suppressions
- [ ] Real coverage ≥ 80% branches, ≥ 85% lines across business logic
- [ ] No `jest.mock('../api/controller')` pattern — all API mocking via MSW
- [ ] Redux-related test files deleted
- [ ] All new components have tests

---

## Layer 8: Performance & Polish

**Goal**: Production-ready bundle. No unnecessary re-renders. Good Core Web Vitals.
**Branch**: `refactor/layer-8-performance`
**Prerequisite**: All layers 0–7 complete

### 8.1 — Bundle Analysis
- [ ] Install: `npm install -D @next/bundle-analyzer`
- [ ] Configure in `next.config.js`, run analysis: `ANALYZE=true npm run build`
- [ ] Identify top 5 largest chunks — address each

### 8.2 — Dynamic Imports for Heavy Components
- [ ] Modal/popup components — load with `next/dynamic` when opened, not on page load
- [ ] Quran bank data (`quran-bank.ts` is 114 entries) — lazy import in the Quran card form

### 8.3 — Memoization
- [ ] `breadcrumbs.tsx` — `useMemo` for path computation (already uses it — verify it's correct)
- [ ] `cards-list.tsx` — `useMemo` for tab filtering (today/active/inactive computation)
- [ ] `React.memo` on pure list item components that receive stable props

### 8.4 — Suspense Boundaries
- [ ] Add `<Suspense fallback={<SkeletonList />}>` around React Query-powered lists
- [ ] Use React Query's `useSuspenseQuery` where appropriate (opt-in)

### 8.5 — Dead Code Removal
- [ ] Remove `src/components/lists/list-analysis.txt`
- [ ] Remove any remaining commented-out code
- [ ] Remove unused helper functions surfaced by TypeScript strict mode

### 8.6 — Core Web Vitals Check
- [ ] Run Lighthouse on all main pages: home, dashboard, activity detail, students
- [ ] Fix any LCP, CLS, or FID issues surfaced
- [ ] Verify no `console.error` / `console.warn` in production build

### 8.7 — Final Cleanup
- [ ] Audit all `TODO` comments left during refactor
- [ ] Remove all `@deprecated` JSDoc markers added in Layer 2 (those items should be deleted by now)
- [ ] Verify `.env.local` is in `.gitignore` (confirm)
- [ ] Review `next.config.js` — remove any legacy options

### Layer 8 Definition of Done
- [ ] Lighthouse performance score ≥ 85 on main pages
- [ ] No `console.error` warnings in production build
- [ ] Bundle size analyzed and largest chunks addressed
- [ ] All `TODO` comments resolved
- [ ] `npm run build` clean with zero warnings

---

## Final Pre-Merge Checklist (Before `refactor/main → main`)

- [ ] Full regression test: every page and user flow works end-to-end
- [ ] `npm run build` clean
- [ ] `npm test` passes at ≥80% coverage
- [ ] `npm run lint` clean
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] Lighthouse audit ≥ 85 performance
- [ ] Teacher flow complete: register → create activity → add cards → link student → view student progress
- [ ] Student flow complete: register → view activities → view cards → request review
- [ ] Auth flow complete: login → session persists → logout → redirect to login → expired session handled
- [ ] All environment variables documented in `.env.example`
- [ ] `REFACTOR_PLAN.md` all checkboxes ticked
- [ ] `CODEBASE_CONTEXT.md` and `FILE_INDEX.md` updated to reflect final architecture

---

## Post-Refactor Backlog (After `refactor/main → main`)

These are deferred intentionally — do not start during the main refactor:

- Cypress upgrade (13 → 15) + major E2E test expansion
- Internationalization (i18n) support
- Dark mode (Tailwind v4 makes this easier)
- Push notifications (Knock API keys are in `.env.local` — currently unused)
- Progressive Web App (PWA) support
- Backend integration improvements (pagination, search)
- Admin dashboard for multi-teacher institutions
