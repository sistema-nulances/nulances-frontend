"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  PencilSquareIcon,
  PhotoIcon,
  TrashIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, type SelectOption } from "@/components/ui/select";
import { SelectSearch } from "@/components/ui/select-search";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { LicensePlate } from "@/components/ui/license-plate";
import type { LoteBemItem } from "@/data/lotes-admin";
import { inferMarcaModelo } from "@/data/bem-marcas";
import {
  BEM_CAMBIO_API,
  BEM_COMBUSTIVEL_API,
  BEM_CONDICAO_API,
  BEM_TIPO_VEICULO_API,
  labelCambioApi,
  labelCombustivelApi,
  labelCondicaoApi,
  labelTipoVeiculoApi,
} from "@/data/bem-veiculo-api";
import { BEM_MARCA_VEICULO_OPTIONS, marcaVeiculoLabel, normalizeMarcaVeiculoCode } from "@/lib/bem-marca-veiculo";
import { cn } from "@/lib/cn";

export type BemSheetMode = "view" | "create" | "edit";

export type BemAdminSaveMeta = {
  novosArquivos: Array<{ file: File; kind: "image" | "video" }>;
  midiasRemovidasIds: string[];
};

type BemAdminSheetProps = {
  open: boolean;
  onClose: () => void;
  mode: BemSheetMode;
  bem: LoteBemItem | null;
  onSave: (next: LoteBemItem, meta: BemAdminSaveMeta) => void | Promise<void>;
  onDelete?: (id: string) => void;
  onRequestEdit?: () => void;
};

export type MidiaDraftItem = {
  id: string;
  url: string;
  kind: "image" | "video";
  file?: File;
  serverMidiaId?: string;
};

const OPT_TIPO = BEM_TIPO_VEICULO_API;
const OPT_COND = BEM_CONDICAO_API;
const OPT_COMB = BEM_COMBUSTIVEL_API;
const OPT_CAMB = BEM_CAMBIO_API;
const OPT_MARCA = BEM_MARCA_VEICULO_OPTIONS;

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function deriveModelo(bem: LoteBemItem): string {
  const explicit = (bem.modelo ?? "").trim();
  if (explicit) return explicit;
  const inf = inferMarcaModelo(bem.nome);
  const codigo = normalizeMarcaVeiculoCode(bem.marca ?? "");
  const m = (marcaVeiculoLabel(codigo) || bem.marca || inf.marca).trim();
  if (!m) return bem.nome.trim();
  const stripped = bem.nome.replace(new RegExp(`^${escapeRegExp(m)}\\s*`, "i"), "").trim();
  return stripped || inf.modelo || bem.nome.trim();
}

function midiaFromBem(bem: LoteBemItem): MidiaDraftItem[] {
  if (bem.midiasDetalhe?.length) {
    return bem.midiasDetalhe.map((m) => ({
      id: `srv-${m.id}`,
      url: m.url,
      kind: m.kind,
      serverMidiaId: m.id,
    }));
  }
  const imgs = (bem.fotoUrls ?? []).map((url, i) => ({
    id: `persist-f-${i}-${url.slice(-24)}`,
    url,
    kind: "image" as const,
  }));
  const vids = (bem.videoUrls ?? []).map((url, i) => ({
    id: `persist-v-${i}-${url.slice(-24)}`,
    url,
    kind: "video" as const,
  }));
  return [...imgs, ...vids];
}

function normalizePlacaInput(raw: string) {
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 7);
}

