# Eduplanner - Codebase Context

> Reference this file before any work session. See FILE_INDEX.md for file locations.

## Project Overview

**Eduplanner** is a Next.js 15 education management frontend for a teacher-student learning platform. It manages users, activities (subjects/courses), and flashcards with spaced repetition. The frontend speaks exclusively to a Node.js backend via REST API.

- **Frontend**: Next.js 15 + React 19 + TypeScript + Redux Toolkit + Tailwind CSS
- **Backend**: Node.js REST API at `http://localhost:8080` (separate repo)
- **Deployment**: Vercel (frontend), backend separate
- **Auth**: Token stored in `sessionStorage`, expires at midnight EST daily

---

## Technology Stack

| Concern | Library | Version |
|---------|---------|---------|
| Framework | Next.js (App Router) | 15.3.0 |
| UI | React | 19.1.0 |
| Language | TypeScript | 5.2.2 |
| State | Redux Toolkit + React-Redux | 2.6.1 / 9.2.0 |
| Styling | Tailwind CSS | 3.3.3 |
| UI Components | Headless UI + Heroicons | 2.2.1 / 2.0.18 |
| HTTP | Axios | 1.8.4 |
| Unit Tests | Jest + Testing Library | 29.7.0 / 16.3.0 |
| E2E Tests | Cypress | 13.6.3 |
| Linting | ESLint (next/core-web-vitals) | 9.24.0 |
| Pre-commit | Husky | 9.1.7 |
| Dev server | Turbopack | built-in |

---

## Application Domain

The app is an **Islamic education management system** for teachers and students:

- **Teacher** creates Activities (e.g., "Quran", "Arabic-Language"), adds flashcards to each, links student accounts, and can review student progress
- **Student** sees their own activities and cards, progresses through SRS (spaced repetition) stages
- **Cards** have three domain types:
  - **Quran cards**: Juz-level (30 Juz) or Surah-level (114 Surahs with metadata)
  - **Language cards**: Vocabulary or Grammar entries with Arabic words
  - **Misc cards**: Generic freeform content
- **Card stages**: 0–10 (SRS progression), with `completionStatus`: `pending`, `completed`, `review`, `delinquent`, `inactive`

---

## Directory Structure

```
eduplanner/
├── src/
│   ├── app/                    # Next.js App Router pages + layouts
│   │   ├── layout.tsx          # Root layout: Redux Provider, auth guard, Navbar
│   │   ├── nested-layout.tsx   # Inner layout: Sidebar for [username] routes
│   │   ├── home/page.tsx       # Public homepage
│   │   ├── login/              # Login page + LoginForm component
│   │   ├── register/           # Register page + RegisterForm component
│   │   └── [username]/         # Protected dynamic routes (all require auth)
│   │       ├── page.tsx        # User dashboard
│   │       ├── profile/        # Profile view/edit
│   │       ├── activities/[activity]/page.tsx  # Activity detail + cards
│   │       └── students/       # Teacher-only student management
│   │           ├── page.tsx
│   │           └── [student]/  # Student sub-routes (profile, activities)
│   ├── components/             # Reusable UI components (not pages)
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── breadcrumbs.tsx
│   │   ├── dashboard.tsx
│   │   ├── activities/         # add-activity.tsx, view-activity.tsx
│   │   ├── students/           # add-student.tsx
│   │   ├── cards/              # add-card.tsx (card type router)
│   │   ├── lists/              # lists-ui.tsx, activities-list, cards-list, students-list
│   │   ├── forms/              # add-activity-form, add-quran-card-form, add-language-card-form, add-misc-card-form, search-user-form
│   │   └── popups/             # popup.tsx (router), deleteAccount, deleteActivity, linkAccount, unlinkAccount, manageCard, validate
│   ├── api/
│   │   ├── service.ts          # Axios wrapper: get/post/patch/delete
│   │   └── controller.ts       # Business endpoint functions (calls service.ts)
│   ├── store/
│   │   ├── store.ts            # Redux store config
│   │   ├── actions/authActions.ts   # setAuthToken, removeAuthToken, hasToken, hasExpired
│   │   └── actions/userActions.ts   # All user data mutations
│   │   ├── reducers/authReducer.ts  # isAuthenticated state
│   │   └── reducers/userReducer.ts  # Full user data state
│   ├── types/                  # TypeScript interfaces (IUser, IActivity, ICard, etc.)
│   ├── lib/
│   │   ├── helpers/            # formatActivityName, formatCardName, getBorderColor, useMounted
│   │   └── constants/quran-bank.ts  # Surah/Juz metadata
│   ├── styles/globals.css      # Tailwind + component utility classes
│   └── specs/                  # All test files (mirrors src/ structure)
│       ├── mocks.ts            # Shared mock data
│       ├── util.tsx            # Custom render wrapper with Redux Provider
│       ├── app/                # Page-level tests
│       ├── components/         # Component tests
│       └── store/              # Redux action + reducer tests
├── cypress/                    # E2E tests
├── CLAUDE.md                   # Claude instructions (start here)
├── FILE_INDEX.md               # Complete file index (start here)
├── jest.config.ts
├── jest.setup.ts
├── cypress.config.ts
├── next.config.js              # Exposes env vars to client
├── tailwind.config.ts
├── tsconfig.json               # strict: false (needs fixing)
└── .env.local                  # Backend API URLs
```

