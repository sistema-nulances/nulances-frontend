"use client";

import * as React from "react";
import { Toast, ToastProps } from "./toast";
import { AnimatePresence } from "framer-motion";

type OmitId<T> = Omit<T, "id" | "onClose">;

interface ToastContextType {
  toasts: ToastProps[];
  toast: (props: OmitId<ToastProps>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const toast = React.useCallback(
    ({ title, description, type = "info", duration = 5000 }: OmitId<ToastProps>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: ToastProps = {
        id,
        title,
        description,
        type,
        duration,
        onClose: removeToast,
      };

      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 p-4 space-y-3 flex flex-col items-center pointer-events-none w-full max-w-md">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
