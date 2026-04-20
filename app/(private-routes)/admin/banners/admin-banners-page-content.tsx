"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import {
  criarBannerAdmin,
  editarBannerAdmin,
  excluirBannerAdmin,
  gerarUploadUrlBannerAdmin,
  listarBannersAdmin,
} from "@/lib/repositories/admin-banners-repository";
import {
  DEFAULT_HOME_BANNERS,
  DEFAULT_MARKETPLACE_BANNERS,
  HOME_BANNER_IDEAL,
  loadHomeBannersFromStorage,
  loadMarketplaceBannersFromStorage,
  saveHomeBannersToStorage,
  saveMarketplaceBannersToStorage,
  type HomeBannerSlide,
} from "@/lib/home-banners";
import type { BannerAdminResponse } from "@/lib/repositories/types/banner.types";

export type AdminBannersVariant = "home" | "marketplace";

const BANNER_ADMIN_CFG = {
  home: {
    load: loadHomeBannersFromStorage,
    save: saveHomeBannersToStorage,
    defaults: DEFAULT_HOME_BANNERS,
    subtitle:
      "Imagens do carrossel em destaque no topo da página inicial do leilão.",
    imageSavedDesc: "A home do leilão foi atualizada com sucesso.",
  },
  marketplace: {
    load: loadMarketplaceBannersFromStorage,
    save: saveMarketplaceBannersToStorage,
    defaults: DEFAULT_MARKETPLACE_BANNERS,
    subtitle: "Imagens do carrossel em destaque no topo do marketplace público.",
    imageSavedDesc: "O banner do marketplace foi atualizado com sucesso.",
  },
} as const;

const MAX_FILE_BYTES = 2_400_000;

/** Proporção da pré-visualização alinhada a 1600×463. */
const BANNER_PREVIEW_ASPECT = "aspect-[1600/463]";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      if (typeof r.result === "string") resolve(r.result);
      else reject(new Error("Leitura inválida"));
    };
    r.onerror = () => reject(r.error ?? new Error("Falha ao ler arquivo"));
    r.readAsDataURL(file);
  });
}

function nextSlideId(slides: HomeBannerSlide[]): number {
  const max = slides.reduce((acc, s) => Math.max(acc, s.id), 0);
  return max + 1;
}

function BannerPreview({ slide, className }: { slide: HomeBannerSlide; className?: string }) {
  const isRemoteOrData =
    slide.image.startsWith("data:") ||
    slide.image.startsWith("blob:") ||
    slide.image.startsWith("http://") ||
    slide.image.startsWith("https://");

  return (
    <div
      className={cn(
        "relative w-full rounded-xl border border-zinc-200 bg-zinc-100",
        BANNER_PREVIEW_ASPECT,
        className
      )}
    >
      {isRemoteOrData ? (
        // eslint-disable-next-line @next/next/no-img-element -- data/blob e URLs arbitrárias
        <img src={slide.image} alt="" className="h-full w-full object-cover" />
      ) : (
        <Image src={slide.image} alt="" fill className="object-cover" sizes="(min-width: 768px) 640px, 100vw" />
      )}
    </div>
  );
}

type AdminBannersPageContentProps = {
  variant?: AdminBannersVariant;
};

