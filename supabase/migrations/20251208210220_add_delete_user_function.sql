/*
  # Add User Self-Deletion Function

  ## Overview
  Creates a secure function that allows authenticated users to delete their own accounts.

  ## New Functions
  
  ### `delete_user()`
  - Allows authenticated users to delete their own account
  - Deletes the user from auth.users (profile is cascade deleted)
  - Uses SECURITY DEFINER to have necessary permissions
  
  ## Security
  - Only the authenticated user can delete their own account
  - Cannot delete other users' accounts
  - Cascade deletion automatically removes profile data
*/

-- Function to allow users to delete their own account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify that the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from auth.users
  -- The profile will be cascade deleted automatically
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;
