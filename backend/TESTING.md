# Backend & Database Testing Guide

## 📋 Overview

This project includes comprehensive test suites for backend API endpoints and database operations.

## 🧪 Test Suites

### 1. Basic API Tests (`test-api.js`)
Quick smoke tests for core functionality:
- Server health check
- Database connection
- Basic authentication
- Core endpoints

**Run:** `npm test`

### 2. Comprehensive Backend Tests (`test-comprehensive.js`)
Full test coverage including:
- Two-step registration flow
- Profile updates
- CRUD operations
- Input validation
- Error handling
- Rate limiting
- Database constraints

**Run:** `npm run test:comprehensive`

### 3. Database Tests (`test-database.js`)
Database schema and integrity tests:
- Table structure
- Foreign key constraints
- Unique constraints
- Check constraints
- Indexes
- Triggers
- Row Level Security (RLS)
- Data integrity

**Run:** `npm run test:database`

### 4. Run All Tests
Run all test suites sequentially:

**Run:** `npm run test:all`

## 🚀 Quick Start

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **In another terminal, run tests:**
   ```bash
   cd backend
   npm test                    # Basic tests
   npm run test:comprehensive   # Full backend tests
   npm run test:database        # Database tests
   npm run test:all             # All tests
   ```

## 📊 Test Coverage

### Authentication & Authorization
- ✅ Admin login
- ✅ Doctor login
- ✅ Patient registration (two-step)
- ✅ Invalid credentials rejection
- ✅ Authentication middleware
- ✅ Role-based access control

### Two-Step Registration
- ✅ Step 1: Basic registration (name, email, phone, password)
- ✅ Step 2: Profile update (address, date of birth, gender, emergency contact)
- ✅ Password strength validation
- ✅ Email format validation

### Database Operations
- ✅ Create, Read, Update, Delete (CRUD)
- ✅ Foreign key constraints
- ✅ Unique constraints
- ✅ Check constraints
- ✅ Indexes performance
- ✅ Triggers (updated_at)
- ✅ RLS policies

### API Endpoints
- ✅ Branches (public & admin)
- ✅ Doctors
- ✅ Appointments
- ✅ Patient records
- ✅ Admin endpoints
- ✅ Audit logs

### Validation & Error Handling
- ✅ Input validation (Zod)
- ✅ Email format
- ✅ Phone format
- ✅ Password strength
- ✅ Required fields
- ✅ 404 errors
- ✅ 400 errors
- ✅ 401 errors

### Business Logic
- ✅ Double booking prevention
- ✅ Working hours constraint
- ✅ Appointment status updates
- ✅ Audit logging

## 🔧 Prerequisites

1. **Environment Variables:**
   Make sure `.env` file has:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PORT=3001
   ```

2. **Database Setup:**
   - Run schema: `backend/database/schema.sql`
   - Run RLS policies: `backend/database/rls_policies.sql`
   - Seed data: `npm run seed`

3. **Server Running:**
   - Backend server must be running on `http://localhost:3001`

## 📝 Test Credentials

Tests use these seeded accounts:
- **Admin:** `admin@dentalclinic.com` / `Admin@123456`
- **Doctor:** `doctor1@dentalclinic.com` / `Doctor@123456`

## 🐛 Troubleshooting

### Tests Fail with "Server is not running"
- Make sure backend server is running: `npm run dev`
- Check if server is on correct port (default: 3001)

### Tests Fail with "Database connection failed"
- Check Supabase credentials in `.env`
- Verify database schema is applied
- Check Supabase project is active

### Tests Fail with "Authentication failed"
- Run seed script: `npm run seed`
- Run password reset: `npm run reset-passwords`
- Verify credentials match seed data

### RLS Policy Errors
- Run `backend/database/fix-rls.sql` to fix RLS policies
- Make sure `is_admin()` function exists

## 📈 Expected Results

All tests should pass with:
- ✅ **100% pass rate** for basic functionality
- ✅ **95%+ pass rate** for comprehensive tests (some may be environment-dependent)
- ✅ **No critical failures**

## 🔍 Understanding Test Output

```
✅ Test Name                    # Passed
❌ Test Name: Error message     # Failed
⚠️  Warning message            # Warning (non-critical)
```

## 📚 Additional Resources

- **Schema:** `backend/database/schema.sql`
- **RLS Policies:** `backend/database/rls_policies.sql`
- **Seed Data:** `backend/database/seed.js`
- **API Documentation:** `backend/README.md`

## 🎯 Continuous Testing

For development, run tests after:
- Database schema changes
- API endpoint changes
- Authentication/authorization changes
- Validation rule changes
- Before deploying to production

---

**Happy Testing! 🧪**

