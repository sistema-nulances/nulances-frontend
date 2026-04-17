"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  NoSymbolIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { BemMarcaLogo } from "@/components/admin/bens/bem-marca-logo";
import { VendedorAdminLink } from "@/components/admin/marketplace/vendedor-admin-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { MarketplaceAnuncioDetailFicha } from "@/components/admin/marketplace/marketplace-anuncio-detail-ficha";
import { MarketplaceAnuncioEditSheet } from "@/components/admin/marketplace/marketplace-anuncio-edit-sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select, type SelectOption } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { MARKETPLACE_ANUNCIOS_MODERACAO_QUERY } from "@/data/marketplace-admin-mock";
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
import { normalizeMarcaVeiculoCode } from "@/lib/bem-marca-veiculo";
import { marcaVeiculoLabel } from "@/lib/bem-marca-veiculo";
import { formatDashboardDateTime } from "@/lib/format-dashboard-datetime";
import {
  buildMarketplaceAnunciosAdminSeed,
  defaultMarketplaceAnuncioTechDetails,
  filterAnunciosByModeracaoFiltro,
  filterAnunciosBySearch,
  type AnuncioModeracaoStatus,
  type MarketplaceAnuncioAdmin,
  type ModeracaoFiltro,
} from "@/lib/marketplace-anuncios-admin";
import {
  aprovarAdminAnuncio,
  buscarAdminAnuncioPorId,
  editarParcialAdminAnuncio,
  listarAdminAnuncios,
  reativarAdminAnuncio,
  suspenderAdminAnuncio,
} from "@/lib/repositories/admin-anuncios-repository";
import {
  buscarMeuAnuncioPorIdVendedor,
  editarParcialMeuAnuncioVendedor,
  listarMeusAnunciosVendedor,
} from "@/lib/repositories/seller-anuncios-repository";
import type {
  AnuncioResponse,
  AnuncioVendedorListResponse,
  EditarAnuncioRequest,
  StatusAnuncioApi,
} from "@/lib/repositories/types/seller-anuncio.types";
import type {
  AnuncioAdminListResponse,
  StatusAnuncioAdminApi,
} from "@/lib/repositories/types/admin-anuncios.types";
import { cn } from "@/lib/cn";
import { getApiErrorMessage } from "@/lib/api/error-body";
import { ApiError } from "@/lib/repositories/types/auth.types";

const FILTRO_OPTIONS: SelectOption[] = [
  { value: "todos", label: "Todos os anúncios" },
  { value: "pendente", label: "Pendentes" },
  { value: "aprovado", label: "Publicados" },
  { value: "suspenso", label: "Suspensos" },
];
const MARKETPLACE_IMAGE_FALLBACK = "/logo-nulance-marketplace.png";

function moderacaoBadge(status: AnuncioModeracaoStatus) {
  if (status === "pendente") {
    return (
      <Badge variant="amber" size="sm" className="normal-case tracking-normal">
        Pendente
      </Badge>
    );
  }
  if (status === "suspenso") {
    return (
      <Badge variant="red" size="sm" className="normal-case tracking-normal">
        Suspenso
      </Badge>
    );
  }
  return (
    <Badge variant="emerald" size="sm" className="normal-case tracking-normal">
      Publicado
    </Badge>
  );
}

type PhotoCarouselProps = {
  photos: string[];
  /** Altura da área da foto (Tailwind height class). */
  heightClass?: string;
  className?: string;
  /**
   * Hero no detalhe (sheet): recorte uniforme sem barras laterais e canto alinhado ao painel.
   * Lista de cards usa `default`.
   */
  variant?: "default" | "sheetHero";
  /** Texto para alt das imagens (acessibilidade). */
  imageAltBase?: string;
};

