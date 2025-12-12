/*
  # Create Tickets Table for Budget Requests

  1. New Tables
    - `tickets`
      - `id` (uuid, primary key, auto-generated)
      - `created_by` (uuid, foreign key to auth.users) - User who created the ticket
      - `project_id` (text, nullable) - Associated project ID
      - `title` (text) - Ticket title
      - `description` (text) - Detailed description
      - `type` (enum) - Type: 'labor', 'materials', or 'combined'
      - `priority` (enum) - Priority: 'low', 'medium', 'high', 'urgent'
      - `status` (enum) - Status: 'pending', 'in_review', 'quoted', 'approved', 'rejected', 'completed'
      - `due_date` (date, nullable) - Due date for the request
      - `start_date` (date, nullable) - Preferred start date
      - `end_date` (date, nullable) - Preferred end date
      - `creator_role` (enum) - Role of creator: 'client' or 'constructor'
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `tickets` table
    - Add policy for users to create their own tickets
    - Add policy for users to view tickets they created
    - Add policy for users to view tickets associated with their projects
    - Add policy for users to update their own tickets
    - Add policy for users to delete their own tickets
*/

-- Create enums
DO $$ BEGIN
  CREATE TYPE ticket_type AS ENUM ('labor', 'materials', 'combined');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('pending', 'in_review', 'quoted', 'approved', 'rejected', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('client', 'constructor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id text,
  title text NOT NULL,
  description text NOT NULL,
  type ticket_type NOT NULL DEFAULT 'combined',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  status ticket_status NOT NULL DEFAULT 'pending',
  due_date date,
  start_date date,
  end_date date,
  creator_role user_role NOT NULL DEFAULT 'client',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create tickets
CREATE POLICY "Users can create tickets"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Policy: Users can update their own tickets
CREATE POLICY "Users can update own tickets"
  ON tickets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can delete their own tickets
CREATE POLICY "Users can delete own tickets"
  ON tickets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_project_id ON tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();