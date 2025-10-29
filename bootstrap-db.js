// Bootstrap database using Supabase Admin API
const SUPABASE_URL = 'https://tdvhmmrvxlwaocfcvdls.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdmhtbXJ2eGx3YW9jZmN2ZGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTMzMDgsImV4cCI6MjA3MTc2OTMwOH0.oI4XEtlLxAp0XFpLvWRhFm9PpjFN4F4SUxSKb1_727c';

async function executeSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ sql })
  });
  
  const text = await response.text();
  console.log(`Status: ${response.status}, Response: ${text.substring(0, 200)}`);
  return { status: response.status, body: text };
}

async function bootstrap() {
  console.log('Starting database bootstrap...');
  
  const tables = [
    {
      name: 'profiles',
      sql: `CREATE TABLE IF NOT EXISTS profiles (
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
      );`
    },
    {
      name: 'projects',
      sql: `CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT,
        owner_id UUID NOT NULL,
        status TEXT DEFAULT 'active',
        start_date DATE,
        target_launch_date DATE,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );`
    }
  ];
  
  for (const table of tables) {
    console.log(`\nCreating table: ${table.name}`);
    try {
      await executeSQL(table.sql);
    } catch (error) {
      console.error(`Error creating ${table.name}:`, error.message);
    }
  }
  
  console.log('\n Bootstrap complete!');
}

bootstrap().catch(console.error);
