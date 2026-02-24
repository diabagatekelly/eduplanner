# File Index

> Quick reference for every file in the eduplanner codebase.
> Use this before grep/glob searches to locate files directly.
> See CODEBASE_CONTEXT.md for architectural context.

---

## Config & Root Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Claude instructions and session guidelines |
| `CODEBASE_CONTEXT.md` | Full codebase context (architecture, patterns, issues) |
| `FILE_INDEX.md` | This file — complete file index |
| `next.config.js` | Next.js config; exposes all env vars to client |
| `tsconfig.json` | TypeScript config — NOTE: `strict: false` (needs fix) |
| `tailwind.config.ts` | Tailwind config with custom font sizes |
| `postcss.config.js` | PostCSS with Tailwind + autoprefixer |
| `jest.config.ts` | Jest config — root `src/`, jsdom, 100% coverage threshold |
| `jest.setup.ts` | Jest setup — mocks `ResizeObserver` |
| `cypress.config.ts` | Cypress E2E config |
| `.eslintrc.json` | ESLint — extends `next/core-web-vitals` |
| `.env.local` | Backend API URLs (all `NEXT_*_URL` variables) |
| `.env.test` | Test environment variables |
| `package.json` | Dependencies and npm scripts |
| `.husky/` | Pre-commit hooks setup |
| `.circleci/config.yml` | CI/CD pipeline config |

---

## App Router — Pages & Layouts

| File | Route | Purpose |
|------|-------|---------|
| `src/app/layout.tsx` | All routes | Root layout: Redux Provider, auth guard (`hasToken`/`hasExpired`), renders Navbar/Footer |
| `src/app/nested-layout.tsx` | `[username]/*` | Inner layout: Sidebar with navigation links |
| `src/app/home/page.tsx` | `/home` | Public homepage/landing page |
| `src/app/login/page.tsx` | `/login` | Login page wrapper |
| `src/app/login/components/login-form.tsx` | `/login` | Login form — email + password, calls `loginUser()` |
| `src/app/register/page.tsx` | `/register` | Register page wrapper |
| `src/app/register/components/register-form.tsx` | `/register` | Register form — name, email, password, account type |
| `src/app/[username]/page.tsx` | `/{username}` | User dashboard (protected) |
| `src/app/[username]/profile/page.tsx` | `/{username}/profile` | Profile view and edit |
| `src/app/[username]/profile/components/user-profile.tsx` | `/{username}/profile` | Profile display component |
| `src/app/[username]/activities/[activity]/page.tsx` | `/{username}/activities/{activity}` | Activity detail with cards list |
| `src/app/[username]/students/page.tsx` | `/{username}/students` | Teacher's student list (teacher-only) |
| `src/app/[username]/students/[student]/page.tsx` | `/{username}/students/{student}` | Individual student dashboard |
| `src/app/[username]/students/[student]/profile/page.tsx` | `/{username}/students/{student}/profile` | Student profile view |
| `src/app/[username]/students/[student]/activities/[activity]/page.tsx` | `/{username}/students/{student}/activities/{activity}` | Student activity detail |

---

## Components

### Layout / Navigation
| File | Purpose |
|------|---------|
| `src/components/navbar.tsx` | Top navigation bar — user menu, mobile drawer toggle |
| `src/components/footer.tsx` | Footer component |
| `src/components/breadcrumbs.tsx` | Dynamic breadcrumbs from route params via `useMemo` |
| `src/components/dashboard.tsx` | Main dashboard — renders different content for teacher vs student |

### Activities
| File | Purpose |
|------|---------|
| `src/components/activities/add-activity.tsx` | Activity creation flow — renders form + instructions |
| `src/components/activities/view-activity.tsx` | Activity detail view — cards list, status update, teacher actions |

### Students
| File | Purpose |
|------|---------|
| `src/components/students/add-student.tsx` | Search for student by email and link to teacher account |

### Cards
| File | Purpose |
|------|---------|
| `src/components/cards/add-card.tsx` | Card type selector — routes to Quran/Language/Misc form |

### Lists
| File | Purpose |
|------|---------|
| `src/components/lists/lists-ui.tsx` | List router — renders correct list based on `listType` string |
| `src/components/lists/activities-list.tsx` | Activities list with status-colored borders and delete |
| `src/components/lists/cards-list.tsx` | Cards list with tab filter (today/active/inactive), SRS display |
| `src/components/lists/students-list.tsx` | Students list with delete and lazy student data loading |
| `src/components/lists/list-analysis.txt` | Architecture documentation (text, not code) |

