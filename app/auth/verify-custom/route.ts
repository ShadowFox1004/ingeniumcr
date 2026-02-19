import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get('token')
  const origin = requestUrl.origin

  if (!token) {
    console.error('No token provided in custom verification')
    return NextResponse.redirect(`${origin}/auth/verify-email?error=missing_token`)
  }

  try {
    // Decodificar el token
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [userId, email, timestamp] = decoded.split(':')

    if (!userId || !email) {
      console.error('Invalid token format')
      return NextResponse.redirect(`${origin}/auth/verify-email?error=invalid_token`)
    }

    // Verificar que el token no sea muy viejo (24 horas)
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 24 * 60 * 60 * 1000) {
      console.error('Token expired')
      return NextResponse.redirect(`${origin}/auth/verify-email?error=token_expired`)
    }

    const supabase = await createClient()

    // Verificar el usuario y confirmar el email
    const { data: { user }, error: userError } = await supabase.auth.getUser(userId)

    if (userError || !user) {
      console.error('User not found:', userError)
      return NextResponse.redirect(`${origin}/auth/verify-email?error=user_not_found`)
    }

    if (user.email !== email) {
      console.error('Email mismatch')
      return NextResponse.redirect(`${origin}/auth/verify-email?error=email_mismatch`)
    }

    // Confirmar el email del usuario
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true
    })

    if (updateError) {
      console.error('Error confirming email:', updateError)
      return NextResponse.redirect(`${origin}/auth/verify-email?error=confirmation_failed`)
    }

    // Crear sesión para el usuario
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: '', // No tenemos la contraseña aquí, pero el email ya está confirmado
    })

    // Si hay error de signIn, es normal (no tenemos la contraseña)
    // Lo importante es que el email ya está confirmado

    console.log('Email confirmed successfully for user:', userId)
    return NextResponse.redirect(`${origin}/auth/verification-success`)

  } catch (error) {
    console.error('Error in custom verification:', error)
    return NextResponse.redirect(`${origin}/auth/verify-email?error=verification_failed`)
  }
}
