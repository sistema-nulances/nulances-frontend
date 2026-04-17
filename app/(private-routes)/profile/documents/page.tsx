"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  IdCardLanyardIcon,
  SecurityIcon,
  CheckmarkCircle02Icon,
  CloudUploadIcon,
  Delete01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/cn";
import { useAuth } from "@/components/providers/auth-provider";
import {
  documentacaoKycTotalmenteAprovada,
  isTipoDocumentoPendente,
  resumoLinhasDocumentosIdentidade,
} from "@/lib/documentos-validacao-kyc";
import { tipoDocumentoValidacaoEnum, type DocIdentidadeTipoUi } from "@/lib/documentos-validacao-tipo";
import { enviarArquivoDocumentoValidacao } from "@/lib/repositories/documentos-validacao-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";

const ACCEPT_IMAGES = "image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

function isAllowedImageFile(file: File): boolean {
  const t = (file.type || "").toLowerCase();
  if (t === "image/jpeg" || t === "image/jpg" || t === "image/png" || t === "image/webp") return true;
  const n = file.name.toLowerCase();
  return /\.(jpe?g|png|webp)$/i.test(n);
}

/** Pré-visualização local; revoga o object URL ao trocar ou remover o arquivo. */
function useObjectUrl(file: File | null): string | null {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);
  return url;
}

