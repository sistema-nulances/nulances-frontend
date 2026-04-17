"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type TabsContextType = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextType | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used inside <Tabs />");
  }
  return context;
}

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value: controlledValue, onValueChange, children, className }: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;
  const setValue = React.useCallback(
    (next: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [controlledValue, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex w-full items-stretch gap-0 overflow-x-auto border-zinc-200 bg-white",
        className
      )}
      {...props}
    />
  );
}

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
}

export function TabsTrigger({
  value,
  className,
  children,
  icon,
  onClick,
  ...props
}: TabsTriggerProps) {
  const { value: activeValue, setValue } = useTabsContext();
  const isActive = activeValue === value;
  const hasIcon = Boolean(icon);

  return (
    <button
      type="button"
      onClick={(event) => {
        setValue(value);
        onClick?.(event);
      }}
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "group relative flex cursor-pointer min-w-[140px] items-center justify-center border-transparent text-center transition-all duration-200",
        hasIcon ? "flex-col gap-3 px-6 py-4" : "px-8 py-5",
        "hover:bg-[#d928ed]/3",
        className
      )}
      {...props}
    >
      {hasIcon ? (
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-200",
            isActive
              ? "border-[color:var(--nulance-purple)] bg-[#fff7df] text-[var(--nulance-purple)]"
              : "border-zinc-200 bg-[#fafafa] text-zinc-500 group-hover:border-[color:var(--nulance-purple)]/50 group-hover:bg-[#fffaf0] group-hover:text-[var(--nulance-purple)]"
          )}
        >
          {icon}
        </span>
      ) : null}

      <span
        className={cn(
          "leading-none font-medium tracking-[-0.02em] transition-colors duration-200",
          hasIcon ? "text-[15px]" : "text-[16px]",
          isActive
            ? "text-[var(--nulance-purple)]"
            : "text-zinc-700 group-hover:text-[var(--nulance-purple)]"
        )}
      >
        {children}
      </span>
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { value: activeValue } = useTabsContext();

  if (activeValue !== value) return null;

  return (
    <div className={cn("w-full bg-white", className)} {...props}>
      {children}
    </div>
  );
}
