"use client";

import * as React from "react";
import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select, type SelectOption } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/cn";
import {
  loadAvisos,
  novoAvisoDraft,
  removeDismissedId,
  saveAvisos,
  sortAvisos,
  type Aviso,
  type AvisoScope,
  type AvisoTipo,
} from "@/lib/avisos";

const AVISOS_ADMIN_COPY: Record<
  AvisoScope,
  { subtitle: string; saveDescription: string }
> = {
  site: {
    subtitle:
      "Comunicados no topo da home e demais páginas do leilão (não aparecem nas rotas do marketplace; salvos neste navegador).",
    saveDescription: "Os visitantes veem este aviso nas páginas do leilão neste navegador.",
  },
  marketplace: {
    subtitle: "Comunicados no topo das páginas públicas do marketplace (salvos neste navegador).",
    saveDescription: "Os visitantes veem este aviso no marketplace neste navegador.",
  },
};

const TIPO_OPTIONS: SelectOption[] = [
  { value: "dismissivel", label: "Aceita e some (usuário pode dispensar)" },
  { value: "permanente", label: "Permanente (sempre visível)" },
];

type AdminAvisosPageContentProps = {
  scope?: AvisoScope;
};

export function AdminAvisosPageContent({ scope = "site" }: AdminAvisosPageContentProps) {
  const copy = AVISOS_ADMIN_COPY[scope];
  const { toast } = useToast();
  const [lista, setLista] = React.useState<Aviso[]>([]);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Aviso | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Aviso | null>(null);

  const refresh = React.useCallback(() => {
    setLista(sortAvisos(loadAvisos(scope)));
  }, [scope]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const openCreate = React.useCallback(() => {
    const nextOrdem =
      lista.length === 0 ? 0 : Math.max(...lista.map((a) => a.ordem), -1) + 1;
    setEditing({ ...novoAvisoDraft(nextOrdem), ordem: nextOrdem });
    setSheetOpen(true);
  }, [lista]);

  const openEdit = React.useCallback((a: Aviso) => {
    setEditing({ ...a });
    setSheetOpen(true);
  }, []);

  const saveSheet = React.useCallback(() => {
    if (!editing) return;
    const titulo = editing.titulo.trim();
    const conteudo = editing.conteudo.trim();
    if (!titulo || !conteudo) {
      toast({
        type: "warning",
        title: "Preencha título e mensagem",
        description: "Ambos os campos são obrigatórios.",
      });
      return;
    }
    const now = new Date().toISOString();
    const exists = lista.some((x) => x.id === editing.id);
    const next: Aviso = {
      ...editing,
      titulo,
      conteudo,
      atualizadoEm: now,
      criadoEm: exists ? editing.criadoEm : now,
    };
    const others = lista.filter((x) => x.id !== next.id);
    const merged = sortAvisos([...others, next]);
    removeDismissedId(next.id, scope);
    try {
      saveAvisos(merged, scope);
      setLista(merged);
      setSheetOpen(false);
      setEditing(null);
      toast({
        type: "success",
        title: exists ? "Aviso atualizado" : "Aviso criado",
        description: copy.saveDescription,
      });
    } catch {
      toast({
        type: "error",
        title: "Não foi possível salvar",
        description: "Verifique o armazenamento do navegador.",
      });
    }
  }, [editing, lista, toast, scope, copy.saveDescription]);

  const confirmDelete = React.useCallback(() => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    const merged = lista.filter((x) => x.id !== id);
    try {
      saveAvisos(merged, scope);
      removeDismissedId(id, scope);
      setLista(sortAvisos(merged));
      setDeleteTarget(null);
      toast({ type: "success", title: "Aviso excluído", description: "Removido da lista e da exibição." });
    } catch {
      toast({ type: "error", title: "Erro ao excluir", description: "Tente novamente." });
    }
  }, [deleteTarget, lista, toast, scope]);

  return (
    <div>
      <PageHeader
        title="Avisos"
        subtitle={copy.subtitle}
        action={
          <Button type="button" onClick={openCreate}>
            <PlusIcon className="mr-2 h-5 w-5" aria-hidden />
            Novo aviso
          </Button>
        }
      />

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-14 text-center">
          <p className="text-sm text-zinc-600">Nenhum aviso cadastrado.</p>
          <Button type="button" className="mt-4" onClick={openCreate}>
            Criar primeiro aviso
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {lista.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-zinc-900">{a.titulo}</h2>
                  <Badge
                    variant={a.tipo === "permanente" ? "purple" : "amber"}
                    size="sm"
                    className="normal-case"
                  >
                    {a.tipo === "permanente" ? "Permanente" : "Dispensável"}
                  </Badge>
                  <span className="text-xs text-zinc-500">Ordem {a.ordem}</span>
                </div>
                <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-zinc-600">{a.conteudo}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => openEdit(a)}>
                  <PencilSquareIcon className="mr-1.5 h-4 w-4" aria-hidden />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setDeleteTarget(a)}
                >
                  <TrashIcon className="mr-1.5 h-4 w-4" aria-hidden />
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <SheetContent className="max-w-[min(100vw-2rem,520px)]" onClose={() => setSheetOpen(false)}>
          <SheetHeader>
            <SheetTitle>{lista.some((x) => x.id === editing?.id) ? "Editar aviso" : "Novo aviso"}</SheetTitle>
            <SheetDescription>
              Avisos dispensáveis podem ser fechados pelo visitante; permanentes ficam sempre visíveis até você
              excluir.
            </SheetDescription>
          </SheetHeader>

          {editing ? (
            <div className="space-y-4 px-2 pb-4">
              <div>
                <Label htmlFor="aviso-titulo">Título</Label>
                <Input
                  id="aviso-titulo"
                  value={editing.titulo}
                  onChange={(e) => setEditing((s) => (s ? { ...s, titulo: e.target.value } : s))}
                  className="mt-1.5"
                  placeholder="Ex.: Manutenção programada"
                />
              </div>
              <div>
                <Label htmlFor="aviso-conteudo">Mensagem</Label>
                <textarea
                  id="aviso-conteudo"
                  value={editing.conteudo}
                  onChange={(e) => setEditing((s) => (s ? { ...s, conteudo: e.target.value } : s))}
                  rows={5}
                  className={cn(
                    "mt-1.5 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm",
                    "text-zinc-900 placeholder:text-zinc-400 focus-visible:border-[var(--nulance-purple)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]"
                  )}
                  placeholder="Texto completo do aviso…"
                />
              </div>
              <div>
                <Label htmlFor="aviso-tipo">Tipo</Label>
                <Select
                  id="aviso-tipo"
                  value={editing.tipo}
                  onValueChange={(v) =>
                    setEditing((s) => (s ? { ...s, tipo: v as AvisoTipo } : s))
                  }
                  options={TIPO_OPTIONS}
                  placeholder="Tipo"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="aviso-ordem">Ordem de exibição</Label>
                <Input
                  id="aviso-ordem"
                  type="number"
                  inputMode="numeric"
                  value={String(editing.ordem)}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setEditing((s) =>
                      s ? { ...s, ordem: Number.isFinite(n) ? n : 0 } : s
                    );
                  }}
                  className="mt-1.5"
                />
                <p className="mt-1 text-xs text-zinc-500">Números menores aparecem primeiro.</p>
              </div>
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => setSheetOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={saveSheet}>
                  Salvar
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Excluir aviso?"
        description={
          deleteTarget ? (
            <>
              O aviso <strong className="font-medium text-zinc-800">{deleteTarget.titulo}</strong> deixará de ser
              exibido para todos.
            </>
          ) : null
        }
        confirmLabel="Excluir"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
