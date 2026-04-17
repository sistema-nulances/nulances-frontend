"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, Alert01Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";

export function AdminTopbar() {
  return (
    <header className="w-full border-b border-zinc-200 bg-white">
      <div className="px-8 py-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-[22px] font-bold text-zinc-900">Olá, Administrador</div>
          <div className="mt-1 text-sm text-zinc-500">
            Veja um resumo das suas atividades recentes
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full border border-zinc-200 bg-white flex items-center justify-center">
                <HugeiconsIcon
                  icon={Alert01Icon}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.8}
                />
              </div>
              <div className="absolute -right-1 -top-1">
                <Badge variant="purple" size="sm">
                  2
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--nulance-purple)]/10 border border-[var(--nulance-purple)]/20 text-[var(--nulance-purple)]">
                <HugeiconsIcon
                  icon={UserIcon}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.8}
                />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold text-zinc-900">Administrador do Sistema</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mt-1">
                  ADM
                </div>
              </div>
            </div>
          </div>

          <div className="hidden">
            <HugeiconsIcon
              icon={Alert01Icon}
              size={18}
              color="currentColor"
              strokeWidth={1.8}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