---

## Routing Map

### Public
| Route | File | Purpose |
|-------|------|---------|
| `/` | N/A (redirect) | Redirects to `/home` |
| `/home` | `app/home/page.tsx` | Landing page |
| `/login` | `app/login/page.tsx` | Login page |
| `/register` | `app/register/page.tsx` | Registration page |

### Protected (auth token required)
| Route | File | Purpose |
|-------|------|---------|
| `/{username}` | `app/[username]/page.tsx` | User dashboard |
| `/{username}/profile` | `app/[username]/profile/page.tsx` | Profile view/edit |
| `/{username}/activities/{activity}` | `app/[username]/activities/[activity]/page.tsx` | Activity detail + cards |
| `/{username}/students` | `app/[username]/students/page.tsx` | Teacher's student list |
| `/{username}/students/{student}` | `app/[username]/students/[student]/page.tsx` | Student detail |
| `/{username}/students/{student}/profile` | `app/[username]/students/[student]/profile/page.tsx` | Student profile |
| `/{username}/students/{student}/activities/{activity}` | `app/[username]/students/[student]/activities/[activity]/page.tsx` | Student activity detail |

### Layout Hierarchy
```
Root layout.tsx (Redux Provider, auth check, Navbar/Footer)
  └── nested-layout.tsx (Sidebar, only wraps [username] routes)
        └── Page content
```

---

## Redux State Shape

```typescript
Store {
  authReducer: {
    isAuthenticated: boolean
  },
  userReducer: {
    userId: string,           // btoa(email)
    username: string,         // "firstname-lastname"
    email: string,
    firstName: string,
    lastName: string,
    accountType: 'teacher' | 'student',
    activities: IActivity[],
    linkedAccountsData: {
      students?: [id: string, username: string][],
      teacher?: string
    },
    students?: Record<string, IUser>  // teacher only, keyed by userId
  }
}
```

### Auth Actions (`store/actions/authActions.ts`)
| Action | Effect |
|--------|--------|
| `setAuthToken(token, user)` | Stores in sessionStorage, sets `isAuthenticated: true` |
| `removeAuthToken()` | Clears sessionStorage, sets `isAuthenticated: false` |
| `hasToken()` | Returns boolean - checks sessionStorage for `user_token` |
| `hasExpired()` | Returns boolean - checks if `created_on` !== today (EST) |

### User Actions (`store/actions/userActions.ts`)
| Action | Effect |
|--------|--------|
| `populateUser()` | Reads sessionStorage `user_data` → dispatches to Redux |
| `resetUser()` | Clears user data from Redux |
| `addNewStudent(student)` | Adds to `linkedAccountsData.students` |
| `saveStudentDetails(student)` | Caches full student object in `students` map |
| `removeStudent(studentId)` | Removes from linked accounts |
| `createUserActivity(activity, username)` | Appends to `activities` array |
| `editUserActivity(activity, username)` | Updates matching activity |
| `removeUserActivity(name, username)` | Removes from `activities` array |
| `createUserCard(cards, activityName, username)` | Appends cards to matching activity |
| `editUserCard(updatedCard, activityName, username)` | Updates card in matching activity |
| `removeUserCard(cardId, activityName, username)` | Removes card from matching activity |

### SessionStorage Keys
| Key | Value |
|-----|-------|
| `user_token` | Auth token string |
| `user_data` | JSON stringified `IUser` object |
| `created_on` | Date string (used for daily expiration check) |

---

## API Layer

