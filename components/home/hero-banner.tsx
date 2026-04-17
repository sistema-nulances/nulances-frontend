"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";
import { listarBannersPublicosPorTipo } from "@/lib/repositories/admin-banners-repository";
import {
  HOME_BANNERS_STORAGE_KEY,
  HOME_BANNERS_UPDATED_EVENT,
  MARKETPLACE_BANNERS_STORAGE_KEY,
  MARKETPLACE_BANNERS_UPDATED_EVENT,
  loadHomeBannersFromStorage,
  loadMarketplaceBannersFromStorage,
  saveHomeBannersToStorage,
  saveMarketplaceBannersToStorage,
  type HomeBannerSlide,
} from "@/lib/home-banners";
import { getApiBaseUrl } from "@/lib/api/api-url";

export type HeroBannerVariant = "home" | "marketplace";

function isDataOrBlob(src: string) {
  return src.startsWith("data:") || src.startsWith("blob:");
}

function resolveBannerImageUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return value;
  if (/^https?:\/\//i.test(value) || isDataOrBlob(value)) return value;
  const base = getApiBaseUrl();
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${base}${normalizedPath}`;
}

type HeroBannerProps = {
  variant?: HeroBannerVariant;
};

export function HeroBanner({ variant = "home" }: HeroBannerProps) {
  const storageKey =
    variant === "marketplace" ? MARKETPLACE_BANNERS_STORAGE_KEY : HOME_BANNERS_STORAGE_KEY;
  const updatedEvent =
    variant === "marketplace" ? MARKETPLACE_BANNERS_UPDATED_EVENT : HOME_BANNERS_UPDATED_EVENT;
  const load =
    variant === "marketplace" ? loadMarketplaceBannersFromStorage : loadHomeBannersFromStorage;

  const [items, setItems] = useState<HomeBannerSlide[]>(() => load());
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let active = true;
    const tipo = variant === "marketplace" ? "MARKETPLACE" : "LEILAO";

    const loadFromApi = async () => {
      try {
        const rows = await listarBannersPublicosPorTipo(tipo);
        if (!active) return;
        if (rows.length === 0) {
          setItems([]);
          if (variant === "marketplace") {
            saveMarketplaceBannersToStorage([]);
          } else {
            saveHomeBannersToStorage([]);
          }
          setCurrent(0);
          return;
        }
        const next: HomeBannerSlide[] = rows
          .sort((a, b) => a.posicao - b.posicao)
          .map((b, idx) => ({
            id: idx + 1,
            image: b.imagem,
            alt: b.textoAlternativo?.trim() || `Banner ${idx + 1}`,
          }));
        setItems(next);
        if (variant === "marketplace") {
          saveMarketplaceBannersToStorage(next);
        } else {
          saveHomeBannersToStorage(next);
        }
        setCurrent(0);
      } catch {
        // fallback silencioso: mantém defaults/storage
      }
    };

    void loadFromApi();
    return () => {
      active = false;
    };
  }, [variant]);

  const refreshFromStorage = useCallback(() => {
    if (variant === "home") return;
    setItems(load());
    setCurrent(0);
  }, [load, variant]);

  useEffect(() => {
    if (variant === "home") return;
    refreshFromStorage();
  }, [refreshFromStorage, variant]);

  useEffect(() => {
    if (variant === "home") return;
    function onCustom() {
      refreshFromStorage();
    }
    function onStorage(e: StorageEvent) {
      if (e.key === storageKey) refreshFromStorage();
    }
    window.addEventListener(updatedEvent, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(updatedEvent, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, [refreshFromStorage, storageKey, updatedEvent, variant]);

  useEffect(() => {
    if (current >= items.length) setCurrent(0);
  }, [current, items.length]);

  const hasMultiple = items.length > 1;
  const isEmpty = items.length === 0;
  const emptyMessage =
    variant === "marketplace"
      ? "Nenhum banner do marketplace selecionado ainda."
      : "Nenhum banner de leiloes selecionado ainda.";

  useEffect(() => {
    if (!hasMultiple) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [hasMultiple, items.length]);

  function goTo(index: number) {
    setCurrent(index);
  }

  function goPrev() {
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  }

  function goNext() {
    setCurrent((prev) => (prev + 1) % items.length);
  }

  return (
    <section className="w-full bg-white pt-5">
      <div className="mx-auto w-full rounded-md">
        <div className="relative w-full overflow-hidden border-y border-zinc-200 bg-[#f3f4f6]">
          {isEmpty ? (
            <div className="relative aspect-[4/1] w-full">
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-100 to-zinc-200/80" />
              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
                <p className="text-[18px] font-semibold tracking-[-0.02em] text-zinc-800 sm:text-[22px]">
                  {emptyMessage}
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Assim que um banner for publicado, ele aparecera aqui automaticamente.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {items.map((banner, idx) => (
                <div key={`${banner.id}-${banner.image.slice(0, 32)}`} className="relative min-w-full">
                  <div className="relative aspect-[4/1] w-full">
                    {isDataOrBlob(banner.image) ? (
                      // eslint-disable-next-line @next/next/no-img-element -- uploads locais (data/blob)
                      <img
                        src={banner.image}
                        alt={banner.alt}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={resolveBannerImageUrl(banner.image)}
                        alt={banner.alt}
                        fill
                        priority={idx === 0}
                        className="object-cover"
                        sizes="100vw"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Banner anterior"
                className={cn(
                  "absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full",
                  "bg-black/20 text-white backdrop-blur-sm",
                  "transition hover:bg-black/35 active:scale-95 md:left-5 md:h-11 md:w-11"
                )}
              >
                <ChevronLeftIcon className="h-5 w-5 stroke-[2.4]" />
              </button>

              <button
                type="button"
                onClick={goNext}
                aria-label="Próximo banner"
                className={cn(
                  "absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full",
                  "bg-black/20 text-white backdrop-blur-sm",
                  "transition hover:bg-black/35 active:scale-95 md:right-5 md:h-11 md:w-11"
                )}
              >
                <ChevronRightIcon className="h-5 w-5 stroke-[2.4]" />
              </button>

              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 md:bottom-4">
                {items.map((item, index) => (
                  <button
                    key={`dot-${item.id}-${index}`}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`Ir para banner ${index + 1}`}
                    className={cn(
                      "h-[4px] rounded-full transition-all duration-300",
                      current === index
                        ? "w-8 bg-white"
                        : "w-6 bg-white/45 hover:bg-white/75"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
