"use client";

import * as React from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SelectSearch } from "@/components/ui/select-search";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetSeparator,
  SheetTitle,
} from "@/components/ui/sheet";
import { CIDADES_BRASIL_OPTIONS } from "@/data/cidades-brasil";
import type { LeilaoModalidade } from "@/data/leiloes-admin";
import { cn } from "@/lib/cn";
import type { LeilaoCreateRequest } from "@/lib/repositories/types/leilao.types";
import {
  formatDateTimeLocalSaoPaulo,
  formatDateTimePtBrSaoPaulo,
  parseDateTimeLocalSaoPaulo,
} from "@/lib/sao-paulo-datetime";

/** Para `min` em inputs: usa o maior valor entre `a` e `floor` (datetime-local em fuso de São Paulo). */
function maxDatetimeLocal(a: string, floor: string): string {
  if (!a.trim()) return floor;
  const ta = parseDateTimeLocalSaoPaulo(a).getTime();
  const tf = parseDateTimeLocalSaoPaulo(floor).getTime();
  if (Number.isNaN(ta) || Number.isNaN(tf)) return floor;
  return ta >= tf ? a : floor;
}

/** Garante que o valor não fique antes do piso (o picker nativo nem sempre bloqueia horas passadas no mesmo dia). */
function clampDatetimeLocal(value: string, floor: Date): string {
  if (!value.trim()) return value;
  const v = parseDateTimeLocalSaoPaulo(value);
  if (Number.isNaN(v.getTime())) return value;
  if (v.getTime() < floor.getTime()) return formatDateTimeLocalSaoPaulo(floor);
  return value;
}

function fechaDisputaFloor(abre: string, now: Date): Date {
  if (!abre.trim()) return now;
  const a = parseDateTimeLocalSaoPaulo(abre);
  if (Number.isNaN(a.getTime())) return now;
  return new Date(Math.max(a.getTime(), now.getTime()));
}

