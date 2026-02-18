import { NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, subject, text, html, template, templateData } = body

    // Validar email destino
    if (!to) {
      return NextResponse.json(
        { error: 'El campo "to" es requerido' },
        { status: 400 }
      )
    }

    let emailOptions: any = {
      to,
      subject,
      text,
      html,
    }

    // Usar plantilla si se especifica
    if (template && templateData) {
      switch (template) {
        case 'verification':
          emailOptions = {
            ...emailOptions,
            ...emailTemplates.verificationEmail(
              templateData.verificationUrl,
              templateData.username
            ),
          }
          break
        case 'welcome':
          emailOptions = {
            ...emailOptions,
            ...emailTemplates.welcomeEmail(templateData.username),
          }
          break
        case 'alert':
          emailOptions = {
            ...emailOptions,
            ...emailTemplates.alertNotification(
              templateData.alertTitle,
              templateData.alertMessage,
              templateData.machineName
            ),
          }
          break
        default:
          return NextResponse.json(
            { error: `Plantilla "${template}" no encontrada` },
            { status: 400 }
          )
      }
    }

    const result = await sendEmail(emailOptions)

    return NextResponse.json({
      success: true,
      message: 'Email enviado exitosamente',
      messageId: result.messageId,
    })
  } catch (error) {
    console.error('Error en POST /api/email:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      { error: 'Error al enviar email', details: errorMessage },
      { status: 500 }
    )
  }
}
