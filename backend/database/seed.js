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

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // 1. Create admin user
    console.log('📝 Creating admin user...');
    const adminEmail = 'admin@dentalclinic.com';
    const adminPassword = 'Admin@123456';
    const adminName = 'System Administrator';
    const adminPhone = '+1234567890';

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .single();

    let adminUserId;
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      adminUserId = existingAdmin.id;
    } else {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          name: adminName,
          phone: adminPhone,
          role: 'admin'
        }
      });

      if (authError) {
        throw new Error(`Failed to create admin auth user: ${authError.message}`);
      }

      adminUserId = authData.user.id;

      // Create user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: adminUserId,
          name: adminName,
          email: adminEmail,
          phone: adminPhone,
          role: 'admin'
        })
        .select()
        .single();

      if (userError) {
        throw new Error(`Failed to create admin user record: ${userError.message}`);
      }

      console.log('✅ Admin user created:', userData.email);
    }

    // 2. Create branches
    console.log('🏢 Creating branches...');
    const branches = [
      {
        name: 'Downtown Branch',
        address: '123 Main Street, Downtown, City 12345',
        latitude: 40.7128,
        longitude: -74.0060
      },
      {
        name: 'Uptown Branch',
        address: '456 Park Avenue, Uptown, City 12345',
        latitude: 40.7589,
        longitude: -73.9851
      },
      {
        name: 'Westside Branch',
        address: '789 Broadway, Westside, City 12345',
        latitude: 40.7505,
        longitude: -73.9934
      },
      {
        name: 'Eastside Branch',
        address: '321 First Avenue, Eastside, City 12345',
        latitude: 40.7282,
        longitude: -73.9942
      }
    ];

    const branchIds = [];
    for (const branch of branches) {
      const { data: existingBranch } = await supabase
        .from('branches')
        .select('id')
        .eq('name', branch.name)
        .single();

      if (existingBranch) {
        console.log(`✅ Branch "${branch.name}" already exists`);
        branchIds.push(existingBranch.id);
      } else {
        const { data, error } = await supabase
          .from('branches')
          .insert(branch)
          .select()
          .single();

        if (error) {
          console.error(`❌ Failed to create branch "${branch.name}":`, error.message);
          continue;
        }

        console.log(`✅ Branch created: ${data.name}`);
        branchIds.push(data.id);
      }
    }

    // 3. Create sample doctors
    console.log('👨‍⚕️ Creating sample doctors...');
    const doctors = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@dentalclinic.com',
        phone: '+1234567891',
        password: 'Doctor@123456',
        specialization: 'Orthodontics',
        branch_ids: [branchIds[0], branchIds[1]]
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@dentalclinic.com',
        phone: '+1234567892',
        password: 'Doctor@123456',
        specialization: 'Oral Surgery',
        branch_ids: [branchIds[0], branchIds[2]]
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@dentalclinic.com',
        phone: '+1234567893',
        password: 'Doctor@123456',
        specialization: 'Periodontics',
        branch_ids: [branchIds[1], branchIds[3]]
      },
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@dentalclinic.com',
        phone: '+1234567894',
        password: 'Doctor@123456',
        specialization: 'General Dentistry',
        branch_ids: [branchIds[2], branchIds[3]]
      }
    ];

    const doctorIds = [];
    for (const doctor of doctors) {
      const { data: existingDoctor } = await supabase
        .from('users')
        .select('id')
        .eq('email', doctor.email)
        .single();

      if (existingDoctor) {
        console.log(`✅ Doctor "${doctor.name}" already exists`);
        // Get doctor record
        const { data: doctorRecord } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', existingDoctor.id)
          .single();
        if (doctorRecord) {
          doctorIds.push(doctorRecord.id);
        }
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: doctor.email,
        password: doctor.password,
        email_confirm: true,
        user_metadata: {
          name: doctor.name,
          phone: doctor.phone,
          role: 'doctor'
        }
      });

      if (authError) {
        console.error(`❌ Failed to create doctor auth user "${doctor.name}":`, authError.message);
        continue;
      }

      // Create user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: doctor.name,
          email: doctor.email,
          phone: doctor.phone,
          role: 'doctor'
        })
        .select()
        .single();

      if (userError) {
        console.error(`❌ Failed to create doctor user record "${doctor.name}":`, userError.message);
        await supabase.auth.admin.deleteUser(authData.user.id);
        continue;
      }

      // Create doctor record
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .insert({
          user_id: authData.user.id,
          specialization: doctor.specialization
        })
        .select()
        .single();

      if (doctorError) {
        console.error(`❌ Failed to create doctor record "${doctor.name}":`, doctorError.message);
        await supabase.auth.admin.deleteUser(authData.user.id);
        await supabase.from('users').delete().eq('id', authData.user.id);
        continue;
      }

      // Assign branches
      if (doctor.branch_ids && doctor.branch_ids.length > 0) {
        const branchAssignments = doctor.branch_ids.map(branch_id => ({
          doctor_id: doctorData.id,
          branch_id
        }));

        const { error: branchError } = await supabase
          .from('doctor_branches')
          .insert(branchAssignments);

        if (branchError) {
          console.error(`⚠️ Failed to assign branches for "${doctor.name}":`, branchError.message);
        }
      }

      console.log(`✅ Doctor created: ${doctor.name} (${doctor.specialization})`);
      doctorIds.push(doctorData.id);
    }

    console.log('\n✨ Seed completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Admin: ${adminEmail} / ${adminPassword}`);
    console.log(`   - Branches: ${branchIds.length} created`);
    console.log(`   - Doctors: ${doctorIds.length} created`);
    console.log('\n💡 You can now login with the admin credentials to manage the system.');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

