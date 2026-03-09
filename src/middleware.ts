import { auth } from '@/auth'

export const middleware = auth((req) => {
  const isAuthenticated = !!req.auth
  const pathname = req.nextUrl.pathname
  const isPublicRoute = ['/', '/home', '/login', '/register'].includes(pathname)

  if (!isAuthenticated && !isPublicRoute) {
    return Response.redirect(new URL('/login', req.url))
  }

  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    const username = (req.auth?.user as any)?.username
    if (!username) return
    return Response.redirect(new URL(`/${username}`, req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
