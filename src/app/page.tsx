"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLoading } from "~/components/ui/loading";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      // Still checking authentication status
      return;
    }

    if (status === "unauthenticated" || !session) {
      // User is not authenticated, redirect to login
      router.replace("/login");
    } else {
      // User is authenticated, redirect to dashboard
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  // Show loading while determining where to redirect
  return <PageLoading />;
}