### Forms
| File | Purpose |
|------|---------|
| `src/components/forms/add-activity-form.tsx` | Form: name, description, points, hasCards toggle |
| `src/components/forms/add-quran-card-form.tsx` | Form: Quran card — Juz or Surah selection from quran-bank |
| `src/components/forms/add-language-card-form.tsx` | Form: Language card — vocab or grammar, word + instructions |
| `src/components/forms/add-misc-card-form.tsx` | Form: Misc card — generic freeform content |
| `src/components/forms/search-user-form.tsx` | Form: search user by email (for student linking) |

### Popups / Modals
| File | Purpose |
|------|---------|
| `src/components/popups/popup.tsx` | Central modal router — dispatches by `modalType` string prop |
| `src/components/popups/deleteAccountPopup.tsx` | Confirm account deletion |
| `src/components/popups/deleteActivityPopup.tsx` | Confirm activity deletion |
| `src/components/popups/linkAccountPopup.tsx` | Confirm teacher-student account link |
| `src/components/popups/unlinkAccountPopup.tsx` | Confirm teacher-student account unlink |
| `src/components/popups/manageCardPopup.tsx` | Card management — edit, delete, activate, view content, request review |
| `src/components/popups/validatePopup.tsx` | Generic validation/confirmation dialog |

---

## API Layer

| File | Purpose |
|------|---------|
| `src/api/service.ts` | Axios HTTP wrapper — `getCommand`, `postCommand`, `patchCommand`, `deleteCommand` |
| `src/api/controller.ts` | Business API functions — maps feature operations to HTTP calls |

---

## Redux Store

| File | Purpose |
|------|---------|
| `src/store/store.ts` | Redux store configuration — combines reducers |
| `src/store/actions/authActions.ts` | Auth actions: `setAuthToken`, `removeAuthToken`, `hasToken`, `hasExpired` |
| `src/store/actions/userActions.ts` | User data actions: populate, reset, add/edit/remove for students/activities/cards |
| `src/store/reducers/authReducer.ts` | Auth reducer — manages `isAuthenticated` boolean |
| `src/store/reducers/userReducer.ts` | User reducer — manages full user data shape |

---

## TypeScript Types

| File | Types Defined |
|------|--------------|
| `src/types/IUser.ts` | `IUser`, `IUserFormData`, `IUserLogin` |
| `src/types/IActivity.ts` | `IActivity`, `IActivityFormData` |
| `src/types/ICard.ts` | `ICard`, `IQuranJuzCard`, `IQuranSurahCard`, `ILanguageVocabCard`, `ILanguageGrammarCard`, `IMiscCard` |
| `src/types/ILinkedAccounts.ts` | `ILinkedAccounts` |
| `src/types/IParams.ts` | `ActivityParams`, `UsernameParams`, `StudentParams`, `ActivityStudentParams` |
| `src/types/IApiResponse.ts` | `IApiResponse` |
| `src/types/isoDateType.ts` | `ISODateString` type alias |
| `src/types/CompletionStatusEnum.ts` | `CompletionStatus` enum |

---

## Lib / Helpers / Constants

| File | Purpose |
|------|---------|
| `src/lib/helpers/formatActivityName.ts` | `toDbFormat("Quran Study")` → `"Quran-Study"`, `fromDbFormat` reverse |
| `src/lib/helpers/formatCardName.ts` | `formatCardName(cardId, activityName)` — returns human-readable card label by type |
| `src/lib/helpers/getBorderColor.ts` | `getBorderColor(item)` — returns CSS border color string based on `completionStatus` |
| `src/lib/helpers/useMounted.tsx` | `useMounted()` hook — returns `true` after client mount (prevents hydration mismatch) |
| `src/lib/constants/quran-bank.ts` | Static data: 30 Juz entries + 114 Surah entries with metadata |

---

## Styles

| File | Purpose |
|------|---------|
| `src/styles/globals.css` | Tailwind directives + component utility classes (buttons, cards, popups, headings) |
| `src/styles/favicon.ico` | Site favicon |

---

## Tests — Unit (Jest)

### Test Infrastructure
| File | Purpose |
|------|---------|
| `src/specs/mocks.ts` | Shared mock data: `mockUser`, `mockActivity`, `mockCard`, `mockTeacher`, etc. |
| `src/specs/util.tsx` | Custom `render()` wrapper — wraps with Redux `<Provider>` |

### Page Tests
| File | Tests |
|------|-------|
| `src/specs/app/home/home.test.tsx` | Home page rendering |
| `src/specs/app/login/login.test.tsx` | Login form — render, submit, error, success |
| `src/specs/app/register/register.test.tsx` | Register form — render, submit, error, success |
| `src/specs/app/[username]/dashboard.test.tsx` | Dashboard — teacher vs student variants |
| `src/specs/app/[username]/profile/profile.test.tsx` | Profile page rendering |
| `src/specs/app/[username]/activities/activity.test.tsx` | Activity page with cards |
| `src/specs/app/[username]/students/students.test.tsx` | Students list page |
| `src/specs/app/[username]/students/[student]/student.test.tsx` | Student detail page |