function fimLeilaoFloor(inicio: string, now: Date): Date {
  if (!inicio.trim()) return now;
  const a = parseDateTimeLocalSaoPaulo(inicio);
  if (Number.isNaN(a.getTime())) return now;
  return new Date(Math.max(a.getTime(), now.getTime()));
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function aberturaBemFloor(
  bens: Array<{ abre: string; fecha: string }>,
  idx: number,
  now: Date
): Date {
  if (idx <= 0) return now;
  const prevFechaRaw = bens[idx - 1]?.fecha ?? "";
  if (!prevFechaRaw.trim()) return now;
  const prevFecha = parseDateTimeLocalSaoPaulo(prevFechaRaw);
  if (Number.isNaN(prevFecha.getTime())) return now;
  const plusFive = addMinutes(prevFecha, 5);
  return new Date(Math.max(plusFive.getTime(), now.getTime()));
}

type AgendaRow = {
  key: string;
  loteId: string;
  bens: Array<{
    bemId: string;
    bemLabel: string;
    valorInicial: string;
    incrementoMinimo: string;
    abre: string;
    fecha: string;
  }>;
};

function newAgendaRowKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `ag-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `ag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyAgendaRow(): AgendaRow {
  return {
    key: newAgendaRowKey(),
    loteId: "",
    bens: [],
  };
}

/** Apenas dígitos (reais inteiros). */
function normalizeCurrencyInput(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  if (!digits) return "";
  const cents = Number.parseInt(digits, 10);
  const value = cents / 100;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCurrencyPositivo(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  const cents = Number.parseInt(digits, 10);
  if (!Number.isFinite(cents) || cents <= 0) return null;
  return cents / 100;
}

function isRowPautaValid(r: AgendaRow): boolean {
  if (!r.loteId || r.bens.length === 0) return false;
  return r.bens.every((b) => {
    if (parseCurrencyPositivo(b.valorInicial) == null) return false;
    if (parseCurrencyPositivo(b.incrementoMinimo) == null) return false;
    if (!b.abre.trim() || !b.fecha.trim()) return false;
    const abre = parseDateTimeLocalSaoPaulo(b.abre);
    const fecha = parseDateTimeLocalSaoPaulo(b.fecha);
    return !Number.isNaN(abre.getTime()) && !Number.isNaN(fecha.getTime()) && fecha.getTime() > abre.getTime();
  });
}

function isPautaProntaParaEvento(rows: AgendaRow[]): boolean {
  return rows.length > 0 && rows.every(isRowPautaValid);
}

function eventoDefaultsFromBens(rows: AgendaRow[]): { start: string; end: string } {
  const abres = rows.flatMap((r) => r.bens.map((b) => parseDateTimeLocalSaoPaulo(b.abre).getTime()));
  const fechas = rows.flatMap((r) => r.bens.map((b) => parseDateTimeLocalSaoPaulo(b.fecha).getTime()));
  const minT = Math.min(...abres);
  const maxT = Math.max(...fechas);
  return {
    start: formatDateTimeLocalSaoPaulo(new Date(minT)),
    end: formatDateTimeLocalSaoPaulo(new Date(maxT)),
  };
}

type NovoLeilaoValidation = { ok: boolean; errors: string[] };

function computeNovoLeilaoValidation(
  input: {
    titulo: string;
    modalidade: LeilaoModalidade;
    local: string;
    leiloeiroId: string;
    comitenteId: string;
    agendaRows: AgendaRow[];
    eventoInicio: string;
    eventoFim: string;
  },
  now: Date
): NovoLeilaoValidation {
  const errors: string[] = [];
  if (!input.titulo.trim()) errors.push("Informe o título do evento.");
  if (input.modalidade === "presencial" && !input.local.trim()) {
    errors.push("Selecione a cidade do pregão presencial.");
  }
  if (!input.leiloeiroId.trim()) errors.push("Selecione o leiloeiro responsável.");
  if (!input.comitenteId.trim()) errors.push("Selecione o comitente.");

  const rows = input.agendaRows;
  if (rows.length === 0) {
    errors.push("Inclua pelo menos um bem na pauta.");
  }

  const nowMs = now.getTime();
  const pautaPronta = isPautaProntaParaEvento(rows);

  for (let i = 0; i < rows.length; i++) {
    const n = i + 1;
    const r = rows[i];
    if (!r.loteId || r.bens.length === 0) {
      errors.push(`Item ${n}: selecione um lote com bens válidos.`);
      continue;
    }
    for (const bem of r.bens) {
      const idxBem = r.bens.findIndex((b) => b.bemId === bem.bemId);
      const floorAbre = aberturaBemFloor(
        r.bens.map((b) => ({ abre: b.abre, fecha: b.fecha })),
        idxBem,
        now
      );
      if (parseCurrencyPositivo(bem.valorInicial) == null) {
        errors.push(`Item ${n} (${bem.bemLabel}): informe o valor inicial (R$) maior que zero.`);
        continue;
      }
      if (parseCurrencyPositivo(bem.incrementoMinimo) == null) {
        errors.push(`Item ${n} (${bem.bemLabel}): informe o incremento mínimo (R$) maior que zero.`);
        continue;
      }
      const abre = parseDateTimeLocalSaoPaulo(bem.abre);
      const fecha = parseDateTimeLocalSaoPaulo(bem.fecha);
      if (Number.isNaN(abre.getTime()) || Number.isNaN(fecha.getTime())) {
        errors.push(`Item ${n} (${bem.bemLabel}): datas de abertura ou encerramento inválidas.`);
        continue;
      }
      if (fecha.getTime() <= abre.getTime()) {
        errors.push(`Item ${n} (${bem.bemLabel}): encerramento deve ser depois da abertura.`);
      }
      if (abre.getTime() < floorAbre.getTime()) {
        errors.push(
          `Item ${n} (${bem.bemLabel}): abertura deve ser a partir de ${formatDateTimePtBrSaoPaulo(floorAbre)}.`
        );
      }
      if (fecha.getTime() < nowMs) {
        errors.push(
          `Item ${n} (${bem.bemLabel}): encerramento não pode ser anterior a ${formatDateTimePtBrSaoPaulo(now)}.`
        );
      }
    }
  }

  if (pautaPronta) {
    if (!input.eventoInicio.trim() || !input.eventoFim.trim()) {
      errors.push("Defina início e fim do período geral do leilão.");
    }
  }

  if (pautaPronta && input.eventoInicio.trim() && input.eventoFim.trim()) {
    const evInicio = parseDateTimeLocalSaoPaulo(input.eventoInicio);
    const evFim = parseDateTimeLocalSaoPaulo(input.eventoFim);
    if (Number.isNaN(evInicio.getTime()) || Number.isNaN(evFim.getTime())) {
      errors.push("Início ou fim do leilão com data/hora inválida.");
    } else {
      if (evInicio.getTime() < nowMs) {
        errors.push(
          `Início do leilão não pode ser anterior à data e hora atuais (${formatDateTimePtBrSaoPaulo(now)}).`
        );
      }
      if (evFim.getTime() < nowMs) {
        errors.push(
          `Fim do leilão não pode ser anterior à data e hora atuais (${formatDateTimePtBrSaoPaulo(now)}).`
        );
      }
      if (evFim.getTime() <= evInicio.getTime()) {
        errors.push("Fim do leilão deve ser posterior ao início.");
      }

      const abres = rows.flatMap((r) => r.bens.map((b) => parseDateTimeLocalSaoPaulo(b.abre).getTime()));
      const fechas = rows.flatMap((r) => r.bens.map((b) => parseDateTimeLocalSaoPaulo(b.fecha).getTime()));
      const primeiraAbre = Math.min(...abres);
      const ultimoEncerra = Math.max(...fechas);

      if (evInicio.getTime() < primeiraAbre) {
        errors.push(
          "Início do período geral não pode ser anterior à primeira abertura de disputa entre os bens."
        );
      }
      if (evFim.getTime() < ultimoEncerra) {
        errors.push(
          "Fim do leilão não pode ser anterior ao último encerramento de disputa entre os bens."
        );
      }
      for (let i = 0; i < rows.length; i++) {
        const n = i + 1;
        const r = rows[i];
        for (const bem of r.bens) {
          const abre = parseDateTimeLocalSaoPaulo(bem.abre).getTime();
          const fecha = parseDateTimeLocalSaoPaulo(bem.fecha).getTime();
          if (abre < evInicio.getTime() || fecha > evFim.getTime()) {
            errors.push(
              `Item ${n} (${bem.bemLabel}): abertura e encerramento devem ficar dentro do período geral.`
            );
          }
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export type NovoLeilaoLoteOption = {
  value: string;
  label: string;
  bens: Array<{ id: string; label: string }>;
};

export type NovoLeilaoSimpleOption = {
  value: string;
  label: string;
};

const MODALIDADE_OPTIONS: { value: LeilaoModalidade; label: string }[] = [
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Online" },
];

export function NovoLeilaoSheet({
  open,
  onClose,
  onSave,
  loteOptions,
  leiloeiroOptions,
  comitenteOptions,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: LeilaoCreateRequest) => void | Promise<void>;
  loteOptions: NovoLeilaoLoteOption[];
  leiloeiroOptions: NovoLeilaoSimpleOption[];
  comitenteOptions: NovoLeilaoSimpleOption[];
}) {
  const [now, setNow] = React.useState(() => new Date());
  const [titulo, setTitulo] = React.useState("");
  const [modalidade, setModalidade] = React.useState<LeilaoModalidade>("presencial");
  const [local, setLocal] = React.useState("");
  const [leiloeiroId, setLeiloeiroId] = React.useState("");
  const [comitenteId, setComitenteId] = React.useState("");
  const [eventoInicio, setEventoInicio] = React.useState("");
  const [eventoFim, setEventoFim] = React.useState("");
  const [agendaRows, setAgendaRows] = React.useState<AgendaRow[]>(() => [emptyAgendaRow()]);

  const prevPautaProntaRef = React.useRef(false);
  const eventoInicioRef = React.useRef(eventoInicio);
  eventoInicioRef.current = eventoInicio;

  const reset = React.useCallback(() => {
    prevPautaProntaRef.current = false;
    setTitulo("");
    setModalidade("presencial");
    setLocal("");
    setLeiloeiroId("");
    setComitenteId("");
    setEventoInicio("");
    setEventoFim("");
    setAgendaRows([emptyAgendaRow()]);
  }, []);

  React.useLayoutEffect(() => {
    if (open) {
      setNow(new Date());
      reset();
    }
  }, [open, reset]);

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(id);
  }, []);

  /** Mantém valores alinhados ao relógio (horários passados viram o piso atual). */
  React.useEffect(() => {
    if (!open) return;
    const n = new Date();
    setAgendaRows((rows) => {
      const next = rows.map((r) => {
        const bens = r.bens.map((b, idxBem) => {
          let abre = b.abre;
          let fecha = b.fecha;
          const floorAbre = aberturaBemFloor(
            r.bens.map((x) => ({ abre: x.abre, fecha: x.fecha })),
            idxBem,
            n
          );
          if (abre) {
            abre = clampDatetimeLocal(abre, floorAbre);
            if (fecha) {
              const floorF = fechaDisputaFloor(abre, n);
              fecha = clampDatetimeLocal(fecha, floorF);
            }
          }
          return { ...b, abre, fecha };
        });
        return { ...r, bens };
      });
      const unchanged =
        next.length === rows.length &&
        next.every(
          (row, i) =>
            row.bens.length === rows[i].bens.length &&
            row.bens.every(
              (b, bi) => b.abre === rows[i].bens[bi]?.abre && b.fecha === rows[i].bens[bi]?.fecha
            )
        );
      return unchanged ? rows : next;
    });
    setEventoInicio((prev) => {
      if (!prev) return prev;
      const c = clampDatetimeLocal(prev, n);
      return c === prev ? prev : c;
    });
    setEventoFim((prev) => {
      if (!prev) return prev;
      const floor = fimLeilaoFloor(eventoInicioRef.current, n);
      const c = clampDatetimeLocal(prev, floor);
      return c === prev ? prev : c;
    });
  }, [now, open]);

  React.useEffect(() => {
    const pronta = isPautaProntaParaEvento(agendaRows);
    if (!pronta) {
      setEventoInicio("");
      setEventoFim("");
      prevPautaProntaRef.current = false;
      return;
    }
    if (!prevPautaProntaRef.current) {
      const d = eventoDefaultsFromBens(agendaRows);
      setEventoInicio(d.start);
      setEventoFim(d.end);
    }
    prevPautaProntaRef.current = true;
  }, [agendaRows]);

  const pautaPronta = isPautaProntaParaEvento(agendaRows);
  const validation = React.useMemo(
    () =>
      computeNovoLeilaoValidation(
        {
          titulo,
          modalidade,
          local,
          leiloeiroId,
          comitenteId,
          agendaRows,
          eventoInicio,
          eventoFim,
        },
        now
      ),
    [titulo, modalidade, local, leiloeiroId, comitenteId, agendaRows, eventoInicio, eventoFim, now]
  );

  const minDateTimeLocal = formatDateTimeLocalSaoPaulo(now);

  const loteOptionsForRow = React.useCallback(
    (rowKey: string, currentId: string) => {
      const taken = new Set(
        agendaRows.filter((r) => r.key !== rowKey && r.loteId).map((r) => r.loteId)
      );
      return loteOptions.filter((o) => !taken.has(o.value) || o.value === currentId);
    },
    [agendaRows, loteOptions]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = computeNovoLeilaoValidation(
      {
        titulo,
        modalidade,
        local,
        leiloeiroId,
        comitenteId,
        agendaRows,
        eventoInicio,
        eventoFim,
      },
      new Date()
    );
    if (!v.ok) return;

    const lotesMap = new Map<string, LeilaoCreateRequest["lotes"][number]>();
    for (const r of agendaRows) {
      const lote = lotesMap.get(r.loteId) ?? { loteId: r.loteId, bens: [] };
      if (r.bens.length === 0) continue;
      for (const bem of r.bens) {
        lote.bens.push({
          bemId: bem.bemId,
          valorInicial: parseCurrencyPositivo(bem.valorInicial)!,
          incrementoMinimo: parseCurrencyPositivo(bem.incrementoMinimo)!,
          aberturaDisputa: parseDateTimeLocalSaoPaulo(bem.abre).toISOString(),
          encerramentoDisputa: parseDateTimeLocalSaoPaulo(bem.fecha).toISOString(),
        });
      }
      lotesMap.set(r.loteId, lote);
    }

    void Promise.resolve(
      onSave({
        titulo: titulo.trim(),
        formato: modalidade === "online" ? "ONLINE" : "PRESENCIAL",
        cidade: modalidade === "online" ? null : local.trim() || null,
        endereco: modalidade === "online" ? null : local.trim() || null,
        leiloeiroId,
        comitenteId,
        lotes: Array.from(lotesMap.values()),
      })
    ).then(() => onClose());
  };

  return (
    <Sheet open={open} onClose={onClose} side="right">
      <SheetContent className="max-w-[min(100vw-1rem,560px)] !w-full" onClose={onClose}>
        <SheetHeader>
          <SheetTitle>Novo leilão</SheetTitle>
          <SheetDescription>
            Primeiro monte a pauta: em cada linha, escolha o bem e os horários de disputa. Só então o
            período geral do leilão é liberado (sugestão automática a partir dos bens).
          </SheetDescription>
        </SheetHeader>

        <form className="mt-8 flex flex-col gap-5 px-5 pb-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="nl-titulo">Título do evento</Label>
            <Input
              id="nl-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Veículos — Centro-Oeste"
              className="mt-1 rounded-2xl"
              required
            />
          </div>

          <div>
            <Label htmlFor="nl-modalidade">Formato do leilão</Label>
            <Select
              id="nl-modalidade"
              className="mt-1"
              value={modalidade}
              onValueChange={(v) => {
                setModalidade(v as LeilaoModalidade);
                if (v === "online") setLocal("");
              }}
              options={MODALIDADE_OPTIONS}
              placeholder="Presencial ou online…"
              aria-label="Formato do leilão: presencial ou online"
            />
            <p className="mt-1.5 text-xs text-zinc-500">
              Presencial exige cidade; online é realizado apenas na plataforma (sem sede física).
            </p>
          </div>

          {modalidade === "presencial" ? (
            <div>
              <Label htmlFor="nl-local">Cidade (local do pregão)</Label>
              <SelectSearch
                id="nl-local"
                className="mt-1"
                value={local}
                onValueChange={setLocal}
                options={CIDADES_BRASIL_OPTIONS}
                placeholder="Selecione a cidade…"
                searchPlaceholder="Buscar cidade ou UF…"
                aria-label="Cidade do pregão presencial"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 px-3 py-3 text-sm text-zinc-600">
              Leilão <strong className="text-zinc-800">online</strong>: sem endereço físico; a disputa ocorre na
              plataforma.
            </div>
          )}

          <div>
            <Label htmlFor="nl-leiloeiro">Leiloeiro</Label>
            <Select
              id="nl-leiloeiro"
              className="mt-1"
              value={leiloeiroId}
              onValueChange={setLeiloeiroId}
              options={leiloeiroOptions}
              placeholder="Selecione o leiloeiro…"
              aria-label="Leiloeiro responsável"
            />
          </div>

          <div>
            <Label htmlFor="nl-comitente">Comitente</Label>
            <Select
              id="nl-comitente"
              className="mt-1"
              value={comitenteId}
              onValueChange={setComitenteId}
              options={comitenteOptions}
              placeholder="Selecione o comitente…"
              aria-label="Comitente do leilão"
            />
          </div>

          <SheetSeparator />

          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                  Lotes na pauta (primeiro passo)
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Em cada linha: lote, valor inicial, incremento mínimo e janela de disputa.
                  Todos os bens do lote entram automaticamente com os mesmos horários/valores.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => setAgendaRows((rows) => [...rows, emptyAgendaRow()])}
              >
                <PlusIcon className="mr-1 h-4 w-4" aria-hidden />
                Adicionar lote
              </Button>
            </div>

            <ul className="flex flex-col gap-3">
              {agendaRows.map((row, idx) => {
                const opts = loteOptionsForRow(row.key, row.loteId);
                return (
                  <li
                    key={row.key}
                    className="rounded-[18px] border border-zinc-200/90 bg-zinc-50/80 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-600">Item {idx + 1}</span>
                      {agendaRows.length > 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setAgendaRows((rows) => rows.filter((r) => r.key !== row.key))
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-red-50 hover:text-red-600"
                          aria-label="Remover linha"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                    <Label htmlFor={`nl-bem-${row.key}`} className="text-zinc-700">
                      Lote
                    </Label>
                    <SelectSearch
                      id={`nl-bem-${row.key}`}
                      className="mt-1"
                      value={row.loteId}
                      onValueChange={(v) =>
                        setAgendaRows((rows) =>
                          rows.map((r) => {
                            if (r.key !== row.key) return r;
                            const lote = loteOptions.find((o) => o.value === v);
                            const baseNow = new Date();
                            const rawBens = (lote?.bens ?? []).map((b) => ({
                              bemId: b.id,
                              bemLabel: b.label,
                              valorInicial: "",
                              incrementoMinimo: "",
                              abre: "",
                              fecha: "",
                            }));
                            const bens = rawBens.map((b, idxBem) => {
                              if (idxBem === 0) return b;
                              const prevFecha = rawBens[idxBem - 1]?.fecha;
                              const floor = aberturaBemFloor(
                                rawBens.map((x) => ({ abre: x.abre, fecha: x.fecha })),
                                idxBem,
                                baseNow
                              );
                              return { ...b, abre: prevFecha ? formatDateTimeLocalSaoPaulo(floor) : "" };
                            });
                            return {
                              ...r,
                              loteId: v,
                              bens,
                            };
                          })
                        )
                      }
                      options={opts}
                      placeholder="Selecione o lote…"
                      searchPlaceholder="Buscar por código do lote…"
                      emptyMessage="Nenhum lote disponível ou já usado em outra linha."
                      aria-label={`Lote do item ${idx + 1}`}
                    />
                    {row.bens.length > 0 ? (
                      <div className="mt-3 space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
                          Horário por bem do lote
                        </p>
                        {row.bens.map((bem, bIdx) => (
                          <div
                            key={bem.bemId}
                            className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                          >
                            <p className="mb-3 text-sm font-semibold text-zinc-800">
                              {bIdx + 1}. {bem.bemLabel}
                            </p>
                            <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div>
                                <Label htmlFor={`nl-vini-${row.key}-${bem.bemId}`} className="text-xs text-zinc-700">
                                  Valor inicial (R$)
                                </Label>
                                <Input
                                  id={`nl-vini-${row.key}-${bem.bemId}`}
                                  value={bem.valorInicial}
                                  onChange={(e) => {
                                    const value = normalizeCurrencyInput(e.target.value);
                                    setAgendaRows((rows) =>
                                      rows.map((r) => {
                                        if (r.key !== row.key) return r;
                                        return {
                                          ...r,
                                          bens: r.bens.map((rb) =>
                                            rb.bemId === bem.bemId ? { ...rb, valorInicial: value } : rb
                                          ),
                                        };
                                      })
                                    );
                                  }}
                                  className="mt-1 rounded-xl bg-white"
                                  inputMode="numeric"
                                  autoComplete="off"
                                  placeholder="R$ 0,00"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`nl-inc-${row.key}-${bem.bemId}`} className="text-xs text-zinc-700">
                                  Incremento mínimo (R$)
                                </Label>
                                <Input
                                  id={`nl-inc-${row.key}-${bem.bemId}`}
                                  value={bem.incrementoMinimo}
                                  onChange={(e) => {
                                    const value = normalizeCurrencyInput(e.target.value);
                                    setAgendaRows((rows) =>
                                      rows.map((r) => {
                                        if (r.key !== row.key) return r;
                                        return {
                                          ...r,
                                          bens: r.bens.map((rb) =>
                                            rb.bemId === bem.bemId ? { ...rb, incrementoMinimo: value } : rb
                                          ),
                                        };
                                      })
                                    );
                                  }}
                                  className="mt-1 rounded-xl bg-white"
                                  inputMode="numeric"
                                  autoComplete="off"
                                  placeholder="R$ 0,00"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div>
                                <Label htmlFor={`nl-abre-${row.key}-${bem.bemId}`} className="text-xs">
                                  Abre disputa
                                </Label>
                                <Input
                                  id={`nl-abre-${row.key}-${bem.bemId}`}
                                  type="datetime-local"
                                  value={bem.abre}
                                  min={formatDateTimeLocalSaoPaulo(
                                    aberturaBemFloor(
                                      row.bens.map((x) => ({ abre: x.abre, fecha: x.fecha })),
                                      bIdx,
                                      now
                                    )
                                  )}
                                  onChange={(e) => {
                                    const n = new Date();
                                    const floorAbre = aberturaBemFloor(
                                      row.bens.map((x) => ({ abre: x.abre, fecha: x.fecha })),
                                      bIdx,
                                      n
                                    );
                                    const abreClamped = clampDatetimeLocal(e.target.value, floorAbre);
                                    setAgendaRows((rows) =>
                                      rows.map((r) => {
                                        if (r.key !== row.key) return r;
                                        const bensAtualizados = r.bens.map((rb) => {
                                          if (rb.bemId !== bem.bemId) return rb;
                                          let fecha = rb.fecha;
                                          if (fecha) {
                                            const floorF = fechaDisputaFloor(abreClamped, n);
                                            fecha = clampDatetimeLocal(fecha, floorF);
                                          }
                                          return { ...rb, abre: abreClamped, fecha };
                                        });
                                        const idx = bensAtualizados.findIndex((x) => x.bemId === bem.bemId);
                                        if (idx >= 0 && idx + 1 < bensAtualizados.length) {
                                          const nextFloor = addMinutes(
                                            parseDateTimeLocalSaoPaulo(bensAtualizados[idx].fecha || abreClamped),
                                            5
                                          );
                                          const next = bensAtualizados[idx + 1];
                                          const nextAbre = next.abre
                                            ? clampDatetimeLocal(next.abre, nextFloor)
                                            : formatDateTimeLocalSaoPaulo(nextFloor);
                                          bensAtualizados[idx + 1] = { ...next, abre: nextAbre };
                                        }
                                        return {
                                          ...r,
                                          bens: bensAtualizados,
                                        };
                                      })
                                    );
                                  }}
                                  className="mt-1 rounded-xl bg-white"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`nl-fecha-${row.key}-${bem.bemId}`} className="text-xs">
                                  Encerra disputa
                                </Label>
                                <Input
                                  id={`nl-fecha-${row.key}-${bem.bemId}`}
                                  type="datetime-local"
                                  value={bem.fecha}
                                  min={maxDatetimeLocal(bem.abre, minDateTimeLocal)}
                                  onChange={(e) => {
                                    const n = new Date();
                                    const floorF = fechaDisputaFloor(bem.abre, n);
                                    const fechaClamped = clampDatetimeLocal(e.target.value, floorF);
                                    setAgendaRows((rows) =>
                                      rows.map((r) => {
                                        if (r.key !== row.key) return r;
                                        return {
                                          ...r,
                                          bens: r.bens.map((rb) =>
                                            rb.bemId === bem.bemId ? { ...rb, fecha: fechaClamped } : rb
                                          ),
                                        };
                                      })
                                    );
                                  }}
                                  className="mt-1 rounded-xl bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>

          <SheetSeparator />

          <div
            className={cn(
              "rounded-[18px] border border-zinc-200/90 p-4 transition-opacity",
              !pautaPronta && "opacity-60"
            )}
            aria-disabled={!pautaPronta}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
              Período geral do evento (segundo passo)
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {pautaPronta
                ? "Ajuste se quiser: por padrão usamos o menor início e o maior fim entre os bens. Cada disputa precisa continuar dentro deste intervalo."
                : "Preencha lote e horários em todas as linhas da pauta para liberar estes campos."}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="nl-ev-ini">Início do leilão</Label>
                <Input
                  id="nl-ev-ini"
                  type="datetime-local"
                  value={eventoInicio}
                  min={minDateTimeLocal}
                  onChange={(e) => {
                    const n = new Date();
                    const next = clampDatetimeLocal(e.target.value, n);
                    setEventoInicio(next);
                    setEventoFim((prev) =>
                      prev ? clampDatetimeLocal(prev, fimLeilaoFloor(next, n)) : prev
                    );
                  }}
                  className="mt-1 rounded-2xl"
                  disabled={!pautaPronta}
                  required={pautaPronta}
                  aria-label="Início do período geral do leilão"
                />
              </div>
              <div>
                <Label htmlFor="nl-ev-fim">Fim do leilão</Label>
                <Input
                  id="nl-ev-fim"
                  type="datetime-local"
                  value={eventoFim}
                  min={maxDatetimeLocal(eventoInicio, minDateTimeLocal)}
                  onChange={(e) => {
                    const n = new Date();
                    const floor = fimLeilaoFloor(eventoInicio, n);
                    setEventoFim(clampDatetimeLocal(e.target.value, floor));
                  }}
                  className="mt-1 rounded-2xl"
                  disabled={!pautaPronta}
                  required={pautaPronta}
                  aria-label="Fim do período geral do leilão"
                />
              </div>
            </div>
          </div>

          <div
            className="mt-2 space-y-3"
            role="status"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {validation.errors.length > 0 ? (
              <div className="rounded-xl border border-red-200 bg-red-50/95 px-3.5 py-3 text-sm text-red-900">
                <p className="font-semibold">Corrija antes de salvar:</p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5">
                  {validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" size="md" className="rounded-full" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" size="md" className="rounded-full" disabled={!validation.ok}>
                Criar leilão
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
