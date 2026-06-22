import { http, HttpResponse } from 'msw'
import { mockUser, mockActivity, mockUserCard } from '../mocks'

// Match any host — works with both .env.test (Heroku) and .env.local (localhost)
const api = (path: string) => `*/user${path}`

/** Default success handlers. Override per-test with server.use(). */
export const handlers = [
  // next-auth session endpoint — prevents getSession() fetch from hanging
  http.get('*/api/auth/session', () => HttpResponse.json({})),

  // Auth
  http.get(api('/login'), () =>
    HttpResponse.json({ message: null, details: { token: 'mock-token', user: mockUser } })
  ),
  http.post(api('/register'), () =>
    HttpResponse.json({ message: null, details: { token: 'mock-token', user: mockUser } })
  ),

  // Users
  http.get(api(''), () => HttpResponse.json({ message: null, details: { student: mockUser } })),
  http.patch(api('/edit'), () => HttpResponse.json({ message: null, details: {} })),
  http.delete(api('/delete/*'), () => HttpResponse.json({ message: null, details: {} })),

  // Linked accounts
  http.post(api('/linked-accounts/add'), () => HttpResponse.json({ message: null, details: {} })),
  http.delete(api('/linked-accounts/delete/*'), () =>
    HttpResponse.json({ message: null, details: {} })
  ),

  // Activities
  http.post(api('/activities/add'), () =>
    HttpResponse.json({
      message: null,
      details: { userId: mockUser.userId, userActivity: mockActivity },
    })
  ),
  http.patch(api('/activities/edit'), () =>
    HttpResponse.json({ message: null, details: mockActivity })
  ),
  http.delete(api('/activities/delete/*'), () => HttpResponse.json({ message: null, details: {} })),

  // Cards
  http.post(api('/cards/add'), () => HttpResponse.json({ message: null, details: [mockUserCard] })),
  http.post(api('/cards/activate'), () => HttpResponse.json({ message: null, details: {} })),
  http.post(api('/cards/edit'), () => HttpResponse.json({ message: null, details: mockUserCard })),
  http.post(api('/cards/edit-stage'), () =>
    HttpResponse.json({ message: null, details: mockUserCard })
  ),
  http.post(api('/cards/reset-stage'), () => HttpResponse.json({ message: null, details: {} })),
  http.post(api('/cards/request-review'), () => HttpResponse.json({ message: null, details: {} })),
  http.post(api('/cards/delete'), () => HttpResponse.json({ message: null, details: {} })),
]
