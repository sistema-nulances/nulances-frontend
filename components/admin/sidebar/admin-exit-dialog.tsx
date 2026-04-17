"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type AdminExitDialogProps = {
  open: boolean;
  onClose: () => void;
  onGoHome: () => void;
  onLogout: () => void;
};

export function AdminExitDialog({
  open,
  onClose,
  onGoHome,
  onLogout,
}: AdminExitDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 pt-20 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-[360px] rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <h3 className="text-[16px] font-bold text-zinc-900">Sair</h3>
        <p className="mt-1 text-sm text-zinc-500">Escolha uma opção.</p>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            type="button"
            variant="default"
            className="h-11 w-full rounded-full"
            onClick={onGoHome}
          >
            Voltar para home
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-full border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
            onClick={onLogout}
          >
            Deslogar
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-full border-zinc-200 text-zinc-700 hover:bg-zinc-50"
            onClick={onClose}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
