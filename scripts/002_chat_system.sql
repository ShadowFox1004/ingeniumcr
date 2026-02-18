-- Chat system schema with 60-day retention
-- Created for user-to-user messaging

-- Create user profiles table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  status VARCHAR(20) DEFAULT 'offline', -- 'online', 'offline', 'away'
  last_seen TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create contacts/friends table
CREATE TABLE IF NOT EXISTS user_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, contact_id)
);

-- Create conversations table (groups individual chats)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Create messages table with 60-day retention
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file', 'system'
  status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'read'
  reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '60 days'), -- 60-day retention
  deleted_at TIMESTAMP -- Soft delete
);

-- Create message attachments table
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  file_name VARCHAR(255),
  file_url TEXT,
  file_type VARCHAR(100),
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_contacts_user ON user_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contacts_contact ON user_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON messages(expires_at);

-- Create function to auto-delete expired messages (60 days)
CREATE OR REPLACE FUNCTION delete_expired_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM messages 
  WHERE expires_at < NOW() 
     OR (deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- Create cron job to run cleanup daily (requires pg_cron extension)
-- Note: This may need to be run manually or via external scheduler if pg_cron not available
-- SELECT cron.schedule('cleanup-expired-messages', '0 0 * * *', 'SELECT delete_expired_messages();');

-- Create function to get or create conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1 UUID, user2 UUID)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Check if conversation already exists
  SELECT c.id INTO conv_id
  FROM conversations c
  JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = user1
  JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = user2
  WHERE NOT EXISTS (
    SELECT 1 FROM conversation_participants cp3 
    WHERE cp3.conversation_id = c.id 
    AND cp3.user_id NOT IN (user1, user2)
  );
  
  -- If not found, create new conversation
  IF conv_id IS NULL THEN
    INSERT INTO conversations DEFAULT VALUES RETURNING id INTO conv_id;
    INSERT INTO conversation_participants (conversation_id, user_id) VALUES (conv_id, user1);
    INSERT INTO conversation_participants (conversation_id, user_id) VALUES (conv_id, user2);
  END IF;
  
  RETURN conv_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation timestamp on new message
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User profiles: Users can view all profiles, but only update their own
CREATE POLICY "Profiles are viewable by all authenticated users" 
ON user_profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON user_profiles FOR UPDATE 
TO authenticated 
USING (id = auth.uid());

-- Contacts: Users can view/manage their own contacts
CREATE POLICY "Users can view their contacts" 
ON user_contacts FOR SELECT 
TO authenticated 
USING (user_id = auth.uid() OR contact_id = auth.uid());

CREATE POLICY "Users can create contacts" 
ON user_contacts FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own contacts" 
ON user_contacts FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own contacts" 
ON user_contacts FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

-- Conversations: Users can view conversations they're part of
CREATE POLICY "Users can view their conversations" 
ON conversations FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conversations.id AND user_id = auth.uid()
  )
);

-- Conversation participants: Users can view participants of their conversations
CREATE POLICY "Users can view conversation participants" 
ON conversation_participants FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = conversation_participants.conversation_id 
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join conversations" 
ON conversation_participants FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participant record" 
ON conversation_participants FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

-- Messages: Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations" 
ON messages FOR SELECT 
TO authenticated 
USING (
  deleted_at IS NULL AND
  expires_at > NOW() AND
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations" 
ON messages FOR INSERT 
TO authenticated 
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can soft delete their own messages" 
ON messages FOR UPDATE 
TO authenticated 
USING (sender_id = auth.uid());

-- Message attachments
CREATE POLICY "Users can view attachments in their conversations" 
ON message_attachments FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
    WHERE m.id = message_attachments.message_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add attachments to their messages" 
ON message_attachments FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages 
    WHERE id = message_attachments.message_id AND sender_id = auth.uid()
  )
);