### Component Tests
| File | Tests |
|------|-------|
| `src/specs/components/navbar.test.tsx` | Navbar rendering, menu interactions |
| `src/specs/components/breadcrumbs.test.tsx` | Breadcrumb path generation |
| `src/specs/components/dashboard.test.tsx` | Dashboard component |
| `src/specs/components/activities/add-activity.test.tsx` | Add activity flow |
| `src/specs/components/activities/view-activity.test.tsx` | View activity flow |
| `src/specs/components/lists/activities-list.test.tsx` | Activities list rendering |
| `src/specs/components/lists/cards-list.test.tsx` | Cards list filtering |
| `src/specs/components/lists/students-list.test.tsx` | Students list rendering |
| `src/specs/components/forms/add-activity-form.test.tsx` | Activity form submission |
| `src/specs/components/forms/add-quran-card-form.test.tsx` | Quran card form |
| `src/specs/components/forms/add-language-card-form.test.tsx` | Language card form |
| `src/specs/components/forms/add-misc-card-form.test.tsx` | Misc card form |
| `src/specs/components/popups/manageCard.test.tsx` | Card management popup |
| `src/specs/components/popups/deleteActivity.test.tsx` | Delete activity popup |

### Store Tests
| File | Tests |
|------|-------|
| `src/specs/store/authActions.test.ts` | Auth action creators and reducers |
| `src/specs/store/userActions.test.ts` | User action creators and reducers |

### API Tests
| File | Tests |
|------|-------|
| `src/specs/api/controller.test.ts` | API controller function calls |
| `src/specs/api/service.test.ts` | Axios service wrapper methods |

---

## Tests — E2E (Cypress)

| Directory / File | Purpose |
|------------------|---------|
| `cypress/` | Root Cypress directory |
| `cypress/e2e/` | E2E test specs (very sparse currently) |
| `cypress/support/` | Cypress support files and commands |
| `cypress.config.ts` | Cypress configuration |

---

## Public Assets

| File | Purpose |
|------|---------|
| `public/` | Static files served at root (currently minimal) |

---

## Quick Lookup by Feature

### Authentication
- Logic: `src/store/actions/authActions.ts`
- UI: `src/app/login/`, `src/app/register/`
- Guard: `src/app/layout.tsx`

### User Profile
- Page: `src/app/[username]/profile/page.tsx`
- Component: `src/app/[username]/profile/components/user-profile.tsx`
- Popup: `src/components/popups/deleteAccountPopup.tsx`

### Activities
- Create flow: `src/components/activities/add-activity.tsx` → `src/components/forms/add-activity-form.tsx`
- View flow: `src/components/activities/view-activity.tsx`
- List: `src/components/lists/activities-list.tsx`
- API: `controller.ts` — `createActivity`, `editActivity`, `deleteActivity`
- Redux: `userActions.ts` — `createUserActivity`, `editUserActivity`, `removeUserActivity`

### Cards (Flashcards)
- Type selector: `src/components/cards/add-card.tsx`
- Quran form: `src/components/forms/add-quran-card-form.tsx`
- Language form: `src/components/forms/add-language-card-form.tsx`
- Misc form: `src/components/forms/add-misc-card-form.tsx`
- List: `src/components/lists/cards-list.tsx`
- Management popup: `src/components/popups/manageCardPopup.tsx`
- API: `controller.ts` — `createCards`, `editAnyCardAttr`, `editCardStage`, `resetCardStage`, `activateCard`, `deleteCard`, `requestCardReview`

### Students (Teacher feature)
- Add flow: `src/components/students/add-student.tsx` → `src/components/forms/search-user-form.tsx`
- List: `src/components/lists/students-list.tsx`
- Link popup: `src/components/popups/linkAccountPopup.tsx`
- Unlink popup: `src/components/popups/unlinkAccountPopup.tsx`
- API: `controller.ts` — `linkAccount`, `unlinkAccount`

### Modals/Popups
- Router: `src/components/popups/popup.tsx` (dispatches by `modalType` string)
- All modal files: `src/components/popups/`

### Navigation
- Top nav: `src/components/navbar.tsx`
- Sidebar: `src/app/nested-layout.tsx`
- Breadcrumbs: `src/components/breadcrumbs.tsx`

### Data Formatting
- Activity names: `src/lib/helpers/formatActivityName.ts`
- Card labels: `src/lib/helpers/formatCardName.ts`
- Status colors: `src/lib/helpers/getBorderColor.ts`
- Quran metadata: `src/lib/constants/quran-bank.ts`
