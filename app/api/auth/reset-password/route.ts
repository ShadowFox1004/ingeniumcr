import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail, emailTemplates } from "@/lib/email"
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

    const baseUrl = getBaseUrl(req)
    const redirectTo = baseUrl ? `${baseUrl}/auth/reset-password` : undefined

    const admin = createAdminClient()

    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: redirectTo ? { redirectTo } : undefined,
    } as any)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const recoveryUrl = (data as any)?.properties?.action_link

    if (!recoveryUrl || typeof recoveryUrl !== "string") {
      return NextResponse.json({ error: "No se pudo generar el enlace de recuperación" }, { status: 500 })
    }

    const template = await emailTemplates.passwordRecoveryEmail(recoveryUrl)

    await sendEmail({
      to: email,
      ...template,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
