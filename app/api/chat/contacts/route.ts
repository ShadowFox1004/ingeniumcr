import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/chat/contacts - Get user's contacts and available users
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user profile exists
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      await supabase.from('user_profiles').insert({
        id: user.id,
        username: user.email?.split('@')[0],
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        status: 'online'
      })
    }

    // Get user's contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('user_contacts')
      .select(`
        id,
        user_id,
        contact_id,
        status,
        created_at,
        contact:user_profiles!contact_id (
          id,
          username,
          full_name,
          avatar_url,
          status,
          last_seen
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError)
      return NextResponse.json({ error: contactsError.message }, { status: 500 })
    }

    // If searching for new users
    let availableUsers: any[] = []
    if (search) {
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, username, full_name, avatar_url, status, last_seen')
        .neq('id', user.id)
        .or(`username.ilike.%${search}%,full_name.ilike.%${search}%`)
        .limit(20)

      if (usersError) {
        console.error('Error searching users:', usersError)
      } else {
        // Filter out existing contacts
        const contactIds = new Set(contacts?.map(c => c.contact_id) || [])
        availableUsers = (users || []).filter(u => !contactIds.has(u.id))
      }
    }

    // Get all users if no search (for adding contacts)
    if (!search) {
      const { data: allUsers, error: allUsersError } = await supabase
        .from('user_profiles')
        .select('id, username, full_name, avatar_url, status, last_seen')
        .neq('id', user.id)
        .order('full_name')

      if (!allUsersError && allUsers) {
        const contactIds = new Set(contacts?.map(c => c.contact_id) || [])
        availableUsers = allUsers.filter(u => !contactIds.has(u.id))
      }
    }

    return NextResponse.json({ 
      contacts: contacts || [],
      availableUsers: availableUsers || []
    })
  } catch (error) {
    console.error('Error in GET /api/chat/contacts:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/chat/contacts - Add a new contact
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { contactId } = await request.json()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID required' }, 
        { status: 400 }
      )
    }

    // Check if already exists
    const { data: existing } = await supabase
      .from('user_contacts')
      .select('id')
      .eq('user_id', user.id)
      .eq('contact_id', contactId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Contact already exists' }, 
        { status: 400 }
      )
    }

    // Add contact
    const { data: contact, error } = await supabase
      .from('user_contacts')
      .insert({
        user_id: user.id,
        contact_id: contactId,
        status: 'accepted'
      })
      .select(`
        id,
        user_id,
        contact_id,
        status,
        created_at,
        contact:user_profiles!contact_id (
          id,
          username,
          full_name,
          avatar_url,
          status,
          last_seen
        )
      `)
      .single()

    if (error) {
      console.error('Error adding contact:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Error in POST /api/chat/contacts:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// DELETE /api/chat/contacts?id=xxx - Remove a contact
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('id')
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID required' }, 
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('user_contacts')
      .delete()
      .eq('id', contactId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error removing contact:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/chat/contacts:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
