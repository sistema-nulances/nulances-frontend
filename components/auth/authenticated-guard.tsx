"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { ProfileRoutePageSkeleton } from "@/components/skeletons";

export function AuthenticatedGuard({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (status !== "ready") return;
    if (!user) {
      router.replace(`/401?returnUrl=${encodeURIComponent(pathname || "/profile")}`);
    }
  }, [pathname, router, status, user]);

  if (status !== "ready" || !user) {
    return <ProfileRoutePageSkeleton />;
  }

  return children;
}
