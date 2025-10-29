# ProductAI Pro - Database Schema

## Overview
Complete database schema for AI-powered product management SaaS platform.

## Tables

### 1. profiles
User profile and subscription information
```sql
- id UUID PRIMARY KEY (references auth.users)
- email TEXT NOT NULL
- full_name TEXT
- company_name TEXT
- role TEXT
- subscription_tier TEXT DEFAULT 'free' (free, pro, enterprise)
- subscription_status TEXT DEFAULT 'active' (active, canceled, expired)
- subscription_end_date TIMESTAMP
- avatar_url TEXT
- onboarding_completed BOOLEAN DEFAULT false
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()
```

### 2. projects
Product projects managed by users
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- name TEXT NOT NULL
- description TEXT
- owner_id UUID NOT NULL (references profiles.id)
- status TEXT DEFAULT 'active' (active, archived, completed)
- start_date DATE
- target_launch_date DATE
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()
```

### 3. project_members
Team members assigned to projects
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- project_id UUID NOT NULL (references projects.id)
- user_id UUID NOT NULL (references profiles.id)
- role TEXT (owner, admin, member, viewer)
- invited_at TIMESTAMP DEFAULT now()
- joined_at TIMESTAMP
```

### 4. features
Product features for RICE prioritization
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- project_id UUID NOT NULL (references projects.id)
- title TEXT NOT NULL
- description TEXT
- reach_score INTEGER
- impact_score INTEGER (1-3 scale)
- confidence_score INTEGER (percentage)
- effort_score DECIMAL
- rice_score DECIMAL (calculated)
- status TEXT DEFAULT 'backlog' (backlog, planned, in-progress, completed)
- priority_rank INTEGER
- created_by UUID NOT NULL (references profiles.id)
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()
```

### 5. user_stories
AI-generated user stories
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- project_id UUID NOT NULL (references projects.id)
- feature_id UUID (references features.id)
- title TEXT NOT NULL
- description TEXT
- user_role TEXT
- user_goal TEXT
- user_benefit TEXT
- acceptance_criteria JSONB
- story_points INTEGER
- priority TEXT (high, medium, low)
- status TEXT DEFAULT 'draft' (draft, ready, in-progress, completed)
- created_by UUID NOT NULL (references profiles.id)
- ai_generated BOOLEAN DEFAULT false
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()
```

### 6. roadmaps
Product roadmaps with timeline
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- project_id UUID NOT NULL (references projects.id)
- title TEXT NOT NULL
- description TEXT
- view_mode TEXT DEFAULT 'quarterly' (monthly, quarterly, yearly, custom)
- start_date DATE
- end_date DATE
- is_public BOOLEAN DEFAULT false
- created_by UUID NOT NULL (references profiles.id)
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()
```

### 7. roadmap_items
Items on the roadmap timeline
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- roadmap_id UUID NOT NULL (references roadmaps.id)
- feature_id UUID (references features.id)
- title TEXT NOT NULL
- description TEXT
- start_date DATE
- end_date DATE
- status TEXT (planned, in-progress, completed, delayed)
- milestone BOOLEAN DEFAULT false
- dependencies JSONB
- color TEXT
- position_index INTEGER
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()
```

### 8. sprints
Sprint planning and tracking
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- project_id UUID NOT NULL (references projects.id)
- name TEXT NOT NULL
- goal TEXT
- start_date DATE NOT NULL
- end_date DATE NOT NULL
- capacity_hours DECIMAL
- status TEXT DEFAULT 'planning' (planning, active, completed, canceled)
- velocity INTEGER
- created_by UUID NOT NULL (references profiles.id)
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()
```

### 9. sprint_tasks
Tasks within sprints
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- sprint_id UUID NOT NULL (references sprints.id)
- user_story_id UUID (references user_stories.id)
- title TEXT NOT NULL
- description TEXT
- assigned_to UUID (references profiles.id)
- estimated_hours DECIMAL
- actual_hours DECIMAL
- status TEXT DEFAULT 'todo' (todo, in-progress, review, done)
- priority INTEGER
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()
```

