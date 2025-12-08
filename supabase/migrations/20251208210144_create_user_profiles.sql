/*
  # Create User Profiles Schema

  ## Overview
  This migration creates the user profiles system with support for both constructors and clients.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, not null)
  - `name` (text)
  - `phone` (text)
  - `avatar_url` (text)
  - `role` (text, enum: 'constructor' or 'client')
  - `company` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  
  1. Enable RLS on profiles table
  2. Policies:
     - Users can read their own profile
     - Users can update their own profile
     - Users can insert their own profile (during signup)
     - Users can delete their own profile
  
  ## Automatic Profile Creation
  
  Creates a trigger that automatically creates a profile when a new user signs up.

  ## Notes
  - Email confirmation is disabled by default in Supabase
  - The trigger ensures every auth.users entry has a corresponding profile
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('constructor', 'client')),
  company text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS on_profile_updated ON profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
