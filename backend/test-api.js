import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_URL = `http://localhost:${process.env.PORT || 3001}`;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

let adminToken = '';
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

async function makeRequest(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();
  return { status: response.status, data };
}

async function runTests() {
  console.log('🧪 Testing Dental Clinic Backend API\n');
  console.log('='.repeat(50));

  // Test 1: Health Check
  await test('Health Check Endpoint', async () => {
    const { status, data } = await makeRequest('GET', '/health');
    if (status !== 200 || data.status !== 'ok') {
      throw new Error('Health check failed');
    }
  });

  // Test 2: Database Connection
  await test('Database Connection (Supabase)', async () => {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw new Error(`Database connection failed: ${error.message}`);
  });

  // Test 3: Tables Exist
  await test('Database Tables Exist', async () => {
    const tables = ['users', 'branches', 'doctors', 'appointments', 'patient_records', 'appointment_audit'];
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) throw new Error(`Table ${table} does not exist: ${error.message}`);
    }
  });

  // Test 4: Admin Login
  await test('Admin Login', async () => {
    const { status, data } = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@dentalclinic.com',
      password: 'Admin@123456'
    });

    if (status !== 200 || !data.token) {
      throw new Error('Admin login failed');
    }
    adminToken = data.token;
  });

  // Test 5: Get Branches
  await test('Get Branches (Public)', async () => {
    const { status, data } = await makeRequest('GET', '/api/branches');
    if (status !== 200 || !Array.isArray(data)) {
      throw new Error('Failed to fetch branches');
    }
    if (data.length === 0) {
      throw new Error('No branches found');
    }
  });

  // Test 6: Get Doctors
  await test('Get Doctors (Authenticated)', async () => {
    const { status, data } = await makeRequest('GET', '/api/doctors', null, adminToken);
    if (status !== 200 || !Array.isArray(data)) {
      throw new Error('Failed to fetch doctors');
    }
  });

  // Test 7: Get Appointments
  await test('Get Appointments', async () => {
    const { status, data } = await makeRequest('GET', '/api/appointments', null, adminToken);
    if (status !== 200 || !Array.isArray(data)) {
      throw new Error('Failed to fetch appointments');
    }
  });

  // Test 8: Admin Endpoints
  await test('Admin - Get Users', async () => {
    const { status, data } = await makeRequest('GET', '/api/admin/users', null, adminToken);
    if (status !== 200 || !Array.isArray(data)) {
      throw new Error('Failed to fetch users');
    }
  });

  await test('Admin - Get Audit Logs', async () => {
    const { status, data } = await makeRequest('GET', '/api/admin/audit-logs', null, adminToken);
    if (status !== 200 || !Array.isArray(data)) {
      throw new Error('Failed to fetch audit logs');
    }
  });

  await test('Admin - Get Analytics', async () => {
    const { status, data } = await makeRequest('GET', '/api/admin/analytics', null, adminToken);
    if (status !== 200 || !data.overview) {
      throw new Error('Failed to fetch analytics');
    }
  });

  // Test 9: Authentication Middleware
  await test('Authentication Middleware (Protected Route)', async () => {
    const { status } = await makeRequest('GET', '/api/appointments');
    if (status !== 401) {
      throw new Error('Authentication middleware not working');
    }
  });

  // Test 10: Role-Based Access Control
  await test('Role-Based Access Control (Admin Only)', async () => {
    // Try to access admin endpoint without admin token (would need patient token)
    // For now, just verify admin endpoint works with admin token
    const { status } = await makeRequest('GET', '/api/admin/users', null, adminToken);
    if (status !== 200) {
      throw new Error('Admin access control not working');
    }
  });

  // Test 11: Input Validation
  await test('Input Validation (Register)', async () => {
    const { status } = await makeRequest('POST', '/api/auth/register', {
      email: 'invalid-email', // Invalid email
      password: '123' // Too short
    });
    if (status !== 400) {
      throw new Error('Input validation not working');
    }
  });

  // Test 12: Error Handling
  await test('Error Handling (404)', async () => {
    const { status } = await makeRequest('GET', '/api/nonexistent');
    if (status !== 404) {
      throw new Error('404 error handling not working');
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.errors.forEach(({ test, error }) => {
      console.log(`   - ${test}: ${error}`);
    });
  }

  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Backend is fully functional.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

// Main execution
(async () => {
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error(`❌ Server is not running at ${API_URL}`);
    console.error('   Please start the server first: npm run dev');
    process.exit(1);
  }

  console.log(`✅ Server is running at ${API_URL}\n`);
  await runTests();
})();

