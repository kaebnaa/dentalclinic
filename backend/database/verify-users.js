import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyUsers() {
  console.log('🔍 Verifying users in database...\n');

  // Check admin user
  const { data: admin, error: adminError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin@dentalclinic.com')
    .single();

  if (adminError || !admin) {
    console.log('❌ Admin user not found');
    console.log('   Run: npm run seed');
  } else {
    console.log('✅ Admin user found:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
  }

  // Check doctor users
  const { data: doctors, error: doctorsError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'doctor')
    .limit(5);

  if (doctorsError || !doctors || doctors.length === 0) {
    console.log('\n❌ No doctor users found');
    console.log('   Run: npm run seed');
  } else {
    console.log(`\n✅ Found ${doctors.length} doctor user(s):`);
    doctors.forEach((doctor, index) => {
      console.log(`   ${index + 1}. ${doctor.email} (${doctor.name})`);
    });
  }

  // Test login for admin
  console.log('\n🔐 Testing admin login...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin@dentalclinic.com',
    password: 'Admin@123456'
  });

  if (loginError) {
    console.log('❌ Admin login failed:', loginError.message);
    console.log('   Run: npm run reset-passwords');
  } else {
    console.log('✅ Admin login successful');
    console.log(`   Token: ${loginData.session.access_token.substring(0, 20)}...`);
  }

  console.log('\n📋 Summary:');
  console.log('   If users are missing, run: npm run seed');
  console.log('   If login fails, run: npm run reset-passwords');
}

verifyUsers().catch(console.error);

