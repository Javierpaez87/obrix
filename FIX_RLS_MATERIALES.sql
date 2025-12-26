-- ============================================
-- FIX RLS para material_lists y material_items
-- Ejecutar manualmente en Supabase SQL Editor
-- ============================================

-- 1. Drop old overly permissive SELECT policies
DROP POLICY IF EXISTS "Users can view material lists" ON material_lists;
DROP POLICY IF EXISTS "Users can view material items" ON material_items;

-- 2. Create new restrictive SELECT policies

-- Allow SELECT on material_lists if:
--   a) User is the ticket creator (tickets.created_by = auth.uid()), OR
--   b) User is a recipient (exists in ticket_recipients with recipient_profile_id = auth.uid())
CREATE POLICY "Ticket creator and recipients can view material lists"
  ON material_lists FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = material_lists.ticket_id
      AND tickets.created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM ticket_recipients
      WHERE ticket_recipients.ticket_id = material_lists.ticket_id
      AND ticket_recipients.recipient_profile_id = auth.uid()
    )
  );

-- Allow SELECT on material_items if user can see the parent material_list
CREATE POLICY "Users can view material items if they can view the list"
  ON material_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM material_lists
      WHERE material_lists.id = material_items.list_id
      AND (
        EXISTS (
          SELECT 1 FROM tickets
          WHERE tickets.id = material_lists.ticket_id
          AND tickets.created_by = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM ticket_recipients
          WHERE ticket_recipients.ticket_id = material_lists.ticket_id
          AND ticket_recipients.recipient_profile_id = auth.uid()
        )
      )
    )
  );
