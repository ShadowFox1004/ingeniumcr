import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] Error exchanging code for session:", error)
      // Redirect to error page if verification fails
      return NextResponse.redirect(`${origin}/auth/verify-email?error=verification_failed`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/verification-success`)
}
