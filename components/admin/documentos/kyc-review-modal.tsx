"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type UsuarioDocumentosKyc } from "@/data/usuarios-documentos-kyc";
import { cn } from "@/lib/cn";

function DocumentPreviewMock({
  label,
  enviado,
  sublabel,
  arquivoUrl,
  status,
}: {
  label: string;
  enviado: boolean;
  sublabel?: string;
  arquivoUrl?: string;
  status?: UsuarioDocumentosKyc["status"];
}) {
  if (!enviado || !arquivoUrl) {
    return (
      <div className="flex aspect-[3/4] min-h-[220px] max-h-[360px] items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 text-center text-sm text-zinc-500">
        Nenhum arquivo enviado.
      </div>
    );
  }
  const statusNode =
    status === "aprovado" ? (
      <Badge variant="emerald" size="sm">Aprovado</Badge>
    ) : status === "pendente" ? (
      <Badge variant="amber" size="sm">Pendente</Badge>
    ) : status === "recusado" ? (
      <Badge variant="red" size="sm">Recusado</Badge>
    ) : (
      <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        Prévia
      </span>
    );

  return (
    <div className="flex max-h-[360px] min-h-[260px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-white px-4 py-2.5">
        <div>
          <span className="text-sm font-semibold text-zinc-800">{label}</span>
          {sublabel ? (
            <span className="ml-2 text-xs font-medium text-zinc-500">({sublabel})</span>
          ) : null}
        </div>
        {statusNode}
      </div>
      <div className="flex min-h-[200px] flex-1 flex-col gap-2 overflow-y-auto p-4">
        <div className="mt-0.5 flex min-h-[220px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-zinc-200/90 bg-gradient-to-b from-white to-zinc-100/90">
          {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada temporária do storage */}
          <img
            src={arquivoUrl}
            alt={`${label} ${sublabel ?? ""}`.trim()}
            className="h-full max-h-[320px] w-full object-contain"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

function statusBadge(status: UsuarioDocumentosKyc["status"]) {
  if (status === "aprovado") return <Badge variant="emerald">Aprovado</Badge>;
  if (status === "pendente") return <Badge variant="amber">Pendente</Badge>;
  return <Badge variant="red">Recusado</Badge>;
}

function InfoCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/90 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">{label}</p>
      <div className="mt-1.5 text-sm font-medium leading-snug text-zinc-900">{children}</div>
    </div>
  );
}

type KycReviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: UsuarioDocumentosKyc | null;
  onAprovarGrupo: (id: string, grupo: "rg" | "cnh") => void;
  onRecusarGrupo: (id: string, grupo: "rg" | "cnh") => void;
};

