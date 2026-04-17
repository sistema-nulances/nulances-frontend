"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SelectSearch } from "@/components/ui/select-search";
import { CIDADES_BRASIL_OPTIONS } from "@/data/cidades-brasil";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetSeparator,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  comitenteLotesFromApi,
  type ComitenteRow,
  type ComitenteTipo,
} from "@/lib/admin-comitentes";
import { verificarComitenteDisponibilidadeAdmin } from "@/lib/repositories/admin-comitentes-repository";

const TIPOS: ComitenteTipo[] = ["Banco", "Seguradora", "Empresa", "Pessoa Física"];

const DISP_DEBOUNCE_MS = 450;

type ComitenteDispState = {
  documento: boolean | null;
  mensagem: string | null;
  loading: boolean;
};

function emptyComitenteDisp(): ComitenteDispState {
  return { documento: null, mensagem: null, loading: false };
}

function computeComitenteDocInclude(
  mode: "create" | "edit",
  draft: ComitenteRow,
  row: ComitenteRow | null
): boolean {
  const doc = draft.documento.trim();
  if (!doc) return false;
  if (mode === "create") return true;
  if (!row) return false;
  return doc !== row.documento.trim();
}

function tipoExibicao(tipo: ComitenteTipo) {
  return tipo === "Pessoa Física" ? "PF (Pessoa física)" : tipo;
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/80 px-3.5 py-3 ring-1 ring-zinc-100/90 shadow-sm shadow-black/[0.02]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">{label}</p>
      <div className="mt-1.5 text-sm font-medium leading-snug text-zinc-900">{children}</div>
    </div>
  );
}

function LotesSection({ row, children }: { row: ComitenteRow; children: React.ReactNode }) {
  const hasLotes = row.totalLotes > 0;

  return (
    <div className="rounded-[22px] border border-[var(--nulance-purple)]/20 bg-gradient-to-br from-[var(--nulance-purple)]/[0.08] via-white/95 to-zinc-50/50 p-4 shadow-sm ring-1 ring-black/[0.04]">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-[var(--nulance-purple)]/10 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--nulance-purple)]">
          Lotes
        </p>
        {hasLotes ? (
          <Link
            href={`/admin/dashboard?comitente=${encodeURIComponent(row.id)}`}
            className="shrink-0 text-sm font-semibold text-[var(--nulance-purple)] underline decoration-[var(--nulance-purple)]/50 underline-offset-[3px] transition hover:decoration-[var(--nulance-purple)]"
          >
            Ver lotes
          </Link>
        ) : null}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function DetailsBody({ row }: { row: ComitenteRow }) {
  return (
    <div className="flex flex-col gap-3 px-2 pb-2">
      <DetailField label="Nome">{row.nome}</DetailField>
      <DetailField label="Tipo">{tipoExibicao(row.tipo)}</DetailField>
      <DetailField label="Documento">{row.documento}</DetailField>
      <DetailField label="Status">{row.ativo ? "Ativo" : "Inativo"}</DetailField>
      <DetailField label="Sede / principal">{row.localPrincipal}</DetailField>
      <SheetSeparator />
      <LotesSection row={row}>
        <DetailField label="Total de lotes">{row.totalLotes}</DetailField>
        <div className="grid grid-cols-3 gap-2">
          <DetailField label="Abertos">{row.lotesAbertos}</DetailField>
          <DetailField label="Em breve">{row.lotesEmBreve}</DetailField>
          <DetailField label="Encerrados">{row.lotesEncerrados}</DetailField>
        </div>
      </LotesSection>
    </div>
  );
}

export function emptyComitenteDraft(): ComitenteRow {
  return {
    id: "",
    nome: "",
    tipo: "Empresa",
    documento: "",
    ativo: true,
    localPrincipal: "",
    ...comitenteLotesFromApi(),
  };
}

