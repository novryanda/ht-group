# HT Group Dashboard

A comprehensive business management dashboard for PT companies with invoice generation, user management, and multi-company navigation system.

## 🚀 Features

### 🏢 **Multi-Company Management**
- **4 PT Companies**: PT. HUSNI TAMRIN KERINCI, PT. TUAH ANDALAN MELAYU, PT. NILO ENG, PT. ZAKIYAH TALITA ANGGUN
- **Hierarchical Navigation**: Company-based sidebar with expandable sub-menus
- **Dedicated Pages**: Individual pages for each business section

### 📄 **Advanced Invoice System**
- **Multi-Type Invoices**: Pengajian, Tagihan, Biaya Operasional, Biaya Lain-lain
- **Professional PDF Generation**: High-quality invoices matching business templates
- **Automatic Calculations**: Tax calculations (PPN 11%, PPh 23 2%)
- **Type-Specific Numbering**: Different invoice prefixes per type

### 🔐 **Authentication & Authorization**
- **Role-Based Access Control**: Super Admin, Admin, Member roles
- **NextAuth.js Integration**: Secure authentication system
- **Protected Routes**: Middleware-based route protection

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on all screen sizes
- **Dark/Light Mode**: Theme switching capability
- **Professional Interface**: Clean, modern dashboard design
- **Interactive Components**: Smooth animations and transitions

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern UI component library
- **Lucide React**: Beautiful icons

### **Backend**
- **Prisma ORM**: Database management and migrations
- **Supabase**: Cloud PostgreSQL database
- **NextAuth.js**: Authentication and session management
- **Puppeteer**: PDF generation engine

### **Database**
- **PostgreSQL**: Relational database via Supabase
- **Connection Pooling**: Optimized database connections
- **Schema Management**: Prisma-based migrations

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/novryanda/ht-group.git
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

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── companies/         # Company-specific pages
│   ├── dashboard/         # Main dashboard
│   └── login/            # Authentication pages
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── auth/             # Authentication components
│   └── forms/            # Form components
├── lib/                  # Utility libraries
├── service/              # Business logic services
├── types/                # TypeScript type definitions
├── mock/                 # Mock data for development
└── generated/            # Generated Prisma client
```

## 📝 Documentation

- [Invoice System Documentation](./INVOICE_SYSTEM.md)
- [Dedicated Pages Implementation](./DEDICATED_PAGES_IMPLEMENTATION.md)
- [Supabase Migration Guide](./SUPABASE_MIGRATION.md)
- [Next.js 15 Fixes](./NEXTJS15_FIXES.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💻 Author

**Novryanda**
- GitHub: [@novryanda](https://github.com/novryanda)
- Repository: [ht-group](https://github.com/novryanda/ht-group)

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
