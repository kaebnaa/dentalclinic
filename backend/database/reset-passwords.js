import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPasswords() {
  try {
    console.log('🔐 Resetting user passwords...\n');

    // Admin user
    const adminEmail = 'admin@dentalclinic.com';
    const adminPassword = 'Admin@123456';

    console.log(`📝 Resetting password for: ${adminEmail}`);
    
    // Get user by email
    const { data: adminUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    const adminUser = adminUsers.users.find(u => u.email === adminEmail);
    
    if (!adminUser) {
      console.log('❌ Admin user not found in auth.users');
      console.log('Creating admin user...');
      
      // Create admin user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          name: 'System Administrator',
          phone: '+1234567890',
          role: 'admin'
        }
      });

      if (authError) {
        throw new Error(`Failed to create admin: ${authError.message}`);
      }

      // Ensure user record exists
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          name: 'System Administrator',
          email: adminEmail,
          phone: '+1234567890',
          role: 'admin'
        }, { onConflict: 'id' })
        .select()
        .single();

      if (userError) {
        console.error('⚠️ Warning: Failed to update users table:', userError.message);
      } else {
        console.log('✅ Admin user created/updated');
      }
    } else {
      // Update password
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        {
          password: adminPassword,
          email_confirm: true
        }
      );

      if (updateError) {
        throw new Error(`Failed to update admin password: ${updateError.message}`);
      }

      console.log('✅ Admin password reset successfully');
    }

    // Reset doctor passwords
    const doctors = [
      { email: 'sarah.johnson@dentalclinic.com', name: 'Dr. Sarah Johnson' },
      { email: 'michael.chen@dentalclinic.com', name: 'Dr. Michael Chen' },
      { email: 'emily.rodriguez@dentalclinic.com', name: 'Dr. Emily Rodriguez' },
      { email: 'james.wilson@dentalclinic.com', name: 'Dr. James Wilson' }
    ];

    const doctorPassword = 'Doctor@123456';

    for (const doctor of doctors) {
      console.log(`\n📝 Resetting password for: ${doctor.email}`);
      
      const doctorUser = adminUsers.users.find(u => u.email === doctor.email);
      
      if (!doctorUser) {
        console.log(`⚠️ Doctor ${doctor.email} not found in auth.users - skipping`);
        continue;
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        doctorUser.id,
        {
          password: doctorPassword,
          email_confirm: true
        }
      );

      if (updateError) {
        console.error(`❌ Failed to reset password for ${doctor.email}:`, updateError.message);
      } else {
        console.log(`✅ Password reset for ${doctor.email}`);
      }
    }

    console.log('\n✨ Password reset completed!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Admin: ${adminEmail} / ${adminPassword}`);
    console.log(`   Doctors: [email] / ${doctorPassword}`);

    // Test login
    console.log('\n🧪 Testing admin login...');
    const { data: testLogin, error: testError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (testError) {
      console.error('❌ Login test failed:', testError.message);
    } else {
      console.log('✅ Login test successful!');
      console.log('   User ID:', testLogin.user.id);
      console.log('   Email:', testLogin.user.email);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPasswords();

