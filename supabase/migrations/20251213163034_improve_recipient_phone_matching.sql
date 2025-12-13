/*
  # Improve phone number matching for ticket recipients

  1. Changes
    - Create a function to clean phone numbers (removes all non-digits)
    - Drop the old recipient view policy
    - Create a new policy that uses the phone cleaning function for better matching

  2. Security
    - Maintains same security level
    - Improves phone number matching by comparing cleaned versions
    - Handles different phone formats (+54 9 11..., 5491122..., etc)
*/

-- Create function to clean phone numbers (only digits)
CREATE OR REPLACE FUNCTION clean_phone(phone_text text)
RETURNS text AS $$
BEGIN
  IF phone_text IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN regexp_replace(phone_text, '[^0-9]', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Drop old policy
DROP POLICY IF EXISTS "Recipients can view tickets sent to them" ON tickets;

-- Create improved policy with phone cleaning
CREATE POLICY "Recipients can view tickets sent to them"
  ON tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ticket_recipients
      WHERE ticket_recipients.ticket_id = tickets.id
      AND (
        -- Direct profile_id match
        ticket_recipients.recipient_profile_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND (
            -- Email match
            (ticket_recipients.recipient_email IS NOT NULL 
             AND LOWER(profiles.email) = LOWER(ticket_recipients.recipient_email))
            OR 
            -- Phone match using cleaned versions
            (ticket_recipients.recipient_phone IS NOT NULL 
             AND profiles.phone IS NOT NULL
             AND clean_phone(profiles.phone) = clean_phone(ticket_recipients.recipient_phone))
          )
        )
      )
    )
  );