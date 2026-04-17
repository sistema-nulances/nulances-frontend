import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "yellow"
  | "header-icon"
  | "header-search"
  | "header-user";

type ButtonSize =
  | "sm"
  | "md"
  | "lg"
  | "icon"
  | "header-icon"
  | "header-search"
  | "header-user";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-[var(--nulance-purple)] cursor-pointer text-white hover:opacity-95 ",
  secondary:
    "bg-zinc-100 text-zinc-900 cursor-pointer hover:bg-zinc-200",
  outline:
    "border border-[#63146c] cursor-pointer bg-white text-zinc-900 hover:bg-zinc-50",
  ghost:
    "bg-transparent text-zinc-900 cursor-pointer hover:bg-zinc-100",
  yellow:
    "bg-[var(--nulance-yellow)] cursor-pointer text-black hover:opacity-95 ",
  "header-icon":
    "bg-gray-200/40 border border-black/7 text-[#7c7c84] cursor-pointer hover:bg-[#e4e4e4] ",
  "header-search":
    "bg-gray-200/40 border border-black/7 cursor-pointer text-slate-600 (0,0,0,0.06)] hover:bg-zinc-50",
  "header-user":
    " cursor-pointer text-[#6f6f78] hover:bg-zinc-200/50 ",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 rounded-full px-3 text-sm",
  md: "h-10 rounded-full px-4 text-sm",
  lg: "h-11 rounded-full px-5 text-base",
  icon: "h-10 w-10 rounded-full",
  "header-icon": "h-[44px] w-[44px] rounded-full",
  "header-search": "h-[44px] rounded-full pl-3.5 pr-3",
  "header-user": "h-[40px] rounded-full px-3",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium outline-none transition-all",
          "focus-visible:ring-4 focus-visible:ring-[var(--ring)]",
          "disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
