import type { NextAuthRequest } from 'next-auth'
import { auth } from '@/auth'

function getAuthUser(req: NextAuthRequest) {
  const user = req.auth?.user
  return {
    username: user?.username,
    accountType: user?.accountType,
  }
}

function isTeacherOnlyRoute(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  return segments.length >= 2 && segments[1] === 'students'
}

export const middleware = auth((req) => {
  const isAuthenticated = !!req.auth
  const pathname = req.nextUrl.pathname
  if (pathname === '/') {
    if (isAuthenticated) {
      const { username } = getAuthUser(req)
      if (username) return Response.redirect(new URL(`/${username}`, req.url))
    }
    return Response.redirect(new URL('/login', req.url))
  }

  const isPublicRoute = ['/home', '/login', '/register'].includes(pathname)

  if (!isAuthenticated && !isPublicRoute) {
    return Response.redirect(new URL('/login', req.url))
  }

  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    const { username } = getAuthUser(req)
    if (!username) return
    return Response.redirect(new URL(`/${username}`, req.url))
  }

  if (isAuthenticated && isTeacherOnlyRoute(pathname)) {
    const { username, accountType } = getAuthUser(req)
    if (accountType === 'student' && username) {
      return Response.redirect(new URL(`/${username}`, req.url))
    }
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)'],
}
