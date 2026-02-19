import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, username, fullName, email } = await request.json()

    if (!userId || !username || !email) {
      return NextResponse.json(
        { error: 'userId, username, and email are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    console.log('🔧 Creating profile with admin client:', { userId, username })

    // Check if profile already exists using admin client
    const { data: existingProfile, error: checkError } = await adminSupabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing profile:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing profile', details: checkError.message },
        { status: 500 }
      )
    }

    if (existingProfile) {
      console.log('✅ Profile already exists:', existingProfile)
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
        profile: existingProfile
      })
    }

    // Create new profile using admin client
    const { data: profile, error: insertError } = await adminSupabase
      .from('user_profiles')
      .insert({
        id: userId,
        username: username,
        full_name: fullName || username,
        status: 'online',
        last_seen: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error creating profile:', insertError)
      return NextResponse.json(
        { error: 'Failed to create profile', details: insertError.message },
        { status: 500 }
      )
    }

    console.log('✅ User profile created:', profile)

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      profile
    })

  } catch (error) {
    console.error('Error in POST /api/chat/create-profile:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      { error: 'Error creating profile', details: errorMessage },
      { status: 500 }
    )
  }
}
