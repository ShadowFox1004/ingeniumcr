import { NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'

// POST /api/email/verify - Enviar email de verificación personalizado
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, username, userId } = body

    if (!email || !username || !userId) {
      return NextResponse.json(
        { error: 'Email, username y userId son requeridos' },
        { status: 400 }
      )
    }

    // Generar token de verificación
    const supabase = await createClient()
    
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
