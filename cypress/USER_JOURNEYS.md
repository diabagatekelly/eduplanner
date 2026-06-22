# Eduplanner — User Journeys

All user-facing interaction paths across the app and which Cypress spec covers each one.

Legend: **—** = no spec yet

---

## Auth

| Journey                        | Spec                  |
| ------------------------------ | --------------------- |
| Register new account           | `register-user.cy.ts` |
| Register failure (duplicate)   | `register-user.cy.ts` |
| Login                          | `login-user.cy.ts`    |
| Login failure (wrong password) | `login-user.cy.ts`    |
| Logout                         | `logout.cy.ts`        |

---

## Navigation

| Journey                                                      | Spec               |
| ------------------------------------------------------------ | ------------------ |
| Blank / root URL redirects to `/login`                       | `navigation.cy.ts` |
| Unauthenticated route redirects to login                     | **—**              |
| Drawer sidebar (teacher sees students)                       | **—**              |
| Drawer activity sub-nav (active / inactive / add hash links) | **—**              |

---

## Profile

| Journey                               | Spec            |
| ------------------------------------- | --------------- |
| View profile (name, email displayed)  | `profile.cy.ts` |
| Delete account → redirect to register | `account.cy.ts` |
| Delete account failure (API error)    | **—**           |

---

## Activities — Teacher (own dashboard)

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

## Cards — Add (Quran)

| Journey                              | Spec          |
| ------------------------------------ | ------------- |
| Add card from checkbox bank          | `cards.cy.ts` |
| Add custom Quran card via text input | `cards.cy.ts` |

---

## Cards — Add (Language / Arabic)

| Journey                                          | Spec          |
| ------------------------------------------------ | ------------- |
| Add grammar card via typed list + validate popup | `cards.cy.ts` |
| Add vocab card via typed list + validate popup   | `cards.cy.ts` |

---

## Cards — Add (Misc)

| Journey                                       | Spec          |
| --------------------------------------------- | ------------- |
| Add misc card via typed list + validate popup | `cards.cy.ts` |

---

## Card Views & Management — Teacher (own cards)

| Journey                               | Spec          |
| ------------------------------------- | ------------- |
| View today's cards (Cards of the Day) | `cards.cy.ts` |
| View active cards list                | `cards.cy.ts` |
| View inactive cards list              | `cards.cy.ts` |
| Show card details (eye icon popup)    | **—**         |
| Activate card (inactive → active)     | `cards.cy.ts` |
| Delete card                           | `cards.cy.ts` |
| Promote card stage                    | `cards.cy.ts` |
| Demote card stage                     | **—**         |
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

---

## Teacher Managing Student — Activities & Cards

These journeys use the **student dashboard** (`/[teacher]/students/[student]/...`),
where the teacher views and manages a student's data. They exercise the `useStudent`
query key path, which is different from the teacher's own `useUser` path.

| Journey                                           | Spec                       |
| ------------------------------------------------- | -------------------------- |
| View student profile from student dashboard       | **—**                      |
| Add activity for student                          | **—**                      |
| Delete activity for student                       | **—**                      |
| View student's card lists (today/active/inactive) | `student-management.cy.ts` |
| Activate student's card                           | `student-management.cy.ts` |
| Delete student's card                             | `student-management.cy.ts` |
| Override student's card stage                     | `student-management.cy.ts` |
| Reset student's card stage                        | `student-management.cy.ts` |
