"use client";

import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AuctionIcon,
  Calendar03Icon,
  Clock01Icon,
  ImageNotFound01Icon,
  Location01Icon,
  Money03Icon,
  TimeQuarterPassIcon,
} from "@hugeicons/core-free-icons";
import { BemMarcaLogo } from "@/components/admin/bens/bem-marca-logo";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { AuctionStatus } from "@/data/auction-items";
import { formatEnumDisplayLabel } from "@/lib/format-enum-label";
import { marcaLeilaoItemLabel } from "@/lib/leilao-bem-exibicao";
import { getStatusLabel } from "@/utils/status-auction";
import { Badge } from "@/components/ui/badge";

type HugeiconsIconProps = React.ComponentProps<typeof HugeiconsIcon>;

export type HomeAuctionCardItem = {
  id: string;
  lote: string;
  status: AuctionStatus;
  categoria: string;
  /** Texto completo para `alt` da imagem (marca + modelo). */
  titulo: string;
  /** Código `MarcaVeiculo` da API — define logotipo (igual admin de bens). */
  marcaVeiculo?: string | null;
  /** Nome do bem / modelo exibido após a marca. */
  modelo: string;
  local: string;
  veiculo: string;
  ano: string;
  km: string;
  cambio: string;
  combustivel: string;
  condicao: string;
  dataAbertura: string;
  dataEncerramento: string;
  lanceAtual?: string;
  imageUrl?: string;
};

export function getBottomStatusMeta(status: AuctionStatus) {
  switch (status) {
    case "ABERTO":
      return {
        label: "Recebendo lances agora",
        textClassName: "text-emerald-700",
        iconClassName: "text-emerald-600",
        buttonLabel: "Dar lance",
      };

    case "ENCERRADO":
      return {
        label: "Leilão encerrado",
        textClassName: "text-red-700",
        iconClassName: "text-red-600",
        buttonLabel: "Ver resultado",
      };

    default:
      return {
        label: "Prestes a abrir",
        textClassName: "text-amber-700",
        iconClassName: "text-amber-600",
        buttonLabel: "Acompanhar leilão",
      };
  }
}

