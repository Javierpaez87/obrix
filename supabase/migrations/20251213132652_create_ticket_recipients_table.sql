/*
  # Create ticket_recipients table

  1. New Tables
    - `ticket_recipients`
      - `id` (uuid, primary key) - Unique identifier for each recipient record
      - `ticket_id` (uuid, foreign key) - References the ticket being sent
      - `recipient_phone` (text, nullable) - Phone number of recipient if sent via phone
      - `recipient_email` (text, nullable) - Email of recipient if sent via email
      - `recipient_profile_id` (uuid, nullable) - Links to profiles table if recipient accepts/rejects while logged in
      - `status` (enum) - Tracks response status: 'sent', 'accepted', 'rejected'
      - `sent_at` (timestamp) - When the WhatsApp message was sent
      - `accepted_at` (timestamp, nullable) - When recipient accepted the ticket
      - `rejected_at` (timestamp, nullable) - When recipient rejected the ticket
      - `created_at` (timestamp) - Record creation timestamp

  2. Security
    - Enable RLS on `ticket_recipients` table
    - Add policy for ticket creators to view their ticket recipients
    - Add policy for authenticated users to view recipients where they are listed (by phone/email or profile_id)
    - Add policy for authenticated users to update recipients where they are listed
*/

CREATE TYPE recipient_status AS ENUM ('sent', 'accepted', 'rejected');

CREATE TABLE IF NOT EXISTS ticket_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  recipient_phone text,
  recipient_email text,
  recipient_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status recipient_status NOT NULL DEFAULT 'sent',
  sent_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ticket creators can view their ticket recipients"
  ON ticket_recipients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_recipients.ticket_id
      AND tickets.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view recipients where they are listed"
  ON ticket_recipients FOR SELECT
  TO authenticated
  USING (
    recipient_profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        (ticket_recipients.recipient_phone IS NOT NULL AND profiles.phone = ticket_recipients.recipient_phone)
        OR (ticket_recipients.recipient_email IS NOT NULL AND profiles.email = ticket_recipients.recipient_email)
      )
    )
  );

CREATE POLICY "Users can update recipients where they are listed"
  ON ticket_recipients FOR UPDATE
  TO authenticated
  USING (
    recipient_profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        (ticket_recipients.recipient_phone IS NOT NULL AND profiles.phone = ticket_recipients.recipient_phone)
        OR (ticket_recipients.recipient_email IS NOT NULL AND profiles.email = ticket_recipients.recipient_email)
      )
    )
  )
  WITH CHECK (
    recipient_profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        (ticket_recipients.recipient_phone IS NOT NULL AND profiles.phone = ticket_recipients.recipient_phone)
        OR (ticket_recipients.recipient_email IS NOT NULL AND profiles.email = ticket_recipients.recipient_email)
      )
    )
  );

CREATE INDEX IF NOT EXISTS idx_ticket_recipients_ticket_id ON ticket_recipients(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_recipients_profile_id ON ticket_recipients(recipient_profile_id);
CREATE INDEX IF NOT EXISTS idx_ticket_recipients_status ON ticket_recipients(status);