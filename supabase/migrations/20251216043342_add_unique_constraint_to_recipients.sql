/*
  # Add unique constraint to ticket_recipients

  1. Changes
    - Add UNIQUE constraint on (ticket_id, recipient_profile_id) to prevent duplicate recipient rows
    - This ensures each constructor can only have one recipient row per ticket
    - Allows null recipient_profile_id for external (non-registered) contacts

  2. Notes
    - This constraint prevents duplicates when the same constructor is sent the same ticket multiple times
    - External contacts (with only phone/email) can still have multiple entries if needed
*/

-- Add unique constraint to prevent duplicate recipient rows for registered users
ALTER TABLE public.ticket_recipients
ADD CONSTRAINT ticket_recipients_unique_ticket_recipient
UNIQUE NULLS NOT DISTINCT (ticket_id, recipient_profile_id);
