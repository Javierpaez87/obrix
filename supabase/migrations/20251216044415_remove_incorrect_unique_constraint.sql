/*
  # Remove incorrect unique constraint

  1. Changes
    - Drop the unique constraint `ticket_recipients_unique_ticket_recipient` that was causing issues with upsert
    - This constraint was using NULLS NOT DISTINCT which is not compatible with Supabase's onConflict syntax

  2. Notes
    - Duplicate prevention is now handled in the application layer with SELECT before INSERT
    - Future: Consider adding a proper unique constraint without NULLS NOT DISTINCT if needed
*/

-- Drop the problematic unique constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ticket_recipients_unique_ticket_recipient'
  ) THEN
    ALTER TABLE public.ticket_recipients 
    DROP CONSTRAINT ticket_recipients_unique_ticket_recipient;
  END IF;
END $$;
