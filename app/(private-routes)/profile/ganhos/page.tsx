"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Award02Icon,
  Calendar01Icon,
  Mail01Icon,
  Tick02Icon,
  File01Icon,
  Location01Icon,
  Car01Icon,
  DashboardSpeed01Icon,
  BankIcon,
  Building03Icon,
  Calendar03Icon,
  Clock01Icon,
  Shield02Icon,
} from "@hugeicons/core-free-icons";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { LicensePlate } from "@/components/ui/license-plate";
import { formatEnumDisplayLabel } from "@/lib/format-enum-label";
import {
  marcaLeilaoItemLabel,
  marcaLeilaoItemLabelOuInferida,
  textoSemPrefixoMarca,
} from "@/lib/leilao-bem-exibicao";
import { listarMeusLeiloesGanhos } from "@/lib/repositories/ganhos-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type {
  ComitenteTipoApi,
  ContatoLoteResponse,
  DocumentoLoteResponse,
  LeilaoGanhoItemResponse,
} from "@/lib/repositories/types/ganhos.types";

type ComitenteTipo = "Banco" | "Seguradora" | "Empresa" | "Pessoa Física";

type LeilaoGanho = {
  id: string;
  titulo: string;
  lote: string;
  categoria: string;
  local: string;
  veiculo: string;
  ano: string;
  km: string;
  cambio: string;
  combustivel: string;
  dataAbertura: string;
  dataEncerramento: string;
  valor: string;
  status: "Pagamento Pendente" | "Finalizado";
  imagem: string;
  placa?: string;
  documentos: DocumentoLoteResponse[];
  contato?: ContatoLoteResponse | null;
  comitente?: {
    nome: string;
    tipo: ComitenteTipo;
  };
};

type InfoCardProps = {
  icon: any;
  label: string;
  value: string;
};

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center gap-2 text-zinc-500">
        <HugeiconsIcon icon={icon} size={16} />
        <span className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-2 font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function getStatusClasses(status: LeilaoGanho["status"]) {
  if (status === "Finalizado") {
    return "bg-emerald-100 text-emerald-800 ring-emerald-200";
  }

  return "bg-amber-100 text-amber-800 ring-amber-200";
}

function getComitenteIcon(tipo?: ComitenteTipo) {
  if (tipo === "Banco") return BankIcon;
  if (tipo === "Seguradora") return Shield02Icon;
  if (tipo === "Empresa") return Building03Icon;
  if (tipo === "Pessoa Física") return Building03Icon;
  return Building03Icon;
}

