// Bootstrap Database - Creates all tables for ProductAI Pro
// This is a temporary function to initialize the database schema

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Execute table creation SQL
    const queries = [
      // Profiles table
      `CREATE TABLE IF NOT EXISTS profiles (
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
      );`,
      
      // Projects table
      `CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT,
        owner_id UUID NOT NULL,
        status TEXT DEFAULT 'active',
        start_date DATE,
        target_launch_date DATE,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );`,
      
      // Project members table
      `CREATE TABLE IF NOT EXISTS project_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL,
        user_id UUID NOT NULL,
        role TEXT,
        invited_at TIMESTAMP DEFAULT now(),
        joined_at TIMESTAMP
      );`,
      
      // Features table
      `CREATE TABLE IF NOT EXISTS features (
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
      );`,
      
      // User stories table
      `CREATE TABLE IF NOT EXISTS user_stories (
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
      );`,
      
      // Roadmaps table
      `CREATE TABLE IF NOT EXISTS roadmaps (
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
      );`,
      
      // Roadmap items table
      `CREATE TABLE IF NOT EXISTS roadmap_items (
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
      );`,
      
      // Sprints table
      `CREATE TABLE IF NOT EXISTS sprints (
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
      );`,
      
      // Sprint tasks table
      `CREATE TABLE IF NOT EXISTS sprint_tasks (
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
      );`,
      
      // Competitors table
      `CREATE TABLE IF NOT EXISTS competitors (
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
      );`,
      
      // Competitive analysis table
      `CREATE TABLE IF NOT EXISTS competitive_analysis (
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
      );`,
      
      // OKRs table
      `CREATE TABLE IF NOT EXISTS okrs (
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
      );`,
      
      // Key results table
      `CREATE TABLE IF NOT EXISTS key_results (
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
      );`,
      
      // Templates table
      `CREATE TABLE IF NOT EXISTS templates (
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
      );`,
      
      // Communications table
      `CREATE TABLE IF NOT EXISTS communications (
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
      );`,
      
      // Activity logs table
      `CREATE TABLE IF NOT EXISTS activity_logs (
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
      );`,
      
      // Usage metrics table
      `CREATE TABLE IF NOT EXISTS usage_metrics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        feature_type TEXT NOT NULL,
        usage_count INTEGER DEFAULT 1,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        created_at TIMESTAMP DEFAULT now()
      );`
    ];

    const results = [];
    for (const query of queries) {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ query })
      });
      
      const result = await response.text();
      results.push({ query: query.substring(0, 50), status: response.status, result });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Database bootstrap completed',
        results 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'BOOTSTRAP_ERROR',
          message: error.message
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
