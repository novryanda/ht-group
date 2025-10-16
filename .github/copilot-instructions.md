# Copilot Instructions for `ht-group`

## 📦 Architecture & Layering (3-Tier Clean Architecture)
- **T3 Stack foundation**: Next.js 15 App Router, NextAuth v5 beta, Prisma ORM, Tailwind CSS. No tRPC—direct API routes instead.
- **Route structure**: App Router splits into `src/app/(auth)` (public) and `src/app/(protected-pages)` with PT-specific paths like `/pt-nilo/dashboard`, `/pt-pks/datamaster`. Protected routes enforced via `src/middleware.ts` using RBAC from `src/lib/rbac.ts`.
- **3-Tier Pattern** (strictly enforced):
  1. **API Controllers** (`src/app/api/**/route.ts`) - Parse NextRequest, validate input, call API modules, return HTTP responses
  2. **API Modules** (`src/server/api/*.ts`) - Business logic, Zod validation, error handling, return `{ success, data, statusCode }`
  3. **Services** (`src/server/services/*.service.ts`) - Database access via Prisma, core domain logic
- **Type definitions**: DTOs in `src/server/types/*.ts` (e.g., `finance.ts`, `supplier.ts`). Prisma models augmented with custom interfaces for API responses.
- **Active modules**: Currently only PT PKS Supplier module is fully implemented. All other pages use `EmptyPageTemplate` component as placeholders.

## 🔐 Authentication & RBAC
- **NextAuth v5 beta** configured in `src/server/auth/config.ts` with Credentials provider. JWT strategy with session callbacks. Passwords hashed with bcryptjs.
- **Role hierarchy** (from `src/lib/rbac.ts`): `GROUP_VIEWER`/`EXECUTIVE` → all PTs; `PT_*_ADMIN` → specific PT; `UNIT_SUPERVISOR`, `TECHNICIAN`, `OPERATOR`, `HR`, `FINANCE_AR/AP`, `GL_ACCOUNTANT` → restricted by company.
- **PT companies**: 5 companies defined in `PT_COMPANIES` array (PT-NILO, PT-ZTA, PT-TAM, PT-HTK, PT-PKS). Each has `code`, `name`, `adminRole`, `dashboardPath`.
- **Middleware flow**: `src/middleware.ts` checks authentication → validates route access via `canAccessRoute()` → redirects to `/unauthorized` or user's default dashboard. Use `hasCompanyAccess()`, `getUserPTCompany()`, `getDefaultRedirectPath()` for access logic.
- **Client session**: Use `useSession()` from `next-auth/react` in Client Components. Protected layout wraps children in `<ProtectedWrapper>` (`src/components/layout/protected-wrapper.tsx`) which handles loading states and redirects.

## 🧭 Frontend Patterns
- **UI primitives**: Shadcn/ui components in `src/components/ui/` (Button, Card, Dialog, Form, etc.). Always use `cn()` helper from `~/lib/utils` for className merging.
- **Forms**: `react-hook-form` with Zod resolvers inline. See `LoginForm` (`src/components/auth/login-form.tsx`) and `SupplierForm` (`src/components/pt-pks/datamaster/supplier/supplier-form.tsx`) for patterns—controlled inputs, error states, loading indicators.
- **Path aliases**: Use `~/*` for absolute imports (e.g., `~/components/ui/button`, `~/server/api/suppliers`). Configured in `tsconfig.json`.
- **PT-specific components**: Organized under `src/components/pt-{company}/` (currently only `pt-pks/` is populated). Shared components at `src/components/dashboard/` and `src/components/layout/`.
- **Empty page template**: Use `EmptyPageTemplate` from `~/components/dashboard/empty-page-template.tsx` for placeholder pages during development. Displays construction icon and "coming soon" message.
- **Sidebar navigation**: `AppSidebar` (`src/components/layout/app-sidebar.tsx`) dynamically generates menus based on user role using `ptNavigationData` structure and RBAC helpers.

## 🗄️ Database & Data Models
- **Prisma schema**: `prisma/schema.prisma` with PostgreSQL datasource. Key models: `User`, `Employee`, `Company`, `SupplierTBS`.
- **Enums**: `UserRole`, `SupplierType`, `PajakPKP` defined in schema.
- **Relationships**: `User` → `Employee` (1:1), `Employee` → `Company` (many:1).
- **Seeding**: Run `npm run db:seed` to populate demo users. Seed file at `prisma/seed.ts`. Demo credentials in `LoginForm` component and `README-ERP.md`.
- **Migrations**: Use `npm run db:push` for dev, `npm run db:migrate` for production. Always run `npm run db:generate` or `postinstall` script after schema changes.