### service.ts - HTTP Methods
```typescript
getCommand(url, params?)       // GET with optional query params
postCommand(url, jsonData)     // POST with JSON body
patchCommand(url, jsonData)    // PATCH with JSON body
deleteCommand(url, id)         // DELETE - appends id to URL
```

### controller.ts - Business Functions
| Function | Method | Endpoint |
|----------|--------|---------|
| `loginUser(creds)` | GET | `/user/login` |
| `registerUser(data)` | POST | `/user/register` |
| `findUser(userId)` | GET | `/user` |
| `editUser(userId, data)` | PATCH | `/user/edit` |
| `deleteUser(userId)` | DELETE | `/user/delete` |
| `linkAccount(teacherId, studentId)` | POST | `/user/linked-accounts/add` |
| `unlinkAccount(teacherId, studentId)` | DELETE | `/user/linked-accounts/delete` |
| `createActivity(activity, userId)` | POST | `/user/activities/add` |
| `editActivity(userId, activity)` | PATCH | `/user/activities/edit` |
| `deleteActivity(userId, name)` | DELETE | `/user/activities/delete` |
| `createCards(userId, activity, cards)` | POST | `/user/cards/add` |
| `editAnyCardAttr(userId, activity, cardId, data)` | POST | `/user/cards/edit` |
| `editCardStage(userId, activity, cardId, data)` | POST | `/user/cards/edit-stage` |
| `resetCardStage(userId, activity, cardId)` | POST | `/user/cards/reset-stage` |
| `activateCard(userId, activity, cardId)` | POST | `/user/cards/activate` |
| `deleteCard(cards[])` | POST | `/user/cards/delete` (batch) |
| `requestCardReview(cardId, teacherId, student)` | POST | `/user/cards/request-review` |

**Missing from current API layer**: Auth token not injected into requests via interceptors.

---

## TypeScript Types (`src/types/`)

### IUser
```typescript
interface IUser {
  userId: string              // btoa(email)
  firstName: string
  lastName: string
  username: string            // "firstname-lastname"
  email: string
  password: string
  accountType: 'teacher' | 'student'
  lastLogin: ISODateString
  linkedAccountsData: ILinkedAccounts
  activities: IActivity[]
  students?: Record<string, IUser>
}
type IUserFormData = Omit<IUser, 'userId'|'username'|'lastLogin'|'activities'|'linkedAccountsData'|'students'>
type IUserLogin = Pick<IUser, 'userId'|'password'>
```

### IActivity
```typescript
interface IActivity {
  activityId: string          // btoa(email-activityName)
  name: string
  points: number
  description: string
  completionStatus: CompletionStatus
  hasCards: boolean | string
  createdOn: ISODateString
  lastUpdatedOn: ISODateString
  cards?: ICard[] | []
}
```

### ICard (union type - varies by activityType)
```typescript
// Base
interface ICard { cardId, activity, activityType, addedOn, lastUpdatedOn, nextShowDate, stage, completionStatus }
// Quran Juz: adds type:'Quran', level:'Juz', juz:number
// Quran Surah: adds type:'Quran', level:'Surah', name, juz, number
// Language Vocab: adds word, instructions
// Misc: adds content
```

### CompletionStatus Enum
```typescript
enum CompletionStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  REVIEW = 'review',
  DELINQUENT = 'delinquent',
  INACTIVE = 'inactive'
}
```

### Route Params
```typescript
ActivityParams    // { username, activity }
UsernameParams    // { username }
StudentParams     // { username, student }
ActivityStudentParams  // { username, student, activity }
```

---

## Component Patterns

### Current Patterns (some anti-patterns)
- **"use client"** on almost every component — most are client components
- **useMounted()** hook used to guard sessionStorage access and prevent hydration mismatch
- **Props spreading** via `{...childArgs}` — props are poorly typed
- **Central popup router** (`popup.tsx`) dispatches by `modalType` string
- **List router** (`lists-ui.tsx`) dispatches by `listType` string
- **Dashboard** renders different content based on `accountType`

### Component Interaction Flow
```
Page (route) → renders component(s) → component calls API →
dispatches Redux action → updates local state → rerenders
```

### Modal Pattern
```
Popup component receives { modalType, ...childArgs }
  → switch on modalType
  → renders: DeleteAccount | DeleteActivity | LinkAccount | UnlinkAccount | ManageCard | Validate
  → all receive spread ...childArgs
```

---

## Testing Setup

