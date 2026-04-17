import * as React from "react";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick01Icon,
  Alert01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

export type ToastType = "success" | "error" | "warning";

export interface ToastProps {
  id: string;
  type?: ToastType | "info"; // Manteve info por compatibilidade se precisar depois
  title: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: <HugeiconsIcon icon={Tick01Icon} size={18} className="text-emerald-500" />,
  error: <HugeiconsIcon icon={Cancel01Icon} size={18} className="text-red-500" />,
  warning: <HugeiconsIcon icon={Alert01Icon} size={18} className="text-amber-500" />,
  info: <HugeiconsIcon icon={Tick01Icon} size={18} className="text-emerald-500" />,
};

const bgColors = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-emerald-50 border-emerald-200 text-emerald-800",
};

export const Toast = ({
  id,
  type = "success",
  title,
  description,
  duration = 5000,
  onClose,
}: ToastProps) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "pointer-events-auto flex items-center gap-2.5 overflow-hidden rounded-full border px-4 py-2.5 ",
        bgColors[type]
      )}
    >
      <div className="flex shrink-0 items-center justify-center">
        {icons[type]}
      </div>
      <div className="flex flex-col">
        <p className="text-[13px] font-semibold leading-none">{title}</p>
        {description && (
          <p className="mt-1 text-[12px] opacity-90 leading-tight">{description}</p>
        )}
      </div>
    </motion.div>
  );
};
