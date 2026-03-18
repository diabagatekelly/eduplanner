import { auth } from '@/auth'

export const middleware = auth((req) => {
  const isAuthenticated = !!req.auth
  const pathname = req.nextUrl.pathname
  if (pathname === '/') {
    return Response.redirect(new URL('/login', req.url))
  }

  const isPublicRoute = ['/home', '/login', '/register'].includes(pathname)

  if (!isAuthenticated && !isPublicRoute) {
    return Response.redirect(new URL('/login', req.url))
  }

  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    const username = (req.auth?.user as any)?.username
    if (!username) return
    return Response.redirect(new URL(`/${username}`, req.url))
  }

  // Teacher-only routes: /<username>/students and all sub-paths
  if (isAuthenticated) {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length >= 2 && segments[1] === 'students') {
      const accountType = (req.auth?.user as any)?.accountType
      if (accountType === 'student') {
        const username = (req.auth?.user as any)?.username
        return Response.redirect(new URL(`/${username}`, req.url))
      }
    }
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
