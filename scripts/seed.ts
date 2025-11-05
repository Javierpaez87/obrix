import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Seeding database...');

  const users = [
    { email: 'owner@obrix.com', password: 'owner123', name: 'Carlos Owner', role: 'owner' },
    { email: 'admin@obrix.com', password: 'admin123', name: 'Ana Admin', role: 'admin' },
    { email: 'constructor@obrix.com', password: 'constructor123', name: 'Miguel Constructor', role: 'constructor' },
    { email: 'client@obrix.com', password: 'client123', name: 'Laura Client', role: 'client' },
  ];

  console.log('Creating users...');
  for (const user of users) {
    const { error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });
    if (!error) {
      console.log(`✓ Created: ${user.name}`);
    }
  }

  console.log('\n✅ Seed complete!');
  console.log('\nDemo accounts:');
  console.log('Owner: owner@obrix.com / owner123');
  console.log('Admin: admin@obrix.com / admin123');
}

seed().catch(console.error);
