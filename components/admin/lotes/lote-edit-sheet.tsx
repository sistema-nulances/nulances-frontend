"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useBensCatalog } from "@/components/admin/bens/bens-catalog-context";
import type { LoteAdmin, LoteBemItem } from "@/data/lotes-admin";
import { cn } from "@/lib/cn";

type LoteEditSheetProps = {
  open: boolean;
  onClose: () => void;
  lote: LoteAdmin | null;
  mode?: "create" | "edit";
  onSave: (next: LoteAdmin) => void | Promise<void>;
};

function normalizeSearch(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function LoteEditSheet({
  open,
  onClose,
  lote,
  mode = "edit",
  onSave,
}: LoteEditSheetProps) {
  const isCreate = mode === "create";
  const { items: catalogoBens } = useBensCatalog();
  const [titulo, setTitulo] = React.useState("");
  const [observacoes, setObservacoes] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(() => new Set());
  const [bemSearch, setBemSearch] = React.useState("");
  const [bensError, setBensError] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const catalogoEfetivo = React.useMemo(() => {
    const m = new Map(catalogoBens.map((b) => [b.id, b]));
    if (lote) {
      for (const i of lote.itens) {
        if (!m.has(i.id)) m.set(i.id, i);
      }
    }
    let list = Array.from(m.values());
    if (isCreate) {
      list = list.filter((b) => !b.statusBem || b.statusBem === "DISPONIVEL");
    }
    return list.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [catalogoBens, lote, isCreate]);

  React.useEffect(() => {
    if (open && lote) {
      setTitulo(lote.titulo);
      setObservacoes(lote.observacoes ?? "");
      setSelectedIds(new Set(lote.itens.map((i) => i.id)));
      setBemSearch("");
      setBensError(false);
    }
  }, [open, lote]);

  const bensFiltrados = React.useMemo(() => {
    const q = normalizeSearch(bemSearch);
    if (!q) return catalogoEfetivo;
    return catalogoEfetivo.filter((b) =>
      normalizeSearch(`${b.nome} ${b.categoria ?? ""} ${b.descricao ?? ""}`).includes(q)
    );
  }, [catalogoEfetivo, bemSearch]);

  const toggleBem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setBensError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lote || isSaving) return;
    const t = titulo.trim();
    if (!t) return;
    if (selectedIds.size === 0) {
      setBensError(true);
      return;
    }
    const itens: LoteBemItem[] = catalogoEfetivo.filter((b) => selectedIds.has(b.id));
    const payload: LoteAdmin = {
      ...lote,
      titulo: t,
      observacoes: observacoes.trim() || undefined,
      itens,
      status: "disponivel",
      leilaoId: isCreate ? null : lote.leilaoId,
    };
    setIsSaving(true);
    void (async () => {
      try {
        await onSave(payload);
        onClose();
      } catch {
        /* erro tratado no pai (toast) */
      } finally {
        setIsSaving(false);
      }
    })();
  };

  React.useEffect(() => {
    if (!open) setIsSaving(false);
  }, [open]);

  const selectedCount = selectedIds.size;

  const safeClose = React.useCallback(() => {
    if (isSaving) return;
    onClose();
  }, [isSaving, onClose]);

  return (
    <Sheet open={open} onClose={safeClose} side="right">
      <SheetContent className="max-w-[min(100vw-1rem,480px)] !w-full" onClose={safeClose}>
        <SheetHeader>
          <SheetTitle>{isCreate ? "Novo lote" : "Editar lote"}</SheetTitle>
          <SheetDescription className="text-left">
            {isCreate
              ? "Defina o nome, observações e os bens disponíveis. O código é gerado pela API ao salvar."
              : "Altere o nome, as observações e os bens vinculados ao lote."}
          </SheetDescription>
          {isSaving ? (
            <p
              className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
              role="status"
              aria-live="polite"
            >
              {isCreate ? "Criando lote na API, aguarde…" : "Salvando lote, aguarde…"}
            </p>
          ) : null}
        </SheetHeader>

        {lote ? (
          <form className="mt-6 flex min-h-0 flex-1 flex-col gap-4 pb-4" onSubmit={handleSubmit}>
            <div>
              <p className="text-sm font-medium text-zinc-800">Código do lote</p>
              <p
                className="mt-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 font-mono text-sm text-zinc-900"
                aria-live="polite"
              >
                {lote.codigo?.trim() ? lote.codigo : "Será gerado ao salvar"}
              </p>
              <p className="mt-1.5 text-xs text-zinc-500">
                {isCreate ? "Definido pelo backend ao criar o lote." : "Gerado pelo sistema. Não editável."}
              </p>
            </div>
            <div>
              <Label htmlFor="lote-edit-titulo">Nome do lote</Label>
              <Input
                id="lote-edit-titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="mt-1 rounded-2xl"
                required
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="lote-edit-obs">Observações</Label>
              <textarea
                id="lote-edit-obs"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className={cn(
                  "mt-1 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900",
                  "placeholder:text-zinc-400 outline-none",
                  "focus:border-[var(--nulance-purple)] focus:ring-4 focus:ring-[var(--ring)]"
                )}
                placeholder="Opcional"
                disabled={isSaving}
              />
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <Label htmlFor="lote-edit-bens-search" className="text-zinc-800">
                  Bens no lote
                </Label>
                <span className="text-xs text-zinc-500">
                  {selectedCount} {selectedCount === 1 ? "selecionado" : "selecionados"}
                </span>
              </div>
              <Input
                id="lote-edit-bens-search"
                type="search"
                value={bemSearch}
                onChange={(e) => setBemSearch(e.target.value)}
                placeholder="Buscar bens…"
                className="rounded-2xl"
                autoComplete="off"
                disabled={isSaving}
              />
              {bensError ? (
                <p className="text-sm text-red-600">Selecione pelo menos um bem para compor o lote.</p>
              ) : null}
              <div
                className={cn(
                  "custom-scrollbar max-h-[min(40vh,320px)] overflow-y-auto rounded-[22px] border border-zinc-200 bg-white",
                  bensError && "border-red-300"
                )}
              >
                {bensFiltrados.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-zinc-500">
                    Nenhum bem corresponde à busca.
                  </p>
                ) : (
                  <ul className="divide-y divide-zinc-100">
                    {bensFiltrados.map((bem) => {
                      const checked = selectedIds.has(bem.id);
                      return (
                        <li key={bem.id}>
                          <label
                            className={cn(
                              "flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors",
                              "hover:bg-zinc-50/80",
                              checked && "bg-nulance-purple/10"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isSaving}
                              onChange={() => toggleBem(bem.id)}
                              className={cn(
                                "mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300",
                                "text-[var(--nulance-purple)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
                              )}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium leading-snug text-zinc-900">
                                {bem.nome}
                              </span>
                              {bem.categoria ?? bem.tipoVeiculo ? (
                                <span className="mt-0.5 block text-[12px] text-zinc-500">
                                  {bem.categoria ?? bem.tipoVeiculo}
                                </span>
                              ) : null}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="rounded-full"
                disabled={isSaving}
                onClick={safeClose}
              >
                Cancelar
              </Button>
              <Button type="submit" size="md" className="rounded-full" loading={isSaving} disabled={isSaving}>
                {isSaving ? (isCreate ? "Criando lote…" : "Salvando…") : isCreate ? "Criar lote" : "Salvar"}
              </Button>
            </div>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
