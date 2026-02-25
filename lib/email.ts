import nodemailer from 'nodemailer'
import { readFile } from 'fs/promises'
import path from 'path'

// Configuración del transporter SMTP
const createTransporter = () => {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('Missing SMTP configuration. Check your .env.local file.')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true para 465, false para otros puertos
    auth: {
      user,
      pass,
    },
  })
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  from?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = createTransporter()
    
    const fromEmail = options.from || process.env.SMTP_USER
    
    const info = await transporter.sendMail({
      from: `"IngeniumCR" <${fromEmail}>`,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    })

    console.log('Email sent:', info.messageId)
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl?.(info),
    }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Plantillas de email predefinidas
export const emailTemplates = {
  // Email de verificación personalizado
  verificationEmail: (verificationUrl: string, username: string) => ({
    subject: 'Verifica tu cuenta - IngeniumCR',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">¡Bienvenido a IngeniumCR!</h2>
        <p>Hola ${username},</p>
        <p>Gracias por registrarte. Por favor confirma tu cuenta haciendo clic en el botón:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Confirmar Cuenta
        </a>
        <p>Si el botón no funciona, copia y pega este enlace:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 12px;">
          Central Romana Corporation, Ltd.<br>
          Si no creaste esta cuenta, ignora este correo.
        </p>
      </div>
    `,
    text: `
      ¡Bienvenido a IngeniumCR!
      
      Hola ${username},
      
      Gracias por registrarte. Por favor confirma tu cuenta visitando:
      ${verificationUrl}
      
      Central Romana Corporation, Ltd.
    `,
  }),

  // Email de notificación de alerta
  alertNotification: (alertTitle: string, alertMessage: string, machineName: string) => ({
    subject: `🚨 Alerta: ${alertTitle} - ${machineName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 16px;">
          <h2 style="color: #dc2626; margin: 0;">🚨 Nueva Alerta de Sistema</h2>
        </div>
        <p><strong>Máquina:</strong> ${machineName}</p>
        <p><strong>Alerta:</strong> ${alertTitle}</p>
        <p><strong>Descripción:</strong> ${alertMessage}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/alerts" 
           style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Ver Alertas
        </a>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #9ca3af; font-size: 12px;">IngeniumCR - Sistema de Gestión Industrial</p>
      </div>
    `,
    text: `
      🚨 ALERTA DE SISTEMA
      
      Máquina: ${machineName}
      Alerta: ${alertTitle}
      Descripción: ${alertMessage}
      
      Ver alertas: ${process.env.NEXT_PUBLIC_APP_URL}/alerts
    `,
  }),

  // Email de bienvenida
  welcomeEmail: (username: string) => ({
    subject: '¡Bienvenido a IngeniumCR!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">¡Hola ${username}!</h2>
        <p>Tu cuenta ha sido verificada exitosamente.</p>
        <p>Ahora puedes acceder a todas las funcionalidades del sistema:</p>
        <ul>
          <li>Gestión de maquinaria</li>
          <li>Órdenes de mantenimiento</li>
          <li>Sistema de alertas</li>
          <li>Chat entre usuarios</li>
          <li>Asistente IA</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
           style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Ir al Dashboard
        </a>
      </div>
    `,
    text: `
      ¡Hola ${username}!
      
      Tu cuenta ha sido verificada exitosamente.
      
      Accede al sistema: ${process.env.NEXT_PUBLIC_APP_URL}
    `,
  }),

  passwordRecoveryEmail: async (recoveryUrl: string) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const templatePath = path.join(process.cwd(), 'email-templates', 'password-recovery-email.html')
    const htmlTemplate = await readFile(templatePath, 'utf-8')

    const html = htmlTemplate.replaceAll('{{APP_URL}}', appUrl).replaceAll('{{RECOVERY_URL}}', recoveryUrl)

    return {
      subject: 'Recupera tu contraseña - IngeniumCR',
      html,
      text: `Recibimos una solicitud para restablecer tu contraseña.\n\nAbre este enlace: ${recoveryUrl}\n\nSi no solicitaste este cambio, ignora este correo.`,
    }
  },
}
