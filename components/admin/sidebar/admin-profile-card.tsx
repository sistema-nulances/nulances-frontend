"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";

type AdminProfileCardProps = {
  href: string;
  active?: boolean;
  name: string;
  subtitle: string;
  avatarSrc?: string;
  onNavigate?: () => void;
};

export function AdminProfileCard({
  href,
  active,
  name,
  subtitle,
  avatarSrc,
  onNavigate,
}: AdminProfileCardProps) {
  return (
    <div className="border-t border-zinc-200">
      <Link
        href={href}
        onClick={() => onNavigate?.()}
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left transition-colors",
          active ? "bg-[var(--nulance-purple)]/5" : "hover:bg-zinc-50"
        )}
      >
        <Avatar
          src={avatarSrc}
          alt={name}
          className="h-12 w-12 border-0 bg-transparent"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold leading-tight text-zinc-900">
            {name}
          </p>
          <p className="truncate text-[14px] text-zinc-500">{subtitle}</p>
        </div>
      </Link>
    </div>
  );
}