## 🏗️ Multi-Company ERP Domain
- **Company structure**: Each PT has multiple Units (e.g., PT-NILO has HVAC Rittal, HVAC Split, Fabrikasi, Efluen). Routes follow `/dashboard/pt-{code}/{module}` pattern.
- **Supplier management** (PT-PKS focus): `SupplierTBS` model with `typeSupplier` (RAMP_PERON, KUD, KELOMPOK_TANI), `pajakPKP` (PKP_11_PERSEN, PKP_1_1_PERSEN, NON_PKP). Automatic form number generation in `SupplierService.generateFormNumber()`.
- **Employee management**: `Employee` model (mapped to `karyawan` table) with comprehensive HR fields including KK status, education, employment dates, BPJS, tax info, and bank details.
- **Finance module**: Types in `src/server/types/finance.ts` define `AccountsReceivableItem`, `AccountsPayableItem`, `GeneralLedgerItem` with status enums and overdue tracking.

## 🧪 Workflows & Tooling
- **Dev server**: `npm run dev` with Turbo (`--turbo` flag). Hot reload enabled.
- **Database tools**: `npm run db:studio` for Prisma Studio GUI. `npm run db:seed` for fixtures.
- **Type checking**: `npm run typecheck` or `tsc --noEmit`. Strict mode enabled in `tsconfig.json`.
- **Linting**: ESLint via flat config (`eslint.config.js`) with Next.js plugin. Run `npm run lint` or `npm run lint:fix`.
- **Formatting**: Prettier with Tailwind plugin (`prettier.config.js`). Check with `npm run format:check`, fix with `npm run format:write`.
- **Build verification**: `npm run build` then `npm run preview` for production testing. CI equivalent: `npm run check` (lint + typecheck).

## 🩺 Debugging & Development Notes
- **Environment variables**: Validated via `@t3-oss/env-nextjs` in `src/env.js`. Required: `DATABASE_URL`, `AUTH_SECRET`. Add any new env vars to schema or build fails.
- **Logging style**: Console logs include emojis for visibility (e.g., "Authorize called with:", "Authentication successful"). Maintain consistency when adding logs.
- **Error handling**: API modules return standardized shapes: `{ success: boolean, data?, error?, details?, statusCode: number }`. Controllers map statusCode to HTTP response.
- **TypeScript strictness**: Uses TypeScript 5.8 with strict mode. Prisma types sometimes require `as any` casts when including relations—see `authConfig.authorize()` for example.

## 🚀 Contribution Checklist
- **New API endpoint**: Create route in `src/app/api/`, add API class in `src/server/api/`, implement service in `src/server/services/`, define types in `src/server/types/`. Follow PT PKS Supplier pattern as reference.
- **New PT module**: 
  1. Replace `EmptyPageTemplate` in `src/app/(protected-pages)/pt-{code}/{module}/page.tsx`
  2. Create components in `src/components/pt-{code}/{module}/`
  3. Add API routes if needed following 3-tier pattern
  4. Update `ptNavigationData` in `app-sidebar.tsx` if adding new menu items
- **Form validation**: Always use Zod schemas at API layer (see `createSupplierSchema` in `suppliers.ts`). Validate in API class before calling service.
- **Access control**: For PT-scoped features, use `hasCompanyAccess(session, companyCode)` or `validateCompanyAccess()`. Extract company from route with `getCompanyCodeFromRoute()`.
- **Database changes**: Update `schema.prisma`, run `npm run db:push`, update seed if needed, regenerate types. Check for breaking changes in services.
- **UI consistency**: Use existing Shadcn components, follow `cn()` pattern, maintain responsive design with Tailwind. Reference PT PKS Supplier module for complete implementation example.

## 📝 Project-Specific Patterns
- **Supplier unique checks**: `SupplierAPI.checkUnique()` validates NIB/NPWP before create/update. Returns `{ nibExists, npwpExists }`.
- **Auto-generated IDs**: Supplier form numbers auto-generated as `{seq}/PT.TRT/SUPP-TBS/{mm}/{yyyy}` based on monthly count.
- **JSON fields**: `SupplierTBS.profilKebun` accepts single object or array of `{ tahunTanam, luasKebun, estimasiSupply }`. Handle both formats in API.
- **Company codes**: Use uppercase with hyphen (e.g., "PT-NILO"). Route paths use lowercase without prefix (e.g., "/pt-nilo").
- **Session hydration**: Client components with session checks must handle mounting state—see `ProtectedWrapper` for SSR-safe pattern.
