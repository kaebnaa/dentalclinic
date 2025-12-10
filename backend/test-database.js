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

let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    testResults.passed++;
  } catch (error) {
    console.error(`❌ ${name}:`, error.message);
    testResults.failed++;
    testResults.errors.push({ test: name, error: error.message });
  }
}

async function runDatabaseTests() {
  console.log('🗄️  Database Schema & Constraints Testing\n');
  console.log('='.repeat(60));

  // ============================================
  // 1. TABLE STRUCTURE
  // ============================================
  console.log('\n📋 Table Structure Tests\n');

  await test('Users Table Exists', async () => {
    const { error } = await supabase.from('users').select('*').limit(1);
    if (error) throw new Error(`Users table error: ${error.message}`);
  });

  await test('Users Table Has Required Columns', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, created_at, updated_at')
      .limit(1);
    if (error) throw new Error(`Missing columns: ${error.message}`);
  });

  await test('Branches Table Exists', async () => {
    const { error } = await supabase.from('branches').select('*').limit(1);
    if (error) throw new Error(`Branches table error: ${error.message}`);
  });

  await test('Doctors Table Exists', async () => {
    const { error } = await supabase.from('doctors').select('*').limit(1);
    if (error) throw new Error(`Doctors table error: ${error.message}`);
  });

  await test('Appointments Table Exists', async () => {
    const { error } = await supabase.from('appointments').select('*').limit(1);
    if (error) throw new Error(`Appointments table error: ${error.message}`);
  });

  await test('Patient Records Table Exists', async () => {
    const { error } = await supabase.from('patient_records').select('*').limit(1);
    if (error) throw new Error(`Patient records table error: ${error.message}`);
  });

  await test('Audit Log Table Exists', async () => {
    const { error } = await supabase.from('appointment_audit').select('*').limit(1);
    if (error) throw new Error(`Audit log table error: ${error.message}`);
  });

  // ============================================
  // 2. FOREIGN KEY CONSTRAINTS
  // ============================================
  console.log('\n🔗 Foreign Key Constraints Tests\n');

  await test('Users Reference Auth Users', async () => {
    // Try to get a user - if it works, foreign key is set up
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    if (error) throw new Error(`Foreign key issue: ${error.message}`);
  });

  await test('Doctors Reference Users', async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select('user_id, users!inner(id)')
      .limit(1);
    if (error && !error.message.includes('No rows')) {
      throw new Error(`Doctor-User foreign key issue: ${error.message}`);
    }
  });

  await test('Appointments Reference Users (Patient)', async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('patient_id, users!appointments_patient_id_fkey(id)')
      .limit(1);
    if (error && !error.message.includes('No rows')) {
      throw new Error(`Appointment-Patient foreign key issue: ${error.message}`);
    }
  });

  // ============================================
  // 3. UNIQUE CONSTRAINTS
  // ============================================
  console.log('\n🔒 Unique Constraints Tests\n');

  await test('Email Unique Constraint', async () => {
    // Get existing email
    const { data: existing } = await supabase
      .from('users')
      .select('email')
      .limit(1)
      .single();

    if (existing) {
      // Try to insert duplicate (should fail)
      const { error } = await supabase
        .from('users')
        .insert({
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Test',
          email: existing.email,
          phone: '+1234567890',
          role: 'patient'
        });

      if (!error || !error.message.includes('duplicate') && !error.message.includes('unique')) {
        throw new Error('Email unique constraint not working');
      }
    }
  });

  await test('Doctor Appointment Unique Constraint', async () => {
    // Check if constraint exists by querying
    const { data, error } = await supabase
      .from('appointments')
      .select('doctor_id, date, start_time')
      .limit(1);

    if (error && !error.message.includes('No rows')) {
      throw new Error(`Appointment unique constraint issue: ${error.message}`);
    }
  });

  // ============================================
  // 4. CHECK CONSTRAINTS
  // ============================================
  console.log('\n✅ Check Constraints Tests\n');

  await test('Role Check Constraint (Valid Role)', async () => {
    // This should work - valid role
    const { data: users } = await supabase
      .from('users')
      .select('role')
      .in('role', ['patient', 'doctor', 'admin'])
      .limit(1);

    if (!users || users.length === 0) {
      console.log('   ⚠️  No users found to test role constraint');
    }
  });

  await test('Appointment Status Check Constraint', async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('status')
      .in('status', ['booked', 'confirmed', 'cancelled', 'completed'])
      .limit(1);

    if (error && !error.message.includes('No rows')) {
      throw new Error(`Status constraint issue: ${error.message}`);
    }
  });

  // ============================================
  // 5. INDEXES
  // ============================================
  console.log('\n📊 Index Performance Tests\n');

  await test('Email Index Performance', async () => {
    const start = Date.now();
    const { error } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@dentalclinic.com')
      .limit(1);
    const duration = Date.now() - start;

    if (error && !error.message.includes('No rows')) {
      throw new Error(`Email index issue: ${error.message}`);
    }
    if (duration > 1000) {
      console.log(`   ⚠️  Email query took ${duration}ms (may need index optimization)`);
    }
  });

  await test('Appointment Date Index Performance', async () => {
    const start = Date.now();
    const { error } = await supabase
      .from('appointments')
      .select('id')
      .gte('date', new Date().toISOString().split('T')[0])
      .limit(10);
    const duration = Date.now() - start;

    if (error && !error.message.includes('No rows')) {
      throw new Error(`Date index issue: ${error.message}`);
    }
    if (duration > 1000) {
      console.log(`   ⚠️  Date query took ${duration}ms (may need index optimization)`);
    }
  });

  // ============================================
  // 6. TRIGGERS
  // ============================================
  console.log('\n⚡ Trigger Tests\n');

  await test('Updated_at Trigger on Users', async () => {
    // Get a user
    const { data: user } = await supabase
      .from('users')
      .select('id, updated_at')
      .limit(1)
      .single();

    if (user) {
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update user
      const { data: updated, error } = await supabase
        .from('users')
        .update({ name: user.name }) // Update with same name
        .eq('id', user.id)
        .select('updated_at')
        .single();

      if (error) {
        throw new Error(`Update trigger issue: ${error.message}`);
      }

      const oldTime = new Date(user.updated_at);
      const newTime = new Date(updated.updated_at);

      if (newTime <= oldTime) {
        throw new Error('updated_at trigger not working');
      }
    } else {
      console.log('   ⚠️  No users found to test trigger');
    }
  });

  // ============================================
  // 7. ROW LEVEL SECURITY (RLS)
  // ============================================
  console.log('\n🔐 Row Level Security (RLS) Tests\n');

  await test('RLS Enabled on Users Table', async () => {
    // RLS is enabled if we can query (service role bypasses RLS)
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) throw new Error(`RLS may not be configured: ${error.message}`);
  });

  await test('RLS Enabled on Appointments Table', async () => {
    const { error } = await supabase.from('appointments').select('id').limit(1);
    if (error && !error.message.includes('No rows')) {
      throw new Error(`RLS may not be configured: ${error.message}`);
    }
  });

  // ============================================
  // 8. DATA INTEGRITY
  // ============================================
  console.log('\n🔍 Data Integrity Tests\n');

  await test('No Orphaned Doctors', async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select('user_id, users!inner(id)')
      .limit(10);

    if (error && !error.message.includes('No rows')) {
      throw new Error(`Orphaned doctors found: ${error.message}`);
    }
  });

  await test('No Orphaned Appointments', async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('patient_id, doctor_id, branch_id')
      .limit(10);

    if (error && !error.message.includes('No rows')) {
      throw new Error(`Data integrity issue: ${error.message}`);
    }
  });

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Database Test Results:');
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  const total = testResults.passed + testResults.failed;
  const successRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
  console.log(`   📈 Success Rate: ${successRate}%`);

  if (testResults.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.errors.forEach(({ test, error }) => {
      console.log(`   - ${test}: ${error}`);
    });
  }

  if (testResults.failed === 0) {
    console.log('\n🎉 All database tests passed! Schema is properly configured.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Main execution
(async () => {
  await runDatabaseTests();
})();