### Unit Tests (Jest + Testing Library)
- **Config**: `jest.config.ts` — root `src/`, env `jsdom`, coverage 100% threshold
- **Setup**: `jest.setup.ts` — mocks `ResizeObserver`
- **Test files**: `src/specs/**/*.test.{ts,tsx}`
- **Custom render**: `src/specs/util.tsx` — wraps with Redux Provider
- **Mock data**: `src/specs/mocks.ts` — `mockUser`, `mockActivity`, `mockCard`, etc.
- **Pattern**: `jest.mock('next/navigation')` + `jest.mock('../api/controller')`

### E2E Tests (Cypress)
- **Config**: `cypress.config.ts`
- **Test files**: `cypress/` directory
- **Very sparse** — needs major expansion

### NPM Scripts
```
npm test          # Jest unit tests
npm run test:e2e  # Cypress E2E
npm run dev       # Next.js dev with Turbopack
npm run build     # Production build
npm run lint      # ESLint
```

---

## Styling

### System
- **Tailwind CSS** utility classes throughout
- **Component classes** defined in `src/styles/globals.css`:
  - `.default-btn`, `.red-btn`, `.green-btn`, `.neutral-btn`, `.disabled-btn`
  - `.list-item-card`
  - `.popup-styling`
  - `.component-title`, `.component-sub-title`, `.component-heading`

### Status-Based Colors
`getBorderColor(item)` returns border color:
- `PENDING` → orange
- `COMPLETED` → green
- `REVIEW` / `INACTIVE` → gray
- `DELINQUENT` → red

---

## Known Issues & Anti-Patterns

### Critical (Fix First)
1. **`tsconfig.json` has `strict: false`** — TypeScript not enforced, `any` types everywhere
2. **sessionStorage as source of truth** — Redux + sessionStorage duplication; inconsistency risk; hard to debug
3. **Auth token NOT injected** into HTTP requests via Axios interceptors — backend may not be validating auth
4. **`hasExpired()` is just a date check** — not real JWT expiry; expires at midnight EST regardless of activity
5. **`window.location.reload()`** used in components after mutations — causes full page refresh instead of state update

### Architectural
6. **No API interceptors** — no token injection, no retry logic, no timeout, no request cancellation
7. **No form validation library** — all manual string checks; no zod/yup
8. **No error boundaries** — unhandled errors will crash the whole app
9. **No loading states in Redux** — loading managed per-component with local `useState`
10. **No data fetching library** — no React Query / SWR; manual fetch + sessionStorage caching
11. **Hardcoded activity type names** — `"Quran"`, `"Language"` strings scattered across conditionals
12. **No navigation guards** — teacher/student-only route checks repeated per component
13. **Props drilling via `{...childArgs}`** — untyped, hard to trace, refactoring nightmare

### Code Quality
14. **`store.getState()` called in components** — should use selectors
15. **Redux reducers are not pure** — some modify action objects directly
16. **`/* istanbul ignore next */`** comments used to fake 100% coverage
17. **Commented-out code** in `cards-list.tsx` (Quran sorting logic)
18. **Magic strings** — activity names, status values, stage numbers hardcoded inline
19. **Popup/Modal uses string switch** — fragile, not type-safe

### Performance
20. **No memoization** — selectors not memoized, inline object creation on every render
21. **No code splitting** — no `dynamic()` imports for heavy components
22. **No image optimization** — no `next/image` usage

---

## Refactor Goals (High Level)

When the refactor plan is built, these are the key areas:

1. **TypeScript**: Enable `strict: true`, fix all type errors, remove `any`
2. **Auth**: Real JWT handling with interceptors, refresh token support
3. **State**: Replace sessionStorage pattern with React Query + minimal Redux (UI state only)
4. **Error handling**: Error boundaries, centralized error handler, toast notifications
5. **Forms**: Adopt React Hook Form + Zod schema validation
6. **Testing**: Fix fake coverage, write real tests, expand Cypress E2E
7. **Architecture**: Clean separation — server components where possible, proper data fetching
8. **Performance**: Memoization, code splitting, skeleton screens
9. **Type safety**: Replace string switches with discriminated unions, enums, constants
10. **API layer**: Add interceptors, token injection, retry logic, timeout

---

## Quran Data Snapshot (quran-bank.ts)

The `lib/constants/quran-bank.ts` contains:
- Array of 30 Juz entries: `{ juzNumber, name }`
- Array of 114 Surah entries: `{ number, name, englishName, juz }`

Used in `add-quran-card-form.tsx` to populate selection dropdowns.
