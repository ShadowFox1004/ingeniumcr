import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

function getBaseUrl(req: Request) {
  const origin = req.headers.get("origin")
  if (origin) return origin

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl) return siteUrl

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl}`

  return ""
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const email = body?.email

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    const supabase = await createClient()

    const baseUrl = getBaseUrl(req)
    const redirectTo = baseUrl ? `${baseUrl}/auth/reset-password` : undefined

    const { error } = await supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