function EditBody({
  draft,
  setDraft,
  onSubmit,
  onCancel,
  isSaving,
  submitLabel = "Salvar alterações",
  avail,
}: {
  draft: ComitenteRow;
  setDraft: React.Dispatch<React.SetStateAction<ComitenteRow | null>>;
  onSubmit: () => void;
  onCancel: () => void;
  isSaving: boolean;
  submitLabel?: string;
  avail: {
    errorDocumento: boolean;
    msgDocumento: string | null;
    submitExtraDisabled: boolean;
  };
}) {
  return (
    <form
      className="flex flex-col gap-4 px-2 pb-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <Label htmlFor="cmt-nome">Nome</Label>
        <Input
          id="cmt-nome"
          value={draft.nome}
          onChange={(e) => setDraft((d) => (d ? { ...d, nome: e.target.value } : d))}
          className="mt-1 rounded-2xl"
          autoComplete="organization"
          disabled={isSaving}
        />
      </div>
      <div>
        <Label htmlFor="cmt-tipo">Tipo</Label>
        <Select
          id="cmt-tipo"
          value={draft.tipo}
          onValueChange={(v) =>
            setDraft((d) => (d ? { ...d, tipo: v as ComitenteTipo } : d))
          }
          options={TIPOS.map((t) => ({ value: t, label: tipoExibicao(t) }))}
          className="mt-1"
          disabled={isSaving}
        />
      </div>
      <div>
        <Label htmlFor="cmt-doc">Documento</Label>
        <Input
          id="cmt-doc"
          value={draft.documento}
          onChange={(e) => setDraft((d) => (d ? { ...d, documento: e.target.value } : d))}
          className="mt-1 rounded-2xl"
          disabled={isSaving}
          error={avail.errorDocumento}
        />
        {avail.errorDocumento && avail.msgDocumento ? (
          <p className="mt-1 text-xs font-medium text-red-600">{avail.msgDocumento}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2.5 rounded-2xl bg-zinc-50 px-3 py-3 ring-1 ring-zinc-100">
        <input
          id="cmt-ativo"
          type="checkbox"
          checked={draft.ativo}
          onChange={(e) => setDraft((d) => (d ? { ...d, ativo: e.target.checked } : d))}
          className="h-4 w-4 rounded border-zinc-300 text-[var(--nulance-purple)] focus:ring-[var(--ring)]"
          disabled={isSaving}
        />
        <Label htmlFor="cmt-ativo" className="mb-0 cursor-pointer text-zinc-800">
          Ativo na plataforma
        </Label>
      </div>
      <div>
        <Label htmlFor="cmt-local">Sede / principal</Label>
        <SelectSearch
          id="cmt-local"
          className="mt-1"
          value={draft.localPrincipal}
          onValueChange={(v) =>
            setDraft((d) => (d ? { ...d, localPrincipal: v } : d))
          }
          options={CIDADES_BRASIL_OPTIONS}
          placeholder="Selecione a cidade…"
          searchPlaceholder="Buscar cidade ou UF…"
          aria-label="Sede ou local principal"
          disabled={isSaving}
        />
      </div>
      <SheetSeparator />
      <LotesSection row={draft}>
        <DetailField label="Total de lotes">{draft.totalLotes}</DetailField>
        <div className="grid grid-cols-3 gap-2">
          <DetailField label="Abertos">{draft.lotesAbertos}</DetailField>
          <DetailField label="Em breve">{draft.lotesEmBreve}</DetailField>
          <DetailField label="Encerrados">{draft.lotesEncerrados}</DetailField>
        </div>
      </LotesSection>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="rounded-full"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="md"
          className="rounded-full"
          loading={isSaving}
          disabled={isSaving || avail.submitExtraDisabled}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export type ComitenteSheetMode = "details" | "edit" | "create";

export type ComitenteSaveAction = "create" | "update";

export function ComitenteSheet({
  open,
  onClose,
  mode,
  row,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  mode: ComitenteSheetMode;
  row: ComitenteRow | null;
  onSave: (next: ComitenteRow, action: ComitenteSaveAction) => void | Promise<void>;
}) {
  const [draft, setDraft] = React.useState<ComitenteRow | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [disp, setDisp] = React.useState<ComitenteDispState>(() => emptyComitenteDisp());
  const rowRef = React.useRef(row);
  rowRef.current = row;

  React.useLayoutEffect(() => {
    if (!open) {
      setDraft(null);
      setIsSaving(false);
      setDisp(emptyComitenteDisp());
      return;
    }
    if (mode === "create") {
      setDraft(emptyComitenteDraft());
      return;
    }
    const current = rowRef.current;
    if (!current) return;
    if (mode === "edit") {
      setDraft({ ...current });
    } else {
      setDraft(null);
    }
  }, [open, row?.id, mode]);

  React.useEffect(() => {
    if (!open || !draft || mode === "details") return;

    const formMode = mode === "create" ? "create" : "edit";
    const baselineRow = mode === "edit" ? row : null;
    const includeDoc = computeComitenteDocInclude(formMode, draft, baselineRow);
    const docTrim = draft.documento.trim();

    const h = window.setTimeout(() => {
      void (async () => {
        if (!includeDoc) {
          setDisp(emptyComitenteDisp());
          return;
        }

        setDisp((d) => ({ ...d, loading: true }));
        try {
          const res = await verificarComitenteDisponibilidadeAdmin(docTrim);
          setDisp({
            loading: false,
            documento: res.disponivel,
            mensagem: res.mensagem ?? null,
          });
        } catch {
          setDisp({
            loading: false,
            documento: false,
            mensagem: "Não foi possível verificar o documento.",
          });
        }
      })();
    }, DISP_DEBOUNCE_MS);

    return () => window.clearTimeout(h);
  }, [open, mode, draft?.documento, row?.id, row?.documento]);

  const includeDocForSubmit =
    draft && mode !== "details"
      ? computeComitenteDocInclude(mode === "create" ? "create" : "edit", draft, mode === "edit" ? row : null)
      : false;

  const documentoVazio = !draft?.documento.trim();
  const dispBloqueiaSubmit =
    disp.loading || (includeDocForSubmit && disp.documento !== true) || documentoVazio;

  const availUi =
    draft && mode !== "details"
      ? {
          errorDocumento: includeDocForSubmit && disp.documento === false,
          msgDocumento: disp.mensagem,
          submitExtraDisabled: dispBloqueiaSubmit,
        }
      : {
          errorDocumento: false,
          msgDocumento: null,
          submitExtraDisabled: false,
        };

  const handleSave = React.useCallback(async () => {
    if (!draft || isSaving) return;
    const nome = draft.nome.trim();
    if (!nome) return;
    if (!draft.documento.trim()) return;
    if (dispBloqueiaSubmit) return;
    const base = { ...draft, nome };
    setIsSaving(true);
    try {
      if (mode === "create") {
        await onSave(base, "create");
      } else {
        await onSave({ ...base, id: draft.id }, "update");
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  }, [draft, dispBloqueiaSubmit, isSaving, mode, onClose, onSave]);

  const safeClose = React.useCallback(() => {
    if (isSaving) return;
    onClose();
  }, [isSaving, onClose]);

  const title =
    mode === "details"
      ? "Detalhes do comitente"
      : mode === "create"
        ? "Novo comitente"
        : "Editar comitente";
  const description =
    mode === "details"
      ? "Informações cadastrais e resumo dos lotes."
      : mode === "create"
        ? "Preencha os dados para incluir um novo comitente."
        : "Altere os dados cadastrais e salve.";

  return (
    <Sheet open={open} onClose={safeClose} side="right">
      <SheetContent className="max-w-[min(100vw-1rem,460px)] !w-full" onClose={safeClose}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        {!row && mode !== "create" ? null : mode === "details" && row ? (
          <DetailsBody row={row} />
        ) : draft && (mode === "edit" || mode === "create") ? (
          <EditBody
            draft={draft}
            setDraft={setDraft}
            onSubmit={() => void handleSave()}
            onCancel={safeClose}
            isSaving={isSaving}
            submitLabel={mode === "create" ? "Cadastrar comitente" : "Salvar alterações"}
            avail={availUi}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
