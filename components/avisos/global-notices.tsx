"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import {
  AVISOS_DISMISSED_STORAGE_KEY,
  AVISOS_STORAGE_KEY,
  AVISOS_UPDATED_EVENT,
  MARKETPLACE_AVISOS_DISMISSED_STORAGE_KEY,
  MARKETPLACE_AVISOS_STORAGE_KEY,
  MARKETPLACE_AVISOS_UPDATED_EVENT,
  dismissAviso,
  loadAvisos,
  loadDismissedIds,
  sortAvisos,
  type Aviso,
  type AvisoScope,
} from "@/lib/avisos";
import { cn } from "@/lib/cn";

function visibleForUser(avisos: Aviso[], dismissed: Set<string>): Aviso[] {
  const sorted = sortAvisos(avisos);
  return sorted.filter((a) => {
    if (a.tipo === "permanente") return true;
    return !dismissed.has(a.id);
  });
}

function noticesScopeForPath(pathname: string | null): AvisoScope {
  if (pathname?.startsWith("/marketplace")) return "marketplace";
  return "site";
}

export function GlobalNotices() {
  const pathname = usePathname();
  /** Painel /admin é `h-screen`; avisos no root empilhariam altura e geram scroll duplo no `body`. */
  const hideInAdminShell = pathname?.startsWith("/admin") ?? false;
  const scope = noticesScopeForPath(pathname);

  const [avisos, setAvisos] = React.useState<Aviso[]>([]);
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());

  const refresh = React.useCallback(() => {
    setAvisos(loadAvisos(scope));
    setDismissed(loadDismissedIds(scope));
  }, [scope]);

  React.useEffect(() => {
    if (hideInAdminShell) return;
    refresh();
  }, [refresh, hideInAdminShell]);

  React.useEffect(() => {
    if (hideInAdminShell) return;
    function onUpdate() {
      refresh();
    }
    function onStorage(e: StorageEvent) {
      const siteHit = e.key === AVISOS_STORAGE_KEY || e.key === AVISOS_DISMISSED_STORAGE_KEY;
      const mpHit =
        e.key === MARKETPLACE_AVISOS_STORAGE_KEY || e.key === MARKETPLACE_AVISOS_DISMISSED_STORAGE_KEY;
      if (scope === "site" ? siteHit : mpHit) refresh();
    }
    const eventName = scope === "site" ? AVISOS_UPDATED_EVENT : MARKETPLACE_AVISOS_UPDATED_EVENT;
    window.addEventListener(eventName, onUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(eventName, onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh, scope, hideInAdminShell]);

  const vis = React.useMemo(() => visibleForUser(avisos, dismissed), [avisos, dismissed]);

  const handleDismiss = React.useCallback(
    (id: string) => {
      dismissAviso(id, scope);
      setDismissed(loadDismissedIds(scope));
    },
    [scope]
  );

  if (hideInAdminShell) return null;
  if (vis.length === 0) return null;

  return (
    <div className="relative z-[90] w-full divide-y divide-zinc-200/90" role="region" aria-label="Avisos">
      {vis.map((a) => (
        <article
          key={a.id}
          className={cn(
            "px-4 py-3 sm:px-6",
            a.tipo === "permanente" ? "bg-sky-50 text-sky-950" : "bg-amber-50 text-amber-950"
          )}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold leading-snug">{a.titulo}</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                {a.conteudo}
              </p>
            </div>
            {a.tipo === "dismissivel" ? (
              <div className="flex shrink-0 items-center gap-2 sm:pt-0.5">
                <Button
                  type="button"
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleDismiss(a.id)}
                >
                  Entendi
                </Button>
                <button
                  type="button"
                  onClick={() => handleDismiss(a.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 transition hover:bg-black/5"
                  aria-label="Fechar aviso"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
