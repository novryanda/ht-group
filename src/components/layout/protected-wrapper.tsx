"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { PageLoading } from "~/components/ui/loading";

interface ProtectedWrapperProps {
  children: React.ReactNode;
}

export function ProtectedWrapper({ children }: ProtectedWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Redirect to login with current path as callback
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
    }
  }, [status, router, pathname]);

  // Show loading while checking authentication
  if (status === "loading") {
    return <PageLoading />;
  }

  // Show loading while redirecting unauthenticated users
  if (status === "unauthenticated") {
    return <PageLoading />;
  }

  // Show loading if no session data
  if (!session) {
    return <PageLoading />;
  }

  return <>{children}</>;
}
