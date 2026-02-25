# Eduplanner — User Journeys

All user-facing interaction paths across the app and which Cypress spec covers each one.

---

## Auth

| Journey                        | Spec                  |
| ------------------------------ | --------------------- |
| Register new account           | `register-user.cy.ts` |
| Login                          | `login-user.cy.ts`    |
| Login failure (wrong password) | `login-user.cy.ts`    |
| Logout                         | `logout.cy.ts`        |

---

## Profile

| Journey                               | Spec            |
| ------------------------------------- | --------------- |
| View profile (name, email displayed)  | `profile.cy.ts` |
| Delete account → redirect to register | `account.cy.ts` |

---

## Activities — Teacher

| Journey                                    | Spec             |
| ------------------------------------------ | ---------------- |
| Teacher sees add-activity form             | `activity.cy.ts` |
| Add new activity (success)                 | `activity.cy.ts` |
| Add new activity (failure / error message) | `activity.cy.ts` |
| Mark activity completed                    | `activity.cy.ts` |
| Delete activity (success)                  | `activity.cy.ts` |
| Delete activity (failure / error message)  | `activity.cy.ts` |

---

## Activities — Student

| Journey                                  | Spec             |
| ---------------------------------------- | ---------------- |
| Student dashboard — no add-activity form | `activity.cy.ts` |
| Request review for activity              | `activity.cy.ts` |

---

## Cards — Quran

| Journey                              | Spec          |
| ------------------------------------ | ------------- |
| Add card from checkbox bank          | `cards.cy.ts` |
| Add custom Quran card via text input | `cards.cy.ts` |

---

## Cards — Language (Arabic)

| Journey                                          | Spec          |
| ------------------------------------------------ | ------------- |
| Add grammar card via typed list + validate popup | `cards.cy.ts` |
| Add vocab card via typed list + validate popup   | `cards.cy.ts` |

---

## Cards — Misc

| Journey                                       | Spec          |
| --------------------------------------------- | ------------- |
| Add misc card via typed list + validate popup | `cards.cy.ts` |

---

## Card Views & Management — Teacher

| Journey                               | Spec          |
| ------------------------------------- | ------------- |
| View inactive cards list              | `cards.cy.ts` |
| View active cards list                | `cards.cy.ts` |
| View today's cards (Cards of the Day) | `cards.cy.ts` |
| Activate card (inactive → active)     | `cards.cy.ts` |
| Delete card                           | `cards.cy.ts` |
| Promote card stage                    | `cards.cy.ts` |
| Reset card stage                      | `cards.cy.ts` |
| Override card stage                   | `cards.cy.ts` |

---

## Card Management — Student

| Journey                        | Spec          |
| ------------------------------ | ------------- |
| Submit card for teacher review | `cards.cy.ts` |

---

## Students — Teacher

| Journey                          | Spec             |
| -------------------------------- | ---------------- |
| View students page — empty state | `students.cy.ts` |
| Search for student by email      | `students.cy.ts` |
| Link (add) a student             | `students.cy.ts` |
| View linked students list        | `students.cy.ts` |
| Navigate to student dashboard    | `students.cy.ts` |
| Unlink (remove) a student        | `students.cy.ts` |
