import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// PUT /api/chat/status - Update user status
export async function PUT(request: Request) {
  try {
    const { status } = await request.json()
    
    if (!status || !['online', 'away', 'offline'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be online, away, or offline' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update status using admin client to bypass RLS
    const { data: profile, error } = await adminSupabase
      .from('user_profiles')
      .update({ 
        status,
        last_seen: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating status:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      profile,
      message: `Status updated to ${status}`
    })

  } catch (error) {
    console.error('Error in PUT /api/chat/status:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
