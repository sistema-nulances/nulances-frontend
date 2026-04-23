"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AuctionIcon,
  Calendar03Icon,
  Car01Icon,
  Clock01Icon,
  DashboardSpeed01Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/cn";
import { getApiOrigin } from "@/lib/api/api-url";
import { documentacaoKycTotalmenteAprovada } from "@/lib/documentos-validacao-kyc";
import {
  buscarItemLeilaoPublicoPorId,
  buscarPainelLeilaoPublicoPorId,
} from "@/lib/repositories/admin-leiloes-repository";
import { enviarLance } from "@/lib/repositories/lances-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type { LanceAtualizadoEvent } from "@/lib/repositories/types/lance.types";
import type {
  LeilaoItemDetalheResponse,
  StatusItemLeilaoApi,
} from "@/lib/repositories/types/leilao.types";
import { AuctionDetailPageContentSkeleton } from "@/components/skeletons";
import { BemMarcaLogo } from "@/components/admin/bens/bem-marca-logo";
import { formatEnumDisplayLabel } from "@/lib/format-enum-label";
import { buildYouTubeEmbedUrl, extractYouTubeVideoId, normalizeOptionalHttpUrl } from "@/lib/leilao-live-url";
import { marcaLeilaoItemLabel, tituloCompletoBemLeilao } from "@/lib/leilao-bem-exibicao";
import { getStatusClasses, getStatusLabel } from "@/utils/status-auction";
import type { AuctionStatus } from "@/data/auction-items";

function toAuctionStatus(status?: StatusItemLeilaoApi): AuctionStatus {
  if (status === "ABERTO") return "ABERTO";
  if (status === "AGUARDANDO_ABERTURA") return "EM_BREVE";
  return "ENCERRADO";
}

function formatMoney(value?: number | null): string {
  if (value == null) return "-";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value?: string): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const hh = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const day = d.toLocaleDateString("pt-BR");
  return `${day} às ${hh}`;
}

