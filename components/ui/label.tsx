// components/ui/label.tsx
import * as React from "react";
import { cn } from "@/lib/cn";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "mb-1.5 inline-block text-sm font-medium text-zinc-900",
          className
        )}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";
