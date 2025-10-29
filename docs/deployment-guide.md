# Deployment Guide - ProductAI Pro

## Prerequisites Checklist

Before deploying, ensure you have:

- [ ] Supabase project created
- [ ] Supabase credentials (URL and anon key)
- [ ] OpenAI API key
- [ ] All environment variables configured

## Step 1: Database Setup

### 1.1 Create Tables

Execute the table creation in batches using Supabase Dashboard SQL Editor or via the API:

**Batch 1**: Core tables
```sql
-- profiles, projects, project_members, features, user_stories
```

**Batch 2**: Roadmap tables
```sql
-- roadmaps, roadmap_items, sprints, sprint_tasks, competitors
```

**Batch 3**: Analysis tables
```sql
-- competitive_analysis, okrs, key_results, templates, communications
```

**Batch 4**: Logging tables
```sql
-- activity_logs, usage_metrics
```

### 1.2 Apply RLS Policies

Execute all RLS policies from `/docs/rls-policies.sql`

**Critical**: Policies must allow both `anon` and `service_role` for edge functions to work correctly.

### 1.3 Create Indexes

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

## Step 2: Edge Functions Deployment

### 2.1 Configure Secrets

In Supabase Dashboard > Edge Functions > Secrets, add:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### 2.2 Deploy Functions

Deploy all 7 edge functions using the batch deployment tool or Supabase CLI:

```bash
# Using Supabase CLI
supabase functions deploy ai-user-story-generator
supabase functions deploy rice-calculator
supabase functions deploy ai-roadmap-optimizer
supabase functions deploy ai-competitive-analysis
supabase functions deploy ai-okr-alignment
supabase functions deploy ai-communication-generator
supabase functions deploy sprint-planner
```

### 2.3 Test Functions

Test each function after deployment:

```javascript
// Test in browser console or use test tool
const { data, error } = await supabase.functions.invoke('rice-calculator', {
  body: {
    features: [
      {
        id: 'test-1',
        reach: 1000,
        impact: 3,
        confidence: 80,
        effort: 2
      }
    ]
  }
})
console.log(data, error)
```

## Step 3: Frontend Configuration

### 3.1 Environment Variables

Create `.env` file in `/productai-pro/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3.2 Build Frontend

```bash
cd productai-pro
pnpm install
pnpm build
```

This creates a `dist/` folder with optimized production build.

### 3.3 Deploy Frontend

Deploy the `dist/` folder to your hosting provider:

**Option 1: Vercel**
```bash
vercel deploy --prod
```

**Option 2: Netlify**
```bash
netlify deploy --prod --dir=dist
```

**Option 3: Use deployment tool**
The platform has a built-in deployment tool that can be used.

## Step 4: Post-Deployment Testing

### 4.1 Authentication Test

1. Visit deployed URL
2. Click "Sign up"
3. Create a test account
4. Verify email (if enabled)
5. Login with credentials
6. Check that dashboard loads

### 4.2 Feature Tests

Test each core feature:

**RICE Framework**
1. Go to Projects → Create a project
2. Go to RICE Framework
3. Select the project
4. Add a feature with RICE scores
5. Click "Calculate RICE Scores"
6. Verify scores are calculated
7. Check visualization chart

**User Stories**
1. Go to User Stories
2. Select a project
3. Enter a requirement
4. Click "Generate User Story"
5. Verify AI-generated story appears
6. Check acceptance criteria

**Database Connectivity**
1. Verify projects are saved
2. Check features persist
3. Confirm user profile loads
4. Test data filtering by project

### 4.3 Edge Function Tests

For each edge function:
1. Trigger from UI
2. Check browser console for errors
3. Verify response data format
4. Confirm data is saved to database

### 4.4 Error Handling Test

Test error scenarios:
- Invalid RICE scores
- Empty project selection
- Network interruption
- Invalid API responses

## Step 5: Monitoring Setup

### 5.1 Supabase Monitoring

Enable in Supabase Dashboard:
- Database connection monitoring
- Edge function logs
- Auth activity logs
- API usage tracking

### 5.2 Error Logging

Check logs regularly:

```bash
# Supabase logs
supabase functions logs ai-user-story-generator
supabase functions logs rice-calculator
```

### 5.3 Performance Metrics

Monitor:
- Database query performance
- Edge function execution time
- Frontend page load times
- API response times

## Step 6: Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] API keys stored in environment variables (not hardcoded)
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Authentication working
- [ ] User data isolated correctly
- [ ] Edge function secrets configured
- [ ] No sensitive data in frontend code

## Troubleshooting

### Issue: "new row violates row-level security policy"

**Solution**: Check RLS policies allow both `anon` and `service_role`:

```sql
CREATE POLICY "Allow both roles" ON table_name
  FOR ALL USING (auth.role() IN ('anon', 'service_role'));
```

### Issue: Edge function returns 500 error

**Solution**: 
1. Check Supabase function logs
2. Verify OpenAI API key is configured
3. Test with simplified request
4. Check RLS policies

### Issue: Frontend can't connect to Supabase

**Solution**:
1. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
2. Check CORS configuration
3. Rebuild frontend after env changes
4. Clear browser cache

### Issue: AI features not working

**Solution**:
1. Verify OpenAI API key in edge function secrets
2. Check OpenAI API quota/billing
3. Test API key directly with curl
4. Review edge function logs

## Rollback Plan

If deployment fails:

1. **Database**: Restore from Supabase automatic backup
2. **Edge Functions**: Redeploy previous version
3. **Frontend**: Revert to previous deployment

## Success Criteria

Deployment is successful when:

- [ ] Users can sign up and log in
- [ ] Dashboard loads with correct data
- [ ] All 7 feature pages accessible
- [ ] RICE calculations work correctly
- [ ] AI user story generation works
- [ ] Data persists across sessions
- [ ] No console errors
- [ ] Mobile responsive
- [ ] All edge functions responding
- [ ] RLS protecting data correctly

## Next Steps After Deployment

1. Create documentation for end users
2. Set up customer support system
3. Implement usage analytics
4. Configure billing system (Stripe)
5. Plan marketing campaign
6. Monitor performance and errors
7. Collect user feedback
8. Plan feature iterations

---

**Deployment Status**: Awaiting Supabase credentials and OpenAI API key

**Estimated Deployment Time**: 30-45 minutes after credentials provided

**Support**: For deployment issues, contact support team
