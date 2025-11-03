-- ProductAI Pro - Complete Database Setup Script
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/tdvhmmrvxlwaocfcvdls/sql/new

-- ============================================================================
-- PART 1: CREATE ALL TABLES
-- ============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    company_name TEXT,
    role TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    subscription_end_date TIMESTAMP,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL,
    status TEXT DEFAULT 'active',
    start_date DATE,
    target_launch_date DATE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 3. Project Members Table
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role TEXT,
    invited_at TIMESTAMP DEFAULT now(),
    joined_at TIMESTAMP
);

-- 4. Features Table
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reach_score INTEGER,
    impact_score INTEGER,
    confidence_score INTEGER,
    effort_score DECIMAL,
    rice_score DECIMAL,
    status TEXT DEFAULT 'backlog',
    priority_rank INTEGER,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 5. User Stories Table
CREATE TABLE IF NOT EXISTS user_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    feature_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    user_role TEXT,
    user_goal TEXT,
    user_benefit TEXT,
    acceptance_criteria JSONB,
    story_points INTEGER,
    priority TEXT,
    status TEXT DEFAULT 'draft',
    created_by UUID NOT NULL,
    ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 6. Roadmaps Table
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    view_mode TEXT DEFAULT 'quarterly',
    start_date DATE,
    end_date DATE,
    is_public BOOLEAN DEFAULT false,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 7. Roadmap Items Table
CREATE TABLE IF NOT EXISTS roadmap_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_id UUID NOT NULL,
    feature_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT,
    milestone BOOLEAN DEFAULT false,
    dependencies JSONB,
    color TEXT,
    position_index INTEGER,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 8. Sprints Table
CREATE TABLE IF NOT EXISTS sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    name TEXT NOT NULL,
    goal TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    capacity_hours DECIMAL,
    status TEXT DEFAULT 'planning',
    velocity INTEGER,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 9. Sprint Tasks Table
CREATE TABLE IF NOT EXISTS sprint_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sprint_id UUID NOT NULL,
    user_story_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID,
    estimated_hours DECIMAL,
    actual_hours DECIMAL,
    status TEXT DEFAULT 'todo',
    priority INTEGER,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 10. Competitors Table
CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    name TEXT NOT NULL,
    website TEXT,
    description TEXT,
    market_position TEXT,
    pricing_model TEXT,
    target_audience TEXT,
    strengths JSONB,
    weaknesses JSONB,
    features JSONB,
    added_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 11. Competitive Analysis Table
CREATE TABLE IF NOT EXISTS competitive_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    competitor_id UUID,
    analysis_type TEXT,
    title TEXT NOT NULL,
    insights JSONB,
    recommendations JSONB,
    ai_generated BOOLEAN DEFAULT false,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 12. OKRs Table
CREATE TABLE IF NOT EXISTS okrs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    parent_okr_id UUID,
    type TEXT,
    objective TEXT NOT NULL,
    description TEXT,
    time_period TEXT,
    start_date DATE,
    end_date DATE,
    owner_id UUID NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 13. Key Results Table
CREATE TABLE IF NOT EXISTS key_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    okr_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metric_type TEXT,
    target_value DECIMAL NOT NULL,
    current_value DECIMAL DEFAULT 0,
    unit TEXT,
    status TEXT DEFAULT 'on-track',
    progress_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 14. Templates Table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB,
    is_public BOOLEAN DEFAULT false,
    created_by UUID,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 15. Communications Table
CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    template_id UUID,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    recipients JSONB,
    sent_at TIMESTAMP,
    created_by UUID NOT NULL,
    ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- 16. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    project_id UUID,
    action_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    description TEXT,
    metadata JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- 17. Usage Metrics Table
CREATE TABLE IF NOT EXISTS usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    feature_type TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- PART 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_features_project ON features(project_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_project ON user_stories(project_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_project ON roadmaps(project_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_items_roadmap ON roadmap_items(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_sprint ON sprint_tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_competitors_project ON competitors(project_id);
CREATE INDEX IF NOT EXISTS idx_competitive_analysis_project ON competitive_analysis(project_id);
CREATE INDEX IF NOT EXISTS idx_okrs_project ON okrs(project_id);
CREATE INDEX IF NOT EXISTS idx_key_results_okr ON key_results(okr_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user ON usage_metrics(user_id);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 'Database tables and indexes created successfully!' as message;
