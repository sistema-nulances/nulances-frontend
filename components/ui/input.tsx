// components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** `flat`: sem sombra, anel de foco mais fino (ex.: sheets densos). */
  variant?: "default" | "flat";
}

const formatCPF = (value: string) => {
  const v = value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 9) {
    return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
  } else if (v.length > 6) {
    return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
  } else if (v.length > 3) {
    return `${v.slice(0, 3)}.${v.slice(3)}`;
  }
  return v;
};

const formatDate = (value: string) => {
  const v = value.replace(/\D/g, "").slice(0, 8);
  if (v.length > 4) {
    return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
  } else if (v.length > 2) {
    return `${v.slice(0, 2)}/${v.slice(2)}`;
  }
  return v;
};

const formatEmail = (value: string) => {
  return value.trim().replace(/\s/g, "");
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = "text", error, leftIcon, rightIcon, onChange, variant = "default", ...props },
    ref
  ) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let { value } = e.target;
      if (type === "cpf") {
        e.target.value = formatCPF(value);
      } else if (type === "date") {
        e.target.value = formatDate(value);
      } else if (type === "email") {
        e.target.value = formatEmail(value);
      }
      if (onChange) {
        onChange(e);
      }
    };

    const isCustomType = type === "cpf" || type === "date";
    const inputType = isCustomType ? "text" : type;

    const focusRing =
      variant === "flat"
        ? "focus-within:border-[var(--nulance-purple)] focus-within:ring-2 focus-within:ring-[var(--ring)]"
        : "focus-within:border-[var(--nulance-purple)] focus-within:ring-4 focus-within:ring-[var(--ring)]";

    return (
      <div
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-full border px-3 transition-all",
          variant === "flat" && "shadow-none",
          error
            ? "border-red-500 focus-within:ring-4 focus-within:ring-red-100"
            : cn("border-zinc-200", focusRing),
          className
        )}
      >
        {leftIcon && <span className="text-zinc-400">{leftIcon}</span>}

        <input
          ref={ref}
          type={inputType}
          className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          onChange={handleChange}
          maxLength={type === "cpf" ? 14 : type === "date" ? 10 : props.maxLength}
          {...props}
        />

        {rightIcon && <span className="text-zinc-400">{rightIcon}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
