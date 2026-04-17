import React from "react";
import { cn } from "@/lib/cn";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, className, position = "top" }: TooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "bottom-[-4px] left-1/2 -translate-x-1/2 border-t-zinc-900 border-l-transparent border-r-transparent border-b-transparent",
    bottom: "top-[-4px] left-1/2 -translate-x-1/2 border-b-zinc-900 border-l-transparent border-r-transparent border-t-transparent",
    left: "right-[-4px] top-1/2 -translate-y-1/2 border-l-zinc-900 border-t-transparent border-b-transparent border-r-transparent",
    right: "left-[-4px] top-1/2 -translate-y-1/2 border-r-zinc-900 border-t-transparent border-b-transparent border-l-transparent",
  };

  return (
    <div className="relative inline-flex group">
      {children}
      <div
        className={cn(
          "pointer-events-none invisible absolute z-50 whitespace-nowrap rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100",
          positionClasses[position],
          className
        )}
      >
        {content}
        <div
          className={cn(
            "absolute h-0 w-0 border-[5px]",
            arrowClasses[position]
          )}
        />
      </div>
    </div>
  );
}
