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
  SheetSeparator,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  type LeiloeiroRow,
} from "@/lib/admin-leiloeiros";
import { formatCpfOuCnpjExibicao } from "@/lib/formatters";
import { verificarLeiloeiroDisponibilidadeAdmin } from "@/lib/repositories/admin-leiloeiros-repository";

type LeiloeiroFormErrors = {
  nome?: string;
  registro?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
};

const DISP_DEBOUNCE_MS = 450;

type LeiloeiroDispState = {
  registro: boolean | null;
  cpf: boolean | null;
  email: boolean | null;
  mensagemRegistro: string | null;
  mensagemCpf: string | null;
  mensagemEmail: string | null;
  loading: boolean;
};

function emptyDisp(): LeiloeiroDispState {
  return {
    registro: null,
    cpf: null,
    email: null,
    mensagemRegistro: null,
    mensagemCpf: null,
    mensagemEmail: null,
    loading: false,
  };
}

function computeLeiloeiroDispIncludes(
  mode: "create" | "edit",
  draft: LeiloeiroRow,
  row: LeiloeiroRow | null
): { includeReg: boolean; includeCpf: boolean; includeEmail: boolean } {
  const regTrim = draft.registro.trim();
  const cpfDig = digitsOnly(draft.documento);
  const emailTrim = draft.email.trim();
  const emailOk = isValidEmail(emailTrim);
  const cpfOk = cpfDig.length === 11 && isValidCpf(draft.documento);

  if (mode === "create") {
    return {
      includeReg: regTrim.length > 0,
      includeCpf: cpfOk,
      includeEmail: emailOk,
    };
  }
  if (!row) {
    return { includeReg: false, includeCpf: false, includeEmail: false };
  }
  const baseline = {
    registro: row.registro.trim(),
    cpfDigits: digitsOnly(row.documento),
    email: row.email.trim().toLowerCase(),
  };
  return {
    includeReg: regTrim.length > 0 && regTrim !== baseline.registro,
    includeCpf: cpfOk && cpfDig !== baseline.cpfDigits,
    includeEmail: emailOk && emailTrim.toLowerCase() !== baseline.email,
  };
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
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
  draft,
  setDraft,
  onSubmit,
  onCancel,
  isSaving,
  errors,
  submitLabel = "Salvar alterações",
  avail,
}: {
  draft: LeiloeiroRow;
  setDraft: React.Dispatch<React.SetStateAction<LeiloeiroRow | null>>;
  onSubmit: () => void;
  onCancel: () => void;
  isSaving: boolean;
  errors: LeiloeiroFormErrors;
  submitLabel?: string;
  avail: {
    errorRegistro: boolean;
    errorCpf: boolean;
    errorEmail: boolean;
    msgRegistro: string | null;
    msgCpf: string | null;
    msgEmail: string | null;
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
        <Label htmlFor="lei-nome">Nome</Label>
        <Input
          id="lei-nome"
          value={draft.nome}
          onChange={(e) => setDraft((d) => (d ? { ...d, nome: e.target.value } : d))}
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
          value={draft.registro}
          onChange={(e) => setDraft((d) => (d ? { ...d, registro: e.target.value } : d))}
          className="mt-1 rounded-2xl"
          placeholder="Ex.: SP-00000-J"
          disabled={isSaving}
          error={avail.errorRegistro}
        />
        {errors.registro ? <p className="mt-1 text-xs text-red-600">{errors.registro}</p> : null}
        {avail.errorRegistro && avail.msgRegistro ? (
          <p className="mt-1 text-xs font-medium text-red-600">{avail.msgRegistro}</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="lei-doc">CPF</Label>
        <Input
          id="lei-doc"
          value={draft.documento}
          onChange={(e) =>
            setDraft((d) => (d ? { ...d, documento: maskCpf(e.target.value) } : d))
          }
          className="mt-1 rounded-2xl"
          inputMode="numeric"
          placeholder="000.000.000-00"
          disabled={isSaving}
          error={avail.errorCpf}
        />
        {errors.cpf ? <p className="mt-1 text-xs text-red-600">{errors.cpf}</p> : null}
        {avail.errorCpf && avail.msgCpf ? (
          <p className="mt-1 text-xs font-medium text-red-600">{avail.msgCpf}</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="lei-email">E-mail</Label>
        <Input
          id="lei-email"
          type="email"
          value={draft.email}
          onChange={(e) =>
            setDraft((d) => (d ? { ...d, email: e.target.value } : d))
          }
          onBlur={() =>
            setDraft((d) => (d ? { ...d, email: d.email.trim().toLowerCase() } : d))
          }
          className="mt-1 rounded-2xl"
          autoComplete="email"
          disabled={isSaving}
          error={avail.errorEmail}
        />
        {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
        {avail.errorEmail && avail.msgEmail ? (
          <p className="mt-1 text-xs font-medium text-red-600">{avail.msgEmail}</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="lei-tel">Telefone</Label>
        <Input
          id="lei-tel"
          value={draft.telefone}
          onChange={(e) =>
            setDraft((d) => (d ? { ...d, telefone: maskTelefone(e.target.value) } : d))
          }
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
          onValueChange={(v) =>
            setDraft((d) => (d ? { ...d, localPrincipal: v } : d))
          }
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
          disabled={isSaving || avail.submitExtraDisabled}
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
  const [disp, setDisp] = React.useState<LeiloeiroDispState>(() => emptyDisp());
  const rowRef = React.useRef(row);
  rowRef.current = row;

  React.useLayoutEffect(() => {
    if (!open) {
      setDraft(null);
      setIsSaving(false);
      setErrors({});
      setDisp(emptyDisp());
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

  React.useEffect(() => {
    if (!open || !draft || mode === "details") return;

    const formMode = mode === "create" ? "create" : "edit";
    const baselineRow = mode === "edit" ? row : null;
    const { includeReg, includeCpf, includeEmail } = computeLeiloeiroDispIncludes(
      formMode,
      draft,
      baselineRow
    );
    const regTrim = draft.registro.trim();
    const cpfDig = digitsOnly(draft.documento);
    const emailTrim = draft.email.trim();

    const h = window.setTimeout(() => {
      void (async () => {
        if (!includeReg && !includeCpf && !includeEmail) {
          setDisp(emptyDisp());
          return;
        }

        setDisp((d) => ({ ...d, loading: true }));
        try {
          const res = await verificarLeiloeiroDisponibilidadeAdmin({
            registroProfissional: includeReg ? regTrim : undefined,
            cpfSomenteDigitos: includeCpf ? cpfDig : undefined,
            email: includeEmail ? emailTrim : undefined,
          });
          setDisp({
            loading: false,
            registro: includeReg ? res.registroDisponivel : null,
            cpf: includeCpf ? res.cpfDisponivel : null,
            email: includeEmail ? res.emailDisponivel : null,
            mensagemRegistro: includeReg ? res.mensagemRegistro ?? null : null,
            mensagemCpf: includeCpf ? res.mensagemCpf ?? null : null,
            mensagemEmail: includeEmail ? res.mensagemEmail ?? null : null,
          });
        } catch {
          setDisp({
            loading: false,
            registro: includeReg ? false : null,
            cpf: includeCpf ? false : null,
            email: includeEmail ? false : null,
            mensagemRegistro: includeReg ? "Não foi possível verificar o registro." : null,
            mensagemCpf: includeCpf ? "Não foi possível verificar o CPF." : null,
            mensagemEmail: includeEmail ? "Não foi possível verificar o e-mail." : null,
          });
        }
      })();
    }, DISP_DEBOUNCE_MS);

    return () => window.clearTimeout(h);
  }, [
    open,
    mode,
    draft?.registro,
    draft?.documento,
    draft?.email,
    row?.id,
    row?.registro,
    row?.documento,
    row?.email,
  ]);

  const includesForSubmit =
    draft && mode !== "details"
      ? computeLeiloeiroDispIncludes(mode === "create" ? "create" : "edit", draft, mode === "edit" ? row : null)
      : { includeReg: false, includeCpf: false, includeEmail: false };

  const dispBloqueiaSubmit =
    disp.loading ||
    (includesForSubmit.includeReg && disp.registro !== true) ||
    (includesForSubmit.includeCpf && disp.cpf !== true) ||
    (includesForSubmit.includeEmail && disp.email !== true);

  const availUi =
    draft && mode !== "details"
      ? {
          errorRegistro: includesForSubmit.includeReg && disp.registro === false,
          errorCpf: includesForSubmit.includeCpf && disp.cpf === false,
          errorEmail: includesForSubmit.includeEmail && disp.email === false,
          msgRegistro: disp.mensagemRegistro,
          msgCpf: disp.mensagemCpf,
          msgEmail: disp.mensagemEmail,
          submitExtraDisabled: dispBloqueiaSubmit,
        }
      : {
          errorRegistro: false,
          errorCpf: false,
          errorEmail: false,
          msgRegistro: null,
          msgCpf: null,
          msgEmail: null,
          submitExtraDisabled: false,
        };

  const handleSave = React.useCallback(async () => {
    if (!draft || isSaving) return;
    const nome = draft.nome.trim();
    const email = draft.email.trim();
    const cpf = draft.documento.trim();
    const telefone = draft.telefone.trim();

    const nextErrors: LeiloeiroFormErrors = {};
    if (!nome) nextErrors.nome = "Nome é obrigatório.";
    else if (looksLikeEmail(nome)) nextErrors.nome = "Nome não pode estar em formato de e-mail.";

    if (!draft.registro.trim()) nextErrors.registro = "Registro profissional é obrigatório.";

    if (!cpf) nextErrors.cpf = "CPF é obrigatório.";
    else if (!isValidCpf(cpf)) nextErrors.cpf = "CPF inválido.";

    if (!email) nextErrors.email = "E-mail é obrigatório.";
    else if (!isValidEmail(email)) nextErrors.email = "E-mail inválido.";

    if (!isValidTelefone(telefone)) {
      nextErrors.telefone = "Telefone inválido. Use 10 ou 11 dígitos com DDD.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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
            draft={draft}
            setDraft={setDraft}
            onSubmit={() => void handleSave()}
            onCancel={safeClose}
            isSaving={isSaving}
            errors={errors}
            submitLabel={mode === "create" ? "Cadastrar leiloeiro" : "Salvar alterações"}
            avail={availUi}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