function PhotoCarousel({
  photos,
  heightClass = "h-56 sm:h-64 md:h-72",
  className,
  variant = "default",
  imageAltBase = "Veículo",
}: PhotoCarouselProps) {
  const [index, setIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const n = photos.length;

  React.useEffect(() => {
    setIndex(0);
  }, [photos]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!lightboxOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen]);

  if (n === 0) {
    return (
      <div
        className={cn(
          variant === "sheetHero" ? "rounded-b-[28px]" : "rounded-t-2xl",
          "bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200/80",
          variant === "sheetHero" ? "h-[min(44vh,380px)]" : heightClass,
          className
        )}
        aria-hidden
      />
    );
  }

  const goPrev = () => setIndex((i) => (i - 1 + n) % n);
  const goNext = () => setIndex((i) => (i + 1) % n);

  const shellRounded =
    variant === "sheetHero" ? "rounded-b-[28px] rounded-t-none" : "rounded-t-2xl";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-zinc-300/40 via-zinc-100 to-zinc-200/30",
        shellRounded,
        className
      )}
    >
      <div
        className={cn(
          "relative w-full",
          variant === "sheetHero" ? "h-[min(44vh,380px)] sm:h-[min(40vh,420px)]" : heightClass
        )}
      >
        <Image
          src={photos[index]!}
          alt={`${imageAltBase} — foto ${index + 1} de ${n}`}
          fill
          className="cursor-pointer object-cover object-center"
          sizes={variant === "sheetHero" ? "(min-width: 768px) 768px, 100vw" : "(min-width: 1280px) 400px, 90vw"}
          priority={index === 0}
          onClick={() => setLightboxOpen(true)}
        />
      </div>

      {n > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Foto anterior"
            className={cn(
              "absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full",
              "bg-[var(--nulance-purple)]/85 text-white shadow-sm backdrop-blur-sm transition hover:bg-[var(--nulance-purple)]"
            )}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Próxima foto"
            className={cn(
              "absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full",
              "bg-[var(--nulance-purple)]/85 text-white shadow-sm backdrop-blur-sm transition hover:bg-[var(--nulance-purple)]"
            )}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Foto ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
                )}
              />
            ))}
          </div>
        </>
      ) : null}

      {mounted && lightboxOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4"
              onClick={() => setLightboxOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label="Visualização ampliada da imagem"
            >
              <button
                type="button"
                className="absolute right-4 top-4 z-20 rounded-full bg-black/40 px-3 py-1 text-sm font-medium text-white hover:bg-black/55"
                onClick={() => setLightboxOpen(false)}
              >
                Fechar
              </button>
              <div
                className="relative z-0 h-[100vh] w-[100vw]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={photos[index]!}
                  alt={`${imageAltBase} — foto ${index + 1} de ${n}`}
                  fill
                  className="object-contain object-center"
                  sizes="100vw"
                  priority
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

function initialFiltroFromSearch(sp: ReturnType<typeof useSearchParams>): ModeracaoFiltro {
  return sp.get("moderacao") === "pendentes" ? "pendente" : "todos";
}

function formatCurrencyBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mapSellerStatusToModeracao(statusRaw: string | null | undefined): AnuncioModeracaoStatus {
  const s = String(statusRaw ?? "").trim().toUpperCase();
  if (s === "PENDENTE") return "pendente";
  if (s === "APROVADO" || s === "ATIVO" || s === "PUBLICADO") return "aprovado";
  return "suspenso";
}

function mapAdminStatusToModeracao(statusRaw: string | null | undefined): AnuncioModeracaoStatus {
  const s = String(statusRaw ?? "").trim().toUpperCase();
  if (s === "PENDENTE") return "pendente";
  if (s === "APROVADO" || s === "ATIVO" || s === "PUBLICADO") return "aprovado";
  return "suspenso";
}

function mapFiltroToSellerStatus(filtro: ModeracaoFiltro): StatusAnuncioApi | undefined {
  if (filtro === "pendente") return "PENDENTE";
  if (filtro === "aprovado") return "PUBLICADO";
  if (filtro === "suspenso") return "SUSPENSO";
  return undefined;
}

function mapFiltroToAdminStatus(filtro: ModeracaoFiltro): StatusAnuncioAdminApi | undefined {
  if (filtro === "pendente") return "PENDENTE";
  if (filtro === "aprovado") return "PUBLICADO";
  if (filtro === "suspenso") return "SUSPENSO";
  return undefined;
}

function parseApiError(error: unknown): string {
  if (error instanceof ApiError) return getApiErrorMessage(error.body) ?? error.message;
  if (error instanceof Error) return error.message;
  return "Não foi possível listar seus anúncios agora.";
}

function isRenderableMediaUrl(value: string | null | undefined): boolean {
  const v = String(value ?? "").trim();
  if (!v) return false;
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("blob:")) return true;
  return v.startsWith("/");
}

function resolveMediaUrlFromItem(item: {
  url?: string | null;
  arquivoUrl?: string | null;
  arquivo?: string | null;
}): string | null {
  const candidates = [item.url, item.arquivoUrl, item.arquivo];
  for (const c of candidates) {
    if (isRenderableMediaUrl(c)) return String(c).trim();
  }
  return null;
}

function resolveApiEnumValue(
  raw: string | null | undefined,
  options: Array<{ value: string; label: string }>
): string | undefined {
  const v = String(raw ?? "").trim();
  if (!v) return undefined;
  if (options.some((o) => o.value === v)) return v;
  const byLabel = options.find((o) => o.label.toLowerCase() === v.toLowerCase());
  if (byLabel) return byLabel.value;
  const normalized = v
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return options.some((o) => o.value === normalized) ? normalized : normalized || undefined;
}

function parsePrecoToNumber(precoFmt: string): number | undefined {
  const digits = String(precoFmt ?? "").replace(/\D/g, "");
  if (!digits) return undefined;
  const value = Number(digits) / 100;
  return Number.isFinite(value) ? value : undefined;
}

function labelCondicaoForSheet(raw: string | null | undefined): string {
  const code = resolveApiEnumValue(raw, BEM_CONDICAO_API);
  if (!code) return "Conservado";
  if (code === "TRABALHO_PESADO") return "Trabalho Pesado";
  if (code === "OTIMO_ESTADO") return "Ótimo Estado";
  return labelCondicaoApi(code) || String(raw ?? "").trim() || "Conservado";
}

function mapAnuncioResponseToRow(response: AnuncioResponse): MarketplaceAnuncioAdmin {
  const marcaRaw = String(response.marca ?? "").trim();
  const marcaCode = normalizeMarcaVeiculoCode(marcaRaw);
  const marcaLabel = marcaVeiculoLabel(marcaCode) || marcaRaw || "—";
  const modelo = String(response.modelo ?? "").trim() || "Sem modelo";
  const titulo = [marcaLabel, modelo].filter(Boolean).join(" ").trim();
  const statusModeracao = mapSellerStatusToModeracao(response.status);
  const midias = Array.isArray(response.midias) ? response.midias : [];
  const fotos = midias
    .filter((m) => {
      const tipo = String(m?.tipo ?? "").toUpperCase();
      return tipo === "FOTO" || tipo === "IMAGEM";
    })
    .map((m) => resolveMediaUrlFromItem({ url: m.url, arquivoUrl: m.arquivoUrl, arquivo: m.arquivo }))
    .filter((u): u is string => Boolean(u));
  const videos = midias
    .filter((m) => String(m?.tipo ?? "").toUpperCase() === "VIDEO")
    .map((m) => resolveMediaUrlFromItem({ url: m.url, arquivoUrl: m.arquivoUrl, arquivo: m.arquivo }))
    .filter((u): u is string => Boolean(u));
  const publicadoEm = String(response.criadoEm ?? response.createdAt ?? "").trim() || new Date().toISOString();
  const valor = Number(response.preco ?? 0);
  const km = Number(response.quilometragem ?? 0);
  const detalhe = response.detalheTecnico;
  const techBase = defaultMarketplaceAnuncioTechDetails({
    combustivel: labelCombustivelApi(response.combustivel),
    cambio: labelCambioApi(response.cambio),
  });

  return {
    id: String(response.id ?? ""),
    leilaoId: 0,
    categoria: "carros",
    status: statusModeracao === "aprovado" ? "ABERTO" : "EM_BREVE",
    titulo: titulo || "Anúncio",
    condicao: labelCondicaoForSheet(response.condicao) as MarketplaceAnuncioAdmin["condicao"],
    marca: marcaCode || marcaLabel,
    modelo,
    ano: response.ano ? String(response.ano) : "—",
    km: response.quilometragem ? `${km.toLocaleString("pt-BR")} km` : "—",
    cambio: labelCambioApi(response.cambio) || "—",
    combustivel: labelCombustivelApi(response.combustivel) || "—",
    local: String(response.cidade ?? "").trim() || "—",
    preco: Number.isFinite(valor) && valor > 0 ? formatCurrencyBRL(valor) : "Sob consulta",
    imagem: fotos[0] ?? MARKETPLACE_IMAGE_FALLBACK,
    vendedor: String(response.vendedorNome ?? "").trim() || "Você",
    publicadoEm,
    fotos: fotos.length > 0 ? fotos : [MARKETPLACE_IMAGE_FALLBACK],
    moderacao: statusModeracao,
    descricao: String(response.descricao ?? "").trim() || "",
    tipoVeiculo: labelTipoVeiculoApi(response.tipo) || "Carro",
    placa: String(response.placaVeiculo ?? "").trim() || "",
    blindado: Boolean(response.blindado),
    chassiFinal: String(response.finalChassi ?? "").trim() || "",
    cor: String(response.cor ?? "").trim() || "",
    videoUrls: videos.length > 0 ? videos : undefined,
    techDetails: {
      ...techBase,
      motorizacao: detalhe?.motorizacao ?? techBase.motorizacao,
      cilindrosCilindrada: detalhe?.cilindros ?? techBase.cilindrosCilindrada,
      potenciaCombinada: detalhe?.potenciaCombinada ?? techBase.potenciaCombinada,
      torqueCombinado: detalhe?.torqueCombinado ?? techBase.torqueCombinado,
      transmissao: detalhe?.transmissao ?? techBase.transmissao,
      tracao: detalhe?.tracao ?? techBase.tracao,
      modosConducao: detalhe?.modosConducao ?? techBase.modosConducao,
      carroceria: detalhe?.carroceria ?? techBase.carroceria,
      comprimentoLarguraAltura: detalhe?.comprimentoLarguraAltura ?? techBase.comprimentoLarguraAltura,
      entreEixos: detalhe?.entreEixos ?? techBase.entreEixos,
      portaMalas: detalhe?.portaMalas ?? techBase.portaMalas,
      tanqueCombustivel: detalhe?.tanqueCombustivel ?? techBase.tanqueCombustivel,
      ciclosUrbanoRodoviario: detalhe?.ciclosUrbano ?? techBase.ciclosUrbanoRodoviario,
      usoModoEletrico: detalhe?.usoModoEletrico ?? techBase.usoModoEletrico,
      emissoesSeloEficiencia: detalhe?.emissoesSeloEficiencia ?? techBase.emissoesSeloEficiencia,
      freiosDianteiros: detalhe?.freiosDianteiros ?? techBase.freiosDianteiros,
      freiosTraseiros: techBase.freiosTraseiros,
      suspensaoDianteira: detalhe?.suspensaoDianteira ?? techBase.suspensaoDianteira,
      suspensaoTraseira: detalhe?.suspensaoTraseira ?? techBase.suspensaoTraseira,
      medidaPneus: detalhe?.medidaPneus ?? techBase.medidaPneus,
      estepe: detalhe?.estepe ?? techBase.estepe,
      airbags: detalhe?.airbags ?? techBase.airbags,
      absDistribuicao: detalhe?.absDistribuicaoEletronica ?? techBase.absDistribuicao,
      controleEstabilidadeTracao:
        detalhe?.controleEstabilidadeTracao ?? techBase.controleEstabilidadeTracao,
      assistentePartidaRampa: detalhe?.assistentePartidaRampa ?? techBase.assistentePartidaRampa,
      cameraSensores: detalhe?.cameraSensoresEstacionamento ?? techBase.cameraSensores,
      arCondicionadoClimatizador:
        detalhe?.arCondicionadoClimatizador ?? techBase.arCondicionadoClimatizador,
      direcao: detalhe?.direcao ?? techBase.direcao,
      bancosVolante: detalhe?.bancosVolante ?? techBase.bancosVolante,
      multimidiaConectividade:
        detalhe?.multimidiaConectividade ?? techBase.multimidiaConectividade,
      rodasIluminacao: detalhe?.rodasIluminacao ?? techBase.rodasIluminacao,
      vidrosTravas: detalhe?.vidrosTravas ?? techBase.vidrosTravas,
      procedenciaNuLances: detalhe?.procedenciaNulances ?? techBase.procedenciaNuLances,
      licenciamentoDebitos: detalhe?.licenciamentoDebitos ?? techBase.licenciamentoDebitos,
      restricoesGravame: detalhe?.restricoesGravame ?? techBase.restricoesGravame,
      chavesManual: detalhe?.chavesManual ?? techBase.chavesManual,
      laudoCautelarInspecao:
        detalhe?.laudoCautelarInspecao ?? techBase.laudoCautelarInspecao,
    },
  };
}

function mapRowToPatchRequest(next: MarketplaceAnuncioAdmin): EditarAnuncioRequest {
  const quilometragemDigits = String(next.km ?? "").replace(/\D/g, "");
  const anoDigits = String(next.ano ?? "").replace(/\D/g, "");
  const marcaCodigo = normalizeMarcaVeiculoCode(next.marca);

  return {
    marca: marcaCodigo || undefined,
    modelo: next.modelo?.trim() || undefined,
    preco: parsePrecoToNumber(next.preco),
    cidade: next.local?.trim() || undefined,
    tipo: resolveApiEnumValue(next.tipoVeiculo, BEM_TIPO_VEICULO_API) as EditarAnuncioRequest["tipo"],
    condicao: resolveApiEnumValue(next.condicao, BEM_CONDICAO_API) as EditarAnuncioRequest["condicao"],
    ano: anoDigits ? Number(anoDigits.slice(0, 4)) : undefined,
    quilometragem: quilometragemDigits ? Number(quilometragemDigits) : undefined,
    combustivel: resolveApiEnumValue(next.combustivel, BEM_COMBUSTIVEL_API) as EditarAnuncioRequest["combustivel"],
    cambio: resolveApiEnumValue(next.cambio, BEM_CAMBIO_API) as EditarAnuncioRequest["cambio"],
    finalChassi: next.chassiFinal?.trim() || undefined,
    cor: next.cor?.trim() || undefined,
    blindado: next.blindado ?? undefined,
    placaVeiculo: next.placa?.trim() || undefined,
    descricao: next.descricao?.trim() || undefined,
    detalheTecnico: next.techDetails
      ? {
          motorizacao: next.techDetails.motorizacao?.trim() || undefined,
          cilindros: next.techDetails.cilindrosCilindrada?.trim() || undefined,
          potenciaCombinada: next.techDetails.potenciaCombinada?.trim() || undefined,
          torqueCombinado: next.techDetails.torqueCombinado?.trim() || undefined,
          transmissao: next.techDetails.transmissao?.trim() || undefined,
          tracao: next.techDetails.tracao?.trim() || undefined,
          modosConducao: next.techDetails.modosConducao?.trim() || undefined,
          carroceria: next.techDetails.carroceria?.trim() || undefined,
          comprimentoLarguraAltura: next.techDetails.comprimentoLarguraAltura?.trim() || undefined,
          entreEixos: next.techDetails.entreEixos?.trim() || undefined,
          portaMalas: next.techDetails.portaMalas?.trim() || undefined,
          tanqueCombustivel: next.techDetails.tanqueCombustivel?.trim() || undefined,
          ciclosUrbano: next.techDetails.ciclosUrbanoRodoviario?.trim() || undefined,
          usoModoEletrico: next.techDetails.usoModoEletrico?.trim() || undefined,
          emissoesSeloEficiencia: next.techDetails.emissoesSeloEficiencia?.trim() || undefined,
          freiosDianteiros: next.techDetails.freiosDianteiros?.trim() || undefined,
          suspensaoDianteira: next.techDetails.suspensaoDianteira?.trim() || undefined,
          suspensaoTraseira: next.techDetails.suspensaoTraseira?.trim() || undefined,
          medidaPneus: next.techDetails.medidaPneus?.trim() || undefined,
          estepe: next.techDetails.estepe?.trim() || undefined,
          airbags: next.techDetails.airbags?.trim() || undefined,
          absDistribuicaoEletronica: next.techDetails.absDistribuicao?.trim() || undefined,
          controleEstabilidadeTracao:
            next.techDetails.controleEstabilidadeTracao?.trim() || undefined,
          assistentePartidaRampa: next.techDetails.assistentePartidaRampa?.trim() || undefined,
          cameraSensoresEstacionamento: next.techDetails.cameraSensores?.trim() || undefined,
          arCondicionadoClimatizador:
            next.techDetails.arCondicionadoClimatizador?.trim() || undefined,
          direcao: next.techDetails.direcao?.trim() || undefined,
          bancosVolante: next.techDetails.bancosVolante?.trim() || undefined,
          multimidiaConectividade:
            next.techDetails.multimidiaConectividade?.trim() || undefined,
          rodasIluminacao: next.techDetails.rodasIluminacao?.trim() || undefined,
          vidrosTravas: next.techDetails.vidrosTravas?.trim() || undefined,
          procedenciaNulances: next.techDetails.procedenciaNuLances?.trim() || undefined,
          licenciamentoDebitos: next.techDetails.licenciamentoDebitos?.trim() || undefined,
          restricoesGravame: next.techDetails.restricoesGravame?.trim() || undefined,
          chavesManual: next.techDetails.chavesManual?.trim() || undefined,
          laudoCautelarInspecao:
            next.techDetails.laudoCautelarInspecao?.trim() || undefined,
        }
      : undefined,
  };
}

function mapSellerApiToRow(item: AnuncioVendedorListResponse): MarketplaceAnuncioAdmin {
  const marcaCode = String(item.marcaVeiculo ?? "").trim();
  const marcaLabel = marcaVeiculoLabel(marcaCode) || marcaCode || "—";
  const modelo = String(item.modelo ?? "").trim() || "Sem modelo";
  const titulo = [marcaLabel, modelo].filter(Boolean).join(" ").trim();
  const statusModeracao = mapSellerStatusToModeracao(item.status);
  const midias = Array.isArray(item.midias) ? item.midias : [];
  const fotos = midias
    .filter((m) => {
      const tipo = String(m?.tipo ?? "").toUpperCase();
      return tipo === "FOTO" || tipo === "IMAGEM";
    })
    .map((m) => resolveMediaUrlFromItem({ url: m?.url, arquivo: m?.arquivo }))
    .filter((u): u is string => Boolean(u));
  const videos = midias
    .filter((m) => String(m?.tipo ?? "").toUpperCase() === "VIDEO")
    .map((m) => resolveMediaUrlFromItem({ url: m?.url, arquivo: m?.arquivo }))
    .filter((u): u is string => Boolean(u));
  const publicadoEm = String(item.quandoFoiPostado ?? "").trim() || new Date().toISOString();
  const valor = Number(item.valor ?? 0);

  return {
    id: String(item.id ?? ""),
    leilaoId: 0,
    categoria: "carros",
    status: statusModeracao === "aprovado" ? "ABERTO" : "EM_BREVE",
    titulo: titulo || "Anúncio",
    condicao: "Conservado",
    marca: marcaCode || marcaLabel,
    modelo,
    ano: "—",
    km: "—",
    cambio: "—",
    combustivel: "—",
    local: "—",
    preco: Number.isFinite(valor) && valor > 0 ? formatCurrencyBRL(valor) : "Sob consulta",
    imagem: fotos[0] ?? MARKETPLACE_IMAGE_FALLBACK,
    vendedor: "Você",
    publicadoEm,
    fotos: fotos.length > 0 ? fotos : [MARKETPLACE_IMAGE_FALLBACK],
    moderacao: statusModeracao,
    descricao: "",
    tipoVeiculo: "Carro",
    placa: "",
    blindado: false,
    chassiFinal: "",
    cor: "",
    videoUrls: videos,
  };
}

function mapAdminApiToRow(item: AnuncioAdminListResponse): MarketplaceAnuncioAdmin {
  const marcaCode = normalizeMarcaVeiculoCode(item.marcaVeiculo);
  const marcaLabel = marcaVeiculoLabel(marcaCode) || String(item.marcaVeiculo ?? "").trim() || "—";
  const modelo = String(item.modelo ?? "").trim() || "Sem modelo";
  const titulo = [marcaLabel, modelo].filter(Boolean).join(" ").trim();
  const statusModeracao = mapAdminStatusToModeracao(item.status);
  const midias = Array.isArray(item.midias) ? item.midias : [];
  const fotos = midias
    .filter((m) => {
      const tipo = String(m?.tipo ?? "").toUpperCase();
      return tipo === "FOTO" || tipo === "IMAGEM";
    })
    .map((m) => resolveMediaUrlFromItem({ url: m?.url, arquivoUrl: m?.arquivoUrl, arquivo: m?.arquivo }))
    .filter((u): u is string => Boolean(u));
  const videos = midias
    .filter((m) => String(m?.tipo ?? "").toUpperCase() === "VIDEO")
    .map((m) => resolveMediaUrlFromItem({ url: m?.url, arquivoUrl: m?.arquivoUrl, arquivo: m?.arquivo }))
    .filter((u): u is string => Boolean(u));
  const publicadoEm = String(item.quandoFoiPostado ?? "").trim() || new Date().toISOString();
  const valor = Number(item.valor ?? 0);

  return {
    id: String(item.id ?? ""),
    leilaoId: 0,
    categoria: "carros",
    status: statusModeracao === "aprovado" ? "ABERTO" : "EM_BREVE",
    titulo: titulo || "Anúncio",
    condicao: "Conservado",
    marca: marcaCode || marcaLabel,
    modelo,
    ano: "—",
    km: "—",
    cambio: "—",
    combustivel: "—",
    local: "—",
    preco: Number.isFinite(valor) && valor > 0 ? formatCurrencyBRL(valor) : "Sob consulta",
    imagem: fotos[0] ?? MARKETPLACE_IMAGE_FALLBACK,
    vendedor: String(item.vendedorNome ?? "").trim() || "Vendedor",
    publicadoEm,
    fotos: fotos.length > 0 ? fotos : [MARKETPLACE_IMAGE_FALLBACK],
    moderacao: statusModeracao,
    descricao: "",
    tipoVeiculo: "Carro",
    placa: "",
    blindado: false,
    chassiFinal: "",
    cor: "",
    videoUrls: videos,
  };
}

function isUuidLike(value: string | number): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value ?? "").trim()
  );
}

