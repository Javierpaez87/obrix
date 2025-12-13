/*
  # Add ticket_creator_id to ticket_recipients

  1. Changes
    - Add ticket_creator_id column to ticket_recipients table
    - This allows RLS policies to check ownership without querying tickets table
    - Prevents infinite recursion between tickets and ticket_recipients policies

  2. Security
    - ticket_creator_id is required and references auth.users
    - This enables non-recursive RLS policies
    - Creators can view/manage recipients for their tickets
*/

-- Add the ticket_creator_id column
ALTER TABLE ticket_recipients 
ADD COLUMN IF NOT EXISTS ticket_creator_id uuid REFERENCES auth.users(id);

-- Update existing records to populate ticket_creator_id from tickets table
UPDATE ticket_recipients
SET ticket_creator_id = (
  SELECT created_by 
  FROM tickets 
  WHERE tickets.id = ticket_recipients.ticket_id
)
WHERE ticket_creator_id IS NULL;

-- Make it required (after backfilling existing data)
ALTER TABLE ticket_recipients 
ALTER COLUMN ticket_creator_id SET NOT NULL;

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Authenticated users can insert recipients" ON ticket_recipients;
DROP POLICY IF EXISTS "View if you are the recipient" ON ticket_recipients;
DROP POLICY IF EXISTS "Update if you are the recipient" ON ticket_recipients;

-- Create new non-recursive policies

-- INSERT: Only ticket creator can add recipients
CREATE POLICY "Creators can insert recipients for their tickets"
  ON ticket_recipients FOR INSERT
  TO authenticated
  WITH CHECK (ticket_creator_id = auth.uid());

-- SELECT: View if you're the creator OR if you're the recipient
CREATE POLICY "View recipients if creator or recipient"
  ON ticket_recipients FOR SELECT
  TO authenticated
  USING (
    ticket_creator_id = auth.uid()
    OR recipient_profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        (ticket_recipients.recipient_email IS NOT NULL 
         AND LOWER(profiles.email) = LOWER(ticket_recipients.recipient_email))
        OR 
        (ticket_recipients.recipient_phone IS NOT NULL 
         AND profiles.phone IS NOT NULL
         AND clean_phone(profiles.phone) = clean_phone(ticket_recipients.recipient_phone))
      )
    )
  );

-- UPDATE: Only recipients can update their own records
CREATE POLICY "Recipients can update their status"
  ON ticket_recipients FOR UPDATE
  TO authenticated
  USING (
    recipient_profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        (ticket_recipients.recipient_phone IS NOT NULL 
         AND profiles.phone IS NOT NULL
         AND clean_phone(profiles.phone) = clean_phone(ticket_recipients.recipient_phone))
        OR 
        (ticket_recipients.recipient_email IS NOT NULL 
         AND LOWER(profiles.email) = LOWER(ticket_recipients.recipient_email))
      )
    )
  )
  WITH CHECK (
    recipient_profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        (ticket_recipients.recipient_phone IS NOT NULL 
         AND profiles.phone IS NOT NULL
         AND clean_phone(profiles.phone) = clean_phone(ticket_recipients.recipient_phone))
        OR 
        (ticket_recipients.recipient_email IS NOT NULL 
         AND LOWER(profiles.email) = LOWER(ticket_recipients.recipient_email))
      )
    )
  );