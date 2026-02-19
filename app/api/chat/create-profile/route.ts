import { createClient } from '@/lib/supabase/server'
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

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
        profile: existingProfile
      })
    }

    // Create new profile
    const { data: profile, error } = await supabase
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

    if (error) {
      console.error('Error creating user profile:', error)
      return NextResponse.json(
        { error: 'Failed to create profile', details: error.message },
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
