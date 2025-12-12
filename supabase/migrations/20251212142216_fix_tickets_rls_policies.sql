/*
  # Fix RLS policies for tickets table

  1. Changes
    - Remove all existing policies
    - Create clean, correct policies for all operations
    - Separate policies for active and deleted tickets

  2. Security
    - Users can only access their own tickets
    - Separate policies for viewing active vs deleted tickets
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view their deleted tickets" ON tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can delete own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can delete their own tickets" ON tickets;

-- Create clean policies

-- SELECT policy for active tickets (deleted_at IS NULL)
CREATE POLICY "Users can view their active tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() AND deleted_at IS NULL);

-- SELECT policy for deleted tickets (deleted_at IS NOT NULL)
CREATE POLICY "Users can view their trashed tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() AND deleted_at IS NOT NULL);

-- INSERT policy
CREATE POLICY "Users can insert tickets"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- UPDATE policy
CREATE POLICY "Users can update tickets"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- DELETE policy (permanent delete)
CREATE POLICY "Users can delete tickets"
  ON tickets
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());