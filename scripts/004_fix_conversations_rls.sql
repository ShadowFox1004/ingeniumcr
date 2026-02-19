-- Fix RLS policies for conversations table to allow function operations

-- Drop existing problematic policy
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;

-- Create new policy that allows the function to work
CREATE POLICY "Users can view their conversations" 
ON conversations FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conversations.id 
    AND user_id = auth.uid()
  )
);

-- Add policy to allow function to create conversations
CREATE POLICY "Allow conversation creation via function" 
ON conversations FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = id 
    AND user_id = auth.uid()
  )
);
