/*
  # Add RLS policy for recipients to view tickets

  1. Changes
    - Add new SELECT policy on `tickets` table
    - Allows authenticated users to view tickets where they are listed as recipients in `ticket_recipients`
    - Recipients are matched by:
      - recipient_profile_id (if they accepted/rejected while logged in)
      - recipient_phone matching their profile phone
      - recipient_email matching their profile email

  2. Security
    - Only authenticated users can view tickets where they are recipients
    - Matches recipients by profile_id, phone, or email
    - Works alongside existing policies (creators can still see their own tickets)
*/

CREATE POLICY "Recipients can view tickets sent to them"
  ON tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ticket_recipients
      WHERE ticket_recipients.ticket_id = tickets.id
      AND (
        ticket_recipients.recipient_profile_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND (
            (ticket_recipients.recipient_phone IS NOT NULL AND profiles.phone = ticket_recipients.recipient_phone)
            OR (ticket_recipients.recipient_email IS NOT NULL AND profiles.email = ticket_recipients.recipient_email)
          )
        )
      )
    )
  );