### 10. competitors
Competitor tracking for analysis
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- project_id UUID NOT NULL (references projects.id)
- name TEXT NOT NULL
- website TEXT
- description TEXT
- market_position TEXT
- pricing_model TEXT
- target_audience TEXT
- strengths JSONB
- weaknesses JSONB
- features JSONB
- added_by UUID NOT NULL (references profiles.id)
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()
```

### 11. competitive_analysis
Competitive analysis insights
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- project_id UUID NOT NULL (references projects.id)
- competitor_id UUID (references competitors.id)
- analysis_type TEXT (feature_comparison, market_positioning, gap_analysis)
- title TEXT NOT NULL
- insights JSONB
- recommendations JSONB
- ai_generated BOOLEAN DEFAULT false
- created_by UUID NOT NULL (references profiles.id)
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()
```

### 12. okrs
Objectives and Key Results
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- project_id UUID NOT NULL (references projects.id)
- parent_okr_id UUID (references okrs.id for hierarchy)
- type TEXT (company, team, individual)
- objective TEXT NOT NULL
- description TEXT
- time_period TEXT
- start_date DATE
- end_date DATE
- owner_id UUID NOT NULL (references profiles.id)
- status TEXT DEFAULT 'draft' (draft, active, completed, archived)
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()
```

### 13. key_results
Key Results for OKRs
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- okr_id UUID NOT NULL (references okrs.id)
- title TEXT NOT NULL
- description TEXT
- metric_type TEXT (number, percentage, currency)
- target_value DECIMAL NOT NULL
- current_value DECIMAL DEFAULT 0
- unit TEXT
- status TEXT DEFAULT 'on-track' (on-track, at-risk, off-track, completed)
- progress_percentage INTEGER DEFAULT 0
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()
```

### 14. templates
Reusable templates for communications
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- type TEXT NOT NULL (executive_summary, product_update, board_presentation, stakeholder_report)
- title TEXT NOT NULL
- description TEXT
- content JSONB
- is_public BOOLEAN DEFAULT false
- created_by UUID (references profiles.id)
- usage_count INTEGER DEFAULT 0
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()
```

### 15. communications
Generated stakeholder communications
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- project_id UUID NOT NULL (references projects.id)
- template_id UUID (references templates.id)
- type TEXT NOT NULL
- title TEXT NOT NULL
- content TEXT
- recipients JSONB
- sent_at TIMESTAMP
- created_by UUID NOT NULL (references profiles.id)
- ai_generated BOOLEAN DEFAULT false
- created_at TIMESTAMP DEFAULT now()
- updated_at TIMESTAMP DEFAULT now()
```

### 16. activity_logs
Audit trail for all actions
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- user_id UUID NOT NULL (references profiles.id)
- project_id UUID (references projects.id)
- action_type TEXT NOT NULL
- entity_type TEXT
- entity_id UUID
- description TEXT
- metadata JSONB
- ip_address TEXT
- user_agent TEXT
- created_at TIMESTAMP DEFAULT now()
```

### 17. usage_metrics
Track feature usage for billing
```sql
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- user_id UUID NOT NULL (references profiles.id)
- feature_type TEXT NOT NULL
- usage_count INTEGER DEFAULT 1
- period_start DATE NOT NULL
- period_end DATE NOT NULL
- created_at TIMESTAMP DEFAULT now()
```

## Indexes

```sql
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_features_project ON features(project_id);
CREATE INDEX idx_user_stories_project ON user_stories(project_id);
CREATE INDEX idx_roadmaps_project ON roadmaps(project_id);
CREATE INDEX idx_roadmap_items_roadmap ON roadmap_items(roadmap_id);
CREATE INDEX idx_sprints_project ON sprints(project_id);
CREATE INDEX idx_sprint_tasks_sprint ON sprint_tasks(sprint_id);
CREATE INDEX idx_competitors_project ON competitors(project_id);
CREATE INDEX idx_okrs_project ON okrs(project_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_usage_metrics_user ON usage_metrics(user_id);
```

## Row Level Security (RLS) Policies

All tables will have RLS enabled with policies allowing:
- Users can read their own data and projects they're members of
- Users can create/update/delete their own data
- Project owners have full access to project data
- Both 'anon' and 'service_role' roles for edge function compatibility
