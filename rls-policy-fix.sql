-- ProductAI Pro - RLS Policy Fix Script
-- CRITICAL: Run this to fix infinite recursion in projects policies
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/tdvhmmrvxlwaocfcvdls/sql/new

-- ============================================================================
-- STEP 1: DROP ALL PROBLEMATIC POLICIES
-- ============================================================================

-- Remove all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Project owners can update projects" ON projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON projects;

-- ============================================================================
-- STEP 2: CREATE SIMPLE, NON-RECURSIVE POLICIES
-- ============================================================================

-- Simple SELECT policy - only owner can view their projects
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (owner_id = auth.uid());

-- Simple INSERT policy - users can create projects they own
CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Simple UPDATE policy - only owners can update their projects
CREATE POLICY "Project owners can update projects" ON projects
    FOR UPDATE USING (owner_id = auth.uid());

-- Simple DELETE policy - only owners can delete their projects  
CREATE POLICY "Project owners can delete projects" ON projects
    FOR DELETE USING (owner_id = auth.uid());

-- ============================================================================
-- STEP 3: VERIFY POLICIES ARE WORKING
-- ============================================================================

-- Test query to verify policies work (replace with your user ID)
-- SELECT auth.uid() as current_user;
-- SELECT * FROM projects WHERE owner_id = auth.uid();

SELECT 'RLS policies fixed! Infinite recursion resolved.' as result;