function normalizeColor(value?: string | null): string {
  if (!value) return "-";
  const normalized = value.trim().toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function normalizeName(value?: string | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export default function AuctionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const { toast } = useToast();
  const { isAuthenticated, status: authStatus, user } = useAuth();

  const [item, setItem] = useState<LeilaoItemDetalheResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncrement, setSelectedIncrement] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState<string>("/BANNER-MOCK1.png");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [submittingBid, setSubmittingBid] = useState(false);
  const [linkLive, setLinkLive] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setSelectedIncrement(null);

    const run = async () => {
      try {
        const data = await buscarItemLeilaoPublicoPorId(id);
        if (!active) return;
        setItem(data);
        setLinkLive(data.linkLive ?? null);
        const first = data.midias?.[0]?.arquivo?.trim();
        setActiveImage(first || "/BANNER-MOCK1.png");

        if (data.leilaoId) {
          try {
            const painel = await buscarPainelLeilaoPublicoPorId(data.leilaoId);
            if (!active) return;
            if (painel.linkLive != null) setLinkLive(painel.linkLive);
          } catch {
            // mantém experiência principal mesmo se o painel falhar
          }
        }
      } catch (e) {
        if (!active) return;
        const message = e instanceof Error ? e.message : "Não foi possível carregar o item do leilão.";
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (!id) {
      setError("ID do item inválido.");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    void run();
    return () => {
      active = false;
    };
  }, [id]);

  const status = toAuctionStatus(item?.statusItem);
  const kycAprovado = documentacaoKycTotalmenteAprovada(user);
  const galleryImages = useMemo(
    () =>
      (item?.midias ?? [])
        .map((m) => (m.arquivo || "").trim())
        .filter((src) => src.length > 0),
    [item]
  );
  const increments = useMemo(
    () =>
      item?.incrementosSugeridos?.length
        ? item.incrementosSugeridos
        : item?.incrementoMinimo
          ? [item.incrementoMinimo, item.incrementoMinimo * 2, item.incrementoMinimo * 3, item.incrementoMinimo * 4]
          : [],
    [item]
  );

  const currentBidValue = item?.lanceAtual ?? item?.valorInicial ?? 0;
  const liveUrl = useMemo(() => normalizeOptionalHttpUrl(linkLive), [linkLive]);
  const youtubeEmbedUrl = useMemo(() => {
    if (!liveUrl) return null;
    const videoId = extractYouTubeVideoId(liveUrl);
    return videoId ? buildYouTubeEmbedUrl(videoId) : null;
  }, [liveUrl]);
  const aberturaMs = item?.aberturaDisputa ? new Date(item.aberturaDisputa).getTime() : NaN;
  const encerramentoMs = item?.encerramentoDisputa ? new Date(item.encerramentoDisputa).getTime() : NaN;
  const ultimoLance = item?.historicoLances?.[0];
  const usuarioEstaGanhando = useMemo(() => {
    if (!isAuthenticated || !user || status !== "ABERTO") return false;
    if (!ultimoLance?.usuarioNome) return false;
    return normalizeName(ultimoLance.usuarioNome) === normalizeName(user.nomeCompleto);
  }, [isAuthenticated, status, ultimoLance?.usuarioNome, user]);

  /** Alinhado ao cronômetro e às mesmas datas que o back valida em `processarLance`. */
  const podeDarLance = useMemo(() => {
    if (!item || item.statusItem !== "ABERTO") return false;
    if (Number.isFinite(aberturaMs) && nowMs < aberturaMs) return false;
    if (Number.isFinite(encerramentoMs) && nowMs >= encerramentoMs) return false;
    return true;
  }, [item, aberturaMs, encerramentoMs, nowMs]);

  const cabecalhoTituloItem = useMemo(() => {
    if (!item) return null;
    const marcaLegivel = marcaLeilaoItemLabel(item.marcaVeiculo);
    const modeloStr = String(item.modelo ?? "").trim();
    const nomeParaLogo =
      modeloStr || tituloCompletoBemLeilao({ marcaVeiculo: item.marcaVeiculo, modelo: item.modelo });
    return { marcaLegivel, modeloStr, nomeParaLogo };
  }, [item]);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (item && item.statusItem !== "ABERTO") setSelectedIncrement(null);
  }, [item]);

  useEffect(() => {
    if (!podeDarLance) setSelectedIncrement(null);
  }, [podeDarLance]);

  useEffect(() => {
    if (!item?.leilaoLoteBemId) return;
    const wsBase = process.env.NEXT_PUBLIC_WS_URL?.trim() || `${getApiOrigin()}/ws`;
    const topic = `/topic/leiloes/itens/${item.leilaoLoteBemId}`;

    const client = new Client({
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS(wsBase),
    });

    client.onConnect = () => {
      client.subscribe(topic, (frame) => {
        try {
          const payload = JSON.parse(frame.body) as LanceAtualizadoEvent;
          const itemId = String(payload.leilaoLoteBemId ?? payload.itemId ?? "");
          if (!itemId || itemId !== item.leilaoLoteBemId) return;

          setItem((prev) => {
            if (!prev) return prev;
            const valorAtual = payload.valorAtual ?? prev.lanceAtual;
            const proximoLance = payload.proximoLance ?? prev.proximoLance;
            const historico = [
              {
                lanceId: `${Date.now()}`,
                valor: Number(payload.valorAtual ?? prev.lanceAtual ?? prev.valorInicial),
                dataHora: new Date().toISOString(),
                usuarioNome:
                  payload.usuarioId && user?.id && payload.usuarioId === user.id
                    ? user.nomeCompleto
                    : "Usuário",
              },
              ...(prev.historicoLances ?? []),
            ].slice(0, 20);

            return { ...prev, lanceAtual: valorAtual, proximoLance, historicoLances: historico };
          });
        } catch {
          // ignore malformed payload
        }
      });
    };

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [item?.leilaoLoteBemId, user?.id, user?.nomeCompleto]);

  useEffect(() => {
    if (!isGalleryOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsGalleryOpen(false);
      if (event.key === "ArrowRight" && galleryImages.length > 1) {
        setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
      }
      if (event.key === "ArrowLeft" && galleryImages.length > 1) {
        setGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [galleryImages.length, isGalleryOpen]);

  function openGalleryBySrc(src: string) {
    const idx = galleryImages.findIndex((x) => x === src);
    setGalleryIndex(idx >= 0 ? idx : 0);
    setIsGalleryOpen(true);
  }

  const countdownTargetMs = useMemo(() => {
    if (!item) return NaN;
    if (status === "EM_BREVE") return aberturaMs;
    if (status === "ABERTO") return encerramentoMs;
    return NaN;
  }, [aberturaMs, encerramentoMs, item, status]);

  const countdownLabel = status === "EM_BREVE" ? "Abre em" : "Encerra em";
  const countdownDiff = Number.isFinite(countdownTargetMs) ? Math.max(0, countdownTargetMs - nowMs) : 0;
  const countdown = {
    days: Math.floor(countdownDiff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((countdownDiff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((countdownDiff / (1000 * 60)) % 60),
    seconds: Math.floor((countdownDiff / 1000) % 60),
  };

  const handleConfirmBid = async () => {
    if (selectedIncrement == null || !item || submittingBid || !podeDarLance) return;
    const valor = currentBidValue + selectedIncrement;
    setSubmittingBid(true);
    try {
      await enviarLance({
        leilaoLoteBemId: item.leilaoLoteBemId,
        valor,
        clientRequestId:
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      });
      toast({
        type: "success",
        title: "Lance enviado",
        description: `Seu lance de ${formatMoney(valor)} foi enviado para processamento.`,
      });
      setSelectedIncrement(null);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Não foi possível enviar o lance.";
      toast({
        type: "error",
        title: "Falha ao enviar lance",
        description: message,
      });
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleGoToLogin = () => {
    const returnUrl = `/auction/${encodeURIComponent(id)}`;
    router.push(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header />

      <main className="flex-1 py-5 md:py-8">
        <div className="mx-auto w-full max-w-375 px-4">
          {loading ? (
            <AuctionDetailPageContentSkeleton />
          ) : error || !item ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
              <p className="font-semibold text-red-700">Não foi possível carregar o detalhe.</p>
              <p className="mt-2 text-sm text-red-600">{error ?? "Item não encontrado."}</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-zinc-200 pb-4">
                <span className="inline-flex items-center rounded-full bg-nulance-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-nulance-purple">
                  {item.codigoLote || "Lote"}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusClasses(status)}`}
                >
                  {getStatusLabel(status)}
                </span>
              </div>

              {usuarioEstaGanhando && (
                <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-[0_10px_30px_-18px_rgba(16,185,129,0.55)]">
                  <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400" />
                  <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                        </span>
                        <p className="text-sm font-semibold text-emerald-900">Você está liderando este lote</p>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-emerald-800/90">
                        Seu lance é o maior no momento. Continue acompanhando em tempo real até o encerramento.
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Maior lance</p>
                      <p className="mt-0.5 text-base font-bold tabular-nums text-emerald-900">
                        {formatMoney(currentBidValue)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                  <div className="overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-zinc-200">
                    <div className="relative aspect-video overflow-hidden rounded-2xl">
                      <button
                        type="button"
                        className="h-full w-full cursor-zoom-in"
                        onClick={() => openGalleryBySrc(activeImage)}
                        aria-label="Abrir galeria de imagens"
                      >
                        <Image
                          src={activeImage}
                          alt={tituloCompletoBemLeilao({ marcaVeiculo: item.marcaVeiculo, modelo: item.modelo })}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 70vw"
                        />
                      </button>
                    </div>
                    {(item.midias?.length ?? 0) > 1 && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {(item.midias ?? []).map((m) => {
                          const src = m.arquivo || "";
                          if (!src) return null;
                          return (
                            <button
                              key={m.id || src}
                              type="button"
                              onClick={() => {
                                setActiveImage(src);
                                openGalleryBySrc(src);
                              }}
                              className={cn(
                                "relative aspect-video overflow-hidden rounded-xl ring-2 transition",
                                activeImage === src ? "ring-nulance-purple" : "ring-transparent hover:ring-zinc-200"
                              )}
                            >
                              <Image src={src} alt="Miniatura do lote" fill className="object-cover" sizes="20vw" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    {cabecalhoTituloItem ? (
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <BemMarcaLogo
                          nome={cabecalhoTituloItem.nomeParaLogo}
                          marca={item.marcaVeiculo}
                          size="lg"
                        />
                        <h1 className="min-w-0 flex-1 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                          {cabecalhoTituloItem.marcaLegivel ? (
                            <>
                              <span className="text-zinc-950">{cabecalhoTituloItem.marcaLegivel}</span>
                              {cabecalhoTituloItem.modeloStr ? (
                                <span className="font-bold"> {cabecalhoTituloItem.modeloStr}</span>
                              ) : null}
                            </>
                          ) : (
                            tituloCompletoBemLeilao({
                              marcaVeiculo: item.marcaVeiculo,
                              modelo: item.modelo,
                            })
                          )}
                        </h1>
                      </div>
                    ) : null}
                    <div className="mt-4 flex items-center gap-2 text-zinc-500">
                      <HugeiconsIcon icon={Location01Icon} size={20} />
                      <span>{item.cidade || "Online"}</span>
                    </div>
                  </div>

                  {liveUrl ? (
                    <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-lg font-bold tracking-tight text-zinc-900">Live do leilão</h3>
                        <a
                          href={liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-xl bg-nulance-purple px-4 py-2 text-sm font-semibold text-white transition hover:bg-nulance-purple/90"
                        >
                          Ver live
                        </a>
                      </div>
                      {youtubeEmbedUrl ? (
                        <div className="overflow-hidden rounded-2xl ring-1 ring-zinc-200">
                          <iframe
                            title="Live do leilão"
                            src={youtubeEmbedUrl}
                            className="aspect-video w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-600">
                          Este link de transmissão não suporta player embutido aqui. Clique em{" "}
                          <strong>Ver live</strong> para assistir.
                        </p>
                      )}
                    </div>
                  ) : null}

                  <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8">
                    <h3 className="mb-6 text-lg font-bold tracking-tight text-zinc-900">Detalhes do Veículo</h3>
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                      <DetailItem icon={Calendar03Icon} label="Ano" value={String(item.ano ?? "-")} />
                      <DetailItem icon={DashboardSpeed01Icon} label="KM" value={item.quilometragem != null ? `${item.quilometragem.toLocaleString("pt-BR")} km` : "-"} />
                      <DetailItem icon={Car01Icon} label="Câmbio" value={formatEnumDisplayLabel(item.cambio)} />
                      <DetailItem icon={AuctionIcon} label="Combustível" value={formatEnumDisplayLabel(item.combustivel)} />
                      <DetailItem icon={AuctionIcon} label="Condição" value={formatEnumDisplayLabel(item.condicao)} />
                      <DetailItem icon={AuctionIcon} label="Cor" value={normalizeColor(item.cor)} />
                      <DetailItem icon={Clock01Icon} label="Encerramento" value={formatDate(item.encerramentoDisputa)} />
                    </div>

                    <div className="mt-8 border-t border-zinc-100 pt-6">
                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">Descrição Completa</h4>
                      <p className="leading-relaxed text-zinc-700">{item.descricao || "Sem descrição informada."}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-zinc-900">Histórico de Lances</h3>
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                        {item.historicoLances?.length ?? 0} lances
                      </span>
                    </div>
                    {(item.historicoLances?.length ?? 0) === 0 ? (
                      <p className="text-sm text-zinc-500">Ainda não há lances registrados.</p>
                    ) : (
                      <div className="max-h-[min(400px,55vh)] overflow-y-auto overflow-x-hidden py-1 pl-0.5 pr-3 [scrollbar-gutter:stable] custom-scrollbar">
                        <div className="space-y-3">
                          {(item.historicoLances ?? []).map((lance, idx) => (
                            <div
                              key={lance.lanceId || `${lance.dataHora}-${idx}`}
                              className={cn(
                                "flex min-w-0 items-center justify-between gap-3 rounded-2xl p-4",
                                idx === 0
                                  ? "border border-emerald-200 bg-emerald-50"
                                  : "border border-transparent bg-zinc-50"
                              )}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-zinc-900">
                                  {lance.usuarioNome || "Usuário"}
                                </p>
                                <p className="text-xs text-zinc-500">{formatDate(lance.dataHora)}</p>
                              </div>
                              <p
                                className={cn(
                                  "shrink-0 whitespace-nowrap text-right text-sm font-bold tabular-nums sm:text-base",
                                  idx === 0 ? "text-emerald-700" : "text-zinc-800"
                                )}
                              >
                                {formatMoney(lance.valor)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-24 rounded-3xl bg-white p-5 ring-1 ring-zinc-200 sm:p-6 lg:p-7">
                    <div className="mb-6 flex items-center gap-3 border-b border-zinc-100 pb-5">
                      <Avatar src="" alt={item.leiloeiroNome || "Leiloeiro"} className="h-12 w-12" />
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900">{item.leiloeiroNome || "Leiloeiro"}</h4>
                        <p className="text-xs text-zinc-500">{item.comitenteNome || "Comitente"}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(status === "ABERTO" || status === "EM_BREVE") && Number.isFinite(countdownTargetMs) && (
                        <div className="rounded-2xl bg-amber-50/80 p-3 ring-1 ring-amber-200/50">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
                            {countdownLabel}
                          </span>
                          <div className="mt-1 flex items-center justify-between px-2 text-zinc-900">
                            <div className="flex flex-col items-center">
                              <span className="font-mono text-xl font-bold tracking-tight">{String(countdown.days).padStart(2, "0")}</span>
                              <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-700">Dias</span>
                            </div>
                            <span className="text-lg font-bold text-amber-200/80">:</span>
                            <div className="flex flex-col items-center">
                              <span className="font-mono text-xl font-bold tracking-tight">{String(countdown.hours).padStart(2, "0")}</span>
                              <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-700">Horas</span>
                            </div>
                            <span className="text-lg font-bold text-amber-200/80">:</span>
                            <div className="flex flex-col items-center">
                              <span className="font-mono text-xl font-bold tracking-tight">{String(countdown.minutes).padStart(2, "0")}</span>
                              <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-700">Min</span>
                            </div>
                            <span className="text-lg font-bold text-amber-200/80">:</span>
                            <div className="flex flex-col items-center">
                              <span className="font-mono text-xl font-bold tracking-tight">{String(countdown.seconds).padStart(2, "0")}</span>
                              <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-700">Seg</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between px-1">
                        <span className="text-[13px] font-medium text-zinc-500">Lance Inicial</span>
                        <span className="text-[13px] font-semibold text-zinc-900">{formatMoney(item.valorInicial)}</span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Lance Atual</span>
                        <p className="mt-0.5 text-[32px] leading-none font-bold tracking-tight text-zinc-900">
                          {formatMoney(item.lanceAtual ?? item.valorInicial)}
                        </p>
                      </div>

                      <div className="space-y-2 border-t border-zinc-100 pt-1">
                        <InfoRow icon={Calendar03Icon} label={`Abertura: ${formatDate(item.aberturaDisputa)}`} />
                        <InfoRow icon={Clock01Icon} label={`Encerramento: ${formatDate(item.encerramentoDisputa)}`} />
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {!isAuthenticated ? (
                        <>
                          <p className="text-sm text-zinc-600">
                            Faça login para poder enviar lances neste item.
                          </p>
                          <Button
                            type="button"
                            size="lg"
                            className="h-12 w-full rounded-xl bg-nulance-purple font-bold hover:bg-nulance-purple/90"
                            onClick={handleGoToLogin}
                            disabled={authStatus !== "ready"}
                          >
                            Fazer login
                          </Button>
                        </>
                      ) : !kycAprovado ? (
                        <p className="text-sm text-zinc-600">
                          Para dar lance, sua documentação precisa estar totalmente aprovada.
                        </p>
                      ) : !podeDarLance ? (
                        <p className="text-sm text-zinc-600">
                          {status === "EM_BREVE"
                            ? "A disputa ainda não está aberta. Quando o item estiver aberto para lances, você poderá enviar o seu aqui."
                            : item.statusItem === "ABERTO" &&
                                Number.isFinite(encerramentoMs) &&
                                nowMs >= encerramentoMs
                              ? "O prazo desta disputa encerrou. Não é mais possível enviar lances."
                              : "Este item não está mais recebendo lances."}
                        </p>
                      ) : (
                        <>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-semibold text-zinc-900">Escolha o incremento</span>
                            <span className="text-[11px] text-zinc-500">Mín: {formatMoney(item.incrementoMinimo)}</span>
                          </div>

                          <Button
                            type="button"
                            size="lg"
                            disabled={selectedIncrement === null || submittingBid}
                            className="h-12 w-full rounded-xl bg-nulance-purple font-bold hover:bg-nulance-purple/90 disabled:opacity-50"
                            onClick={handleConfirmBid}
                          >
                            {submittingBid ? "Enviando..." : "Confirmar Lance"}
                          </Button>

                          <div className="grid grid-cols-2 gap-2.5">
                            {increments.map((inc) => (
                              <Button
                                key={inc}
                                type="button"
                                variant="outline"
                                className={cn(
                                  "h-10 rounded-xl border-zinc-200 text-[13px] font-semibold",
                                  selectedIncrement === inc
                                    ? "border-nulance-purple bg-nulance-purple/10 text-nulance-purple ring-1 ring-nulance-purple/30"
                                    : "text-zinc-700 hover:border-nulance-purple hover:bg-nulance-purple/5 hover:text-nulance-purple"
                                )}
                                onClick={() => setSelectedIncrement((prev) => (prev === inc ? null : inc))}
                              >
                                + {formatMoney(inc)}
                              </Button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />

      {isGalleryOpen && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-[120] bg-black/85 p-4">
          <button
            type="button"
            aria-label="Fechar galeria"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25"
            onClick={() => setIsGalleryOpen(false)}
          >
            Fechar
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Imagem anterior"
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 px-4 py-3 text-white hover:bg-white/25"
                onClick={() => setGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
              >
                {"<"}
              </button>
              <button
                type="button"
                aria-label="Próxima imagem"
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 px-4 py-3 text-white hover:bg-white/25"
                onClick={() => setGalleryIndex((prev) => (prev + 1) % galleryImages.length)}
              >
                {">"}
              </button>
            </>
          )}

          <div className="relative mx-auto h-full w-full max-w-6xl">
            <Image
              src={galleryImages[galleryIndex]}
              alt={`Imagem ${galleryIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-zinc-500">
        <HugeiconsIcon icon={icon} size={18} />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-zinc-600">
      <HugeiconsIcon icon={icon} size={16} className="text-zinc-400" />
      <span>{label}</span>
    </div>
  );
}