function normalizeAnoInput(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}/${digits.slice(4)}`;
}

function normalizeKmInput(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 7);
}

function normalizeChassiFinalInput(raw: string) {
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10);
}

function normalizeCorInput(raw: string) {
  const trimmed = raw.replace(/[^\p{L}\s]/gu, "").replace(/\s+/g, " ");
  return trimmed.slice(0, 40);
}

function categoriaLabel(b: LoteBemItem) {
  return b.categoria ?? labelTipoVeiculoApi(b.tipoVeiculo) ?? b.tipoVeiculo;
}

export function BemMidiaPicker({
  items,
  onAddFiles,
  onRemove,
  disabled = false,
}: {
  items: MidiaDraftItem[];
  onAddFiles: (files: FileList | null, kind: "image" | "video") => void;
  onRemove: (id: string) => void;
  /** Durante envio ao servidor: impede alterar mídias. */
  disabled?: boolean;
}) {
  const imgRef = React.useRef<HTMLInputElement>(null);
  const vidRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <input
          ref={imgRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            onAddFiles(e.target.files, "image");
            e.target.value = "";
          }}
        />
        <input
          ref={vidRef}
          type="file"
          accept="video/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            onAddFiles(e.target.files, "video");
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-full"
          disabled={disabled}
          onClick={() => !disabled && imgRef.current?.click()}
        >
          <PhotoIcon className="h-4 w-4" aria-hidden />
          Adicionar fotos
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-full"
          disabled={disabled}
          onClick={() => !disabled && vidRef.current?.click()}
        >
          <VideoCameraIcon className="h-4 w-4" aria-hidden />
          Adicionar vídeos
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-500">
          Nenhum arquivo ainda. Você pode concluir sem mídia e editar depois.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((m) => (
            <li
              key={m.id}
              className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100"
            >
              {m.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob e URLs arbitrárias no admin
                <img src={m.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <video src={m.url} className="h-full w-full object-cover" muted playsInline />
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onRemove(m.id)}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white shadow-md transition hover:bg-black/70 disabled:pointer-events-none disabled:opacity-40"
                aria-label="Remover mídia"
              >
                <XMarkIcon className="h-4 w-4" aria-hidden />
              </button>
              <span className="pointer-events-none absolute bottom-1 left-1 rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                {m.kind === "image" ? "Foto" : "Vídeo"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function BemAdminSheet({
  open,
  onClose,
  mode,
  bem,
  onSave,
  onDelete,
  onRequestEdit,
}: BemAdminSheetProps) {
  const [marca, setMarca] = React.useState("");
  const [modelo, setModelo] = React.useState("");
  const [tipoVeiculo, setTipoVeiculo] = React.useState("");
  const [condicao, setCondicao] = React.useState("");
  const [ano, setAno] = React.useState("");
  const [quilometragem, setQuilometragem] = React.useState("");
  const [combustivel, setCombustivel] = React.useState("");
  const [cambio, setCambio] = React.useState("");
  const [placa, setPlaca] = React.useState("");
  const [blindado, setBlindado] = React.useState(false);
  const [chassiFinal, setChassiFinal] = React.useState("");
  const [cor, setCor] = React.useState("");
  const [descricao, setDescricao] = React.useState("");
  const [createStep, setCreateStep] = React.useState<1 | 2>(1);
  const [midiaDraft, setMidiaDraft] = React.useState<MidiaDraftItem[]>([]);
  const [galleryLightbox, setGalleryLightbox] = React.useState<{
    url: string;
    kind: "image" | "video";
  } | null>(null);
  const [lightboxPortalReady, setLightboxPortalReady] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const initialServerMidiaIdsRef = React.useRef<string[]>([]);

  React.useEffect(() => setLightboxPortalReady(true), []);

  React.useEffect(() => {
    if (!open) setIsSaving(false);
  }, [open]);

  React.useEffect(() => {
    if (!open || mode !== "view") setGalleryLightbox(null);
  }, [open, mode]);

  React.useEffect(() => {
    if (!galleryLightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGalleryLightbox(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [galleryLightbox]);

  const revokeBlobDrafts = React.useCallback((items: MidiaDraftItem[]) => {
    for (const m of items) {
      if (m.url.startsWith("blob:")) URL.revokeObjectURL(m.url);
    }
  }, []);

  const discardAndClose = React.useCallback(() => {
    setMidiaDraft((prev) => {
      revokeBlobDrafts(prev);
      return [];
    });
    setCreateStep(1);
    onClose();
  }, [onClose, revokeBlobDrafts]);

  /** Fecha o sheet só se não estiver enviando (visibilidade de status / evita perda acidental). */
  const requestCloseWhileEditing = React.useCallback(() => {
    if (isSaving) return;
    discardAndClose();
  }, [isSaving, discardAndClose]);

  const finishSave = React.useCallback(
    async (payload: LoteBemItem) => {
      const novosArquivos = midiaDraft
        .filter((m) => m.file)
        .map((m) => ({ file: m.file as File, kind: m.kind }));
      const idsAgora = new Set(
        midiaDraft.map((m) => m.serverMidiaId).filter((x): x is string => Boolean(x))
      );
      const midiasRemovidasIds = initialServerMidiaIdsRef.current.filter((id) => !idsAgora.has(id));
      setIsSaving(true);
      try {
        await onSave(payload, { novosArquivos, midiasRemovidasIds });
        setMidiaDraft([]);
        setCreateStep(1);
        onClose();
      } catch {
        /* toast / tratamento no pai */
      } finally {
        setIsSaving(false);
      }
    },
    [midiaDraft, onClose, onSave]
  );

  React.useEffect(() => {
    if (!open || !bem) return;
    const marcaInferida = inferMarcaModelo(bem.nome).marca;
    setMarca(normalizeMarcaVeiculoCode(bem.marca ?? marcaInferida));
    setModelo(deriveModelo(bem));
    setTipoVeiculo(bem.tipoVeiculo ?? bem.categoria ?? "");
    setCondicao(bem.condicao ?? "");
    setAno(normalizeAnoInput(bem.ano ?? ""));
    setQuilometragem(normalizeKmInput(bem.quilometragem ?? ""));
    setCombustivel(bem.combustivel ?? "");
    setCambio(bem.cambio ?? "");
    setPlaca(bem.placa ?? "");
    setBlindado(bem.blindado ?? false);
    setChassiFinal(normalizeChassiFinalInput(bem.chassiFinal ?? ""));
    setCor(normalizeCorInput(bem.cor ?? "").trim());
    setDescricao(bem.descricao ?? "");

    if (mode === "create") {
      initialServerMidiaIdsRef.current = [];
      setCreateStep(1);
      setMidiaDraft((prev) => {
        revokeBlobDrafts(prev);
        return [];
      });
    } else if (mode === "edit") {
      initialServerMidiaIdsRef.current = (bem.midiasDetalhe ?? []).map((m) => m.id);
      setMidiaDraft((prev) => {
        revokeBlobDrafts(prev);
        return midiaFromBem(bem);
      });
    } else {
      initialServerMidiaIdsRef.current = (bem.midiasDetalhe ?? []).map((m) => m.id);
    }
  }, [open, bem, mode, revokeBlobDrafts]);

  const nomeCompleto = React.useMemo(() => {
    const m = marca.trim();
    const mo = modelo.trim();
    const marcaLegivel = marcaVeiculoLabel(normalizeMarcaVeiculoCode(m)) || m;
    return [marcaLegivel, mo].filter(Boolean).join(" ").trim();
  }, [marca, modelo]);

  const step1Valid =
    Boolean(marca.trim()) &&
    Boolean(modelo.trim()) &&
    Boolean(tipoVeiculo.trim()) &&
    Boolean(condicao.trim());

  const addMidiaFiles = React.useCallback((files: FileList | null, kind: "image" | "video") => {
    if (!files?.length) return;
    const next: MidiaDraftItem[] = [];
    for (const f of Array.from(files)) {
      if (kind === "image" && !f.type.startsWith("image/")) continue;
      if (kind === "video" && !f.type.startsWith("video/")) continue;
      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        url: URL.createObjectURL(f),
        kind,
        file: f,
      });
    }
    if (next.length) setMidiaDraft((p) => [...p, ...next]);
  }, []);

  const removeMidia = React.useCallback((id: string) => {
    setMidiaDraft((prev) => {
      const found = prev.find((x) => x.id === id);
      if (found?.url.startsWith("blob:")) URL.revokeObjectURL(found.url);
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  const buildPayload = React.useCallback((): LoteBemItem | null => {
    if (!bem) return null;
    const tipo = tipoVeiculo.trim();
    const n = nomeCompleto;
    if (!n || !tipo || !condicao.trim() || !marca.trim() || !modelo.trim()) return null;
    const fotos = midiaDraft.filter((m) => m.kind === "image").map((m) => m.url);
    const videos = midiaDraft.filter((m) => m.kind === "video").map((m) => m.url);
    const marcaCodigo = normalizeMarcaVeiculoCode(marca.trim());
    return {
      ...bem,
      nome: n,
      marca: marcaCodigo,
      modelo: modelo.trim(),
      tipoVeiculo: tipo,
      categoria: labelTipoVeiculoApi(tipo) || tipo,
      condicao: condicao.trim(),
      ano: ano.trim() || undefined,
      quilometragem: quilometragem.trim() || undefined,
      combustivel: combustivel.trim() || undefined,
      cambio: cambio.trim() || undefined,
      placa: placa.trim() || undefined,
      blindado,
      chassiFinal: chassiFinal.trim() || undefined,
      cor: cor.trim() || undefined,
      descricao: descricao.trim() || undefined,
      fotoUrls: fotos.length ? fotos : undefined,
      videoUrls: videos.length ? videos : undefined,
    };
  }, [
    bem,
    nomeCompleto,
    marca,
    modelo,
    tipoVeiculo,
    condicao,
    ano,
    quilometragem,
    combustivel,
    cambio,
    placa,
    blindado,
    chassiFinal,
    cor,
    descricao,
    midiaDraft,
  ]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = buildPayload();
    if (!p) return;
    void finishSave(p);
  };

  const title =
    mode === "create" ? "Novo bem" : mode === "edit" ? "Editar bem" : "Detalhe do bem";

  const description =
    mode === "create"
      ? createStep === 1
        ? "Etapa 1: dados do veículo. Depois você adiciona fotos e vídeos."
        : "Etapa 2: selecione fotos e vídeos e conclua o cadastro."
      : mode === "edit"
        ? "Altere os dados do bem no catálogo."
        : "Dados cadastrais do item.";

  if (mode === "view" && bem) {
    const cat = categoriaLabel(bem);
    const fotos = (bem.fotoUrls ?? []).filter(Boolean);
    const videos = (bem.videoUrls ?? []).filter(Boolean);
    const hasMedia = fotos.length > 0 || videos.length > 0;

    return (
      <>
      <Sheet open={open} onClose={onClose} side="right">
        <SheetContent
          className="max-w-[min(100vw-1rem,520px)] !w-full overflow-y-auto"
          onClose={onClose}
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription className="text-left">{description}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex flex-col gap-4 pb-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Marca</p>
              <p className="mt-1 text-sm font-medium text-zinc-800">
                {marcaVeiculoLabel(normalizeMarcaVeiculoCode(bem.marca ?? "")) ||
                  bem.marca ||
                  inferMarcaModelo(bem.nome).marca ||
                  "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Nome do veículo</p>
              <p className="mt-1 text-base font-semibold text-zinc-900">{bem.nome}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Tipo</p>
              {cat ? (
                <Badge variant="zinc" size="sm" className="mt-1 normal-case tracking-normal">
                  {cat}
                </Badge>
              ) : (
                <p className="mt-1 text-sm text-zinc-500">—</p>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Condição</p>
              <p className="mt-1 text-sm font-medium text-zinc-800">
                {labelCondicaoApi(bem.condicao) || bem.condicao || "—"}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Ano</p>
                <p className="mt-1 text-sm text-zinc-800">{bem.ano ?? "—"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Quilometragem</p>
                <p className="mt-1 text-sm text-zinc-800">{bem.quilometragem ?? "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Combustível</p>
                <p className="mt-1 text-sm text-zinc-800">
                  {labelCombustivelApi(bem.combustivel) || bem.combustivel || "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Câmbio</p>
                <p className="mt-1 text-sm text-zinc-800">{labelCambioApi(bem.cambio) || bem.cambio || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Blindado</p>
                <p className="mt-1 text-sm font-medium text-zinc-800">{bem.blindado ? "Sim" : "Não"}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Cor</p>
                <p className="mt-1 text-sm text-zinc-800">{bem.cor ?? "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Final do chassi</p>
              <p className="mt-1 font-mono text-sm text-zinc-800">{bem.chassiFinal ?? "—"}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Placa</p>
              <p className="mt-1 font-mono text-sm font-semibold text-zinc-900">{bem.placa ?? "—"}</p>
              {bem.placa ? (
                <div className="mt-3 flex justify-center sm:justify-start">
                  <LicensePlate plate={bem.placa} />
                </div>
              ) : null}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Descrição</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-700">
                {bem.descricao ? (
                  bem.descricao
                ) : (
                  <span className="text-zinc-400">Sem descrição.</span>
                )}
              </p>
            </div>
            {hasMedia ? (
              <div className="flex flex-col gap-5">
                {fotos.length > 0 ? (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                      Galeria de fotos
                    </p>
                    <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {fotos.map((url, i) => (
                        <li key={`vf-${i}-${url.slice(-16)}`}>
                          <button
                            type="button"
                            onClick={() => setGalleryLightbox({ url, kind: "image" })}
                            className="group relative aspect-square w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 text-left shadow-sm transition hover:border-[var(--nulance-purple)]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt=""
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <span className="sr-only">Abrir foto em tela cheia</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {videos.length > 0 ? (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Vídeos</p>
                    <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {videos.map((url, i) => (
                        <li key={`vv-${i}-${url.slice(-16)}`}>
                          <button
                            type="button"
                            onClick={() => setGalleryLightbox({ url, kind: "video" })}
                            className="relative aspect-square w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-900 text-left shadow-sm transition hover:border-[var(--nulance-purple)]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                          >
                            <video
                              src={url}
                              className="h-full w-full object-cover opacity-90"
                              muted
                              playsInline
                              preload="metadata"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[var(--nulance-purple)] shadow-md">
                                <VideoCameraIcon className="h-6 w-6" aria-hidden />
                              </span>
                            </span>
                            <span className="sr-only">Abrir vídeo</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-6 text-center text-sm text-zinc-500">
                Nenhuma foto ou vídeo cadastrado para este bem.
              </div>
            )}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <Button type="button" variant="secondary" size="md" className="rounded-full" onClick={onClose}>
                Fechar
              </Button>
              {onRequestEdit ? (
                <Button
                  type="button"
                  variant="default"
                  size="md"
                  className="rounded-full"
                  onClick={onRequestEdit}
                >
                  <PencilSquareIcon className="h-4 w-4" aria-hidden />
                  Editar
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  className="rounded-full text-red-700 hover:bg-red-50 hover:text-red-800"
                  onClick={() => {
                    onDelete(bem.id);
                    onClose();
                  }}
                >
                  <TrashIcon className="h-4 w-4" aria-hidden />
                  Excluir
                </Button>
              ) : null}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {lightboxPortalReady &&
        galleryLightbox &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Visualização ampliada"
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/88 p-3 backdrop-blur-[2px]"
            onClick={() => setGalleryLightbox(null)}
          >
            <button
              type="button"
              className="absolute right-3 top-3 z-[1] flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              onClick={(e) => {
                e.stopPropagation();
                setGalleryLightbox(null);
              }}
              aria-label="Fechar"
            >
              <XMarkIcon className="h-6 w-6" aria-hidden />
            </button>
            <div
              className="max-h-[min(92vh,900px)] max-w-[min(96vw,1200px)]"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryLightbox.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={galleryLightbox.url}
                  alt=""
                  className="max-h-[min(92vh,900px)] w-auto max-w-full object-contain"
                />
              ) : (
                <video
                  src={galleryLightbox.url}
                  className="max-h-[min(92vh,900px)] w-full max-w-full rounded-lg bg-black"
                  controls
                  autoPlay
                  playsInline
                />
              )}
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  const stepFields = (
    <>
      <div>
        <Label htmlFor="bem-marca">Marca</Label>
        <SelectSearch
          id="bem-marca"
          value={marca}
          onValueChange={setMarca}
          options={OPT_MARCA}
          placeholder="Selecione a marca"
          searchPlaceholder="Buscar marca…"
          emptyMessage="Nenhuma marca encontrada."
          aria-label="Marca do veículo"
          variant="flat"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="bem-modelo">Modelo / versão</Label>
        <Input
          id="bem-modelo"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          className="mt-1 rounded-2xl"
          variant="flat"
          required
          autoComplete="off"
          placeholder="Ex.: Onix Plus 1.0 LTZ"
        />
        <p className="mt-1 text-xs text-zinc-500">
          O nome completo no catálogo será <span className="font-medium text-zinc-700">{nomeCompleto || "—"}</span>.
        </p>
      </div>

      <div>
        <Label htmlFor="bem-tipo">Tipo de veículo</Label>
        <Select
          id="bem-tipo"
          value={tipoVeiculo}
          onValueChange={setTipoVeiculo}
          options={OPT_TIPO}
          placeholder="Selecione o tipo"
          aria-label="Tipo de veículo"
          variant="flat"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="bem-cond">Condição</Label>
        <Select
          id="bem-cond"
          value={condicao}
          onValueChange={setCondicao}
          options={OPT_COND}
          placeholder="Selecione a condição"
          aria-label="Condição do bem"
          variant="flat"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bem-ano">Ano</Label>
          <Input
            id="bem-ano"
            value={ano}
            onChange={(e) => setAno(normalizeAnoInput(e.target.value))}
            className="mt-1 rounded-2xl"
            variant="flat"
            autoComplete="off"
            inputMode="numeric"
            maxLength={9}
            placeholder="Ex.: 2022/2023"
            aria-describedby="bem-ano-hint"
          />
          <p id="bem-ano-hint" className="mt-1 text-xs text-zinc-500">
            Digite só números; a barra entre ano fab. e modelo é colocada automaticamente.
          </p>
        </div>
        <div>
          <Label htmlFor="bem-km">Quilometragem</Label>
          <Input
            id="bem-km"
            value={quilometragem}
            onChange={(e) => setQuilometragem(normalizeKmInput(e.target.value))}
            className="mt-1 rounded-2xl"
            variant="flat"
            autoComplete="off"
            inputMode="numeric"
            placeholder="Ex.: 48320"
            aria-describedby="bem-km-hint"
          />
          <p id="bem-km-hint" className="mt-1 text-xs text-zinc-500">
            Apenas números (km).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bem-comb">Combustível</Label>
          <Select
            id="bem-comb"
            value={combustivel}
            onValueChange={setCombustivel}
            options={OPT_COMB}
            placeholder="Selecione"
            aria-label="Combustível"
            variant="flat"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="bem-camb">Câmbio</Label>
          <Select
            id="bem-camb"
            value={cambio}
            onValueChange={setCambio}
            options={OPT_CAMB}
            placeholder="Selecione"
            aria-label="Câmbio"
            variant="flat"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bem-chassi">Final do chassi</Label>
          <Input
            id="bem-chassi"
            value={chassiFinal}
            onChange={(e) => setChassiFinal(normalizeChassiFinalInput(e.target.value))}
            className="mt-1 rounded-2xl font-mono uppercase tracking-wider"
            variant="flat"
            autoComplete="off"
            inputMode="text"
            placeholder="Ex.: 9283 ou A1B2"
            maxLength={10}
            aria-describedby="bem-chassi-hint"
          />
          <p id="bem-chassi-hint" className="mt-1 text-xs text-zinc-500">
            Use letras e números (até 10 caracteres).
          </p>
        </div>
        <div>
          <Label htmlFor="bem-cor">Cor</Label>
          <Input
            id="bem-cor"
            value={cor}
            onChange={(e) => setCor(normalizeCorInput(e.target.value))}
            className="mt-1 rounded-2xl"
            variant="flat"
            autoComplete="off"
            placeholder="Ex.: Branca"
            aria-describedby="bem-cor-hint"
          />
          <p id="bem-cor-hint" className="mt-1 text-xs text-zinc-500">
            Apenas letras (acentos permitidos).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-3 py-3 shadow-none">
        <input
          id="bem-blindado"
          type="checkbox"
          checked={blindado}
          onChange={(e) => setBlindado(e.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-zinc-300 text-[var(--nulance-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
        <Label htmlFor="bem-blindado" className="mb-0 cursor-pointer text-sm font-medium text-zinc-800">
          Veículo blindado
        </Label>
      </div>

      <div>
        <Label htmlFor="bem-placa">Placa do veículo</Label>
        <Input
          id="bem-placa"
          value={placa}
          onChange={(e) => setPlaca(normalizePlacaInput(e.target.value))}
          className={cn("mt-1 rounded-2xl font-mono uppercase tracking-wider")}
          variant="flat"
          autoComplete="off"
          placeholder="ABC1D23 ou ABC1234"
          maxLength={7}
          aria-describedby="bem-placa-hint"
        />
        <p id="bem-placa-hint" className="mt-1 text-xs text-zinc-500">
          Mercosul (7 caracteres) ou formato antigo (3 letras + 4 números).
        </p>
        <div className="mt-3 flex justify-center sm:justify-start">
          <LicensePlate plate={placa} />
        </div>
      </div>

      <div>
        <Label htmlFor="bem-desc">Descrição</Label>
        <textarea
          id="bem-desc"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
          className={cn(
            "mt-1 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-none",
            "placeholder:text-zinc-400 outline-none",
            "focus:border-[var(--nulance-purple)] focus:ring-2 focus:ring-[var(--ring)]"
          )}
          placeholder="Observações adicionais (opcional)"
        />
      </div>
    </>
  );

  return (
    <Sheet open={open} onClose={requestCloseWhileEditing} side="right">
      <SheetContent
        className="max-w-[min(100vw-1rem,520px)] !w-full overflow-y-auto"
        onClose={requestCloseWhileEditing}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="text-left">{description}</SheetDescription>
          {isSaving ? (
            <p className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700" role="status" aria-live="polite">
              {mode === "create" ? "Criando bem na API, aguarde…" : "Salvando alterações, aguarde…"}
            </p>
          ) : null}
          {mode === "create" ? (
            <div className="mt-4 flex gap-2" role="navigation" aria-label="Etapas do cadastro">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  createStep === 1
                    ? "bg-[var(--nulance-purple)] text-white"
                    : "bg-zinc-100 text-zinc-600"
                )}
              >
                1 — Dados
              </span>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  createStep === 2
                    ? "bg-[var(--nulance-purple)] text-white"
                    : "bg-zinc-100 text-zinc-600"
                )}
              >
                2 — Fotos e vídeos
              </span>
            </div>
          ) : null}
        </SheetHeader>
        {bem ? (
          mode === "create" ? (
            <div className="mt-6 flex flex-col gap-4 pb-4" aria-busy={isSaving}>
              {createStep === 1 ? (
                <>
                  {stepFields}
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      className="rounded-full"
                      disabled={isSaving}
                      onClick={discardAndClose}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      size="md"
                      className="rounded-full"
                      disabled={!step1Valid || isSaving}
                      onClick={() => setCreateStep(2)}
                    >
                      Continuar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 px-3 py-3 text-sm text-zinc-700">
                    <p className="font-medium text-zinc-900">{nomeCompleto}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Revise as mídias abaixo. Você pode voltar para alterar os dados.
                    </p>
                  </div>
                  <div>
                    <Label className="text-base">Fotos e vídeos</Label>
                    <p className="mt-1 text-xs text-zinc-500">
                      Formatos de imagem e vídeo comuns. Os arquivos ficam nesta sessão até integração com servidor.
                    </p>
                    <div className="mt-3">
                      <BemMidiaPicker
                        disabled={isSaving}
                        items={midiaDraft}
                        onAddFiles={addMidiaFiles}
                        onRemove={removeMidia}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      className="rounded-full"
                      disabled={isSaving}
                      onClick={() => setCreateStep(1)}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      size="md"
                      className="rounded-full"
                      loading={isSaving}
                      disabled={isSaving}
                      onClick={() => {
                        const p = buildPayload();
                        if (p) void finishSave(p);
                      }}
                    >
                      {isSaving ? "Criando bem…" : "Concluir cadastro"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <form className="mt-6 flex flex-col gap-4 pb-4" onSubmit={handleEditSubmit} aria-busy={isSaving}>
              {stepFields}
              <div className="border-t border-zinc-200 pt-4">
                <Label className="text-base">Fotos e vídeos</Label>
                <p className="mt-1 text-xs text-zinc-500">Atualize as mídias do anúncio.</p>
                <div className="mt-3">
                  <BemMidiaPicker
                    disabled={isSaving}
                    items={midiaDraft}
                    onAddFiles={addMidiaFiles}
                    onRemove={removeMidia}
                  />
                </div>
              </div>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="rounded-full"
                  disabled={isSaving}
                  onClick={discardAndClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="md"
                  className="rounded-full"
                  loading={isSaving}
                  disabled={!step1Valid || isSaving}
                >
                  {isSaving ? "Salvando…" : "Salvar"}
                </Button>
              </div>
            </form>
          )
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export {
  normalizePlacaInput,
  normalizeAnoInput,
  normalizeKmInput,
  normalizeChassiFinalInput,
  normalizeCorInput,
};
