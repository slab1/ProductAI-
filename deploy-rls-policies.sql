-- ProductAI Pro - Row Level Security Policies
-- Run this AFTER creating tables: https://supabase.com/dashboard/project/tdvhmmrvxlwaocfcvdls/sql/new

-- ============================================================================
-- PART 1: ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitive_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 2: PROFILES POLICIES
-- ============================================================================

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() IN ('anon', 'service_role'));

-- ============================================================================
-- PART 3: PROJECTS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (
        owner_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()) OR
        auth.role() IN ('anon', 'service_role')
    );

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (owner_id = auth.uid() OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Project owners can update projects" ON projects
    FOR UPDATE USING (owner_id = auth.uid() OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Project owners can delete projects" ON projects
    FOR DELETE USING (owner_id = auth.uid() OR auth.role() IN ('anon', 'service_role'));

-- ============================================================================
-- PART 4: PROJECT MEMBERS POLICIES
-- ============================================================================

CREATE POLICY "Users can view project members" ON project_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM projects WHERE id = project_members.project_id AND owner_id = auth.uid()) OR
        auth.role() IN ('anon', 'service_role')
    );

CREATE POLICY "Project owners can manage members" ON project_members
    FOR ALL USING (
        EXISTS (SELECT 1 FROM projects WHERE id = project_members.project_id AND owner_id = auth.uid()) OR
        auth.role() IN ('anon', 'service_role')
    );

-- ============================================================================
-- PART 5: FEATURES POLICIES
-- ============================================================================

CREATE POLICY "Project members can view features" ON features
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = features.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

CREATE POLICY "Project members can manage features" ON features
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = features.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

-- ============================================================================
-- PART 6: USER STORIES POLICIES
-- ============================================================================

CREATE POLICY "Project members can view user stories" ON user_stories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = user_stories.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

CREATE POLICY "Project members can manage user stories" ON user_stories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = user_stories.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

-- ============================================================================
-- PART 7: ROADMAPS POLICIES
-- ============================================================================

CREATE POLICY "Project members can view roadmaps" ON roadmaps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = roadmaps.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

CREATE POLICY "Project members can manage roadmaps" ON roadmaps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = roadmaps.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

-- ============================================================================
-- PART 8: ROADMAP ITEMS POLICIES
-- ============================================================================

CREATE POLICY "Project members can view roadmap items" ON roadmap_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM roadmaps 
            JOIN projects ON roadmaps.project_id = projects.id
            WHERE roadmaps.id = roadmap_items.roadmap_id 
            AND (projects.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

CREATE POLICY "Project members can manage roadmap items" ON roadmap_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM roadmaps 
            JOIN projects ON roadmaps.project_id = projects.id
            WHERE roadmaps.id = roadmap_items.roadmap_id 
            AND (projects.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

-- ============================================================================
-- PART 9: SPRINTS POLICIES
-- ============================================================================

CREATE POLICY "Project members can view sprints" ON sprints
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = sprints.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

CREATE POLICY "Project members can manage sprints" ON sprints
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = sprints.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

-- ============================================================================
-- PART 10: SPRINT TASKS POLICIES
-- ============================================================================

CREATE POLICY "Project members can view sprint tasks" ON sprint_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sprints 
            JOIN projects ON sprints.project_id = projects.id
            WHERE sprints.id = sprint_tasks.sprint_id 
            AND (projects.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

CREATE POLICY "Project members can manage sprint tasks" ON sprint_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM sprints 
            JOIN projects ON sprints.project_id = projects.id
            WHERE sprints.id = sprint_tasks.sprint_id 
            AND (projects.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

-- ============================================================================
-- PART 11: COMPETITORS POLICIES
-- ============================================================================

CREATE POLICY "Project members can view competitors" ON competitors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = competitors.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

CREATE POLICY "Project members can manage competitors" ON competitors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = competitors.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

-- ============================================================================
-- PART 12: COMPETITIVE ANALYSIS POLICIES
-- ============================================================================

CREATE POLICY "Project members can view competitive analysis" ON competitive_analysis
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = competitive_analysis.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

CREATE POLICY "Project members can manage competitive analysis" ON competitive_analysis
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = competitive_analysis.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

-- ============================================================================
-- PART 13: OKRS POLICIES
-- ============================================================================

CREATE POLICY "Project members can view okrs" ON okrs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = okrs.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

CREATE POLICY "Project members can manage okrs" ON okrs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = okrs.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

-- ============================================================================
-- PART 14: KEY RESULTS POLICIES
-- ============================================================================

CREATE POLICY "Project members can view key results" ON key_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM okrs 
            JOIN projects ON okrs.project_id = projects.id
            WHERE okrs.id = key_results.okr_id 
            AND (projects.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

CREATE POLICY "Project members can manage key results" ON key_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM okrs 
            JOIN projects ON okrs.project_id = projects.id
            WHERE okrs.id = key_results.okr_id 
            AND (projects.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

-- ============================================================================
-- PART 15: TEMPLATES POLICIES
-- ============================================================================

CREATE POLICY "Users can view public templates" ON templates
    FOR SELECT USING (is_public = true OR created_by = auth.uid() OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can create templates" ON templates
    FOR INSERT WITH CHECK (created_by = auth.uid() OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can update own templates" ON templates
    FOR UPDATE USING (created_by = auth.uid() OR auth.role() IN ('anon', 'service_role'));

-- ============================================================================
-- PART 16: COMMUNICATIONS POLICIES
-- ============================================================================

CREATE POLICY "Project members can view communications" ON communications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = communications.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

CREATE POLICY "Project members can manage communications" ON communications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE id = communications.project_id 
            AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()))
        ) OR auth.role() IN ('anon', 'service_role')
    );

-- ============================================================================
-- PART 17: ACTIVITY LOGS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own activity" ON activity_logs
    FOR SELECT USING (user_id = auth.uid() OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "System can insert activity logs" ON activity_logs
    FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- ============================================================================
-- PART 18: USAGE METRICS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own usage" ON usage_metrics
    FOR SELECT USING (user_id = auth.uid() OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "System can insert usage metrics" ON usage_metrics
    FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 'RLS policies created successfully!' as message;
