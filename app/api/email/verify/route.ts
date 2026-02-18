import { NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email'

// POST /api/email/verify - Enviar email de verificación personalizado
export async function POST(request: Request) {
  try {
    // Verificar Content-Type
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type debe ser application/json' },
        { status: 400 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'JSON inválido en el body' },
        { status: 400 }
      )
    }
    
    const { email, username, userId } = body

    if (!email || !username || !userId) {
      return NextResponse.json(
        { error: 'Email, username y userId son requeridos' },
        { status: 400 }
      )
    }

    // Verificar configuración SMTP
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP configuration missing')
      return NextResponse.json(
        { error: 'Configuración SMTP incompleta. Revisa tu .env.local' },
        { status: 500 }
      )
    }

    // Crear URL de verificación
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/auth/callback?token=${userId}&type=signup`

    // Enviar email con plantilla personalizada
    const template = emailTemplates.verificationEmail(verificationUrl, username)
    
    const result = await sendEmail({
      to: email,
      ...template,
    })

    return NextResponse.json({
      success: true,
      message: 'Email de verificación enviado',
      messageId: result.messageId,
    })
  } catch (error) {
    console.error('Error en POST /api/email/verify:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      { error: 'Error al enviar email de verificación', details: errorMessage },
      { status: 500 }
    )
  }
}