function formatCurrencyBRL(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDateTimeBr(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const data = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
  const hora = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${data} às ${hora}`;
}

function formatKm(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "-";
  return `${new Intl.NumberFormat("pt-BR").format(value)} km`;
}

function mapComitenteTipo(tipo?: ComitenteTipoApi | null): ComitenteTipo {
  const t = String(tipo ?? "").trim().toUpperCase();
  if (t === "BANCO") return "Banco";
  if (t === "SEGURADORA") return "Seguradora";
  if (t === "EMPRESA") return "Empresa";
  return "Pessoa Física";
}

function mapItemToView(item: LeilaoGanhoItemResponse): LeilaoGanho {
  const anoFab = item.anoFabricacao ?? null;
  const anoMod = item.anoModelo ?? null;
  const ano = anoFab && anoMod ? `${anoFab}/${anoMod}` : anoFab ? String(anoFab) : anoMod ? String(anoMod) : "-";
  const cidade = String(item.cidade ?? "").trim();
  const endereco = String(item.endereco ?? "").trim();
  const local = cidade || endereco || "-";
  const marcaCodigo = String(item.marcaVeiculo ?? "").trim();
  const modeloBruto = String(item.modelo ?? "").trim();
  const tituloBruto = String(item.titulo ?? "").trim();
  const nomeParaInferencia = modeloBruto || tituloBruto;
  const rotuloMarcaDoResponse = marcaCodigo ? marcaLeilaoItemLabel(marcaCodigo) : "";
  const marcaLegivel = marcaLeilaoItemLabelOuInferida(marcaCodigo, nomeParaInferencia || item.tituloLeilao);
  const baseModeloParaExibir = modeloBruto || tituloBruto;
  const modeloSemMarca = rotuloMarcaDoResponse
    ? textoSemPrefixoMarca(rotuloMarcaDoResponse, baseModeloParaExibir)
    : marcaLegivel
      ? textoSemPrefixoMarca(marcaLegivel, baseModeloParaExibir)
      : baseModeloParaExibir;
  const modeloExibir = modeloSemMarca || tituloBruto || modeloBruto;
  const veiculo =
    [marcaLegivel, modeloExibir].filter(Boolean).join(" ").trim() ||
    nomeParaInferencia ||
    item.tituloLeilao?.trim() ||
    "-";

  return {
    id: String(item.id),
    titulo: item.titulo?.trim() || item.tituloLeilao?.trim() || "Lote arrematado",
    lote: item.codigoLote ? `Lote ${item.codigoLote}` : "Lote",
    categoria: formatEnumDisplayLabel(item.tipoVeiculo),
    local,
    veiculo,
    ano,
    km: formatKm(item.quilometragem),
    cambio: formatEnumDisplayLabel(item.cambio),
    combustivel: formatEnumDisplayLabel(item.combustivel),
    dataAbertura: formatDateTimeBr(item.aberturaDisputa),
    dataEncerramento: formatDateTimeBr(item.encerramentoDisputa),
    valor: formatCurrencyBRL(item.valorArrematado),
    status: "Finalizado",
    placa: item.placaVeiculo || undefined,
    imagem: item.midiaCapaUrl || "/logo-nulance-leilao.png",
    documentos: Array.isArray(item.documentos) ? item.documentos : [],
    contato: item.contato ?? null,
    comitente: item.comitente?.nome
      ? {
          nome: item.comitente.nome,
          tipo: mapComitenteTipo(item.comitente.tipo),
        }
      : undefined,
  };
}

export default function LeiloesGanhosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [ganhos, setGanhos] = React.useState<LeilaoGanho[]>([]);

  const carregarGanhos = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listarMeusLeiloesGanhos(0, 50);
      const itens = Array.isArray(res.itens) ? res.itens : [];
      setGanhos(itens.map(mapItemToView));
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? String(err.message)
          : err instanceof Error
            ? err.message
            : "Não foi possível carregar seus leilões ganhos.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void carregarGanhos();
  }, [carregarGanhos]);

  return (
    <>
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto w-full max-w-375 px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              Leilões Ganhos
            </h1>

            <p className="mt-3 max-w-2xl text-base text-zinc-500">
              Veja todos os lotes arrematados, acompanhe pagamento, documentos e
              detalhes completos de cada item.
            </p>
          </div>

          {loading ? (
            <div className="space-y-5">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200">
                  <div className="h-6 w-1/3 animate-pulse rounded bg-zinc-200" />
                  <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-zinc-200" />
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="h-20 animate-pulse rounded-xl bg-zinc-100" />
                    <div className="h-20 animate-pulse rounded-xl bg-zinc-100" />
                    <div className="h-20 animate-pulse rounded-xl bg-zinc-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center ring-1 ring-red-100">
              <h3 className="text-lg font-bold text-red-900">Não foi possível carregar seus ganhos</h3>
              <p className="mt-2 text-sm text-red-800">{error}</p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <Button variant="outline" className="border-red-200 text-red-800" onClick={() => void carregarGanhos()}>
                  Tentar novamente
                </Button>
                <Button
                  className="bg-nulance-purple hover:bg-nulance-purple/90"
                  onClick={() => router.push("/")}
                >
                  Ir para início
                </Button>
              </div>
            </div>
          ) : ganhos.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center ring-1 ring-zinc-200">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                <HugeiconsIcon icon={Award02Icon} size={32} />
              </div>

              <h3 className="text-lg font-bold text-zinc-900">
                Nenhum leilão ganho ainda
              </h3>

              <p className="mt-2 max-w-md text-sm text-zinc-500">
                Participe dos nossos leilões para ter a chance de arrematar
                lotes incríveis.
              </p>

              <Button
                className="mt-6 bg-nulance-purple hover:bg-nulance-purple/90"
                onClick={() => router.push("/")}
              >
                Explorar Leilões
              </Button>
            </div>
          ) : (
            <Accordion className="space-y-5">
              {ganhos.map((g) => (
                <AccordionItem
                  key={g.id}
                  title={
                    <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:gap-5">
                      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200 md:h-24 md:w-36">
                        <Image
                          src={g.imagem}
                          alt={g.titulo}
                          fill
                          className="object-cover"
                          onError={() => {
                            toast({
                              type: "warning",
                              title: "Imagem indisponível",
                              description: "Uma imagem de capa não pôde ser carregada.",
                            });
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full bg-nulance-purple/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-nulance-purple">
                            {g.lote}
                          </span>

                          <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                            {g.categoria}
                          </span>

                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ring-1 md:hidden ${getStatusClasses(
                              g.status
                            )}`}
                          >
                            {g.status}
                          </span>
                        </div>

                        <h2 className="line-clamp-2 text-lg font-bold text-zinc-950 sm:text-2xl md:line-clamp-1">
                          {g.titulo}
                        </h2>

                        <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
                          {g.veiculo}
                        </p>

                        <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-500 md:flex-row md:flex-wrap md:items-center md:gap-x-5 md:gap-y-2">
                          <span className="inline-flex items-center gap-2">
                            <HugeiconsIcon icon={Location01Icon} size={16} />
                            {g.local}
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <HugeiconsIcon icon={Calendar01Icon} size={16} />
                            {g.ano}
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <HugeiconsIcon
                              icon={DashboardSpeed01Icon}
                              size={16}
                            />
                            {g.km}
                          </span>
                        </div>

                        <div className="mt-3 md:hidden">
                          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                            Valor arrematado
                          </p>
                          <p className="text-xl font-bold text-nulance-purple">
                            {g.valor}
                          </p>
                        </div>
                      </div>

                      <div className="hidden shrink-0 text-right md:block">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClasses(
                            g.status
                          )}`}
                        >
                          {g.status}
                        </span>

                        <div className="mt-3">
                          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                            Valor arrematado
                          </p>
                          <p className="text-2xl font-bold text-nulance-purple">
                            {g.valor}
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          <InfoCard
                            icon={Car01Icon}
                            label="Veículo"
                            value={g.veiculo}
                          />
                          <InfoCard
                            icon={Calendar03Icon}
                            label="Ano"
                            value={g.ano}
                          />
                          <InfoCard
                            icon={DashboardSpeed01Icon}
                            label="Quilometragem"
                            value={g.km}
                          />
                          <InfoCard
                            icon={Car01Icon}
                            label="Câmbio"
                            value={formatEnumDisplayLabel(g.cambio)}
                          />
                          <InfoCard
                            icon={File01Icon}
                            label="Combustível"
                            value={formatEnumDisplayLabel(g.combustivel)}
                          />
                          <InfoCard
                            icon={Location01Icon}
                            label="Local"
                            value={g.local}
                          />
                        </div>

                        <div className="rounded-2xl border border-zinc bg-white p-5">
                          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">
                            Informações do lote
                          </h3>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl p-4">
                              <div className="flex items-center gap-2 text-zinc-500">
                                <HugeiconsIcon
                                  icon={Calendar03Icon}
                                  size={16}
                                />
                                <span className="text-xs font-semibold uppercase tracking-wider">
                                  Abertura
                                </span>
                              </div>
                              <p className="mt-2 font-semibold text-zinc-900">
                                {g.dataAbertura}
                              </p>
                            </div>

                            <div className="rounded-xl p-4">
                              <div className="flex items-center gap-2 text-zinc-500">
                                <HugeiconsIcon icon={Clock01Icon} size={16} />
                                <span className="text-xs font-semibold uppercase tracking-wider">
                                  Encerramento
                                </span>
                              </div>
                              <p className="mt-2 font-semibold text-zinc-900">
                                {g.dataEncerramento}
                              </p>
                            </div>
                          </div>
                        </div>

                        {g.placa && (
                          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0 text-center sm:text-left">
                              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                Placa do veículo
                              </p>
                              <p className="mt-1 text-sm text-zinc-500">
                                Referência visual do lote arrematado.
                              </p>
                            </div>

                            <div className="flex w-full justify-center sm:w-auto sm:justify-end">
                              <LicensePlate plate={g.placa} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                            Valor arrematado
                          </p>
                          <p className="mt-2 text-3xl font-bold tracking-tight text-nulance-purple">
                            {g.valor}
                          </p>

                          <div className="mt-4">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClasses(
                                g.status
                              )}`}
                            >
                              {g.status}
                            </span>
                          </div>
                        </div>

                        {g.comitente ? (
                          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                                <HugeiconsIcon
                                  icon={getComitenteIcon(g.comitente.tipo)}
                                  size={20}
                                />
                              </div>

                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                  Comitente
                                </p>
                                <p className="font-semibold text-zinc-900">
                                  {g.comitente.nome}
                                </p>
                                <p className="text-sm text-zinc-500">
                                  {g.comitente.tipo}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                            Ações do lote
                          </p>

                          <div className="flex flex-col gap-3">
                            <Button
                              variant="outline"
                              className="h-11 justify-start gap-2 border-zinc-200 text-zinc-700"
                              disabled={g.documentos.length === 0}
                              onClick={() => {
                                const primeiro = g.documentos.find((d) => d.disponivel && d.url)?.url;
                                if (!primeiro) {
                                  toast({
                                    type: "info",
                                    title: "Sem documentos",
                                    description: "Ainda não há documentos disponíveis para este lote.",
                                  });
                                  return;
                                }
                                window.open(primeiro, "_blank", "noopener,noreferrer");
                              }}
                            >
                              <HugeiconsIcon icon={File01Icon} size={18} />
                              Ver documentos
                            </Button>

                            <div className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-100 px-4 font-semibold text-emerald-800">
                              <HugeiconsIcon icon={Tick02Icon} size={18} />
                              Arrematação concluída
                            </div>

                            <Button
                              variant="outline"
                              className="h-11 justify-start gap-2 border-zinc-200 text-zinc-700"
                              onClick={() => {
                                const email = g.contato?.email?.trim();
                                const telefone = g.contato?.telefone?.trim();
                                if (email) {
                                  window.location.href = `mailto:${email}`;
                                  return;
                                }
                                if (telefone) {
                                  window.location.href = `tel:${telefone}`;
                                  return;
                                }
                                toast({
                                  type: "info",
                                  title: "Contato indisponível",
                                  description: "Este lote não possui um canal de contato no momento.",
                                });
                              }}
                            >
                              <HugeiconsIcon icon={Mail01Icon} size={18} />
                              Entrar em contato
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}