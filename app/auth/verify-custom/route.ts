import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get('token')
  const origin = requestUrl.origin

  console.log('🔍 Custom verification attempt:', { token: token?.substring(0, 20) + '...', hasToken: !!token })

  if (!token) {
    console.error('❌ No token provided in custom verification')
    return NextResponse.redirect(`${origin}/auth/verify-email?error=missing_token`)
  }

  try {
    // Decodificar el token
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    console.log('🔍 Decoded token:', decoded.substring(0, 50) + '...')
    
    const [userId, email, timestamp] = decoded.split(':')

    if (!userId || !email) {
      console.error('❌ Invalid token format:', { userId, email })
      return NextResponse.redirect(`${origin}/auth/verify-email?error=invalid_token`)
    }

    // Verificar que el token no sea muy viejo (24 horas)
    const tokenAge = Date.now() - parseInt(timestamp)
    console.log('🔍 Token age:', tokenAge / 1000 / 60, 'minutes')
    
    if (tokenAge > 24 * 60 * 60 * 1000) {
      console.error('❌ Token expired')
      return NextResponse.redirect(`${origin}/auth/verify-email?error=token_expired`)
    }

    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    // Verificar el usuario usando admin client (no necesita JWT)
    const { data: { user }, error: userError } = await adminSupabase.auth.admin.getUserById(userId)

    if (userError || !user) {
      console.error('❌ User not found:', userError)
      return NextResponse.redirect(`${origin}/auth/verify-email?error=user_not_found`)
    }

    console.log('🔍 Found user:', { userId: user.id, email: user.email, confirmed: !!user.email_confirmed_at })

    if (user.email !== email) {
      console.error('❌ Email mismatch:', { userEmail: user.email, tokenEmail: email })
      return NextResponse.redirect(`${origin}/auth/verify-email?error=email_mismatch`)
    }

    // Confirmar el email del usuario usando admin client
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(userId, {
      email_confirm: true
    })

    if (updateError) {
      console.error('❌ Error confirming email:', updateError)
      return NextResponse.redirect(`${origin}/auth/verify-email?error=confirmation_failed`)
    }

    console.log('✅ Email confirmed successfully for user:', userId)
    
    return NextResponse.redirect(`${origin}/auth/verification-success`)

  } catch (error) {
    console.error('❌ Error in custom verification:', error)
    return NextResponse.redirect(`${origin}/auth/verify-email?error=verification_failed`)
  }
}
