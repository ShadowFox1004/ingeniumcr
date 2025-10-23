-- Function to delete a user and all their associated data
-- This function should be created in Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete user data from custom tables (add your tables here)
  -- Example: DELETE FROM user_profiles WHERE user_id = current_user_id;
  -- Example: DELETE FROM user_settings WHERE user_id = current_user_id;
  
  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;
