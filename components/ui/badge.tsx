import * as React from "react";
import { cn } from "@/lib/cn";

type BadgeVariant =
  | "zinc"
  | "emerald"
  | "amber"
  | "red"
  | "purple"
  | "neutral"
  | "light";

type BadgeSize = "sm" | "chip";

type BadgeOwnProps = {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children: React.ReactNode;
};

type BadgeProps<T extends React.ElementType = "span"> = BadgeOwnProps &
  Omit<React.ComponentPropsWithoutRef<T>, keyof BadgeOwnProps | "as" | "children"> & {
    as?: T;
  };

const variantClasses: Record<BadgeVariant, string> = {
  purple:
    "border border-[var(--nulance-purple)]/20 bg-[var(--nulance-purple)]/10 text-[var(--nulance-purple)]",
  neutral: "border border-zinc-200 bg-white/40 text-zinc-700 hover:bg-white/60 hover:border-zinc-300",
  light: "border border-black/6 bg-white text-zinc-500",

  emerald: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border border-amber-200 bg-amber-50 text-amber-700",
  red: "border border-red-200 bg-red-50 text-red-700",
  zinc: "border border-zinc-200 bg-zinc-100 text-zinc-600",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.04em] uppercase",
  chip: "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold",
};

export function Badge<T extends React.ElementType = "span">({
  as,
  variant = "zinc",
  size = "sm",
  className,
  children,
  ...props
}: BadgeProps<T>) {
  const Component = as || "span";

  return (
    <Component
      className={cn(sizeClasses[size], variantClasses[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
}

