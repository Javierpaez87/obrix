/*
  # Create contacts table

  1. New Tables
    - `contacts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users) - owner of the contact
      - `name` (text, required) - contact person name
      - `company` (text, required) - company name
      - `phone` (text, required) - phone number
      - `email` (text, nullable) - email address
      - `category` (text, required) - 'materials', 'labor', or 'clients'
      - `subcategory` (text, required) - specific type within category
      - `notes` (text, nullable) - additional notes
      - `rating` (integer, nullable) - 1-5 star rating
      - `last_contact` (timestamptz, nullable) - last contact date
      - `created_at` (timestamptz) - creation timestamp
  
  2. Security
    - Enable RLS on `contacts` table
    - Add policies for authenticated users to manage their own contacts only
    - Users can only see/edit/delete their own contacts (user_id = auth.uid())
*/

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  company text NOT NULL,
  phone text NOT NULL,
  email text,
  category text NOT NULL CHECK (category IN ('materials', 'labor', 'clients')),
  subcategory text NOT NULL,
  notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  last_contact timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_category ON contacts(category);
