import { createClient } from '@supabase/supabase-js'

// Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tdvhmmrvxlwaocfcvdls.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdmhtbXJ2eGx3YW9jZmN2ZGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTMzMDgsImV4cCI6MjA3MTc2OTMwOH0.oI4XEtlLxAp0XFpLvWRhFm9PpjFN4F4SUxSKb1_727c'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  company_name?: string
  role?: string
  subscription_tier: 'free' | 'pro' | 'enterprise'
  subscription_status: 'active' | 'canceled' | 'expired'
  subscription_end_date?: string
  avatar_url?: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  owner_id: string
  status: 'active' | 'archived' | 'completed'
  start_date?: string
  target_launch_date?: string
  created_at: string
  updated_at: string
}

export interface Feature {
  id: string
  project_id: string
  title: string
  description?: string
  reach_score?: number
  impact_score?: number
  confidence_score?: number
  effort_score?: number
  rice_score?: number
  status: 'backlog' | 'planned' | 'in-progress' | 'completed'
  priority_rank?: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface UserStory {
  id: string
  project_id: string
  feature_id?: string
  title: string
  description?: string
  user_role?: string
  user_goal?: string
  user_benefit?: string
  acceptance_criteria?: any
  story_points?: number
  priority?: 'high' | 'medium' | 'low'
  status: 'draft' | 'ready' | 'in-progress' | 'completed'
  created_by: string
  ai_generated: boolean
  created_at: string
  updated_at: string
}

export interface Roadmap {
  id: string
  project_id: string
  title: string
  description?: string
  view_mode: 'monthly' | 'quarterly' | 'yearly' | 'custom'
  start_date?: string
  end_date?: string
  is_public: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface Sprint {
  id: string
  project_id: string
  name: string
  goal?: string
  start_date: string
  end_date: string
  capacity_hours?: number
  status: 'planning' | 'active' | 'completed' | 'canceled'
  velocity?: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface Competitor {
  id: string
  project_id: string
  name: string
  website?: string
  description?: string
  market_position?: string
  pricing_model?: string
  target_audience?: string
  strengths?: any
  weaknesses?: any
  features?: any
  added_by: string
  created_at: string
  updated_at: string
}

export interface OKR {
  id: string
  project_id: string
  parent_okr_id?: string
  type: 'company' | 'team' | 'individual'
  objective: string
  description?: string
  time_period?: string
  start_date?: string
  end_date?: string
  owner_id: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}
