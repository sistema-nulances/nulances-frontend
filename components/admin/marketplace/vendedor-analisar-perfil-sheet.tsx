"use client";

import * as React from "react";
import {
  BuildingOffice2Icon,
  CheckCircleIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDashboardDateTime } from "@/lib/format-dashboard-datetime";
import { formatPhoneBr } from "@/lib/formatters";
import type { MarketplaceVendedorAdmin } from "@/lib/marketplace-vendedores-admin";
import type { AdminMarketplaceSolicitacaoPendenteDetalheResponse } from "@/lib/repositories/types/admin-marketplace-vendedores.types";
import { cn } from "@/lib/cn";

function iniciais(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}

function tipoPessoaLabel(tipo?: string): string {
  return String(tipo).toUpperCase() === "PESSOA_JURIDICA" ? "Pessoa jurídica" : "Pessoa física";
}

function tipoDocumentoLabel(tipo?: string): string {
  const raw = String(tipo ?? "").trim();
  if (!raw) return "Documento";
  return raw
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type DocumentoPreviewVariant = {
  label: string;
  url: string;
  isPdf: boolean;
};

type DocumentoPreviewGroup = {
  title: string;
  variants: DocumentoPreviewVariant[];
};

function isPdfDocument(url?: string, arquivo?: string): boolean {
  const source = `${url ?? ""} ${arquivo ?? ""}`.toLowerCase();
  return source.includes(".pdf");
}

function buildDocumentoGroups(detalhe: AdminMarketplaceSolicitacaoPendenteDetalheResponse | null): DocumentoPreviewGroup[] {
  if (!detalhe?.documentos || detalhe.documentos.length === 0) return [];

  const groups: Record<string, DocumentoPreviewGroup> = {};

  const ensureGroup = (key: string, title: string) => {
    if (!groups[key]) groups[key] = { title, variants: [] };
    return groups[key];
  };

  for (const doc of detalhe.documentos) {
    const url = doc.urlAssinada?.trim();
    if (!url) continue;

    const tipo = String(doc.tipo ?? "").toUpperCase();
    const variant = {
      label: tipoDocumentoLabel(doc.tipo),
      url,
      isPdf: isPdfDocument(url, doc.arquivo),
    };

    if (tipo === "RG_FRENTE") {
      ensureGroup("rg", "RG").variants.push({ ...variant, label: "Frente" });
      continue;
    }
    if (tipo === "RG_VERSO") {
      ensureGroup("rg", "RG").variants.push({ ...variant, label: "Verso" });
      continue;
    }
    if (tipo === "CPF_FRENTE") {
      ensureGroup("cpf", "CPF").variants.push({ ...variant, label: "Frente" });
      continue;
    }
    if (tipo === "CPF_VERSO") {
      ensureGroup("cpf", "CPF").variants.push({ ...variant, label: "Verso" });
      continue;
    }
    if (tipo === "SELFIE_COM_DOCUMENTO") {
      ensureGroup("selfie", "Selfie com documento").variants.push(variant);
      continue;
    }
    if (tipo === "CONTRATO_SOCIAL") {
      ensureGroup("contrato", "Contrato social").variants.push(variant);
      continue;
    }
    ensureGroup(`outro-${tipo || "desconhecido"}`, tipoDocumentoLabel(doc.tipo)).variants.push(variant);
  }

  const order = ["rg", "cpf", "selfie", "contrato"];
  const ordered: DocumentoPreviewGroup[] = [];
  for (const key of order) {
    if (groups[key] && groups[key]!.variants.length > 0) ordered.push(groups[key]!);
  }
  for (const [key, group] of Object.entries(groups)) {
    if (order.includes(key)) continue;
    if (group.variants.length > 0) ordered.push(group);
  }
  return ordered;
}

type Props = {
  open: boolean;
  vendedor: MarketplaceVendedorAdmin | null;
  detalhe: AdminMarketplaceSolicitacaoPendenteDetalheResponse | null;
  loading?: boolean;
  onClose: () => void;
  onAceitar: () => void;
  /** Abre o fluxo de confirmação para recusar (fora deste sheet). */
  onPedirRecusa: () => void;
};

export function VendedorAnalisarPerfilSheet({
  open,
  vendedor,
  detalhe,
  loading = false,
  onClose,
  onAceitar,
  onPedirRecusa,
}: Props) {
  const [previewGroup, setPreviewGroup] = React.useState<DocumentoPreviewGroup | null>(null);
  const [previewIndex, setPreviewIndex] = React.useState(0);
  const documentoGroups = React.useMemo(() => buildDocumentoGroups(detalhe), [detalhe]);
  const currentPreview = previewGroup?.variants[previewIndex] ?? null;
  const telefoneMascarado = formatPhoneBr(detalhe?.telefone ?? "") || detalhe?.telefone || "—";

  React.useEffect(() => {
    if (!open) {
      setPreviewGroup(null);
      setPreviewIndex(0);
    }
  }, [open]);

  return (
    <>
      <Sheet open={open} onClose={onClose} side="right">
        <SheetContent
          className="max-w-[min(100vw-1rem,560px)] !w-full overflow-y-auto"
          onClose={onClose}
        >
          {vendedor ? (
            <>
            <SheetHeader className="text-left">
              <div className="flex flex-col gap-4 pr-8 sm:flex-row sm:items-start">
                <div
                  className={cn(
                    "mx-auto flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center overflow-hidden rounded-full text-2xl font-bold tracking-tight sm:mx-0",
                    "bg-[var(--nulance-purple)]/12 text-[var(--nulance-purple)] ring-4 ring-[var(--nulance-purple)]/10"
                  )}
                  aria-hidden
                >
                  {detalhe?.fotoPerfilUrl || detalhe?.fotoPerfil ? (
                    <Avatar
                      src={detalhe.fotoPerfilUrl || detalhe.fotoPerfil}
                      alt={detalhe.nomeExibicao || vendedor.nome}
                      className="h-full w-full [&>img]:h-full [&>img]:w-full [&>img]:object-contain [&>img]:p-1.5"
                    />
                  ) : (
                    iniciais(vendedor.nome)
                  )}
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <SheetTitle>Analisar perfil</SheetTitle>
                  <SheetDescription className="mt-1">
                    Solicitação de{" "}
                    <span className="font-medium text-zinc-700">
                      {detalhe?.nomeExibicao || vendedor.nome}
                    </span>
                  </SheetDescription>
                  <p className="mt-2 text-xs text-zinc-500">
                    Pedido em{" "}
                    <time dateTime={detalhe?.createdAt || vendedor.cadastroEm} className="font-medium text-zinc-700">
                      {formatDashboardDateTime(detalhe?.createdAt || vendedor.cadastroEm)}
                    </time>
                  </p>
                </div>
              </div>
            </SheetHeader>

            {loading ? (
              <div className="px-2 py-8 text-sm text-zinc-500">Carregando detalhes da solicitação...</div>
            ) : !detalhe ? (
              <div className="px-2 py-8 text-sm text-zinc-500">
                Não foi possível carregar os detalhes desta solicitação.
              </div>
            ) : (
              <div className="mt-6 space-y-6 px-2 pb-4">
                <section className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <BuildingOffice2Icon className="h-5 w-5 text-zinc-500" aria-hidden />
                    Tipo de conta e identificação
                  </h3>
                  <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Perfil</dt>
                      <dd className="mt-0.5 font-medium text-zinc-900">{tipoPessoaLabel(detalhe.tipoPessoa)}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                        Nome / fantasia
                      </dt>
                      <dd className="mt-0.5 text-zinc-900">{detalhe.nomeExibicao || "—"}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                        CPF / CNPJ
                      </dt>
                      <dd className="mt-0.5 font-mono text-zinc-900">{detalhe.cpfOuCnpj || "—"}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Contato</dt>
                      <dd className="mt-1 space-y-1 text-zinc-800">
                        <p className="flex items-center gap-2">
                          <EnvelopeIcon className="h-4 w-4 text-zinc-400" aria-hidden />
                          {detalhe.email || "—"}
                        </p>
                        <p className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 text-zinc-400" aria-hidden />
                          {telefoneMascarado}
                        </p>
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Endereço</dt>
                      <dd className="mt-1 flex items-start gap-2 text-zinc-900">
                        <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                        {detalhe.endereco || `${detalhe.cidade || "—"} - ${detalhe.estado || "—"}`}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                        Sobre o negócio
                      </dt>
                      <dd className="mt-1 leading-relaxed text-zinc-800">{detalhe.informacoesNegocio || "—"}</dd>
                    </div>
                  </dl>
                </section>

                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <DocumentTextIcon className="h-5 w-5 text-zinc-500" aria-hidden />
                    Documentos enviados
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Documentos anexados na solicitação pendente.
                  </p>
                  <ul className="mt-3 space-y-3">
                    {documentoGroups.map((group) => (
                      <li
                        key={group.title}
                        className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm shadow-black/[0.02]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-zinc-900">{group.title}</p>
                            <p className="mt-0.5 text-xs text-zinc-600">
                              {group.variants.length > 1 ? `${group.variants.length} arquivos` : "1 arquivo"}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full text-xs"
                            onClick={() => {
                              setPreviewGroup(group);
                              setPreviewIndex(0);
                            }}
                          >
                            Ver arquivo
                          </Button>
                        </div>
                      </li>
                    ))}
                    {documentoGroups.length === 0 ? (
                      <li className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-3 py-4 text-sm text-zinc-500">
                        Nenhum documento retornado pela API.
                      </li>
                    ) : null}
                  </ul>
                </section>

                <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button
                      type="button"
                      className="rounded-full border-0 bg-emerald-600 text-white hover:bg-emerald-700 hover:opacity-100"
                      onClick={onAceitar}
                    >
                      <CheckCircleIcon className="mr-2 h-4 w-4" aria-hidden />
                      Aceitar como vendedor
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="rounded-full text-red-700 hover:bg-red-50 hover:text-red-800"
                      onClick={onPedirRecusa}
                    >
                      <XMarkIcon className="mr-2 h-4 w-4" aria-hidden />
                      Recusar solicitação
                    </Button>
                  </div>
                  <Button type="button" variant="ghost" className="rounded-full" onClick={onClose}>
                    Fechar sem decidir
                  </Button>
                </div>
              </div>
              )}
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog open={!!previewGroup} onOpenChange={(openState) => !openState && setPreviewGroup(null)}>
        <DialogContent className="max-w-[min(100vw-1.5rem,980px)] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{previewGroup?.title || "Documento"}</DialogTitle>
            <DialogDescription>
              {previewGroup?.variants.length && previewGroup.variants.length > 1
                ? "Selecione frente/verso para visualizar."
                : "Visualização do documento enviado."}
            </DialogDescription>
          </DialogHeader>

          {previewGroup && previewGroup.variants.length > 1 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {previewGroup.variants.map((variant, idx) => (
                <Button
                  key={`${variant.label}-${idx}`}
                  type="button"
                  variant={idx === previewIndex ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setPreviewIndex(idx)}
                >
                  {variant.label}
                </Button>
              ))}
            </div>
          ) : null}

          {currentPreview ? (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
              {currentPreview.isPdf ? (
                <iframe
                  src={currentPreview.url}
                  title={currentPreview.label}
                  className="h-[70vh] w-full bg-white"
                />
              ) : (
                <img
                  src={currentPreview.url}
                  alt={currentPreview.label}
                  className="max-h-[70vh] w-full object-contain bg-white"
                />
              )}
            </div>
          ) : (
            <p className="py-8 text-sm text-zinc-500">Arquivo indisponível para visualização.</p>
          )}

          <div className="mt-4 flex justify-end">
            <Button type="button" variant="secondary" className="rounded-full" onClick={() => setPreviewGroup(null)}>
              Fechar visualização
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
