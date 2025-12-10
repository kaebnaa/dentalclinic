# Dental Clinic Backend API

Production-ready REST API for a Dental Clinic Appointment & Patient Management System built with Node.js, Express.js, and Supabase.

## 🏗️ Architecture

- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **Security**: Row Level Security (RLS), Helmet, Rate Limiting

## 📋 Features

- ✅ Multi-branch scheduling system
- ✅ Role-based access control (Patient, Doctor, Admin)
- ✅ Appointment management with double-booking prevention
- ✅ Medical records management
- ✅ Full audit logging
- ✅ Analytics and reporting
- ✅ Map-based branch selection
- ✅ Working hours validation (10:00 - 19:00)

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd backend
   vercel
   ```

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project settings → Environment Variables
   - Add all variables from `.env`:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `CORS_ORIGIN` (your frontend URL)
     - `NODE_ENV=production`

5. **Redeploy** after adding environment variables:
   ```bash
   vercel --prod
   ```

**Note:** The API will be available at `https://your-project.vercel.app/api`

### Alternative: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Import project in Vercel Dashboard
3. Set root directory to `backend`
4. Add environment variables
5. Deploy

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- npm or pnpm package manager

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and API keys

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 4. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the schema file: `database/schema.sql` (includes the `is_admin()` helper function)
4. Run the RLS policies file: `database/rls_policies.sql`

**Note:** If you encounter "infinite recursion detected in policy" errors, run `database/fix-rls.sql` to update the policies with the helper function.

### 5. Seed Initial Data

```bash
npm run seed
```

This will create:
- Admin user: `admin@dentalclinic.com` / `Admin@123456`
- 4 sample branches
- 4 sample doctors

**If you encounter login issues**, you can reset passwords:
```bash
node database/reset-passwords.js
```

This will reset all user passwords and verify login works.

### 6. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3001`

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Branches

- `GET /api/branches` - Get all branches (public)
- `GET /api/branches/:id` - Get branch by ID (public)
- `POST /api/branches` - Create branch (admin only)
- `PATCH /api/branches/:id` - Update branch (admin only)
- `DELETE /api/branches/:id` - Delete branch (admin only)

### Doctors

- `GET /api/doctors` - Get all doctors (authenticated)
- `GET /api/doctors?branchId=:id` - Get doctors by branch
- `GET /api/doctors/:id` - Get doctor by ID (authenticated)
- `POST /api/doctors` - Create doctor (admin only)
- `PATCH /api/doctors/:id` - Update doctor (admin only)
- `DELETE /api/doctors/:id` - Delete doctor (admin only)

### Appointments

- `GET /api/appointments` - Get appointments (filtered by role)
- `POST /api/appointments` - Create appointment (patient)
- `PATCH /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

**Query Parameters:**
- `patient_id` - Filter by patient (admin/doctor only)
- `doctor_id` - Filter by doctor
- `branch_id` - Filter by branch
- `status` - Filter by status (booked, confirmed, cancelled, completed)
- `date_from` - Filter from date (YYYY-MM-DD)
- `date_to` - Filter to date (YYYY-MM-DD)

### Medical Records

- `GET /api/records/:patientId` - Get patient records
- `POST /api/records` - Create record (doctor/admin)
- `DELETE /api/records/:id` - Delete record (doctor/admin)

### Admin

- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/audit-logs` - Get audit logs (admin only)
- `GET /api/admin/analytics` - Get analytics data (admin only)

**Analytics Query Parameters:**
- `branch_id` - Filter by branch
- `doctor_id` - Filter by doctor
- `date_from` - Start date
- `date_to` - End date

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Roles

- **patient**: Can book appointments, view own records
- **doctor**: Can view/manage appointments, create records
- **admin**: Full access to all resources

## 📝 Request/Response Examples

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123",
  "role": "patient"
}
```

### Create Appointment

```bash
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctor_id": "uuid",
  "branch_id": "uuid",
  "date": "2024-12-25",
  "start_time": "14:00",
  "notes": "Regular checkup"
}
```

### Create Medical Record

```bash
POST /api/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "patient_id": "uuid",
  "appointment_id": "uuid",
  "notes": "Patient examination completed. No issues found.",
  "attachments": ["https://storage.supabase.co/..."]
}
```

## 🛡️ Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Validation**: Token verification on every request
- **Rate Limiting**: Prevents abuse (100 req/15min general, 5 req/15min auth)
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Parameterized queries via Supabase
- **CORS**: Configurable cross-origin resource sharing

## 📊 Database Schema

### Tables

- `users` - User accounts and profiles
- `branches` - Clinic branch locations
- `doctors` - Doctor profiles and specializations
- `doctor_branches` - Many-to-many doctor-branch assignments
- `appointments` - Appointment bookings
- `patient_records` - Medical records
- `appointment_audit` - Audit trail for all changes

### Constraints

- Unique constraint on `(doctor_id, date, start_time)` prevents double booking
- Working hours validation: 10:00 - 19:00
- Status validation: booked, confirmed, cancelled, completed

## 🔍 Audit Logging

All CREATE, UPDATE, and DELETE operations are automatically logged with:
- Actor ID (who performed the action)
- Action type (CREATE/UPDATE/DELETE)
- Entity name (table)
- Old data (for updates/deletes)
- New data (for creates/updates)
- Timestamp

## 🧪 Testing

Health check endpoint:
```bash
GET /health
```

## 📦 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js          # Supabase client configuration
│   ├── controllers/
│   │   ├── adminController.js   # Admin operations
│   │   ├── appointmentController.js
│   │   ├── authController.js
│   │   ├── branchController.js
│   │   ├── doctorController.js
│   │   └── recordController.js
│   ├── middlewares/
│   │   ├── auth.js              # JWT authentication & role checks
│   │   ├── security.js          # Security middleware
│   │   └── validation.js        # Request validation
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── branchRoutes.js
│   │   ├── doctorRoutes.js
│   │   └── recordRoutes.js
│   ├── services/
│   │   ├── appointmentService.js # Business logic
│   │   └── auditService.js      # Audit logging
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── database/
│   ├── schema.sql               # Database schema
│   ├── rls_policies.sql         # Row Level Security policies
│   └── seed.js                  # Seed script
├── .env.example
├── package.json
└── README.md
```

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": [] // For validation errors
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## 🔄 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment (development/production) | No |
| `CORS_ORIGIN` | Allowed CORS origin | No |

## 📈 Performance Considerations

- Indexes on frequently queried columns
- Efficient joins with Supabase PostgREST
- Rate limiting to prevent abuse
- Connection pooling via Supabase

## 🔮 Future Enhancements

- Email notifications for appointments
- SMS reminders
- File upload for medical records
- Advanced analytics dashboard
- Mobile app API support
- WebSocket for real-time updates

## 📄 License

ISC

## 🤝 Support

For issues and questions, please check the documentation or contact the development team.

---

**Built with ❤️ for scalable dental clinic management**

