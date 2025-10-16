# Material & Inventory Module - Fixes & Troubleshooting

## Issue #1: QueryClient Error

### Error Message
```
Error: No QueryClient set, use QueryClientProvider to set one
    at useQueryClient (http://localhost:3000/_next/static/chunks/node_modules_0e4178fa._.js:1913:15)
    at UomList (http://localhost:3000/_next/static/chunks/src_67a551d7._.js:1191:233)
```

### Root Cause
The application was using TanStack Query (`@tanstack/react-query`) in components but didn't have a `QueryClientProvider` wrapper in the root layout. All components using `useQuery`, `useMutation`, or `useQueryClient` hooks require a `QueryClientProvider` to be present in the component tree.

### Solution
Created a `QueryProvider` component and added it to the root layout.

#### Files Created/Modified

**1. Created: `src/components/providers/query-provider.tsx`**
```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

**2. Modified: `src/app/layout.tsx`**
```tsx
import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { SessionProvider } from "~/components/providers/session-provider";
import { QueryProvider } from "~/components/providers/query-provider"; // ✅ Added

export const metadata: Metadata = {
  title: "HT Group ERP",
  description: "Sistem ERP terintegrasi untuk HT Group",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body
        className="min-h-screen bg-background font-sans antialiased"
        suppressHydrationWarning
      >
        <QueryProvider> {/* ✅ Added wrapper */}
          <SessionProvider>{children}</SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

### Why This Works
- `QueryProvider` is a client component that creates a `QueryClient` instance
- The `QueryClient` is created using `useState` to ensure it's only created once per app lifecycle
- Default options are configured:
  - `staleTime: 60 * 1000` - Data is considered fresh for 1 minute
  - `refetchOnWindowFocus: false` - Prevents automatic refetch when window regains focus
- The provider wraps all children, making the QueryClient available to all components in the tree

### Testing
After applying this fix:
1. Restart the development server
2. Navigate to any inventory page (e.g., `/dashboard/pt-pks/datamaster/material-inventory/uom`)
3. The page should load without the QueryClient error
4. All TanStack Query hooks should work properly

---

## Common TanStack Query Patterns Used

### 1. Data Fetching with useQuery
```tsx
const { data, isLoading } = useQuery({
  queryKey: ["uoms", { search, page }],
  queryFn: async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: "20",
      ...(search && { search }),
    });
    const res = await fetch(`/api/inventory/uom?${params}`);
    if (!res.ok) throw new Error("Failed to fetch UoMs");
    return res.json();
  },
});
```

### 2. Mutations with useMutation
```tsx
const mutation = useMutation({
  mutationFn: async (data: UomFormData) => {
    const res = await fetch("/api/inventory/uom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create UoM");
    }
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["uoms"] });
    toast({ title: "Success", description: "UoM created successfully" });
  },
  onError: (error: Error) => {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  },
});
```

### 3. Cache Invalidation
```tsx
const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ["uoms"] });

// Invalidate multiple queries
queryClient.invalidateQueries({ queryKey: ["stock"] });
queryClient.invalidateQueries({ queryKey: ["ledger"] });
```

---

## Future Improvements

### 1. Add React Query Devtools (Development Only)
```tsx
// src/components/providers/query-provider.tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: QueryProviderProps) {
  // ... existing code ...
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

### 2. Add Error Boundary
Consider adding an error boundary to catch and display query errors gracefully.

### 3. Optimize Query Keys
Use a centralized query key factory for better type safety:
```tsx
// src/lib/query-keys.ts
export const inventoryKeys = {
  all: ['inventory'] as const,
  uoms: () => [...inventoryKeys.all, 'uoms'] as const,
  uom: (id: string) => [...inventoryKeys.uoms(), id] as const,
  materials: () => [...inventoryKeys.all, 'materials'] as const,
  // ... etc
};
```

---

**Status**: ✅ FIXED  
**Date**: 2025-10-15  
**Developer**: Augment Agent

