"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectSearch } from "@/components/ui/select-search";
import { CIDADES_BRASIL_OPTIONS } from "@/data/cidades-brasil";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  type LeiloeiroRow,
} from "@/lib/admin-leiloeiros";
import { formatCpfOuCnpjExibicao } from "@/lib/formatters";

type LeiloeiroFormErrors = {
  nome?: string;
  registro?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Lê valores atuais do DOM (evita submit por Enter com estado React defasado). */
function readLeiloeiroSnapshotFromForm(form: HTMLFormElement | null, draft: LeiloeiroRow): LeiloeiroRow {
  if (!form) return draft;
  const inputVal = (name: string) => form.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.value;
  const checked = form.querySelector<HTMLInputElement>('input[name="leiloeiro_ativo"][type="checkbox"]')?.checked;
  return {
    ...draft,
    nome: inputVal("leiloeiro_nome") ?? draft.nome,
    registro: inputVal("leiloeiro_registro") ?? draft.registro,
    documento: inputVal("leiloeiro_documento") ?? draft.documento,
    email: inputVal("leiloeiro_email") ?? draft.email,
    telefone: inputVal("leiloeiro_telefone") ?? draft.telefone,
    ativo: typeof checked === "boolean" ? checked : draft.ativo,
  };
}

function maskCpf(value: string): string {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskTelefone(value: string): string {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatTelefoneForDisplay(value: string): string {
  if (!value) return "";
  return maskTelefone(value);
}

function isValidCpf(value: string): boolean {
  const cpf = digitsOnly(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i += 1) soma += Number(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i += 1) soma += Number(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(cpf[10]);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function looksLikeEmail(value: string): boolean {
  return /@/.test(value) || isValidEmail(value);
}

function isValidTelefone(value: string): boolean {
  if (!value.trim()) return true;
  const len = digitsOnly(value).length;
  return len === 10 || len === 11;
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/80 px-3.5 py-3 ring-1 ring-zinc-100/90 shadow-sm shadow-black/[0.02]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">{label}</p>
      <div className="mt-1.5 text-sm font-medium leading-snug text-zinc-900">{children}</div>
    </div>
  );
}

function DetailsBody({ row }: { row: LeiloeiroRow }) {
  return (
    <div className="flex flex-col gap-3 px-2 pb-2">
      <DetailField label="Nome">{row.nome}</DetailField>
      <DetailField label="Registro">{row.registro}</DetailField>
      <DetailField label="Documento">
        <span className="tabular-nums">{formatCpfOuCnpjExibicao(row.documento)}</span>
      </DetailField>
      <DetailField label="E-mail">{row.email}</DetailField>
      <DetailField label="Telefone">{formatTelefoneForDisplay(row.telefone)}</DetailField>
      <DetailField label="Status">{row.ativo ? "Ativo" : "Inativo"}</DetailField>
      <DetailField label="Local principal">{row.localPrincipal}</DetailField>
    </div>
  );
}

export function emptyLeiloeiroDraft(): LeiloeiroRow {
  return {
    id: "",
    nome: "",
    registro: "",
    documento: "",
    email: "",
    telefone: "",
    localPrincipal: "",
    ativo: true,
    leiloesVinculados: 0,
  };
}

function EditBody({
  formRef,
  draft,
  setDraft,
  clearFieldError,
  onSubmit,
  onCancel,
  isSaving,
  errors,
  submitLabel = "Salvar alterações",
}: {
  formRef: React.RefObject<HTMLFormElement | null>;
  draft: LeiloeiroRow;
  setDraft: React.Dispatch<React.SetStateAction<LeiloeiroRow | null>>;
  clearFieldError: (key: keyof LeiloeiroFormErrors) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSaving: boolean;
  errors: LeiloeiroFormErrors;
  submitLabel?: string;
}) {
  return (
    <form
      ref={formRef}
      className="flex flex-col gap-4 px-2 pb-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (isSaving) return;
        onSubmit();
      }}
    >
      <div>
        <Label htmlFor="lei-nome">Nome</Label>
        <Input
          id="lei-nome"
          name="leiloeiro_nome"
          value={draft.nome}
          onChange={(e) => {
            clearFieldError("nome");
            setDraft((d) => (d ? { ...d, nome: e.target.value } : d));
          }}
          className="mt-1 rounded-2xl"
          autoComplete="name"
          disabled={isSaving}
        />
        {errors.nome ? <p className="mt-1 text-xs text-red-600">{errors.nome}</p> : null}
      </div>
      <div>
        <Label htmlFor="lei-reg">Registro profissional</Label>
        <Input
          id="lei-reg"
          name="leiloeiro_registro"
          value={draft.registro}
          onChange={(e) => {
            clearFieldError("registro");
            setDraft((d) => (d ? { ...d, registro: e.target.value } : d));
          }}
          className="mt-1 rounded-2xl"
          placeholder="Ex.: SP-00000-J"
          autoComplete="off"
          disabled={isSaving}
        />
        {errors.registro ? <p className="mt-1 text-xs text-red-600">{errors.registro}</p> : null}
      </div>
      <div>
        <Label htmlFor="lei-doc">CPF</Label>
        <Input
          id="lei-doc"
          name="leiloeiro_documento"
          value={draft.documento}
          onChange={(e) => {
            clearFieldError("cpf");
            setDraft((d) => (d ? { ...d, documento: maskCpf(e.target.value) } : d));
          }}
          className="mt-1 rounded-2xl"
          inputMode="numeric"
          placeholder="000.000.000-00"
          disabled={isSaving}
        />
        {errors.cpf ? <p className="mt-1 text-xs text-red-600">{errors.cpf}</p> : null}
      </div>
      <div>
        <Label htmlFor="lei-email">E-mail</Label>
        <Input
          id="lei-email"
          name="leiloeiro_email"
          type="email"
          value={draft.email}
          onChange={(e) => {
            clearFieldError("email");
            setDraft((d) => (d ? { ...d, email: e.target.value } : d));
          }}
          onBlur={() =>
            setDraft((d) => (d ? { ...d, email: d.email.trim().toLowerCase() } : d))
          }
          className="mt-1 rounded-2xl"
          autoComplete="email"
          disabled={isSaving}
        />
        {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
      </div>
      <div>
        <Label htmlFor="lei-tel">Telefone</Label>
        <Input
          id="lei-tel"
          name="leiloeiro_telefone"
          value={draft.telefone}
          onChange={(e) => {
            clearFieldError("telefone");
            setDraft((d) => (d ? { ...d, telefone: maskTelefone(e.target.value) } : d));
          }}
          className="mt-1 rounded-2xl"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="(00) 00000-0000"
          disabled={isSaving}
        />
        {errors.telefone ? <p className="mt-1 text-xs text-red-600">{errors.telefone}</p> : null}
      </div>
      <div className="flex items-center gap-2.5 rounded-2xl bg-zinc-50 px-3 py-3 ring-1 ring-zinc-100">
        <input
          id="lei-ativo"
          name="leiloeiro_ativo"
          type="checkbox"
          checked={draft.ativo}
          onChange={(e) => setDraft((d) => (d ? { ...d, ativo: e.target.checked } : d))}
          className="h-4 w-4 rounded border-zinc-300 text-[var(--nulance-purple)] focus:ring-[var(--ring)]"
          disabled={isSaving}
        />
        <Label htmlFor="lei-ativo" className="mb-0 cursor-pointer text-zinc-800">
          Ativo na plataforma
        </Label>
      </div>
      <div>
        <Label htmlFor="lei-local">Local principal</Label>
        <SelectSearch
          id="lei-local"
          className="mt-1"
          value={draft.localPrincipal}
          onValueChange={(v) => setDraft((d) => (d ? { ...d, localPrincipal: v } : d))}
          options={CIDADES_BRASIL_OPTIONS}
          placeholder="Selecione a cidade…"
          searchPlaceholder="Buscar cidade ou UF…"
          aria-label="Local principal"
          disabled={isSaving}
        />
      </div>
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
          disabled={isSaving}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export type LeiloeiroSheetMode = "details" | "edit" | "create";

export type LeiloeiroSaveAction = "create" | "update";

export function LeiloeiroSheet({
  open,
  onClose,
  mode,
  row,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  mode: LeiloeiroSheetMode;
  row: LeiloeiroRow | null;
  onSave: (next: LeiloeiroRow, action: LeiloeiroSaveAction) => void | Promise<void>;
}) {
  const [draft, setDraft] = React.useState<LeiloeiroRow | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<LeiloeiroFormErrors>({});
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const rowRef = React.useRef(row);
  rowRef.current = row;

  const clearFieldError = React.useCallback((key: keyof LeiloeiroFormErrors) => {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  React.useLayoutEffect(() => {
    if (!open) {
      setDraft(null);
      setIsSaving(false);
      setErrors({});
      return;
    }
    if (mode === "create") {
      setDraft(emptyLeiloeiroDraft());
      return;
    }
    const current = rowRef.current;
    if (!current) return;
    if (mode === "edit") {
      setDraft({
        ...current,
        documento: maskCpf(current.documento),
        telefone: maskTelefone(current.telefone),
      });
    } else {
      setDraft(null);
    }
  }, [open, row?.id, mode]);

  const handleSave = React.useCallback(async () => {
    if (!draft || isSaving) return;
    const merged = readLeiloeiroSnapshotFromForm(formRef.current, draft);

    const nome = merged.nome.trim();
    const registro = merged.registro.trim();
    const email = merged.email.trim();
    const cpf = merged.documento.trim();
    const telefone = merged.telefone.trim();

    const nextErrors: LeiloeiroFormErrors = {};
    if (!nome) nextErrors.nome = "Nome é obrigatório.";
    else if (looksLikeEmail(nome)) nextErrors.nome = "Nome não pode estar em formato de e-mail.";

    if (!registro) nextErrors.registro = "Registro profissional é obrigatório.";

    if (!cpf) nextErrors.cpf = "CPF é obrigatório.";
    else if (!isValidCpf(cpf)) nextErrors.cpf = "CPF inválido.";

    if (!email) nextErrors.email = "E-mail é obrigatório.";
    else if (!isValidEmail(email)) nextErrors.email = "E-mail inválido.";

    if (!isValidTelefone(telefone)) {
      nextErrors.telefone = "Telefone inválido. Use 10 ou 11 dígitos com DDD.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setDraft(merged);
      return;
    }

    const base: LeiloeiroRow = {
      ...merged,
      nome,
      registro,
      documento: cpf,
      email,
      telefone,
      localPrincipal: merged.localPrincipal.trim(),
    };
    setIsSaving(true);
    try {
      if (mode === "create") {
        await onSave(base, "create");
      } else {
        await onSave({ ...base, id: merged.id }, "update");
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  }, [draft, isSaving, mode, onClose, onSave, row]);

  const safeClose = React.useCallback(() => {
    if (isSaving) return;
    onClose();
  }, [isSaving, onClose]);

  const title =
    mode === "details"
      ? "Detalhes do leiloeiro"
      : mode === "create"
        ? "Novo leiloeiro"
        : "Editar leiloeiro";
  const description =
    mode === "details"
      ? "Informações cadastrais e leilões vinculados."
      : mode === "create"
        ? "Preencha os dados para incluir um novo leiloeiro."
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
            formRef={formRef}
            draft={draft}
            setDraft={setDraft}
            clearFieldError={clearFieldError}
            onSubmit={() => void handleSave()}
            onCancel={safeClose}
            isSaving={isSaving}
            errors={errors}
            submitLabel={mode === "create" ? "Cadastrar leiloeiro" : "Salvar alterações"}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
