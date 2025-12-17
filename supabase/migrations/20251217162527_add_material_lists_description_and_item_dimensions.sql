/*
  # Add description and dimensions to material lists

  1. Changes to material_lists
    - Add `description` column (text, nullable)
  
  2. Changes to material_items
    - Add `thickness_value` (text, nullable)
    - Add `thickness_unit` (text, nullable)
    - Add `width_value` (text, nullable)
    - Add `width_unit` (text, nullable)
    - Add `length_value` (text, nullable)
    - Add `length_unit` (text, nullable)
*/

-- Add description to material_lists
ALTER TABLE material_lists
ADD COLUMN IF NOT EXISTS description text;

-- Add dimension columns to material_items
ALTER TABLE material_items
ADD COLUMN IF NOT EXISTS thickness_value text,
ADD COLUMN IF NOT EXISTS thickness_unit text,
ADD COLUMN IF NOT EXISTS width_value text,
ADD COLUMN IF NOT EXISTS width_unit text,
ADD COLUMN IF NOT EXISTS length_value text,
ADD COLUMN IF NOT EXISTS length_unit text;