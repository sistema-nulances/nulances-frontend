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
    const role = String(user.role ?? "").toUpperCase();
    const isPlanosRoute = String(pathname ?? "").startsWith("/painel-vendedor/planos");
    const allow = role === "VENDEDOR" || (isPlanosRoute && role === "COMPRADOR");
    if (!allow) {
      router.replace("/403");
    }
  }, [user, status, router, pathname]);

  const role = String(user?.role ?? "").toUpperCase();
  const isPlanosRoute = String(pathname ?? "").startsWith("/painel-vendedor/planos");
  const allow = role === "VENDEDOR" || (isPlanosRoute && role === "COMPRADOR");

  if (status !== "ready" || !user || !allow) {
    return <SellerContentSkeleton />;
  }

  return children;
}