export function KycReviewModal({
  open,
  onOpenChange,
  usuario,
  onAprovarGrupo,
  onRecusarGrupo,
}: KycReviewModalProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(94vh,1020px)] w-[min(100vw-1rem,1920px)] max-w-[min(100vw-1rem,1920px)] flex-col gap-0 overflow-hidden p-0 sm:p-0"
        )}
      >
        <div className="max-h-[inherit] overflow-y-auto px-6 pb-6 pt-6 sm:px-10 sm:pb-8 sm:pt-8">
          <DialogHeader className="space-y-3 text-left">
            <DialogTitle className="text-xl sm:text-2xl">Análise de documentos</DialogTitle>
            <DialogDescription className="sr-only">
              Revise os dados cadastrais e as imagens de RG e CPF (frente e verso) antes de aprovar ou
              recusar.
            </DialogDescription>
          </DialogHeader>

          {usuario ? (
            <>
                <div className="mt-6 space-y-10">
                  {/* Dados completos do usuário */}
                  <section aria-labelledby="kyc-dados-heading">
                    <h3
                      id="kyc-dados-heading"
                      className="border-b border-zinc-200 pb-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-500"
                    >
                      Dados do usuário
                    </h3>
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      <InfoCell label="Nome completo">{usuario.nome}</InfoCell>
                      <InfoCell label="E-mail">{usuario.email}</InfoCell>
                      <InfoCell label="Telefone">{usuario.telefone}</InfoCell>
                      <InfoCell label="CPF (cadastro)">
                        <span className="font-mono">{usuario.cpfMascarado}</span>
                      </InfoCell>
                      <InfoCell label="Data de nascimento">{usuario.dataNascimento}</InfoCell>
                      <InfoCell label="Cidade / UF">
                        {usuario.cidade} — {usuario.uf}
                      </InfoCell>
                      <InfoCell label="Status da verificação">{statusBadge(usuario.status)}</InfoCell>
                      <InfoCell label="Protocolo / ID">
                        <span className="font-mono text-xs">{usuario.id}</span>
                      </InfoCell>
                      <InfoCell label="Primeiro envio">{usuario.enviadoEm}</InfoCell>
                      <InfoCell label="Última atualização">{usuario.atualizadoEm}</InfoCell>
                    </div>
                    {usuario.motivoRecusa ? (
                      <p className="mt-4 rounded-2xl border border-red-100 bg-red-50/95 px-4 py-3 text-sm text-red-900">
                        <span className="font-semibold">Última recusa registrada: </span>
                        {usuario.motivoRecusa}
                      </p>
                    ) : null}
                  </section>

                  {/* RG frente e verso */}
                  <section aria-labelledby="kyc-rg-heading">
                    <h3
                      id="kyc-rg-heading"
                      className="border-b border-zinc-200 pb-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-500"
                    >
                      Documento de identidade (RG)
                    </h3>
                    <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div>
                        <p className="mb-3 text-xs font-semibold text-zinc-600">Frente</p>
                        <DocumentPreviewMock
                          label="RG"
                          sublabel="Frente"
                          enviado={usuario.rgFrenteEnviado}
                          arquivoUrl={usuario.rgFrenteUrl}
                          status={usuario.rgStatus}
                        />
                      </div>
                      <div>
                        <p className="mb-3 text-xs font-semibold text-zinc-600">Verso</p>
                        <DocumentPreviewMock
                          label="RG"
                          sublabel="Verso"
                          enviado={usuario.rgVersoEnviado}
                          arquivoUrl={usuario.rgVersoUrl}
                          status={usuario.rgStatus}
                        />
                      </div>
                    </div>
                    {usuario.rgStatus !== "aprovado" && (
                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-red-200 text-red-700 hover:bg-red-50"
                        disabled={!usuario.rgFrenteId && !usuario.rgVersoId}
                        onClick={() => onRecusarGrupo(usuario.id, "rg")}
                      >
                        Recusar RG
                      </Button>
                      <Button
                        type="button"
                        className="rounded-full"
                        disabled={!usuario.rgFrenteId && !usuario.rgVersoId}
                        onClick={() => onAprovarGrupo(usuario.id, "rg")}
                      >
                        Aprovar RG
                      </Button>
                      </div>
                    )}
                  </section>

                  {/* CNH frente e verso */}
                  <section aria-labelledby="kyc-cpf-heading">
                    <h3
                      id="kyc-cpf-heading"
                      className="border-b border-zinc-200 pb-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-500"
                    >
                      CNH
                    </h3>
                    <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div>
                        <p className="mb-3 text-xs font-semibold text-zinc-600">Frente</p>
                        <DocumentPreviewMock
                          label="CNH"
                          sublabel="Frente"
                          enviado={usuario.cpfFrenteEnviado}
                          arquivoUrl={usuario.cpfFrenteUrl}
                          status={usuario.cnhStatus}
                        />
                      </div>
                      <div>
                        <p className="mb-3 text-xs font-semibold text-zinc-600">Verso</p>
                        <DocumentPreviewMock
                          label="CNH"
                          sublabel="Verso"
                          enviado={usuario.cpfVersoEnviado}
                          arquivoUrl={usuario.cpfVersoUrl}
                          status={usuario.cnhStatus}
                        />
                      </div>
                    </div>
                    {usuario.cnhStatus !== "aprovado" && (
                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-red-200 text-red-700 hover:bg-red-50"
                        disabled={!usuario.cpfFrenteId && !usuario.cpfVersoId}
                        onClick={() => onRecusarGrupo(usuario.id, "cnh")}
                      >
                        Recusar CNH
                      </Button>
                      <Button
                        type="button"
                        className="rounded-full"
                        disabled={!usuario.cpfFrenteId && !usuario.cpfVersoId}
                        onClick={() => onAprovarGrupo(usuario.id, "cnh")}
                      >
                        Aprovar CNH
                      </Button>
                      </div>
                    )}
                  </section>
                </div>

              <div className="mt-10 flex flex-col gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="w-full rounded-full sm:w-auto"
                  onClick={handleClose}
                >
                  Fechar
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