export default function DocumentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, status, refreshUser } = useAuth();

  const [docType, setDocType] = useState<DocIdentidadeTipoUi>("RG");
  const [fileFrente, setFileFrente] = useState<File | null>(null);
  const [fileVerso, setFileVerso] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previewFrente = useObjectUrl(fileFrente);
  const previewVerso = useObjectUrl(fileVerso);

  useEffect(() => {
    if (status !== "ready") return;
    if (!user) {
      router.replace("/auth?returnUrl=/profile/documents");
    }
  }, [status, user, router]);

  /** Ao trocar RG ↔ CNH, limpa arquivos selecionados (pares independentes). */
  useEffect(() => {
    setFileFrente(null);
    setFileVerso(null);
  }, [docType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "frente" | "verso") => {
    const docs = user?.documentosValidacao ?? [];
    const tipo = tipoDocumentoValidacaoEnum(docType, side);
    if (isTipoDocumentoPendente(docs, tipo)) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        type: "error",
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é de 5MB.",
      });
      return;
    }
    if (!isAllowedImageFile(file)) {
      toast({
        type: "error",
        title: "Formato inválido",
        description: "Envie apenas imagem JPG, PNG ou WEBP.",
      });
      return;
    }
    if (side === "frente") setFileFrente(file);
    else setFileVerso(file);
  };

  const handleRemoveFile = (side: "frente" | "verso") => {
    const docs = user?.documentosValidacao ?? [];
    const tipo = tipoDocumentoValidacaoEnum(docType, side);
    if (isTipoDocumentoPendente(docs, tipo)) return;
    if (side === "frente") setFileFrente(null);
    else setFileVerso(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const docs = user?.documentosValidacao ?? [];
    const tf = tipoDocumentoValidacaoEnum(docType, "frente");
    const tv = tipoDocumentoValidacaoEnum(docType, "verso");
    if (isTipoDocumentoPendente(docs, tf) || isTipoDocumentoPendente(docs, tv)) {
      toast({
        type: "info",
        title: "Trecho em análise",
        description:
          "Um ou mais lados deste documento já estão pendente. Aguarde a análise ou envie o outro tipo (ex.: CNH) se ainda não enviou.",
      });
      return;
    }
    if (!fileFrente || !fileVerso) {
      toast({
        type: "warning",
        title: "Documentos incompletos",
        description: "Envie a frente e o verso do documento.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await enviarArquivoDocumentoValidacao(fileFrente, tf);
      await enviarArquivoDocumentoValidacao(fileVerso, tv);
      await refreshUser();
      setFileFrente(null);
      setFileVerso(null);
      toast({
        type: "success",
        title: "Documentos enviados",
        description: "Suas imagens foram registradas e estão em análise.",
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? String(err.message) : err instanceof Error ? err.message : "Tente novamente.";
      toast({ type: "error", title: "Não foi possível enviar", description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || (status === "ready" && !user)) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center py-24">
          <p className="text-sm text-zinc-500">Carregando…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return null;
  }

  const kycOk = documentacaoKycTotalmenteAprovada(user);
  const docs = user.documentosValidacao ?? [];
  const temRejeitado = docs.some((d) => String(d.status ?? "").toUpperCase() === "REJEITADO");
  const temAlgumPendente = docs.some((d) => String(d.status ?? "").toUpperCase() === "PENDENTE");

  const tf = tipoDocumentoValidacaoEnum(docType, "frente");
  const tv = tipoDocumentoValidacaoEnum(docType, "verso");
  const pendFrente = isTipoDocumentoPendente(docs, tf);
  const pendVerso = isTipoDocumentoPendente(docs, tv);
  const rgEmAnalise =
    isTipoDocumentoPendente(docs, "RG_FRENTE") || isTipoDocumentoPendente(docs, "RG_VERSO");
  const cnhEmAnalise =
    isTipoDocumentoPendente(docs, "CNH_FRENTE") || isTipoDocumentoPendente(docs, "CNH_VERSO");

  return (
    <>
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto w-full max-w-375 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              Verificação de identidade
            </h1>
            <p className="mt-3 text-base leading-relaxed text-zinc-500">
              Para garantir a segurança na plataforma e liberar sua conta para dar lances, precisamos validar seus
              documentos. Escolha RG ou CNH e envie fotos nítidas da frente e do verso.
            </p>
          </div>

          {kycOk ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-8 ring-1 ring-emerald-100">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={28} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-emerald-950">Documentação aprovada</h2>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-900/90">
                    Sua identidade foi verificada. O aviso no menu some automaticamente quando todos os documentos
                    estão com status APROVADO.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                {(temAlgumPendente || temRejeitado) && (
                  <div
                    className={cn(
                      "mb-6 rounded-2xl border p-4",
                      temRejeitado && !temAlgumPendente
                        ? "border-amber-300 bg-amber-50 text-amber-950"
                        : "border-blue-200 bg-blue-50 text-blue-950"
                    )}
                  >
                    <div className="flex gap-3">
                      <HugeiconsIcon
                        icon={Alert02Icon}
                        className="mt-0.5 shrink-0"
                        size={20}
                      />
                      <div className="text-sm">
                        {temAlgumPendente ? (
                          <>
                            <p className="font-semibold">Em análise (por tipo)</p>
                            <p className="mt-1 opacity-90">
                              Cada frente/verso enviado fica pendente sozinho: não dá para substituir só aquele trecho até a
                              análise. Se já enviou RG e está em análise, ainda pode enviar CNH (e o contrário).
                            </p>
                          </>
                        ) : temRejeitado ? (
                          <>
                            <p className="font-semibold">Ajuste necessário</p>
                            <p className="mt-1 opacity-90">
                              Um ou mais documentos precisam ser reenviados. Substitua as imagens abaixo e envie
                              novamente.
                            </p>
                          </>
                        ) : null}
                      </div>
                    </div>
                    {docs.length > 0 && (
                      <ul className="mt-3 list-inside list-disc text-xs opacity-90">
                        {resumoLinhasDocumentosIdentidade(docs).map((row) => (
                          <li key={row.key}>{row.linha}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8">
                  <div className="mb-8">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                      Tipo de documento
                    </h3>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setDocType("RG")}
                        className={cn(
                          "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border-2 py-4 font-semibold transition-all sm:flex-row sm:gap-2",
                          docType === "RG"
                            ? "border-nulance-purple bg-nulance-purple/5 text-nulance-purple"
                            : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        <HugeiconsIcon icon={IdCardLanyardIcon} size={20} />
                        <span>Carteira de Identidade (RG)</span>
                        {rgEmAnalise && (
                          <span className="text-[11px] font-medium text-blue-600 sm:absolute sm:bottom-1.5">
                            em análise
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDocType("CNH")}
                        className={cn(
                          "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border-2 py-4 font-semibold transition-all sm:flex-row sm:gap-2",
                          docType === "CNH"
                            ? "border-nulance-purple bg-nulance-purple/5 text-nulance-purple"
                            : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        <HugeiconsIcon icon={IdCardLanyardIcon} size={20} />
                        <span>CNH</span>
                        {cnhEmAnalise && (
                          <span className="text-[11px] font-medium text-blue-600 sm:absolute sm:bottom-1.5">
                            em análise
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="mb-3 font-semibold text-zinc-900">1. Frente do {docType}</h4>
                      {!fileFrente ? (
                        <label
                          htmlFor="upload-frente"
                          className={cn(
                            "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-10 transition-all",
                            pendFrente
                              ? "cursor-not-allowed opacity-70"
                              : "cursor-pointer hover:border-nulance-purple/50 hover:bg-nulance-purple/5"
                          )}
                        >
                          <div className="mb-3 rounded-full bg-white p-3 ring-1 ring-zinc-200">
                            <HugeiconsIcon icon={CloudUploadIcon} size={24} className="text-zinc-500" />
                          </div>
                          <span className="text-sm font-semibold text-zinc-700">Clique para enviar</span>
                          <span className="mt-1 text-xs text-zinc-400">JPG, PNG ou WEBP (máx. 5MB)</span>
                          <input
                            id="upload-frente"
                            type="file"
                            accept={ACCEPT_IMAGES}
                            className="hidden"
                            disabled={pendFrente}
                            onChange={(e) => handleFileChange(e, "frente")}
                          />
                        </label>
                      ) : (
                        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
                          {previewFrente && (
                            <div className="relative h-56 w-full bg-zinc-100">
                              <Image
                                src={previewFrente}
                                alt="Pré-visualização da frente do documento"
                                fill
                                unoptimized
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, 672px"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-3 border-t border-emerald-200/80 p-4">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-emerald-900">{fileFrente.name}</p>
                              <p className="text-xs text-emerald-700">{(fileFrente.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                              type="button"
                              disabled={pendFrente}
                              onClick={() => handleRemoveFile("frente")}
                              className="shrink-0 p-2 text-emerald-600 transition-colors hover:text-emerald-800 disabled:opacity-40"
                              aria-label="Remover arquivo"
                            >
                              <HugeiconsIcon icon={Delete01Icon} size={20} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="mb-3 font-semibold text-zinc-900">2. Verso do {docType}</h4>
                      {!fileVerso ? (
                        <label
                          htmlFor="upload-verso"
                          className={cn(
                            "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-10 transition-all",
                            pendVerso
                              ? "cursor-not-allowed opacity-70"
                              : "cursor-pointer hover:border-nulance-purple/50 hover:bg-nulance-purple/5"
                          )}
                        >
                          <div className="mb-3 rounded-full bg-white p-3 ring-1 ring-zinc-200">
                            <HugeiconsIcon icon={CloudUploadIcon} size={24} className="text-zinc-500" />
                          </div>
                          <span className="text-sm font-semibold text-zinc-700">Clique para enviar</span>
                          <span className="mt-1 text-xs text-zinc-400">JPG, PNG ou WEBP (máx. 5MB)</span>
                          <input
                            id="upload-verso"
                            type="file"
                            accept={ACCEPT_IMAGES}
                            className="hidden"
                            disabled={pendVerso}
                            onChange={(e) => handleFileChange(e, "verso")}
                          />
                        </label>
                      ) : (
                        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
                          {previewVerso && (
                            <div className="relative h-56 w-full bg-zinc-100">
                              <Image
                                src={previewVerso}
                                alt="Pré-visualização do verso do documento"
                                fill
                                unoptimized
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, 672px"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-3 border-t border-emerald-200/80 p-4">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-emerald-900">{fileVerso.name}</p>
                              <p className="text-xs text-emerald-700">{(fileVerso.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                              type="button"
                              disabled={pendVerso}
                              onClick={() => handleRemoveFile("verso")}
                              className="shrink-0 p-2 text-emerald-600 transition-colors hover:text-emerald-800 disabled:opacity-40"
                              aria-label="Remover arquivo"
                            >
                              <HugeiconsIcon icon={Delete01Icon} size={20} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-10 border-t border-zinc-100 pt-6">
                    <Button
                      type="submit"
                      size="lg"
                      className="h-14 w-full text-base font-semibold"
                      disabled={
                        isSubmitting || pendFrente || pendVerso || !fileFrente || !fileVerso
                      }
                      loading={isSubmitting}
                    >
                      Enviar para análise
                    </Button>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <div className="rounded-3xl bg-nulance-purple/5 p-6 ring-1 ring-nulance-purple/10">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-nulance-purple">
                        <HugeiconsIcon icon={SecurityIcon} size={20} />
                      </div>
                      <h3 className="font-bold text-nulance-purple">Seus dados estão seguros</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-nulance-purple/80">
                      O arquivo sobe para armazenamento seguro; apenas a referência do arquivo é registrada na sua conta
                      após a confirmação.
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200">
                    <h3 className="mb-4 font-bold text-zinc-900">Dicas para aprovação rápida</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                        <span className="text-sm text-zinc-600">Retire o documento do plástico para evitar reflexos.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                        <span className="text-sm text-zinc-600">Ambiente bem iluminado e foto nítida.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                        <span className="text-sm text-zinc-600">Enquadre o documento inteiro, sem cortar bordas.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
