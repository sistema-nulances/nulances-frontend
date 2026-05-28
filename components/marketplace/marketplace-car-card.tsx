"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Car03Icon,
  Motorbike01FreeIcons,
  TruckIcon,
  Location01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/cn";
import { formatEnumDisplayLabel } from "@/lib/format-enum-label";
import { Badge } from "@/components/ui/badge";
import { BemMarcaLogo } from "@/components/admin/bens/bem-marca-logo";
import type { MarketplaceItem } from "@/data/marketplace-items";
import type { MarketplaceRenderableMedia } from "@/lib/marketplace-public-map";

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
      return { label: "Disponível agora", variant: "emerald" as const };
    case "EM_BREVE":
      return { label: "Em breve", variant: "amber" as const };
    case "ENCERRADO":
      return { label: "Anúncio encerrado", variant: "red" as const };
  }
}

type MarketplaceCardItem = MarketplaceItem & { midias?: MarketplaceRenderableMedia[] };

function isVeiculoCategoria(categoria: string): boolean {
  const c = String(categoria ?? "").toUpperCase();
  return c === "VEICULOS" || c === "CARROS" || c === "MOTOS" || c === "CAMINHOES";
}

export function MarketplaceCarCard({ item }: { item: MarketplaceCardItem }) {
  const meta = categoryMeta(item.categoria);
  const sm = statusMeta(item.status);
  const mediaPreview = item.midias?.[0];
  const isVeiculo = isVeiculoCategoria(item.categoria);

  return (
    <Link
      href={`/marketplace/${item.id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[28px] bg-white/5 ring-1 ring-zinc-200/25 transition-all",
        "hover:-translate-y-1 hover:shadow-lg hover:bg-white/10 hover:ring-zinc-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      )}
    >
      {/* Imagem */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        {mediaPreview?.tipo === "VIDEO" ? (
          <video
            src={mediaPreview.url}
            className="h-full w-full object-cover"
            preload="metadata"
            playsInline
            muted
          />
        ) : item.imagem ? (
          <Image
            src={item.imagem}
            alt={item.titulo}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-zinc-300">
            <HugeiconsIcon icon={meta.icon} size={48} />
          </div>
        )}

        {/* Badges sobrepostos na imagem */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <Badge variant="purple" className="shadow-sm backdrop-blur-sm">
            <span className="inline-flex items-center gap-1.5">
              <HugeiconsIcon icon={meta.icon} size={14} />
              {meta.label}
            </span>
          </Badge>
          <Badge variant={sm.variant} className="shadow-sm backdrop-blur-sm">
            {sm.label}
          </Badge>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-4 md:p-5">
        {/* Título */}
        <div className="flex items-start gap-2.5">
          {isVeiculo ? (
            <BemMarcaLogo
              nome={item.titulo}
              marca={item.marca}
              size="sm"
              className="mt-0.5 shrink-0 text-zinc-700 [&_svg]:!h-6 [&_svg]:!w-6"
            />
          ) : null}
          <h3 className="line-clamp-2 text-[18px] leading-[1.2] font-bold tracking-[-0.02em] text-zinc-950 group-hover:text-nulance-purple transition-colors">
            {item.titulo}
          </h3>
        </div>

        {/* Preço */}
        <p className="mt-2 text-[22px] font-extrabold text-nulance-purple leading-none">
          {item.preco}
        </p>

        {/* Localização */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
          <HugeiconsIcon icon={Location01Icon} size={13} color="currentColor" strokeWidth={2} />
          <span className="truncate">{item.local}</span>
        </div>

        {/* Separador */}
        <div className="my-3 border-t border-zinc-100" />

        {/* Detalhes — cresce para preencher espaço disponível */}
        <div className="flex-1">
          {isVeiculo ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DetailItem label="Ano" value={item.ano} />
              <DetailItem label="KM" value={item.km} />
              <DetailItem label="Marca" value={item.marca} />
              <DetailItem label="Câmbio" value={formatEnumDisplayLabel(item.cambio)} />
              <DetailItem label="Combustível" value={formatEnumDisplayLabel(item.combustivel)} />
              <DetailItem label="Condição" value={formatEnumDisplayLabel(item.condicao)} />
            </div>
          ) : (
            <div className="space-y-2">
              {item.condicao && (item.condicao as string) !== "—" && (
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  {formatEnumDisplayLabel(item.condicao)}
                </span>
              )}
              {item.descricao ? (
                <p className="line-clamp-4 text-sm leading-relaxed text-zinc-600">
                  {item.descricao}
                </p>
              ) : (
                <p className="text-sm italic text-zinc-400">Sem descrição</p>
              )}
            </div>
          )}
        </div>

        {/* Rodapé — sempre no fundo */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
            Ver anúncio
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-nulance-purple text-white transition-transform group-hover:translate-x-0.5">
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-zinc-800">{value ?? "—"}</p>
    </div>
  );
}
