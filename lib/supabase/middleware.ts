import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicPaths = [
    "/",
    "/login",
    "/auth/sign-up",
    "/auth/sign-up-success",
    "/auth/callback",
    "/auth/verify-email",
    "/auth/verification-success",
    "/auth/verify-custom",
    "/api",
  ]
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Redirect to login if not authenticated and not on public pages
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Redirect to verify email page if user is authenticated but email not confirmed
  if (user && !user.email_confirmed_at && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/verify-email"
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if authenticated with verified email and on login page
  if (user && user.email_confirmed_at && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
