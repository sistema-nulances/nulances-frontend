"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { SellerContentSkeleton } from "@/components/skeletons";

export function SellerRoleGuard({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (status !== "ready") return;
    if (!user) {
      router.replace(`/401?returnUrl=${encodeURIComponent(pathname || "/painel-vendedor")}`);
      return;
    }
    if (user.role !== "VENDEDOR") {
      router.replace("/403");
    }
  }, [user, status, router, pathname]);

  if (status !== "ready" || !user || user.role !== "VENDEDOR") {
    return <SellerContentSkeleton />;
  }

  return children;
}