export function AuctionCard({ item }: { item: HomeAuctionCardItem }) {
  const bottomStatusMeta = getBottomStatusMeta(item.status);
  const nomeParaLogo = item.modelo.trim() || item.titulo;
  const marcaLegivel = marcaLeilaoItemLabel(item.marcaVeiculo);
  const modeloExibir = item.modelo.trim();

  const statusVariant =
    item.status === "ABERTO"
      ? "emerald"
      : item.status === "EM_BREVE"
        ? "amber"
        : "zinc";

  return (
    <Link 
      href={`/auction/${item.id}`} 
      className="group overflow-hidden rounded-[28px] bg-white/5 transition-all duration-300 hover:-translate-y-1 block ring-1 ring-zinc-200/25 hover:ring-zinc-200/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <article className="px-4 pt-4 pb-5 md:px-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="purple">{item.lote}</Badge>

              <Badge variant={statusVariant} className="uppercase">
                {getStatusLabel(item.status)}
              </Badge>

              <Badge variant="zinc" className="font-medium">
                {formatEnumDisplayLabel(item.categoria)}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <BemMarcaLogo nome={nomeParaLogo} marca={item.marcaVeiculo} size="sm" />
              <h3 className="line-clamp-2 min-w-0 flex-1 text-[22px] leading-[1.1] font-semibold tracking-[-0.04em] text-zinc-950 sm:text-[24px] sm:leading-[1.08]">
                {marcaLegivel ? (
                  <>
                    <span className="text-zinc-950">{marcaLegivel}</span>
                    {modeloExibir ? (
                      <span className="font-semibold text-zinc-950">
                        {marcaLegivel ? "\u00A0" : null}
                        {modeloExibir}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span>{modeloExibir || item.titulo}</span>
                )}
              </h3>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
              <HugeiconsIcon
                icon={Location01Icon}
                size={16}
                color="currentColor"
                strokeWidth={1.9}
              />
              <span className="truncate">{item.local}</span>
            </div>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
            <HugeiconsIcon
              icon={AuctionIcon}
              size={18}
              color="currentColor"
              strokeWidth={1.9}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-[22px] bg-zinc-100">
          <div className="relative h-57.5 w-full">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- origem dinâmica (backend/object key)
              <img src={item.imageUrl} alt={item.titulo} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 ">
                    <HugeiconsIcon
                      icon={ImageNotFound01Icon}
                      size={24}
                      color="currentColor"
                      strokeWidth={1.9}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-600">Sem foto no momento</p>
                    <p className="mt-1 text-xs text-zinc-400">A imagem do lote será exibida aqui</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-zinc-200/5 pt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-zinc-400">
              Informações do veículo
            </span>
          </div>

          <div className="flex items-start gap-2">
            <BemMarcaLogo nome={nomeParaLogo} marca={item.marcaVeiculo} size="sm" />
            <p className="min-w-0 flex-1 text-[15px] font-medium leading-relaxed text-zinc-800">
              {marcaLegivel ? (
                <>
                  <span>{marcaLegivel}</span>
                  {modeloExibir ? <span> {modeloExibir}</span> : null}
                </>
              ) : (
                item.veiculo
              )}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 md:grid-cols-3">
            <SpecItem label="Ano" value={item.ano} />
            <SpecItem label="KM" value={item.km} />
            <SpecItem label="Câmbio" value={formatEnumDisplayLabel(item.cambio)} />
            <SpecItem label="Combustível" value={formatEnumDisplayLabel(item.combustivel)} />
            <SpecItem label="Condição" value={formatEnumDisplayLabel(item.condicao)} />
          </div>
        </div>

        <div className="mt-4 border-t border-zinc-200/10 pt-4">
          <div className="space-y-3">
            <AuctionInfoRow
              icon={Calendar03Icon}
              label="Abertura do leilão"
              value={item.dataAbertura}
            />

            <AuctionInfoRow
              icon={Clock01Icon}
              label="Encerramento"
              value={item.dataEncerramento}
            />

            {item.lanceAtual ? (
              <AuctionInfoRow
                icon={Money03Icon}
                label="Lance atual"
                value={item.lanceAtual}
                valueClassName="text-emerald-600"
              />
            ) : null}
          </div>
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100",
                  bottomStatusMeta.iconClassName
                )}
              >
                <HugeiconsIcon
                  icon={TimeQuarterPassIcon}
                  size={18}
                  color="currentColor"
                  strokeWidth={1.9}
                />
              </div>

              <span
                className={cn(
                  "truncate text-sm font-semibold",
                  bottomStatusMeta.textClassName
                )}
              >
                {bottomStatusMeta.label}
              </span>
            </div>

            <Button
              variant="default"
              type="button"
              disabled={item.status === "ENCERRADO"}
              className={cn(
                "h-11 shrink-0 whitespace-nowrap rounded-full px-5 text-sm font-semibold text-white pointer-events-none",
                item.status === "ABERTO" && "bg-nulance-purple opacity-100",
                item.status === "EM_BREVE" && "bg-amber-500 opacity-100",
                item.status === "ENCERRADO" && "bg-zinc-300 text-zinc-500 opacity-100"
              )}
            >
              {bottomStatusMeta.buttonLabel}
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}

function SpecItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-zinc-900">
        {value}
      </p>
    </div>
  );
}

function AuctionInfoRow({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: HugeiconsIconProps["icon"];
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3 text-zinc-600">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
          <HugeiconsIcon
            icon={icon}
            size={17}
            color="currentColor"
            strokeWidth={1.9}
          />
        </div>

        <span className="truncate text-sm font-medium">{label}</span>
      </div>

      <span
        className={cn(
          "shrink-0 text-right text-sm font-semibold text-zinc-900",
          valueClassName
        )}
      >
        {value}
      </span>
    </div>
  );
}
