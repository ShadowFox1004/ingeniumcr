import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const adminSupabase = createAdminClient()
    const supabase = await createClient()

    // Get all users from auth.users
    const { data: { users }, error: usersError } = await adminSupabase.auth.admin.listUsers()

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError.message },
        { status: 500 }
      )
    }

    console.log(`Found ${users.length} users in auth.users`)

    let createdProfiles = 0
    let skippedProfiles = 0
    let errors = []

    // Create profiles for users who don't have one
    for (const user of users) {
      try {
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (existingProfile) {
          skippedProfiles++
          continue
        }

        // Create profile
        const username = user.email?.split('@')[0] || 'user'
        const fullName = user.user_metadata?.full_name || username

        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            username: username,
            full_name: fullName,
            status: 'offline',
            last_seen: new Date().toISOString(),
          })

        if (insertError) {
          errors.push({ userId: user.id, error: insertError.message })
          console.error(`Error creating profile for user ${user.id}:`, insertError)
        } else {
          createdProfiles++
          console.log(`✅ Created profile for user: ${user.email}`)
        }

      } catch (error) {
        errors.push({ userId: user.id, error: error instanceof Error ? error.message : 'Unknown error' })
        console.error(`Error processing user ${user.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      stats: {
        totalUsers: users.length,
        createdProfiles,
        skippedProfiles,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error in migration:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      { error: 'Migration failed', details: errorMessage },
      { status: 500 }
    )
  }
}
