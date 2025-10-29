# Quick Deployment Checklist

## ✅ Pre-Deployment
- [ ] Supabase CLI installed: `npm install -g @supabase/cli`
- [ ] Supabase CLI logged in: `supabase login`
- [ ] Project linked: `supabase link --project-ref tdvhmmrvxlwaocfcvdls`
- [ ] OpenAI API key ready

## ✅ Environment Setup
- [ ] Set OpenAI API key: `supabase secrets set OPENAI_API_KEY=your_key_here`

## ✅ Deploy Functions (in order)
- [ ] Batch 1:
  - [ ] `supabase functions deploy ai-user-story-generator`
  - [ ] `supabase functions deploy rice-calculator`
  - [ ] `supabase functions deploy ai-competitive-analysis`

- [ ] Batch 2:
  - [ ] `supabase functions deploy ai-roadmap-optimizer`
  - [ ] `supabase functions deploy sprint-planner`
  - [ ] `supabase functions deploy ai-okr-alignment`

- [ ] Batch 3:
  - [ ] `supabase functions deploy ai-communication-generator`

## ✅ Testing
- [ ] Check deployment: `supabase functions list`
- [ ] Test user story generator (see test script)
- [ ] Test RICE calculator
- [ ] Check function logs if needed

## ✅ Verification
- [ ] All 7 functions appear in `supabase functions list`
- [ ] User story generation working
- [ ] RICE calculations working
- [ ] No errors in function logs

## 🎯 Success Criteria
- All 7 AI Edge Functions deployed successfully
- AI features working in the web application
- User stories generate correctly
- RICE calculations display properly
- No authentication or timeout errors