import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

// POST /api/email/test - Test SMTP connection
export async function POST(request: Request) {
  try {
    // Verificar configuración SMTP
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({
        success: false,
        error: 'Configuración SMTP incompleta',
        config: {
          SMTP_HOST: process.env.SMTP_HOST ? '✅' : '❌',
          SMTP_USER: process.env.SMTP_USER ? '✅' : '❌',
          SMTP_PASS: process.env.SMTP_PASS ? '✅' : '❌',
          SMTP_PORT: process.env.SMTP_PORT || '❌',
        }
      }, { status: 500 })
    }

    // Enviar email de prueba
    const result = await sendEmail({
      to: process.env.SMTP_USER!, // Enviar a ti mismo
      subject: '🧪 Test de SMTP - IngeniumCR',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">✅ Test de SMTP Exitoso</h2>
          <p>Las variables de entorno están configuradas correctamente.</p>
          <p><strong>Host:</strong> ${process.env.SMTP_HOST}</p>
          <p><strong>Port:</strong> ${process.env.SMTP_PORT}</p>
          <p><strong>User:</strong> ${process.env.SMTP_USER}</p>
          <p><strong>App URL:</strong> ${process.env.NEXT_PUBLIC_APP_URL}</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #9ca3af; font-size: 12px;">IngeniumCR - Test de Configuración</p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'Email de prueba enviado',
      messageId: result.messageId,
      previewUrl: result.previewUrl,
    })
  } catch (error) {
    console.error('Error en test SMTP:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json({
      success: false,
      error: 'Error al enviar email de prueba',
      details: errorMessage,
    }, { status: 500 })
  }
}
