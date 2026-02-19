-- Fix RLS policies for conversation_participants to avoid infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;

-- Create new policies without recursion
CREATE POLICY "Users can view conversation participants" 
ON conversation_participants FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can join conversations" 
ON conversation_participants FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participant record" 
ON conversation_participants FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