export function AdminBannersPageContent({ variant = "home" }: AdminBannersPageContentProps) {
  const cfg = BANNER_ADMIN_CFG[variant];
  const bannerTipo = variant === "home" ? "LEILAO" : "MARKETPLACE";
  const { toast } = useToast();
  const createFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [apiBanners, setApiBanners] = React.useState<BannerAdminResponse[]>([]);
  const [apiLoading, setApiLoading] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<string | null>(null);
  const [savingAltId, setSavingAltId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [altDraft, setAltDraft] = React.useState<Record<string, string>>({});
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewerIndex, setViewerIndex] = React.useState(0);
  const [slides, setSlides] = React.useState<HomeBannerSlide[]>(cfg.defaults);
  const replaceInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  React.useEffect(() => {
    if (variant === "home") return;
    setSlides(cfg.load());
  }, [cfg]);

  const refreshApiBanners = React.useCallback(async () => {
    setApiLoading(true);
    try {
      const rows = await listarBannersAdmin();
      setApiBanners(
        rows
          .filter((b) => b.tipo === bannerTipo)
          .sort((a, b) => a.posicao - b.posicao || String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")))
      );
      setAltDraft(
        Object.fromEntries(
          rows
            .filter((b) => b.tipo === bannerTipo)
            .map((b) => [b.id, b.textoAlternativo ?? ""])
        )
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Verifique a API e tente novamente.";
      toast({ type: "error", title: "Erro ao carregar banners", description: msg });
    } finally {
      setApiLoading(false);
    }
  }, [bannerTipo, toast]);

  React.useEffect(() => {
    void refreshApiBanners();
  }, [refreshApiBanners]);

  const openViewer = React.useCallback((index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  }, []);

  const handleFile = React.useCallback(
    async (slideId: number, file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast({ type: "warning", title: "Arquivo inválido", description: "Envie uma imagem (PNG, JPG, WebP…)." });
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast({
          type: "warning",
          title: "Arquivo grande demais",
          description: `Use até cerca de ${Math.round(MAX_FILE_BYTES / 1_000_000)} MB ou comprima a arte.`,
        });
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setSlides((prev) => {
          const next = prev.map((s) =>
            s.id === slideId ? { ...s, image: dataUrl, alt: s.alt.trim() || "Banner" } : s
          );
          try {
            cfg.save(next);
            toast({
              type: "success",
              title: "Imagem atualizada",
              description: cfg.imageSavedDesc,
            });
          } catch {
            toast({
              type: "error",
              title: "Não foi possível salvar",
              description: `Armazenamento cheio ou bloqueado. Tente uma imagem menor (~${HOME_BANNER_IDEAL.widthPx}×${HOME_BANNER_IDEAL.heightPx} px).`,
            });
            return prev;
          }
          return next;
        });
      } catch {
        toast({ type: "error", title: "Erro ao ler imagem", description: "Tente outro arquivo." });
      }
    },
    [toast, cfg]
  );

  const handleAltChange = React.useCallback(
    (slideId: number, alt: string) => {
      setSlides((prev) => {
        const next = prev.map((s) => (s.id === slideId ? { ...s, alt } : s));
        try {
          cfg.save(next);
        } catch {
          /* silencioso no digitar; upload falhará visível */
        }
        return next;
      });
    },
    [cfg]
  );

  const addBanner = React.useCallback(() => {
    createFileInputRef.current?.click();
  }, []);

  const removeBanner = React.useCallback(
    (slideId: number) => {
      setSlides((prev) => {
        if (prev.length <= 1) {
          toast({
            type: "warning",
            title: "Mantenha ao menos um banner",
            description: "O carrossel precisa de pelo menos uma imagem.",
          });
          return prev;
        }
        const next = prev.filter((s) => s.id !== slideId);
        try {
          cfg.save(next);
          toast({ type: "success", title: "Banner removido", description: "Lista atualizada e salva." });
        } catch {
          toast({
            type: "error",
            title: "Não foi possível salvar",
            description: "Tente novamente ou libere espaço no armazenamento do navegador.",
          });
          return prev;
        }
        return next;
      });
    },
    [toast, cfg]
  );

  return (
    <div>
      <PageHeader
        title="Banners"
        subtitle={cfg.subtitle}
        action={
          <Button type="button" onClick={addBanner}>
            Adicionar banner
          </Button>
        }
      />

      <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold text-zinc-900">Tamanho ideal da arte</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Exporte ou redimensione seus arquivos para{" "}
          <strong className="font-semibold text-zinc-800">
            {HOME_BANNER_IDEAL.widthPx} × {HOME_BANNER_IDEAL.heightPx} pixels
          </strong>{" "}
          (proporção <strong className="font-semibold text-zinc-800">{HOME_BANNER_IDEAL.aspectRatioLabel}</strong>
          ). Referência visual:{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-800">public/BANNER-MOCK1.png</code>
          . Assim o banner fica bem enquadrado e evita cortes em textos ou logos.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {variant === "home" || variant === "marketplace" ? (
          <>
            <input
              ref={createFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;

                if (!file.type.startsWith("image/")) {
                  toast({
                    type: "warning",
                    title: "Arquivo inválido",
                    description: "Envie uma imagem (PNG, JPG, WebP).",
                  });
                  return;
                }
                if (file.size > MAX_FILE_BYTES) {
                  toast({
                    type: "warning",
                    title: "Arquivo grande demais",
                    description: `Use até cerca de ${Math.round(MAX_FILE_BYTES / 1_000_000)} MB ou comprima a arte.`,
                  });
                  return;
                }

                setCreating(true);
                setUploadStatus("Solicitando URL de upload...");
                try {
                  const upload = await gerarUploadUrlBannerAdmin({
                    fileName: file.name,
                    contentType: file.type,
                  });

                  setUploadStatus("Enviando imagem...");
                  const put = await fetch(upload.uploadUrl, {
                    method: "PUT",
                    headers: { "Content-Type": file.type },
                    body: file,
                  });
                  if (!put.ok) {
                    throw new Error("Falha ao enviar arquivo para o storage.");
                  }

                  setUploadStatus("Salvando banner...");
                  const posicao = (apiBanners[apiBanners.length - 1]?.posicao ?? 0) + 1;
                  await criarBannerAdmin({
                    tipo: bannerTipo,
                    posicao,
                    textoAlternativo: `Banner ${posicao}`,
                    imagem: upload.objectKey,
                    ativo: true,
                  });

                  await refreshApiBanners();
                  toast({
                    type: "success",
                    title: "Banner criado",
                    description:
                      bannerTipo === "LEILAO"
                        ? "Banner de leilão publicado com sucesso."
                        : "Banner do marketplace publicado com sucesso.",
                  });
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "Não foi possível criar banner.";
                  toast({ type: "error", title: "Falha ao criar banner", description: msg });
                } finally {
                  setCreating(false);
                  setUploadStatus(null);
                }
              }}
            />

            {creating && uploadStatus ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="font-semibold">Processando upload do banner</p>
                <p className="mt-1">{uploadStatus}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-200/70">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-amber-500" />
                </div>
              </div>
            ) : null}

            {apiLoading ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
                Carregando banners...
              </div>
            ) : apiBanners.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
                {bannerTipo === "LEILAO" ? "Nenhum banner de leilão cadastrado ainda." : "Nenhum banner de marketplace cadastrado ainda."}{" "}
                Clique em <strong>Adicionar banner</strong> para criar.
              </div>
            ) : (
              apiBanners.map((banner, index) => (
                <div key={banner.id} className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-900">Banner posição {banner.posicao}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          banner.ativo ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                        )}
                      >
                        {banner.ativo ? "Ativo" : "Inativo"}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        loading={deletingId === banner.id}
                        onClick={async () => {
                          setDeletingId(banner.id);
                          try {
                            await excluirBannerAdmin(banner.id);
                            await refreshApiBanners();
                            toast({ type: "success", title: "Banner removido", description: "Banner excluído com sucesso." });
                          } catch (e) {
                            const msg = e instanceof Error ? e.message : "Não foi possível excluir banner.";
                            toast({ type: "error", title: "Falha ao excluir", description: msg });
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                      >
                        <TrashIcon className="mr-1.5 h-4 w-4" aria-hidden />
                        Remover
                      </Button>
                    </div>
                  </div>

                  <button type="button" className="mb-4 block w-full text-left" onClick={() => openViewer(index)}>
                    <BannerPreview
                      slide={{ id: Number(banner.posicao), image: banner.arquivoUrl, alt: banner.textoAlternativo ?? "" }}
                      className="cursor-zoom-in"
                    />
                  </button>

                  <div className="space-y-3">
                    <div>
                      <Label>Texto alternativo</Label>
                      <div className="mt-1.5 flex gap-2">
                        <Input
                          value={altDraft[banner.id] ?? ""}
                          onChange={(e) =>
                            setAltDraft((prev) => ({
                              ...prev,
                              [banner.id]: e.target.value,
                            }))
                          }
                          disabled={savingAltId === banner.id}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          loading={savingAltId === banner.id}
                          onClick={async () => {
                            setSavingAltId(banner.id);
                            try {
                              await editarBannerAdmin(banner.id, {
                                textoAlternativo: (altDraft[banner.id] ?? "").trim() || undefined,
                              });
                              await refreshApiBanners();
                              toast({
                                type: "success",
                                title: "Texto alternativo atualizado",
                                description: "Alteração salva no banner.",
                              });
                            } catch (e) {
                              const msg = e instanceof Error ? e.message : "Não foi possível salvar o texto alternativo.";
                              toast({ type: "error", title: "Falha ao salvar", description: msg });
                            } finally {
                              setSavingAltId(null);
                            }
                          }}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Object key</Label>
                      <Input value={banner.imagem} className="mt-1.5" disabled />
                    </div>
                    <div>
                      <input
                        ref={(el) => {
                          replaceInputRefs.current[banner.id] = el;
                        }}
                        id={`banner-replace-file-${banner.id}`}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="sr-only"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (!file) return;
                          if (!file.type.startsWith("image/")) {
                            toast({
                              type: "warning",
                              title: "Arquivo inválido",
                              description: "Envie uma imagem (PNG, JPG, WebP).",
                            });
                            return;
                          }
                          if (file.size > MAX_FILE_BYTES) {
                            toast({
                              type: "warning",
                              title: "Arquivo grande demais",
                              description: `Use até cerca de ${Math.round(MAX_FILE_BYTES / 1_000_000)} MB ou comprima a arte.`,
                            });
                            return;
                          }

                          setCreating(true);
                          setUploadStatus("Solicitando URL de upload...");
                          try {
                            const upload = await gerarUploadUrlBannerAdmin({
                              fileName: file.name,
                              contentType: file.type,
                            });
                            setUploadStatus("Enviando nova imagem...");
                            const put = await fetch(upload.uploadUrl, {
                              method: "PUT",
                              headers: { "Content-Type": file.type },
                              body: file,
                            });
                            if (!put.ok) throw new Error("Falha ao enviar arquivo para o storage.");
                            setUploadStatus("Atualizando banner...");
                            await editarBannerAdmin(banner.id, { imagem: upload.objectKey });
                            await refreshApiBanners();
                            toast({
                              type: "success",
                              title: "Imagem atualizada",
                              description: "Banner atualizado com a nova imagem.",
                            });
                          } catch (err) {
                            const msg = err instanceof Error ? err.message : "Não foi possível atualizar imagem.";
                            toast({ type: "error", title: "Falha ao atualizar imagem", description: msg });
                          } finally {
                            setCreating(false);
                            setUploadStatus(null);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => replaceInputRefs.current[banner.id]?.click()}
                        disabled={creating}
                      >
                        Trocar imagem…
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          slides.map((slide, index) => (
          <div key={slide.id} className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-zinc-900">Banner {index + 1}</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => removeBanner(slide.id)}
                aria-label={`Remover banner ${index + 1}`}
              >
                <TrashIcon className="mr-1.5 h-4 w-4" aria-hidden />
                Remover
              </Button>
            </div>

            <BannerPreview slide={slide} className="mb-4" />

            <div className="space-y-3">
              <div>
                <Label htmlFor={`banner-alt-${slide.id}`}>Texto alternativo (acessibilidade)</Label>
                <Input
                  id={`banner-alt-${slide.id}`}
                  value={slide.alt}
                  onChange={(e) => handleAltChange(slide.id, e.target.value)}
                  className="mt-1.5"
                  placeholder="Descrição curta do banner"
                />
              </div>
              <div>
                <input
                  id={`banner-file-${slide.id}`}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  aria-hidden
                  tabIndex={-1}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    void handleFile(slide.id, f);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => document.getElementById(`banner-file-${slide.id}`)?.click()}
                >
                  Trocar imagem…
                </Button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-5xl p-2 sm:p-3">
          {apiBanners.length > 0 ? (
            <div className="relative">
              <div className="relative aspect-[1600/463] w-full overflow-hidden rounded-xl bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={apiBanners[viewerIndex]?.arquivoUrl}
                  alt={apiBanners[viewerIndex]?.textoAlternativo ?? `Banner ${viewerIndex + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              {apiBanners.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white"
                    aria-label="Imagem anterior"
                    onClick={() =>
                      setViewerIndex((i) => (i - 1 + apiBanners.length) % apiBanners.length)
                    }
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white"
                    aria-label="Próxima imagem"
                    onClick={() => setViewerIndex((i) => (i + 1) % apiBanners.length)}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