function createDraftAnuncio(seedId: number): MarketplaceAnuncioAdmin {
  return {
    id: seedId,
    leilaoId: 0,
    categoria: "carros",
    status: "EM_BREVE",
    titulo: "",
    condicao: "Conservado",
    marca: "",
    modelo: "",
    ano: "",
    km: "",
    cambio: "",
    combustivel: "",
    local: "",
    preco: "",
    imagem: "",
    vendedor: "Pietro",
    publicadoEm: new Date().toISOString(),
    fotos: [],
    moderacao: "pendente",
    descricao: "",
    tipoVeiculo: "",
    placa: "",
    blindado: false,
    chassiFinal: "",
    cor: "",
    videoUrls: [],
  };
}

export function AdminMarketplaceAnunciosContent({
  allowApproveAction = true,
  showSellerInfo = true,
  allowCreateAction = false,
  createActionLabel = "Criar anúncio",
  createActionHref,
  onCreateAction,
  dataSource = "adminApi",
  refreshSignal = 0,
}: {
  allowApproveAction?: boolean;
  showSellerInfo?: boolean;
  allowCreateAction?: boolean;
  createActionLabel?: string;
  createActionHref?: string;
  onCreateAction?: () => void;
  dataSource?: "mock" | "sellerApi" | "adminApi";
  refreshSignal?: number;
} = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [filtroMod, setFiltroMod] = React.useState<ModeracaoFiltro>(() => initialFiltroFromSearch(searchParams));

  React.useEffect(() => {
    setFiltroMod(initialFiltroFromSearch(searchParams));
  }, [searchParams]);

  const [rows, setRows] = React.useState<MarketplaceAnuncioAdmin[]>(() =>
    dataSource === "mock" ? buildMarketplaceAnunciosAdminSeed() : []
  );
  const [search, setSearch] = React.useState("");
  const [loadingRows, setLoadingRows] = React.useState(dataSource !== "mock");
  const [loadingEditId, setLoadingEditId] = React.useState<string | null>(null);
  const [loadingDetailId, setLoadingDetailId] = React.useState<string | null>(null);
  const [loadingActionId, setLoadingActionId] = React.useState<string | null>(null);
  const [searchDebounced, setSearchDebounced] = React.useState("");

  React.useEffect(() => {
    const raw = searchParams.get("q");
    if (raw) setSearch(decodeURIComponent(raw));
  }, [searchParams]);

  React.useEffect(() => {
    const t = window.setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  /** Painel admin: lista vem sem texto de busca na API (filtro no cliente). Vendedor: refetch ao debounce. */
  const listFetchKey = dataSource === "adminApi" ? "" : searchDebounced;

  React.useEffect(() => {
    if (dataSource === "mock") return;
    let active = true;
    setLoadingRows(true);
    const buscaParam = searchDebounced || undefined;
    const fetchRows = async (): Promise<MarketplaceAnuncioAdmin[]> => {
      if (dataSource === "adminApi") {
        // Lista só por status + paginação. A caixa "Buscar" (título, vendedor, local…) usa
        // `filterAnunciosBySearch` no cliente — o backend separa `busca` (modelo) e `vendedor` (nome).
        const page = await listarAdminAnuncios({
          status: mapFiltroToAdminStatus(filtroMod),
          page: 0,
          size: 120,
        });
        return (page.content ?? []).map(mapAdminApiToRow);
      }

      const status = mapFiltroToSellerStatus(filtroMod);

      if (status) {
        const page = await listarMeusAnunciosVendedor({
          status,
          busca: buscaParam,
          page: 0,
          size: 120,
        });
        return (page.content ?? []).map(mapSellerApiToRow);
      }

      // Fallback para backends que quebram com status nulo no filtro "todos".
      const statuses: StatusAnuncioApi[] = [
        "PENDENTE",
        "PUBLICADO",
        "SUSPENSO",
        "REPROVADO",
        "CANCELADO",
      ];
      const results = await Promise.allSettled(
        statuses.map((st) =>
          listarMeusAnunciosVendedor({
            status: st,
            busca: buscaParam,
            page: 0,
            size: 120,
          })
        )
      );

      const merged = new Map<string, MarketplaceAnuncioAdmin>();
      for (const result of results) {
        if (result.status !== "fulfilled") continue;
        for (const item of result.value.content ?? []) {
          const row = mapSellerApiToRow(item);
          merged.set(String(row.id), row);
        }
      }
      if (merged.size === 0 && results.every((r) => r.status === "rejected")) {
        const firstError = results.find((r) => r.status === "rejected");
        throw (firstError as PromiseRejectedResult | undefined)?.reason ?? new Error("Falha ao listar anúncios.");
      }
      return Array.from(merged.values()).sort(
        (a, b) => new Date(b.publicadoEm).getTime() - new Date(a.publicadoEm).getTime()
      );
    };

    fetchRows()
      .then(async (mappedRows) => {
        if (!active) return;
        const needHydration = mappedRows.filter(
          (r) => (r.fotos?.length ?? 0) === 0 || r.fotos.every((u) => u === MARKETPLACE_IMAGE_FALLBACK)
        );
        if (needHydration.length === 0) {
          setRows(mappedRows);
          return;
        }
        const hydrationTargets = new Set(needHydration.map((r) => String(r.id)));
        const hydrated = await Promise.all(
          mappedRows.map(async (row) => {
            if (!hydrationTargets.has(String(row.id))) return row;
            try {
              const detailed =
                dataSource === "adminApi"
                  ? await buscarAdminAnuncioPorId(String(row.id))
                  : await buscarMeuAnuncioPorIdVendedor(String(row.id));
              return mapAnuncioResponseToRow(detailed);
            } catch {
              return row;
            }
          })
        );
        if (!active) return;
        setRows(hydrated);
      })
      .catch((error) => {
        if (!active) return;
        setRows([]);
        toast({
          type: "error",
          title: "Falha ao carregar anúncios",
          description: parseApiError(error),
        });
      })
      .finally(() => {
        if (!active) return;
        setLoadingRows(false);
      });
    return () => {
      active = false;
    };
  }, [dataSource, filtroMod, refreshSignal, listFetchKey, toast]);
  const [deleteTarget, setDeleteTarget] = React.useState<MarketplaceAnuncioAdmin | null>(null);
  const [editTarget, setEditTarget] = React.useState<MarketplaceAnuncioAdmin | null>(null);
  const [detailTarget, setDetailTarget] = React.useState<MarketplaceAnuncioAdmin | null>(null);

  const onFiltroChange = React.useCallback(
    (value: string) => {
      const next = value as ModeracaoFiltro;
      setFiltroMod(next);
      if (next === "pendente") {
        router.replace(`${pathname}?${MARKETPLACE_ANUNCIOS_MODERACAO_QUERY}`);
      } else {
        router.replace(pathname);
      }
    },
    [pathname, router]
  );

  const filtered = React.useMemo(() => {
    const byMod = filterAnunciosByModeracaoFiltro(rows, filtroMod);
    return filterAnunciosBySearch(byMod, searchDebounced);
  }, [rows, filtroMod, searchDebounced]);

  const saveEdit = React.useCallback(
    async (next: MarketplaceAnuncioAdmin) => {
      if (dataSource === "adminApi") {
        try {
          const updated = await editarParcialAdminAnuncio(String(next.id), mapRowToPatchRequest(next));
          const mapped = mapAnuncioResponseToRow(updated);
          setRows((prev) => prev.map((r) => (r.id === mapped.id ? mapped : r)));
          setDetailTarget((d) => (d && d.id === mapped.id ? mapped : d));
          toast({
            type: "success",
            title: "Anúncio atualizado",
            description: "Alterações salvas com sucesso.",
          });
          return true;
        } catch (error) {
          toast({
            type: "error",
            title: "Falha ao salvar anúncio",
            description: parseApiError(error),
          });
          return false;
        }
      }

      if (dataSource === "sellerApi") {
        try {
          const updated = await editarParcialMeuAnuncioVendedor(String(next.id), mapRowToPatchRequest(next));
          const mapped = mapAnuncioResponseToRow(updated);
          setRows((prev) => prev.map((r) => (r.id === mapped.id ? mapped : r)));
          setDetailTarget((d) => (d && d.id === mapped.id ? mapped : d));
          toast({
            type: "success",
            title: "Anúncio atualizado",
            description: "Alterações salvas com sucesso.",
          });
          return true;
        } catch (error) {
          toast({
            type: "error",
            title: "Falha ao salvar anúncio",
            description: parseApiError(error),
          });
          return false;
        }
      }

      let existed = false;
      setRows((prev) => {
        existed = prev.some((r) => r.id === next.id);
        if (!existed) return [next, ...prev];
        return prev.map((r) => (r.id === next.id ? next : r));
      });
      setDetailTarget((d) => (d && d.id === next.id ? next : d));
      toast({
        type: "success",
        title: existed ? "Anúncio atualizado" : "Anúncio criado",
        description: existed ? "Alterações salvas (mock local)." : "Novo anúncio salvo (mock local).",
      });
      return true;
    },
    [dataSource, toast]
  );

  const openEditAnuncio = React.useCallback(
    async (a: MarketplaceAnuncioAdmin) => {
      if (dataSource === "mock") {
        setEditTarget(a);
        return;
      }
      setLoadingEditId(String(a.id));
      try {
        const detailed =
          dataSource === "adminApi"
            ? await buscarAdminAnuncioPorId(String(a.id))
            : await buscarMeuAnuncioPorIdVendedor(String(a.id));
        setEditTarget(mapAnuncioResponseToRow(detailed));
      } catch (error) {
        toast({
          type: "error",
          title: "Falha ao abrir edição",
          description: parseApiError(error),
        });
      } finally {
        setLoadingEditId(null);
      }
    },
    [dataSource, toast]
  );

  const openDetailAnuncio = React.useCallback(
    async (a: MarketplaceAnuncioAdmin) => {
      if (dataSource === "mock") {
        setDetailTarget(a);
        return;
      }
      setLoadingDetailId(String(a.id));
      try {
        const detailed =
          dataSource === "adminApi"
            ? await buscarAdminAnuncioPorId(String(a.id))
            : await buscarMeuAnuncioPorIdVendedor(String(a.id));
        setDetailTarget(mapAnuncioResponseToRow(detailed));
      } catch (error) {
        toast({
          type: "error",
          title: "Falha ao abrir detalhe",
          description: parseApiError(error),
        });
      } finally {
        setLoadingDetailId(null);
      }
    },
    [dataSource, toast]
  );

  const confirmDelete = React.useCallback(() => {
    if (!deleteTarget) return;
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
    if (detailTarget?.id === deleteTarget.id) setDetailTarget(null);
    toast({ type: "success", title: "Anúncio removido", description: "Removido da lista (mock local)." });
  }, [deleteTarget, detailTarget, toast]);

  const approveAnuncio = React.useCallback(
    async (a: MarketplaceAnuncioAdmin) => {
      if (dataSource === "adminApi") {
        setLoadingActionId(String(a.id));
        try {
          await aprovarAdminAnuncio(String(a.id));
          setRows((prev) =>
            prev.map((r) => (r.id === a.id ? { ...r, moderacao: "aprovado" as const } : r))
          );
          setDetailTarget((d) => (d && d.id === a.id ? { ...d, moderacao: "aprovado" } : d));
          toast({
            type: "success",
            title: "Anúncio aprovado",
            description: "O anúncio foi aprovado com sucesso.",
          });
        } catch (error) {
          toast({
            type: "error",
            title: "Falha ao aprovar anúncio",
            description: parseApiError(error),
          });
        } finally {
          setLoadingActionId(null);
        }
        return;
      }

      setRows((prev) => prev.map((r) => (r.id === a.id ? { ...r, moderacao: "aprovado" as const } : r)));
      setDetailTarget((d) => (d && d.id === a.id ? { ...d, moderacao: "aprovado" } : d));
      toast({
        type: "success",
        title: "Anúncio aprovado",
        description: "Publicado no marketplace (mock local).",
      });
    },
    [dataSource, toast]
  );

  const toggleSuspend = React.useCallback(
    async (a: MarketplaceAnuncioAdmin) => {
      if (dataSource === "adminApi") {
        setLoadingActionId(String(a.id));
        try {
          let next: AnuncioModeracaoStatus;
          if (a.moderacao === "suspenso") {
            await reativarAdminAnuncio(String(a.id));
            next = "aprovado";
          } else {
            await suspenderAdminAnuncio(String(a.id), {
              motivo: a.moderacao === "pendente" ? "Recusado na moderação" : "Suspenso pelo admin",
            });
            next = "suspenso";
          }
          setRows((prev) => prev.map((r) => (r.id === a.id ? { ...r, moderacao: next } : r)));
          setDetailTarget((d) => (d && d.id === a.id ? { ...d, moderacao: next } : d));
          toast({
            type: "success",
            title: next === "suspenso" ? "Anúncio recusado/suspenso" : "Anúncio reativado",
            description:
              a.moderacao === "pendente"
                ? "O anúncio foi recusado na moderação."
                : next === "suspenso"
                  ? "O anúncio foi suspenso com sucesso."
                  : "O anúncio foi reativado e voltou a ser publicado.",
          });
        } catch (error) {
          toast({
            type: "error",
            title: "Falha ao atualizar status do anúncio",
            description: parseApiError(error),
          });
        } finally {
          setLoadingActionId(null);
        }
        return;
      }

      let next: AnuncioModeracaoStatus;
      if (a.moderacao === "suspenso") {
        const idNum = Number(a.id);
        next = Number.isFinite(idNum) && idNum >= 200 ? "pendente" : "aprovado";
      } else {
        next = "suspenso";
      }
      setRows((prev) => prev.map((r) => (r.id === a.id ? { ...r, moderacao: next } : r)));
      setDetailTarget((d) => (d && d.id === a.id ? { ...d, moderacao: next } : d));
      toast({
        type: "success",
        title: next === "suspenso" ? "Anúncio suspenso" : "Status atualizado",
        description:
          next === "suspenso"
            ? "O anúncio deixa de aparecer para compradores (mock)."
            : next === "pendente"
              ? "Voltou para a fila de moderação (mock)."
              : "Anúncio publicado novamente (mock).",
      });
    },
    [dataSource, toast]
  );

  const handleCreateAnuncio = React.useCallback(() => {
    if (onCreateAction) {
      onCreateAction();
      return;
    }
    if (createActionHref) {
      router.push(createActionHref);
      return;
    }
    setEditTarget(createDraftAnuncio(Date.now()));
  }, [createActionHref, onCreateAction, router]);

  return (
    <div>
      <PageHeader
        title="Anúncios"
        subtitle={
          showSellerInfo
            ? "Gerencie anúncios do marketplace: fotos, vendedor, moderação e publicação."
            : "Gerencie seus anúncios no marketplace: fotos, moderação e publicação."
        }
        action={
          allowCreateAction ? (
            <Button type="button" onClick={handleCreateAnuncio}>
              {createActionLabel}
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
        <div className="w-full shrink-0 sm:w-auto sm:min-w-[220px] sm:max-w-xs">
          <Label htmlFor="anuncios-filtro" className="text-zinc-700">
            Status
          </Label>
          <Select
            id="anuncios-filtro"
            value={filtroMod}
            onValueChange={onFiltroChange}
            options={FILTRO_OPTIONS}
            placeholder="Filtrar"
            aria-label="Filtrar por status de moderação"
            className="mt-1.5"
          />
        </div>
        <div className="min-w-0 w-full flex-1">
          <Label htmlFor="anuncios-busca" className="text-zinc-700">
            Buscar
          </Label>
          <Input
            id="anuncios-busca"
            type="search"
            placeholder={showSellerInfo ? "Título, vendedor, local…" : "Título, local…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-1.5 w-full rounded-2xl"
          />
        </div>
      </div>

      {loadingRows ? (
        <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center text-sm text-zinc-600">
          Carregando anúncios...
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-12 text-center text-sm text-zinc-600">
          Nenhum anúncio encontrado com os filtros atuais.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <li
              key={a.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-black/[0.03]"
            >
              <PhotoCarousel photos={a.fotos} imageAltBase={a.titulo} />

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex gap-3">
                  <BemMarcaLogo
                    nome={a.titulo}
                    marca={a.marca}
                    className="shrink-0 pt-0.5 [&_svg]:!h-9 [&_svg]:!w-9 sm:[&_svg]:!h-10 sm:[&_svg]:!w-10"
                  />
                  <div className="min-w-0 flex-1">
                    <h2
                      className={cn(
                        "line-clamp-2 font-semibold leading-snug text-zinc-900",
                        showSellerInfo ? "text-[15px]" : "text-lg"
                      )}
                    >
                      {a.titulo}
                    </h2>
                    {!isUuidLike(a.id) ? <p className="mt-1 text-xs text-zinc-500">#{a.id}</p> : null}
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  {showSellerInfo ? (
                    <p>
                      <span className="text-zinc-500">Vendedor:</span> <VendedorAdminLink name={a.vendedor} />
                    </p>
                  ) : null}
                  <p>
                    <span className="text-zinc-500">Postado em:</span>{" "}
                    <time dateTime={a.publicadoEm} className="font-medium text-zinc-800">
                      {formatDashboardDateTime(a.publicadoEm)}
                    </time>
                  </p>
                  <p className="text-xl font-bold text-zinc-900">{a.preco}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">{moderacaoBadge(a.moderacao)}</div>

                <div className="mt-auto flex flex-col gap-2 border-t border-zinc-100 pt-3">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="w-full rounded-full"
                    onClick={() => void openDetailAnuncio(a)}
                    loading={loadingDetailId === String(a.id)}
                    disabled={loadingDetailId === String(a.id)}
                  >
                    <EyeIcon className="mr-2 h-4 w-4" aria-hidden />
                    {loadingDetailId === String(a.id) ? "Abrindo..." : "Ver detalhe"}
                  </Button>
                  {allowApproveAction && a.moderacao === "pendente" ? (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="w-full rounded-full border-0 bg-emerald-600 text-white shadow-none hover:bg-emerald-700 hover:opacity-100"
                      onClick={() => void approveAnuncio(a)}
                      loading={loadingActionId === String(a.id)}
                      disabled={loadingActionId === String(a.id)}
                    >
                      <CheckCircleIcon className="mr-2 h-4 w-4" aria-hidden />
                      {loadingActionId === String(a.id) ? "Aprovando..." : "Aprovar anúncio"}
                    </Button>
                  ) : null}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                      onClick={() => void openEditAnuncio(a)}
                      loading={loadingEditId === String(a.id)}
                      disabled={loadingEditId === String(a.id)}
                    >
                      <PencilSquareIcon className="mr-1.5 h-4 w-4" aria-hidden />
                      {loadingEditId === String(a.id) ? "Abrindo..." : "Editar"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                      onClick={() => void toggleSuspend(a)}
                      loading={loadingActionId === String(a.id)}
                      disabled={loadingActionId === String(a.id)}
                    >
                      <NoSymbolIcon className="mr-1.5 h-4 w-4" aria-hidden />
                      {loadingActionId === String(a.id)
                        ? "Atualizando..."
                        : a.moderacao === "pendente"
                          ? "Recusar anúncio"
                          : a.moderacao === "suspenso"
                            ? "Reativar"
                            : "Suspender"}
                    </Button>
                  </div>
                  {dataSource !== "adminApi" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleteTarget(a)}
                    >
                      <TrashIcon className="mr-1.5 h-4 w-4" aria-hidden />
                      Excluir
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={!!detailTarget} onClose={() => setDetailTarget(null)}>
        <SheetContent
          className="max-w-[min(100vw-1rem,768px)] w-full overflow-y-auto"
          onClose={() => setDetailTarget(null)}
        >
          {detailTarget ? (
            <>
              <div className="-mx-4 -mt-1">
                <PhotoCarousel
                  photos={
                    detailTarget.fotos.length > 0
                      ? detailTarget.fotos
                      : detailTarget.imagem
                        ? [detailTarget.imagem]
                        : []
                  }
                  variant="sheetHero"
                  imageAltBase={detailTarget.titulo}
                />
              </div>

              <SheetHeader className="mt-6 text-left">
                <div className="flex gap-3 pr-2">
                  <BemMarcaLogo
                    nome={detailTarget.titulo}
                    marca={detailTarget.marca}
                    className="shrink-0 [&_svg]:!h-10 [&_svg]:!w-10 sm:[&_svg]:!h-11 sm:[&_svg]:!w-11"
                  />
                  <div className="min-w-0 flex-1">
                    <SheetTitle className="text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-zinc-900">
                      {detailTarget.titulo}
                    </SheetTitle>
                    <SheetDescription className="mt-1.5 text-[13px] leading-snug text-zinc-500">
                      {showSellerInfo ? (
                        <>
                          {!isUuidLike(detailTarget.id) ? `Anúncio #${detailTarget.id} · ` : null}
                          <VendedorAdminLink name={detailTarget.vendedor} />
                        </>
                      ) : (
                        <>{!isUuidLike(detailTarget.id) ? `Anúncio #${detailTarget.id}` : ""}</>
                      )}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              <div className="space-y-6 pb-4">
                <div className="flex flex-wrap gap-2">{moderacaoBadge(detailTarget.moderacao)}</div>

                <MarketplaceAnuncioDetailFicha anuncio={detailTarget} />

                <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:flex-wrap">
                  <Link
                    href={`/marketplace/${detailTarget.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-100 px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
                  >
                    Abrir no site
                  </Link>
                  {allowApproveAction && detailTarget.moderacao === "pendente" ? (
                    <Button
                      type="button"
                      className="rounded-full border-0 bg-emerald-600 text-white shadow-none hover:bg-emerald-700 hover:opacity-100"
                      onClick={() => void approveAnuncio(detailTarget)}
                      loading={loadingActionId === String(detailTarget.id)}
                      disabled={loadingActionId === String(detailTarget.id)}
                    >
                      <CheckCircleIcon className="mr-2 h-4 w-4" aria-hidden />
                      {loadingActionId === String(detailTarget.id) ? "Aprovando..." : "Aprovar anúncio"}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => {
                      void openEditAnuncio(detailTarget);
                      setDetailTarget(null);
                    }}
                    loading={loadingEditId === String(detailTarget.id)}
                    disabled={loadingEditId === String(detailTarget.id)}
                  >
                    {loadingEditId === String(detailTarget.id) ? "Abrindo..." : "Editar"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => void toggleSuspend(detailTarget)}
                    loading={loadingActionId === String(detailTarget.id)}
                    disabled={loadingActionId === String(detailTarget.id)}
                  >
                    {loadingActionId === String(detailTarget.id)
                      ? "Atualizando..."
                      : detailTarget.moderacao === "pendente"
                        ? "Recusar anúncio"
                        : detailTarget.moderacao === "suspenso"
                          ? "Reativar"
                          : "Suspender"}
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <MarketplaceAnuncioEditSheet
        open={!!editTarget}
        anuncio={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={saveEdit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Excluir anúncio?"
        description={
          deleteTarget ? (
            <>
              O anúncio <strong className="font-medium text-zinc-800">{deleteTarget.titulo}</strong> será removido da
              lista (mock local).
            </>
          ) : null
        }
        confirmLabel="Excluir"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
