import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/chat/conversations - Get all conversations for current user
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // Create profile if doesn't exist
      await supabase.from('user_profiles').insert({
        id: user.id,
        username: user.email?.split('@')[0],
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        status: 'online'
      })
    }

    // Get conversations with last message and unread count
    const { data: conversations, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        last_read_at,
        conversations:conversation_id (
          id,
          created_at,
          updated_at,
          participants:conversation_participants (
            user_id,
            user:user_profiles (
              id,
              username,
              full_name,
              avatar_url,
              status,
              last_seen
            )
          ),
          messages:messages (
            id,
            content,
            sender_id,
            message_type,
            status,
            created_at,
            sender:user_profiles (
              id,
              username,
              full_name,
              avatar_url
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .order('conversations(updated_at)', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format conversations
    const formattedConversations = conversations?.map((conv: any) => {
      const otherParticipant = conv.conversations.participants.find(
        (p: any) => p.user_id !== user.id
      )?.user

      const lastMessage = conv.conversations.messages?.[0]
      const unreadCount = conv.conversations.messages?.filter(
        (m: any) => new Date(m.created_at) > new Date(conv.last_read_at) && m.sender_id !== user.id
      ).length || 0

      return {
        id: conv.conversations.id,
        created_at: conv.conversations.created_at,
        updated_at: conv.conversations.updated_at,
        other_participant: otherParticipant,
        last_message: lastMessage,
        unread_count: unreadCount,
        my_participant_id: user.id
      }
    }) || []

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error) {
    console.error('Error in GET /api/chat/conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST /api/chat/conversations - Create or get conversation with another user
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { contactId } = await request.json()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use the database function to get or create conversation
    const { data: conversationId, error } = await supabase
      .rpc('get_or_create_conversation', {
        user1: user.id,
        user2: contactId
      })

    if (error) {
      console.error('Error creating conversation:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ conversationId })
  } catch (error) {
    console.error('Error in POST /api/chat/conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
