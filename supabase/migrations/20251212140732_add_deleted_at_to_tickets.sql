/*
  # Add soft delete to tickets table

  1. Changes
    - Add `deleted_at` column to `tickets` table for soft delete functionality
    - Add index on `deleted_at` for efficient queries
    - Update RLS policies to exclude deleted tickets

  2. Notes
    - Tickets with `deleted_at` IS NULL are active
    - Tickets with `deleted_at` IS NOT NULL are in the trash
    - Users can restore tickets by setting `deleted_at` to NULL
*/

-- Add deleted_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tickets' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE tickets ADD COLUMN deleted_at timestamptz;
  END IF;
END $$;

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_tickets_deleted_at ON tickets(deleted_at);

-- Update RLS policies to exclude deleted tickets from normal views
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
CREATE POLICY "Users can view their own tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() AND deleted_at IS NULL);

-- Add policy to view deleted tickets (for trash)
DROP POLICY IF EXISTS "Users can view their deleted tickets" ON tickets;
CREATE POLICY "Users can view their deleted tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() AND deleted_at IS NOT NULL);

-- Policy for inserting tickets
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
CREATE POLICY "Users can create tickets"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Policy for updating tickets
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;
CREATE POLICY "Users can update their own tickets"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policy for deleting tickets (soft delete via update)
DROP POLICY IF EXISTS "Users can delete their own tickets" ON tickets;
CREATE POLICY "Users can delete their own tickets"
  ON tickets
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());