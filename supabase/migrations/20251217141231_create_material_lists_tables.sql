/*
  # Create material lists tables

  1. New Tables
    - `material_lists`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, foreign key to tickets)
      - `name` (text, not null)
      - `created_by` (uuid, nullable)
      - `status` (text, default 'draft')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `material_items`
      - `id` (uuid, primary key)
      - `list_id` (uuid, foreign key to material_lists)
      - `position` (int, not null, default 1)
      - `material` (text, not null)
      - `quantity` (numeric, nullable)
      - `unit` (text, nullable)
      - `spec` (text, nullable)
      - `comment` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add basic policies for authenticated users

  3. Indexes
    - Index on material_lists(ticket_id)
    - Index on material_items(list_id)
*/

-- Create material_lists table
CREATE TABLE IF NOT EXISTS material_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_by uuid,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create material_items table
CREATE TABLE IF NOT EXISTS material_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES material_lists(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 1,
  material text NOT NULL,
  quantity numeric,
  unit text,
  spec text,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_material_lists_ticket_id ON material_lists(ticket_id);
CREATE INDEX IF NOT EXISTS idx_material_items_list_id ON material_items(list_id);

-- Enable RLS
ALTER TABLE material_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_items ENABLE ROW LEVEL SECURITY;

-- Policies for material_lists
CREATE POLICY "Users can view material lists"
  ON material_lists FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert material lists"
  ON material_lists FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update material lists"
  ON material_lists FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete material lists"
  ON material_lists FOR DELETE
  TO authenticated
  USING (true);

-- Policies for material_items
CREATE POLICY "Users can view material items"
  ON material_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert material items"
  ON material_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update material items"
  ON material_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete material items"
  ON material_items FOR DELETE
  TO authenticated
  USING (true);