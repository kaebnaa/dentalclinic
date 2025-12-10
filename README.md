# 🦷 Dental Clinic Management System

A full-stack dental clinic appointment and patient management system built with Next.js, Express.js, and Supabase.

## ✨ Features

- 🏥 **Multi-branch Management** - Manage multiple clinic branches
- 👥 **Role-based Access** - Patient, Doctor, and Admin roles
- 📅 **Appointment Scheduling** - Book, manage, and track appointments
- 📋 **Medical Records** - Secure patient record management
- 📊 **Analytics Dashboard** - Comprehensive reporting and analytics
- 🔐 **Secure Authentication** - JWT-based authentication with Supabase
- 🗺️ **Map Integration** - Branch location with map coordinates
- 📝 **Audit Logging** - Complete audit trail of all operations

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Express.js** - Node.js framework
- **Supabase** - PostgreSQL database & authentication
- **JWT** - Token-based authentication
- **Row Level Security** - Database-level security
- **Zod** - Input validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dental-clinic-system
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   ```

3. **Set up environment variables**
   - Backend: Copy `backend/.env.example` to `backend/.env`
   - Frontend: Copy `.env.local.example` to `.env.local`

4. **Set up database**
   - Run `backend/database/schema.sql` in Supabase
   - Run `backend/database/rls_policies.sql` in Supabase
   - Run `cd backend && npm run seed` to create initial data

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Quick Vercel deployment
- **[INTERNAL.md](./INTERNAL.md)** - Internal development notes
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[backend/README.md](./backend/README.md)** - Backend API documentation

## 🔐 Default Credentials

After seeding the database:
- **Admin**: `admin@dentalclinic.com` / `Admin@123456`
- **Doctors**: `doctor@dentalclinic.com` / `Doctor@123456`

## 🌐 Deployment

### Deploy to Vercel

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for quick deployment or [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick deploy:**
```bash
# Backend
cd backend && vercel --prod

# Frontend
vercel --prod
```

## 📁 Project Structure

```
dental-clinic-system/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                # Utilities & API client
├── backend/            # Express API
│   ├── src/           # Source code
│   ├── database/       # SQL scripts
│   └── api/           # Vercel entry point
└── public/             # Static assets
```

## 🛠️ Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

**Backend:**
- `npm run dev` - Start development server
- `npm run start` - Start production server
- `npm run seed` - Seed database
- `npm test` - Run API tests

## 🔒 Security

- Row Level Security (RLS) policies
- JWT token authentication
- CORS protection
- Input validation
- Rate limiting
- SQL injection protection

## 📝 License

ISC

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📞 Support

For issues and questions:
1. Check documentation files
2. Review error logs
3. Verify environment variables
4. Check Supabase project status

---

**Built with ❤️ for dental clinic management**

