# HT Group - Dashboard Application

A modern web application built with Next.js, featuring role-based authentication, dashboard components, and a clean, maintainable architecture.

## Features

- 🔐 **Authentication System**: NextAuth.js with database integration
- 👥 **Role-Based Access Control**: Three user roles (Super Admin, Admin, Member)
- 🎨 **Modern UI**: shadcn/ui components with Tailwind CSS
- 📊 **Dashboard**: Interactive dashboard with charts and data tables
- 🛡️ **Protected Routes**: Middleware-based route protection
- 🗄️ **Database**: PostgreSQL with Prisma ORM
- 🔒 **Security**: Password hashing with bcryptjs

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ht-group
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your database URL and NextAuth secret:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ht_group"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Run migrations
   npm run db:migrate

   # Generate Prisma client
   npm run db:generate

   # Seed the database with test users
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Test Users

After running the seed script, you can log in with these test accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Super Admin | superadmin@htgroup.com | superadmin123 | Full access to all features |
| Admin | admin@htgroup.com | admin123 | Administrative access |
| Member | member@htgroup.com | member123 | Basic user access |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/auth/          # NextAuth.js API routes
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── providers/         # Context providers
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── auth-utils.ts      # Role-based access utilities
│   ├── prisma.ts          # Prisma client
│   └── user-utils.ts      # User management utilities
├── types/                 # TypeScript type definitions
└── generated/             # Generated Prisma client
```

## Authentication Flow

1. **Login**: Users authenticate via the `/login` page
2. **Session Management**: NextAuth.js manages sessions with JWT strategy
3. **Route Protection**: Middleware protects routes based on authentication status
4. **Role-Based Access**: Components and pages check user roles for access control

## Role-Based Access Control

The application implements a hierarchical role system:

- **Super Admin**: Highest privileges, can manage all users and settings
- **Admin**: Moderate privileges, can access admin panel and moderate content
- **Member**: Basic privileges, can access dashboard and personal features

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with test data
- `npm run db:studio` - Open Prisma Studio

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is private and proprietary to HT Group.
