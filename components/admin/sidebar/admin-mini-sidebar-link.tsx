"use client";

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/cn";

type AdminMiniSidebarLinkProps = {
  href?: string;
  label: string;
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  active?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

export function AdminMiniSidebarLink({
  href,
  label,
  icon,
  active,
  onClick,
}: AdminMiniSidebarLinkProps) {
  return (
    <Link
      href={href ?? "#"}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-[76px] w-[64px] flex-col items-center justify-center gap-1 rounded-2xl transition-colors",
        active
          ? "bg-[var(--nulance-purple)]/10 text-[var(--nulance-purple)]"
          : "text-zinc-600 hover:bg-zinc-100"
      )}
    >
      <HugeiconsIcon icon={icon} size={24} color="currentColor" strokeWidth={1.8} />
      <span className="text-center text-[11px] font-semibold leading-none">
        {label}
      </span>
    </Link>
  );
}
