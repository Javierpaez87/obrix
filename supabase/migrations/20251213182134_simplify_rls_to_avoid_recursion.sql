/*
  # Simplify RLS policies to completely avoid recursion

  1. Strategy
    - ticket_recipients policies should NEVER query the tickets table
    - tickets policies CAN query ticket_recipients (one-way reference)
    - This breaks the circular dependency

  2. Changes
    - Drop all ticket_recipients SELECT policies
    - Create simple policies that don't reference tickets
    - Keep tickets policies as-is

  3. Security Trade-off
    - ticket_recipients are visible to authenticated users if they can match by email/phone
    - This is acceptable because recipients only contain contact info, not sensitive ticket data
    - The actual ticket content is still protected by tickets policies
*/

-- Clean slate: drop all existing ticket_recipients policies
DROP POLICY IF EXISTS "View own recipient records" ON ticket_recipients;
DROP POLICY IF EXISTS "Users can view recipients where they are listed" ON ticket_recipients;
DROP POLICY IF EXISTS "Allow inserting ticket recipients" ON ticket_recipients;

-- Simple INSERT policy: anyone authenticated can create recipients
CREATE POLICY "Authenticated users can insert recipients"
  ON ticket_recipients FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Simple SELECT policy: can view if you're the recipient (no tickets lookup)
CREATE POLICY "View if you are the recipient"
  ON ticket_recipients FOR SELECT
  TO authenticated
  USING (
    recipient_profile_id = auth.uid()
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

-- Keep the UPDATE policy simple too (already doesn't reference tickets)
-- This policy should already exist, but let's ensure it's there
DROP POLICY IF EXISTS "Users can update recipients where they are listed" ON ticket_recipients;

CREATE POLICY "Update if you are the recipient"
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