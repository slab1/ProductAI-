-- ProductAI Pro - Database Fix Script
-- CRITICAL: Run this FIRST to fix UUID generation and profile creation issues
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/tdvhmmrvxlwaocfcvdls/sql/new

-- ============================================================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- ============================================================================

-- Enable UUID extension (CRITICAL for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 2: CREATE PROFILE CREATION TRIGGER
-- ============================================================================

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 3: FIX PROFILES TABLE DEFAULT
-- ============================================================================

-- Add default UUID generation to profiles table if not already set
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- ============================================================================
-- STEP 4: VERIFY UUID GENERATION WORKS
-- ============================================================================

-- Test UUID generation (should return a UUID)
SELECT uuid_generate_v4() as test_uuid;

-- ============================================================================
-- STEP 5: FIX RLS POLICIES FOR BETTER DEBUGGING
-- ============================================================================

-- Update projects SELECT policy to be more permissive for debugging
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (
        owner_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid())
    );

-- Ensure INSERT policy is correct
DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- ============================================================================
-- STEP 6: ADD HELPFUL DEBUG QUERY
-- ============================================================================

-- Query to check if user exists in profiles table
-- Replace 'USER_ID_HERE' with actual user ID for debugging
-- SELECT * FROM profiles WHERE id = 'USER_ID_HERE';

-- Query to check if projects exist for user
-- SELECT * FROM projects WHERE owner_id = 'USER_ID_HERE';

SELECT 'Database fix completed! UUID extension enabled, profile trigger created.' as result;