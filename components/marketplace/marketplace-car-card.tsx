"use client";

import React from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Car03Icon,
  Motorbike01FreeIcons,
  TruckIcon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/cn";
import { formatEnumDisplayLabel } from "@/lib/format-enum-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BemMarcaLogo } from "@/components/admin/bens/bem-marca-logo";
import type { MarketplaceItem } from "@/data/marketplace-items";
import type { MarketplaceRenderableMedia } from "@/lib/marketplace-public-map";
import { useRouter } from "next/navigation";

function categoryMeta(categoria: MarketplaceItem["categoria"]) {
  switch (categoria) {
    case "carros":
      return { label: "Carros", icon: Car03Icon };
    case "motos":
      return { label: "Motos", icon: Motorbike01FreeIcons };
    case "caminhoes":
      return { label: "Caminhões", icon: TruckIcon };
    default:
      return { label: formatEnumDisplayLabel(String(categoria ?? "Categoria")), icon: Car03Icon };
  }
}

function statusMeta(status: MarketplaceItem["status"]) {
  switch (status) {
    case "ABERTO":
      return {
        label: "Disponível agora",
        variant: "emerald" as const,
      };
    case "EM_BREVE":
      return {
        label: "Em breve",
        variant: "amber" as const,
      };
    case "ENCERRADO":
      return {
        label: "Anúncio encerrado",
        variant: "red" as const,
      };
  }
}

type MarketplaceCardItem = MarketplaceItem & { midias?: MarketplaceRenderableMedia[] };

function isVeiculoCategoria(categoria: string): boolean {
  const c = String(categoria ?? "").toUpperCase();
  return c === "VEICULOS" || c === "CARROS" || c === "MOTOS" || c === "CAMINHOES";
}

export function MarketplaceCarCard({ item }: { item: MarketplaceCardItem }) {
  const router = useRouter();
  const meta = categoryMeta(item.categoria);
  const sm = statusMeta(item.status);
  const mediaPreview = item.midias?.[0];
  const isVeiculo = isVeiculoCategoria(item.categoria);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[28px] bg-white/5 ring-1 ring-zinc-200/25 transition-all",
        "hover:-translate-y-1 hover:bg-white/10 hover:ring-zinc-200/45 focus-within:ring-[var(--ring)]"
      )}
    >
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Badge variant="purple">
            <span className="inline-flex items-center gap-2">
              <HugeiconsIcon icon={meta.icon} size={16} />
              {meta.label}
            </span>
          </Badge>

          <Badge variant={sm.variant}>{sm.label}</Badge>
        </div>

        <div className="mt-4 flex flex-1 flex-col gap-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-black/5">
            {mediaPreview?.tipo === "VIDEO" ? (
              <video
                src={mediaPreview.url}
                className="h-full w-full object-cover"
                controls
                preload="metadata"
                playsInline
                muted
              />
            ) : item.imagem ? (
              <Image
                src={item.imagem}
                alt={item.titulo}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={false}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-zinc-400">
                <HugeiconsIcon icon={meta.icon} size={34} />
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col min-w-0">
            <div className="flex items-start gap-2.5">
              {isVeiculo ? (
                <BemMarcaLogo
                  nome={item.titulo}
                  marca={item.marca}
                  size="sm"
                  className="mt-0.5 text-zinc-700 [&_svg]:!h-7 [&_svg]:!w-7"
                />
              ) : null}
              <h3 className="line-clamp-2 text-[20px] leading-[1.15] font-semibold tracking-[-0.02em] text-zinc-950">
                {item.titulo}
              </h3>
            </div>
            <p className="mt-2 text-[22px] font-bold text-nulance-purple">{item.preco}</p>

            <div className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
              <HugeiconsIcon
                icon={Location01Icon}
                size={16}
                color="currentColor"
                strokeWidth={1.9}
              />
              <span className="truncate">{item.local}</span>
            </div>

            {isVeiculo ? (
              <div className="mt-3 flex-1 grid grid-cols-1 gap-y-2 content-start">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Ano</p>
                  <p className="mt-1 truncate text-sm font-semibold text-zinc-900">{item.ano}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">KM</p>
                  <p className="mt-1 truncate text-sm font-semibold text-zinc-900">{item.km}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Marca / Modelo</p>
                  <p className="mt-1 truncate text-sm font-semibold text-zinc-900">{item.marca} {item.modelo}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Câmbio</p>
                  <p className="mt-1 truncate text-sm font-semibold text-zinc-900">
                    {formatEnumDisplayLabel(item.cambio)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Combustível</p>
                  <p className="mt-1 truncate text-sm font-semibold text-zinc-900">
                    {formatEnumDisplayLabel(item.combustivel)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Condição</p>
                  <p className="mt-1 truncate text-sm font-semibold text-zinc-900">
                    {formatEnumDisplayLabel(item.condicao)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex-1 space-y-2">
                {item.condicao && (item.condicao as string) !== "—" ? (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Condição</p>
                    <p className="mt-1 truncate text-sm font-semibold text-zinc-900">
                      {formatEnumDisplayLabel(item.condicao)}
                    </p>
                  </div>
                ) : null}
                {item.descricao ? (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600">{item.descricao}</p>
                ) : null}
              </div>
            )}

            <div className="mt-4">
              <Button
                type="button"
                variant="default"
                className="h-10 w-full rounded-full"
                onClick={() => router.push(`/marketplace/${item.id}`)}
              >
                Ver anúncio
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

