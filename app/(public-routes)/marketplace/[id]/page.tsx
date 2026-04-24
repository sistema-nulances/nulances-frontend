"use client";

import React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  WhatsappIcon,
  Location01Icon,
  ImageNotFound01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  LayoutGridIcon,
  Camera01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import type { MarketplaceItem } from "@/data/marketplace-items";
import { buildMarketplaceTechSheet, type TechSheetRow } from "@/lib/marketplace-ad-tech-sheet";
import { resolveBemMarcaIconFromMarca } from "@/lib/bem-marca-icon";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { cn } from "@/lib/cn";
import { formatEnumDisplayLabel } from "@/lib/format-enum-label";
import { digitsOnly, formatPhoneBr } from "@/lib/formatters";
import { buscarAnuncioPublicoPorId } from "@/lib/repositories/marketplace-anuncios-public-repository";
import { mapAnuncioPublicoDetalheToMarketplaceItem } from "@/lib/marketplace-public-map";
import type { AnuncioPublicoDetalheResponse } from "@/lib/repositories/types/marketplace-public.types";
import { getApiBaseUrl } from "@/lib/api/api-url";
import { consultarFipePorMarcaModeloAno } from "@/lib/repositories/fipe-repository";

function TechSpecGrid({ rows }: { rows: TechSheetRow[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
      {rows.map((row, idx) => (
        <div
          key={`${row.label}-${idx}`}
          className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        >
          <dt className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            {row.label}
          </dt>
          <dd className="min-w-0 text-[15px] font-medium leading-snug text-zinc-900 sm:max-w-[58%] sm:text-right">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function safeYearFromAno(ano: string) {
  const [fab, mod] = ano.split("/");
  return { fab: fab?.trim() || "N/A", mod: mod?.trim() || "N/A" };
}

function buildAnoFabMod(marketplace: MarketplaceItem) {
  const { fab, mod } = safeYearFromAno(marketplace.ano);
  return `${fab}/${mod}`;
}

function resolveSellerPhotoUrl(raw: string | null | undefined): string | undefined {
  const value = String(raw ?? "").trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value) || value.startsWith("blob:") || value.startsWith("data:")) {
    return value;
  }
  const base = getApiBaseUrl();
  if (value.startsWith("/")) return `${base}${value}`;
  return `${base}/${value}`;
}

function resolveAnoReferencia(anoRaw: string | null | undefined, anoNum: number | null | undefined): number | null {
  if (Number.isFinite(anoNum)) return Number(anoNum);
  const first = String(anoRaw ?? "")
    .split("/")[0]
    ?.trim();
  const parsed = Number(first);
  return Number.isFinite(parsed) ? parsed : null;
}

function getWhatsappHref(phoneRaw: string | null | undefined, modelo: string): string | null {
  const rawDigits = digitsOnly(String(phoneRaw ?? ""));
  if (rawDigits.length < 10) return null;

  // Remove prefixo de discagem nacional (0 + operadora), ex.: 0311199999999 -> 11999999999.
  const digits = rawDigits.startsWith("0") && rawDigits.length > 11 ? rawDigits.slice(3) : rawDigits;
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  const text = `Quero saber mais sobre o anuncio ${modelo} publicado na NuLances`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

const VISIBLE_SLOTS = 3;
const FALLBACK_MARKETPLACE_ITEM: MarketplaceItem = {
  id: "fallback",
  leilaoId: 0,
  categoria: "carros",
  status: "ABERTO",
  titulo: "Anúncio",
  condicao: "Média monta",
  marca: "—",
  modelo: "—",
  ano: "N/A/N/A",
  km: "—",
  cambio: "—",
  combustivel: "—",
  local: "—",
  preco: "Sob consulta",
};

/** Três URLs exibidas lado a lado; `start` é o índice da foto mais à esquerda (para badge e lightbox). */
function getCarouselTriplet(urls: string[], start: number): { triplet: string[]; startClamped: number; maxStart: number } {
  const n = urls.length;
  if (n === 0) {
    return { triplet: [], startClamped: 0, maxStart: 0 };
  }
  if (n === 1) {
    return { triplet: [urls[0], urls[0], urls[0]], startClamped: 0, maxStart: 0 };
  }
  if (n === 2) {
    const maxStart = 1;
    const s = Math.max(0, Math.min(start, maxStart));
    const at = (k: number) => urls[(s + k) % 2];
    return { triplet: [at(0), at(1), at(2)], startClamped: s, maxStart };
  }
  const maxStart = n - VISIBLE_SLOTS;
  const s = Math.max(0, Math.min(start, maxStart));
  return {
    triplet: [urls[s], urls[s + 1], urls[s + 2]],
    startClamped: s,
    maxStart,
  };
}

export default function MarketplaceAdDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [carouselStart, setCarouselStart] = React.useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);
  const [detail, setDetail] = React.useState<AnuncioPublicoDetalheResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = React.useState(true);
  const [detailError, setDetailError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    let active = true;
    setLoadingDetail(true);
    setDetailError(null);
    void buscarAnuncioPublicoPorId(String(id))
      .then((response) => {
        if (!active) return;
        setDetail(response);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setDetail(null);
        setDetailError(error instanceof Error ? error.message : "Não foi possível carregar o anúncio.");
      })
      .finally(() => {
        if (active) setLoadingDetail(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const marketplaceItem = React.useMemo(() => {
    if (!detail) return null;
    return mapAnuncioPublicoDetalheToMarketplaceItem(detail);
  }, [detail]);
  const effectiveMarketplaceItem = marketplaceItem ?? FALLBACK_MARKETPLACE_ITEM;
  const [fipe, setFipe] = React.useState("Sob consulta");
  const [loadingFipe, setLoadingFipe] = React.useState(false);

  React.useEffect(() => {
    setCarouselStart(0);
  }, [id]);

  React.useEffect(() => {
    if (!marketplaceItem) {
      setFipe("Sob consulta");
      setLoadingFipe(false);
      return;
    }
    const marcaRef = String(detail?.marcaVeiculo ?? effectiveMarketplaceItem.marca ?? "").trim();
    const modeloRef = String(detail?.modelo ?? effectiveMarketplaceItem.modelo ?? "").trim();
    const anoRef = resolveAnoReferencia(effectiveMarketplaceItem.ano, detail?.ano);
    if (!marcaRef || !modeloRef || !anoRef) {
      setFipe("Sob consulta");
      setLoadingFipe(false);
      return;
    }

    let active = true;
    setLoadingFipe(true);
    void consultarFipePorMarcaModeloAno({
      marca: marcaRef,
      modelo: modeloRef,
      ano: anoRef,
      tipoVeiculo: effectiveMarketplaceItem.categoria,
    })
      .then((valor) => {
        if (!active) return;
        setFipe(valor || "Sob consulta");
      })
      .catch(() => {
        if (!active) return;
        setFipe("Sob consulta");
      })
      .finally(() => {
        if (active) setLoadingFipe(false);
      });

    return () => {
      active = false;
    };
  }, [
    detail?.ano,
    detail?.marcaVeiculo,
    detail?.modelo,
    effectiveMarketplaceItem.ano,
    effectiveMarketplaceItem.categoria,
    effectiveMarketplaceItem.marca,
    effectiveMarketplaceItem.modelo,
    marketplaceItem,
  ]);

  const anoFabMod = buildAnoFabMod(effectiveMarketplaceItem);
  const cor = detail?.cor?.trim() || "N/A";
  const blindado = detail?.blindado ? "Sim" : "Não";
  const kmValue = effectiveMarketplaceItem.km;
  const cambioValue = effectiveMarketplaceItem.cambio;
  const combustivelValue = effectiveMarketplaceItem.combustivel;
  const descricao = (detail?.descricao?.trim() || effectiveMarketplaceItem.titulo).trim();
  const galleryImages = (
    ((effectiveMarketplaceItem as MarketplaceItem & { imagens?: string[] }).imagens ?? []).length > 0
      ? (effectiveMarketplaceItem as MarketplaceItem & { imagens?: string[] }).imagens!
      : effectiveMarketplaceItem.imagem
        ? [effectiveMarketplaceItem.imagem]
        : []
  );
  const totalPhotos = galleryImages.length;
  const { triplet, startClamped: safeCarouselStart, maxStart: carouselMaxStart } = React.useMemo(
    () => getCarouselTriplet(galleryImages, carouselStart),
    [galleryImages, carouselStart],
  );

  React.useEffect(() => {
    if (carouselStart !== safeCarouselStart) {
      setCarouselStart(safeCarouselStart);
    }
  }, [carouselStart, safeCarouselStart]);

  const goPrevPhoto = React.useCallback(() => {
    setCarouselStart((s) => Math.max(0, s - 1));
  }, []);

  const goNextPhoto = React.useCallback(() => {
    setCarouselStart((s) => Math.min(carouselMaxStart, s + 1));
  }, [carouselMaxStart]);

  const canGoPrevCarousel = totalPhotos > 0 && safeCarouselStart > 0;
  const canGoNextCarousel = totalPhotos > 0 && safeCarouselStart < carouselMaxStart;

  const safeLightboxIndex = totalPhotos > 0 ? Math.min(lightboxIndex, totalPhotos - 1) : 0;

  const goPrevLightbox = React.useCallback(() => {
    if (totalPhotos <= 1) return;
    setLightboxIndex((i) => (i - 1 + totalPhotos) % totalPhotos);
  }, [totalPhotos]);

  const goNextLightbox = React.useCallback(() => {
    if (totalPhotos <= 1) return;
    setLightboxIndex((i) => (i + 1) % totalPhotos);
  }, [totalPhotos]);

  const openGallery = React.useCallback(() => {
    setLightboxIndex(safeCarouselStart);
    setIsGalleryOpen(true);
  }, [safeCarouselStart]);

  const techSheetSections = React.useMemo(
    () => buildMarketplaceTechSheet(undefined, effectiveMarketplaceItem, detail?.detalheTecnico),
    [detail?.detalheTecnico, effectiveMarketplaceItem],
  );
  const brandIcon = React.useMemo(
    () => resolveBemMarcaIconFromMarca(effectiveMarketplaceItem.marca, effectiveMarketplaceItem.titulo),
    [effectiveMarketplaceItem.marca, effectiveMarketplaceItem.titulo]
  );

  const seller = {
    nome: detail?.vendedor?.nome?.trim() || "Revenda Parceira NuLances",
    endereco: detail?.vendedor?.cidade?.trim() || `${effectiveMarketplaceItem.local}, Brasil`,
    telefone: detail?.vendedor?.telefoneContato?.trim() || "",
    descricao:
      detail?.vendedor?.sobre?.trim() ||
      "Equipe especializada em compra e venda de veículos, com atendimento consultivo e histórico de avaliações positivas na plataforma.",
  };
  const sellerPhoto =
    resolveSellerPhotoUrl(detail?.vendedor?.fotoPerfilUrl) ??
    resolveSellerPhotoUrl(detail?.vendedor?.fotoPerfil);
  const whatsappHref = getWhatsappHref(seller.telefone, effectiveMarketplaceItem.modelo || effectiveMarketplaceItem.titulo);

  if (!marketplaceItem) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--background)] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            {loadingDetail ? (
              <>
                <h1 className="text-2xl font-bold text-zinc-900">Carregando anúncio...</h1>
                <p className="mt-2 text-zinc-500">Aguarde enquanto carregamos os dados do veículo.</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-zinc-900">Anúncio não encontrado</h1>
                <p className="mt-2 text-zinc-500">
                  {detailError || "O anúncio que você está procurando não existe ou foi removido."}
                </p>
              </>
            )}
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header />

      <main className="flex-1">
        <section className="relative w-full overflow-hidden bg-white">
          <div className="relative flex h-[240px] w-full min-w-0 md:h-[520px]">
            {totalPhotos > 0 ? (
              triplet.map((src, i) => (
                <div
                  key={`${safeCarouselStart}-${i}`}
                  className="relative h-full min-w-0 flex-1 border-r border-white last:border-r-0"
                >
                  <Image
                    src={src}
                    alt={`${marketplaceItem.titulo} - foto ${safeCarouselStart + i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 34vw, 33vw"
                    priority={i === 0}
                  />
                </div>
              ))
            ) : (
              <div className="flex h-full w-full flex-1 items-center justify-center bg-zinc-100 text-zinc-400">
                <HugeiconsIcon icon={ImageNotFound01Icon} size={42} />
              </div>
            )}
          </div>

          {totalPhotos > 0 ? (
            <>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 md:px-4">
                <button
                  type="button"
                  className="pointer-events-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-[2px] transition hover:bg-black/60 disabled:pointer-events-none disabled:opacity-35 md:h-11 md:w-11"
                  onClick={goPrevPhoto}
                  disabled={!canGoPrevCarousel}
                  aria-label="Fotos anteriores"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
                </button>
                <button
                  type="button"
                  className="pointer-events-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-[2px] transition hover:bg-black/60 disabled:pointer-events-none disabled:opacity-35 md:h-11 md:w-11"
                  onClick={goNextPhoto}
                  disabled={!canGoNextCarousel}
                  aria-label="Próximas fotos"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
                </button>
              </div>

              <div className="absolute right-3 top-3 z-10 md:right-5 md:top-5">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-black/65 px-3 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:bg-black/80 md:rounded-xl md:px-4"
                  onClick={openGallery}
                >
                  <HugeiconsIcon icon={LayoutGridIcon} size={18} />
                  Galeria
                </button>
              </div>

              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-lg bg-black/65 px-3 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-sm md:bottom-5 md:left-5 md:rounded-xl">
                <HugeiconsIcon icon={Camera01Icon} size={18} />
                <span>
                  {safeCarouselStart + 1} / {totalPhotos}
                </span>
              </div>
            </>
          ) : null}
        </section>

        <div className="mx-auto w-full max-w-375 px-4 py-5 sm:px-6 md:py-8 lg:max-w-7xl lg:px-8">
          <section className="grid grid-cols-1 items-start gap-10">
            <div className="min-w-0 space-y-8">
              <header className="space-y-2">
                <div className="flex items-center gap-3">
                  {brandIcon ? (
                    <span className="inline-flex shrink-0 items-center justify-center" title={brandIcon.title}>
                      <svg role="img" viewBox="0 0 24 24" className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden>
                        <title>{brandIcon.title}</title>
                        <path d={brandIcon.path} fill={`#${brandIcon.hex}`} />
                      </svg>
                    </span>
                  ) : null}
                  <h1 className="text-3xl font-bold tracking-[-0.02em] text-zinc-950 sm:text-4xl">
                    {marketplaceItem.titulo}
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-[15px] text-zinc-500">
                  <HugeiconsIcon icon={Location01Icon} size={18} className="shrink-0" />
                  <span>{marketplaceItem.local}</span>
                </div>
              </header>

              <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-100 pb-6">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">Preço</p>
                    <p className="mt-2 text-[42px] font-bold leading-none tracking-tight text-zinc-950">
                      {marketplaceItem.preco}
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      size="lg"
                      className="h-12 shrink-0 rounded-xl bg-nulance-purple px-6 hover:bg-nulance-purple/90"
                      onClick={() => router.push("/marketplace")}
                    >
                      Ver outros anúncios
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-x-8">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">Ano fab/mod</p>
                    <p className="mt-1.5 text-[15px] font-semibold text-zinc-900">{anoFabMod}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">KM</p>
                    <p className="mt-1.5 text-[15px] font-semibold text-zinc-900">{kmValue}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">Câmbio</p>
                    <p className="mt-1.5 text-[15px] font-semibold text-zinc-900">
                      {formatEnumDisplayLabel(cambioValue)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">Combustível</p>
                    <p className="mt-1.5 text-[15px] font-semibold text-zinc-900">
                      {formatEnumDisplayLabel(combustivelValue)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">Cor</p>
                    <p className="mt-1.5 text-[15px] font-semibold text-zinc-900">{cor}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">FIPE</p>
                    <p
                      className={cn(
                        "mt-1.5 text-[15px] font-semibold",
                        loadingFipe || fipe === "Sob consulta" ? "text-zinc-700" : "text-emerald-600",
                      )}
                    >
                      {loadingFipe ? "Consultando..." : fipe}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">Blindado</p>
                    <p className="mt-1.5 text-[15px] font-semibold text-zinc-900">{blindado}</p>
                  </div>
                </div>

                <div className="mt-8 border-t border-zinc-100 pt-8">
                  <h2 className="text-lg font-bold text-zinc-900">Descrição</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-zinc-700">
                    {descricao}. Condição classificada como{" "}
                    <span className="font-semibold text-zinc-900">
                      {formatEnumDisplayLabel(marketplaceItem.condicao)}
                    </span>.
                  </p>
                </div>

              </div>

              <div>
                <h2 className="text-[22px] font-bold tracking-[-0.02em] text-zinc-900">Ficha técnica</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Dados agregados do anúncio e referências típicas de fabricante. Confirme sempre com o vendedor e a
                  documentação.
                </p>
                <Accordion className="mt-2">
                  {techSheetSections.map((section, i) => (
                    <AccordionItem
                      key={section.title}
                      title={section.title}
                      variant="plain"
                      defaultOpen={i === 0}
                    >
                      <TechSpecGrid rows={section.rows} />
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8">
                <div className="flex items-start gap-4">
                  <Avatar
                    src={sellerPhoto}
                    alt={seller.nome}
                    fallbackSrc="/logo-nulance-marketplace.png"
                    className="h-14 w-14 border-zinc-200 bg-zinc-100"
                  />
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold tracking-tight text-zinc-900">{seller.nome}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{seller.endereco}</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-zinc-100 pt-5">
                  <p className="text-[15px] font-semibold text-zinc-700">Sobre o vendedor</p>
                  <p className="mt-3 text-zinc-700 leading-relaxed">{seller.descricao}</p>
                  {whatsappHref ? (
                    <div className="mt-4">
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                      >
                        <HugeiconsIcon icon={WhatsappIcon} size={18} />
                        {seller.telefone ? `Chamar no WhatsApp ${formatPhoneBr(seller.telefone)}` : "Chamar no WhatsApp"}
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {isGalleryOpen && totalPhotos > 0 && (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm">
          <div className="absolute right-4 top-4">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              onClick={() => setIsGalleryOpen(false)}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={20} />
            </button>
          </div>

          <div className="flex h-full w-full items-center justify-center px-4 py-8">
            <div className="relative h-[70vh] w-full max-w-6xl overflow-hidden rounded-2xl">
              <Image
                src={galleryImages[safeLightboxIndex]}
                alt={`${marketplaceItem.titulo} - galeria ${safeLightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4 md:px-8">
            <button
              type="button"
              className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              onClick={goPrevLightbox}
              disabled={totalPhotos <= 1}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
            </button>
            <button
              type="button"
              className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              onClick={goNextLightbox}
              disabled={totalPhotos <= 1}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={22} />
            </button>
          </div>

          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
            <HugeiconsIcon icon={Camera01Icon} size={16} />
            <span>
              {safeLightboxIndex + 1} / {totalPhotos}
            </span>
          </div>
        </div>
      )}

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
