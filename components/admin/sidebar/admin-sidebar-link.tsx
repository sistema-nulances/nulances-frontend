"use client";

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/cn";

type AdminSidebarLinkProps = {
  href: string;
  label: string;
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  active?: boolean;
  onNavigate?: () => void;
};

export function AdminSidebarLink({
  href,
  label,
  icon,
  active,
  onNavigate,
}: AdminSidebarLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => onNavigate?.()}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-[14px] font-medium transition-colors",
        active
          ? "bg-[var(--nulance-purple)]/10 text-[var(--nulance-purple)]"
          : "text-zinc-700 hover:bg-zinc-100"
      )}
    >
      <HugeiconsIcon icon={icon} size={18} color="currentColor" strokeWidth={1.8} />
      <span className="truncate">{label}</span>
    </Link>
  );
}
