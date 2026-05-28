"use client";

import * as React from "react";
import { PhotoIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

import { BemMarcaLogo } from "@/components/admin/bens/bem-marca-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LicensePlate } from "@/components/ui/license-plate";
import { Select, type SelectOption } from "@/components/ui/select";
import { SelectSearch } from "@/components/ui/select-search";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { CIDADES_BRASIL_OPTIONS } from "@/data/cidades-brasil";
import { BEM_MARCA_VEICULO_OPTIONS, marcaVeiculoLabel } from "@/lib/bem-marca-veiculo";
import { getApiErrorMessage } from "@/lib/api/error-body";
import { cn } from "@/lib/cn";
import {
  criarAnuncioVendedor,
  gerarUploadMidiaAnuncio,
} from "@/lib/repositories/seller-anuncios-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type {
  AnuncioDetalheTecnicoRequest,
  CategoriaAnuncioApi,
  CriarAnuncioRequest,
  TipoMidiaAnuncioApi,
} from "@/lib/repositories/types/seller-anuncio.types";

const CATEGORIA_OPTIONS: SelectOption[] = [
  { value: "VEICULOS", label: "🚗 Automóveis" },
  { value: "IMOVEIS", label: "🏠 Imóveis" },
  { value: "CELULARES_E_TELEFONIA", label: "📱 Celulares e telefonia" },
  { value: "CASA_DECORACAO_E_UTENSILIOS", label: "🏡 Casa, decoração e utensílios" },
  { value: "ESPORTES_E_FITNESS", label: "🏋️ Esportes e fitness" },
  { value: "SERVICOS", label: "🛠️ Serviços" },
  { value: "MODA_E_BELEZA", label: "💄 Moda e beleza" },
  { value: "ARTIGOS_INFANTIS", label: "🧸 Artigos infantis" },
  { value: "ANIMAIS_DE_ESTIMACAO", label: "🐾 Animais de estimação" },
  { value: "MUSICA_E_HOBBIES", label: "🎵 Música e hobbies" },
  { value: "AGRO_E_INDUSTRIA", label: "🌾 Agro e indústria" },
  { value: "VAGAS_DE_EMPREGO", label: "💼 Vagas de emprego" },
  { value: "COMERCIO", label: "🏪 Comércio" },
  { value: "GAMES", label: "🎮 Games" },
  { value: "TVS_E_VIDEO", label: "📺 TVs e vídeo" },
  { value: "AUDIO", label: "🎧 Áudio" },
  { value: "INFORMATICA", label: "💻 Informática" },
  { value: "ELETRO", label: "🔌 Eletro" },
  { value: "MOVEIS", label: "🪑 Móveis" },
  { value: "MATERIAIS_DE_CONSTRUCAO", label: "🧱 Materiais de construção" },
  { value: "ESCRITORIO_E_HOME_OFFICE", label: "🖇️ Escritório e home office" },
];

const TIPO_OPTIONS: SelectOption[] = [
  { value: "CARRO", label: "Carro" },
  { value: "MOTO", label: "Moto" },
  { value: "CAMINHAO", label: "Caminhão" },
  { value: "SUV", label: "SUV" },
  { value: "CAMINHONETE", label: "Caminhonete" },
  { value: "ONIBUS", label: "Ônibus" },
  { value: "OUTRO", label: "Outro" },
];

const CONDICAO_OPTIONS: SelectOption[] = [
  { value: "NOVO", label: "Novo" },
  { value: "USADO", label: "Usado" },
  { value: "SEMINOVO", label: "Seminovo" },
];

const COMBUSTIVEL_OPTIONS: SelectOption[] = [
  { value: "FLEX", label: "Flex" },
  { value: "DIESEL", label: "Diesel" },
  { value: "GASOLINA", label: "Gasolina" },
  { value: "ETANOL", label: "Etanol" },
  { value: "ELETRICO", label: "Elétrico" },
  { value: "HIBRIDO", label: "Híbrido" },
];

const CAMBIO_OPTIONS: SelectOption[] = [
  { value: "AUTOMATICO", label: "Automático" },
  { value: "MANUAL", label: "Manual" },
  { value: "CVT", label: "CVT" },
  { value: "AUTOMATIZADO", label: "Automatizado" },
];

function toMidiaTipo(file: File): TipoMidiaAnuncioApi {
  return file.type.startsWith("video/") ? "VIDEO" : "FOTO";
}

function parseApiError(error: unknown): string {
  if (error instanceof ApiError) return getApiErrorMessage(error.body) ?? error.message;
  if (error instanceof Error) return error.message;
  return "Não foi possível criar o anúncio.";
}

function currencyDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 12);
}

function formatCurrencyBRL(digits: string): string {
  if (!digits) return "";
  const n = Number(digits) / 100;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function normalizeAnoInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}/${digits.slice(4)}`;
}

function normalizeKmInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 7);
}

function formatKmDisplay(digits: string): string {
  const normalized = digits.replace(/\D/g, "");
  if (!normalized) return "";
  const n = Number(normalized);
  if (Number.isNaN(n)) return "";
  return n.toLocaleString("pt-BR");
}

function normalizePlacaInput(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 7);
}

function LabelObrigatoria({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <Label htmlFor={htmlFor}>
      {children} <span className="text-red-500">*</span>
    </Label>
  );
}

const EMPTY_DETALHE_TECNICO: AnuncioDetalheTecnicoRequest = {
  motorizacao: "",
  cilindros: "",
  potenciaCombinada: "",
  torqueCombinado: "",
  transmissao: "",
  tracao: "",
  modosConducao: "",
  carroceria: "",
  comprimentoLarguraAltura: "",
  entreEixos: "",
  portaMalas: "",
  tanqueCombustivel: "",
  ciclosUrbano: "",
  usoModoEletrico: "",
  emissoesSeloEficiencia: "",
  freiosDianteiros: "",
  suspensaoDianteira: "",
  suspensaoTraseira: "",
  medidaPneus: "",
  estepe: "",
  airbags: "",
  absDistribuicaoEletronica: "",
  controleEstabilidadeTracao: "",
  assistentePartidaRampa: "",
  cameraSensoresEstacionamento: "",
  arCondicionadoClimatizador: "",
  direcao: "",
  bancosVolante: "",
  multimidiaConectividade: "",
  rodasIluminacao: "",
  vidrosTravas: "",
  procedenciaNulances: "",
  licenciamentoDebitos: "",
  restricoesGravame: "",
  chavesManual: "",
  laudoCautelarInspecao: "",
};

const DETALHE_FIELDS: Array<{ key: keyof AnuncioDetalheTecnicoRequest; label: string; rows?: number }> = [
  { key: "motorizacao", label: "Motorização", rows: 2 },
  { key: "cilindros", label: "Cilindros" },
  { key: "potenciaCombinada", label: "Potência combinada" },
  { key: "torqueCombinado", label: "Torque combinado" },
  { key: "transmissao", label: "Transmissão" },
  { key: "tracao", label: "Tração" },
  { key: "modosConducao", label: "Modos de condução" },
  { key: "carroceria", label: "Carroceria" },
  { key: "comprimentoLarguraAltura", label: "Comprimento / largura / altura" },
  { key: "entreEixos", label: "Entre-eixos" },
  { key: "portaMalas", label: "Porta-malas" },
  { key: "tanqueCombustivel", label: "Tanque de combustível" },
  { key: "ciclosUrbano", label: "Ciclos urbano" },
  { key: "usoModoEletrico", label: "Uso em modo elétrico" },
  { key: "emissoesSeloEficiencia", label: "Emissões / selo de eficiência" },
  { key: "freiosDianteiros", label: "Freios dianteiros" },
  { key: "suspensaoDianteira", label: "Suspensão dianteira" },
  { key: "suspensaoTraseira", label: "Suspensão traseira" },
  { key: "medidaPneus", label: "Medida dos pneus" },
  { key: "estepe", label: "Estepe" },
  { key: "airbags", label: "Airbags" },
  { key: "absDistribuicaoEletronica", label: "ABS / distribuição eletrônica" },
  { key: "controleEstabilidadeTracao", label: "Controle de estabilidade e tração" },
  { key: "assistentePartidaRampa", label: "Assistente de partida em rampa" },
  { key: "cameraSensoresEstacionamento", label: "Câmera / sensores de estacionamento" },
  { key: "arCondicionadoClimatizador", label: "Ar-condicionado / climatizador" },
  { key: "direcao", label: "Direção" },
  { key: "bancosVolante", label: "Bancos / volante" },
  { key: "multimidiaConectividade", label: "Multimídia / conectividade" },
  { key: "rodasIluminacao", label: "Rodas / iluminação" },
  { key: "vidrosTravas", label: "Vidros / travas" },
  { key: "procedenciaNulances", label: "Procedência NuLances", rows: 2 },
  { key: "licenciamentoDebitos", label: "Licenciamento / débitos" },
  { key: "restricoesGravame", label: "Restrições / gravame" },
  { key: "chavesManual", label: "Chaves / manual" },
  { key: "laudoCautelarInspecao", label: "Laudo cautelar / inspeção", rows: 2 },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function SellerCriarAnuncioSheet({ open, onClose, onCreated }: Props) {
  const { toast } = useToast();

  const [categoria, setCategoria] = React.useState("");
  const [marca, setMarca] = React.useState("");
  const [modelo, setModelo] = React.useState("");
  const [precoDigits, setPrecoDigits] = React.useState("");
  const [cidade, setCidade] = React.useState("");
  const [tipo, setTipo] = React.useState("");
  const [condicao, setCondicao] = React.useState("");
  const [ano, setAno] = React.useState("");
  const [quilometragemDigits, setQuilometragemDigits] = React.useState("");
  const [combustivel, setCombustivel] = React.useState("");
  const [cambio, setCambio] = React.useState("");
  const [finalChassi, setFinalChassi] = React.useState("");
  const [cor, setCor] = React.useState("");
  const [blindado, setBlindado] = React.useState(false);
  const [placaVeiculo, setPlacaVeiculo] = React.useState("");
  const [descricao, setDescricao] = React.useState("");
  const [detalheTecnico, setDetalheTecnico] =
    React.useState<AnuncioDetalheTecnicoRequest>(EMPTY_DETALHE_TECNICO);
  const [midiaFiles, setMidiaFiles] = React.useState<File[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<string | null>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);

  const resetForm = React.useCallback(() => {
    setCategoria("");
    setMarca("");
    setModelo("");
    setPrecoDigits("");
    setCidade("");
    setTipo("");
    setCondicao("");
    setAno("");
    setQuilometragemDigits("");
    setCombustivel("");
    setCambio("");
    setFinalChassi("");
    setCor("");
    setBlindado(false);
    setPlacaVeiculo("");
    setDescricao("");
    setDetalheTecnico(EMPTY_DETALHE_TECNICO);
    setMidiaFiles([]);
    setUploadStatus(null);
    setLoading(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  }, []);

  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const isVeiculo = categoria === "VEICULOS";

  const marcaNomeExibicao = React.useMemo(() => {
    if (!isVeiculo) return modelo.trim();
    const label = marcaVeiculoLabel(marca.trim()) || "";
    const modeloLimpo = modelo.trim();
    const anoLimpo = ano.trim();
    return [label, modeloLimpo, anoLimpo].filter(Boolean).join(" ");
  }, [ano, isVeiculo, marca, modelo]);

  const canSubmit = React.useMemo(() => {
    const base =
      !!categoria &&
      modelo.trim().length > 0 &&
      !!precoDigits &&
      cidade.trim().length > 0 &&
      descricao.trim().length > 0 &&
      midiaFiles.length > 0;
    if (!base) return false;
    if (isVeiculo) return !!marca.trim();
    return true;
  }, [categoria, cidade, descricao, isVeiculo, marca, midiaFiles.length, modelo, precoDigits]);
  const midiaPreviewUrls = React.useMemo(
    () => midiaFiles.map((file) => URL.createObjectURL(file)),
    [midiaFiles]
  );
  React.useEffect(() => {
    return () => {
      for (const url of midiaPreviewUrls) URL.revokeObjectURL(url);
    };
  }, [midiaPreviewUrls]);

  const onPickFiles = (files: FileList | null, kind: "image" | "video") => {
    if (!files?.length) return;
    const accepted = Array.from(files).filter((f) =>
      kind === "image"
        ? f.type.startsWith("image/")
        : f.type === "video/mp4" || f.type === "video/webm" || f.type.startsWith("video/")
    );
    if (accepted.length === 0) {
      toast({
        type: "warning",
        title: "Formato inválido",
        description:
          kind === "image"
            ? "Envie imagens válidas (jpg/png/webp)."
            : "Envie vídeos válidos (mp4/webm).",
      });
      return;
    }
    setMidiaFiles((prev) => [...prev, ...accepted]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const precoNumber = Number(precoDigits) / 100;
    if (!Number.isFinite(precoNumber) || precoNumber <= 0) {
      toast({ type: "warning", title: "Preço inválido", description: "Informe um preço maior que zero." });
      return;
    }

    setLoading(true);
    try {
      const midias: CriarAnuncioRequest["midias"] = [];

      for (const [index, file] of midiaFiles.entries()) {
        const tipoMidia = toMidiaTipo(file);
        setUploadStatus(`Enviando mídia ${index + 1} de ${midiaFiles.length}...`);

        const upload = await gerarUploadMidiaAnuncio({
          nomeArquivo: file.name,
          contentType: file.type || (tipoMidia === "VIDEO" ? "video/mp4" : "image/jpeg"),
          tipo: tipoMidia,
        });

        const putRes = await fetch(upload.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });

        if (!putRes.ok) throw new Error(`Falha no upload da mídia ${index + 1}.`);

        midias.push({
          tipo: tipoMidia,
          arquivo: upload.objectKey,
          ordem: index,
        });
      }

      setUploadStatus("Salvando anúncio...");
      const payload: CriarAnuncioRequest = {
        categoria: categoria as CategoriaAnuncioApi,
        modelo: modelo.trim(),
        preco: precoNumber,
        cidade: cidade.trim(),
        descricao: descricao.trim(),
        midias,
      };
      if (isVeiculo) {
        if (marca.trim()) payload.marca = marca.trim();
        payload.tipo = tipo as import("@/lib/repositories/types/seller-anuncio.types").TipoVeiculoAnuncioApi || undefined;
        payload.condicao = condicao as import("@/lib/repositories/types/seller-anuncio.types").CondicaoAnuncioVeiculoApi || undefined;
        if (ano.trim()) {
          const [fab] = ano.split("/");
          const anoNum = Number(fab?.trim());
          if (Number.isFinite(anoNum) && anoNum > 1900) payload.ano = anoNum;
        }
        if (quilometragemDigits) payload.quilometragem = Number(quilometragemDigits);
        payload.combustivel = combustivel as import("@/lib/repositories/types/seller-anuncio.types").CombustivelVeiculoApi || undefined;
        payload.cambio = cambio as import("@/lib/repositories/types/seller-anuncio.types").CambioVeiculoApi || undefined;
        if (finalChassi.trim()) payload.finalChassi = finalChassi.trim();
        if (cor.trim()) payload.cor = cor.trim();
        payload.blindado = blindado;
        if (placaVeiculo.trim()) payload.placaVeiculo = placaVeiculo.trim();
        payload.detalheTecnico = EMPTY_DETALHE_TECNICO;
      }
      await criarAnuncioVendedor(payload);

      toast({
        type: "success",
        title: "Anúncio enviado",
        description: "Seu anúncio foi criado e enviado para análise.",
      });

      resetForm();
      onCreated?.();
      onClose();
    } catch (error) {
      toast({
        type: "error",
        title: "Falha ao criar anúncio",
        description: parseApiError(error),
      });
    } finally {
      setLoading(false);
      setUploadStatus(null);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} side="right">
      <SheetContent className="max-w-[min(100vw-1rem,840px)] !w-full" onClose={onClose}>
        <SheetHeader>
          <SheetTitle>Criar anúncio</SheetTitle>
          <SheetDescription>
            {isVeiculo
              ? "Preencha os dados do veículo e envie as mídias para análise."
              : "Preencha os dados do item ou serviço e envie as mídias para análise."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 pb-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-start">
              <BemMarcaLogo nome={marcaNomeExibicao} marca={marca} className="sm:pt-1" />
              <div className="min-w-0 flex-1">
                <LabelObrigatoria htmlFor="sheet-categoria">Categoria</LabelObrigatoria>
                <Select
                  id="sheet-categoria"
                  value={categoria}
                  onValueChange={setCategoria}
                  options={CATEGORIA_OPTIONS}
                  placeholder="Selecione a categoria"
                  className="mt-1.5"
                />
              </div>
            </div>

            {isVeiculo ? (
              <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-start">
                <BemMarcaLogo nome={marcaNomeExibicao} marca={marca} className="sm:pt-1" />
                <div className="min-w-0 flex-1">
                  <LabelObrigatoria htmlFor="sheet-marca">Marca</LabelObrigatoria>
                  <SelectSearch
                    id="sheet-marca"
                    value={marca}
                    onValueChange={setMarca}
                    options={BEM_MARCA_VEICULO_OPTIONS}
                    placeholder="Selecione a marca"
                    searchPlaceholder="Buscar marca…"
                    emptyMessage="Nenhuma marca encontrada."
                    aria-label="Marca do veículo"
                    variant="flat"
                    className="mt-1.5"
                  />
                </div>
              </div>
            ) : null}

            <div>
              <LabelObrigatoria htmlFor="sheet-modelo">Modelo</LabelObrigatoria>
              <Input
                id="sheet-modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                className="mt-1.5"
                placeholder="Ex.: 911"
                required
              />
              <p className="mt-1 text-xs text-zinc-500">
                Nome do anúncio: <span className="font-medium text-zinc-700">{marcaNomeExibicao || "—"}</span>
              </p>
            </div>
            <div>
              <LabelObrigatoria htmlFor="sheet-preco">Preço</LabelObrigatoria>
              <Input
                id="sheet-preco"
                value={precoDigits ? formatCurrencyBRL(precoDigits) : ""}
                onChange={(e) => setPrecoDigits(currencyDigits(e.target.value))}
                inputMode="numeric"
                className="mt-1.5"
                placeholder="R$ 0,00"
                required
              />
            </div>
            <div>
              <LabelObrigatoria htmlFor="sheet-cidade">Cidade</LabelObrigatoria>
              <SelectSearch
                id="sheet-cidade"
                value={cidade}
                onValueChange={setCidade}
                options={CIDADES_BRASIL_OPTIONS}
                placeholder="Selecione a cidade"
                searchPlaceholder="Buscar cidade…"
                emptyMessage="Nenhuma cidade encontrada."
                aria-label="Cidade"
                variant="flat"
                className="mt-1.5"
              />
            </div>
            {isVeiculo ? (
              <>
                <div>
                  <Label htmlFor="sheet-ano">Ano</Label>
                  <Input
                    id="sheet-ano"
                    value={ano}
                    onChange={(e) => setAno(normalizeAnoInput(e.target.value))}
                    inputMode="numeric"
                    maxLength={9}
                    className="mt-1.5"
                    placeholder="Ex.: 2022/2023"
                  />
                </div>
                <div>
                  <Label htmlFor="sheet-tipo">Tipo</Label>
                  <Select
                    id="sheet-tipo"
                    value={tipo}
                    onValueChange={setTipo}
                    options={TIPO_OPTIONS}
                    placeholder="Selecione o tipo"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="sheet-condicao">Condição</Label>
                  <Select
                    id="sheet-condicao"
                    value={condicao}
                    onValueChange={setCondicao}
                    options={CONDICAO_OPTIONS}
                    placeholder="Selecione a condição"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="sheet-comb">Combustível</Label>
                  <Select
                    id="sheet-comb"
                    value={combustivel}
                    onValueChange={setCombustivel}
                    options={COMBUSTIVEL_OPTIONS}
                    placeholder="Selecione o combustível"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="sheet-cambio">Câmbio</Label>
                  <Select
                    id="sheet-cambio"
                    value={cambio}
                    onValueChange={setCambio}
                    options={CAMBIO_OPTIONS}
                    placeholder="Selecione o câmbio"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="sheet-km">Quilometragem</Label>
                  <Input
                    id="sheet-km"
                    value={formatKmDisplay(quilometragemDigits)}
                    onChange={(e) => setQuilometragemDigits(normalizeKmInput(e.target.value))}
                    inputMode="numeric"
                    className="mt-1.5"
                    placeholder="Ex.: 48.320"
                  />
                </div>
                <div>
                  <Label htmlFor="sheet-chassi">Final do chassi</Label>
                  <Input
                    id="sheet-chassi"
                    value={finalChassi}
                    onChange={(e) => setFinalChassi(e.target.value)}
                    className="mt-1.5"
                    placeholder="Ex.: 9283"
                  />
                </div>
                <div>
                  <Label htmlFor="sheet-cor">Cor</Label>
                  <Input
                    id="sheet-cor"
                    value={cor}
                    onChange={(e) => setCor(e.target.value)}
                    className="mt-1.5"
                    placeholder="Ex.: Branco"
                  />
                </div>
              </>
            ) : null}

            <div className="sm:col-span-2">
              <LabelObrigatoria htmlFor="sheet-descricao">Descrição</LabelObrigatoria>
              <textarea
                id="sheet-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                className={cn(
                  "mt-1.5 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nulance-purple)]/35"
                )}
                placeholder={isVeiculo ? "Descreva o veículo, estado geral e diferenciais." : "Descreva o item ou serviço, incluindo características, condição e diferenciais."}
                required
              />
            </div>

            {isVeiculo ? (
              <div className="sm:col-span-2">
                <p className="text-sm font-semibold text-zinc-900">Detalhe técnico</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Preencha os campos da ficha técnica enviados para a API.
                </p>
              </div>
            ) : null}

            {false && DETALHE_FIELDS.map((field) => (
              <div key={field.key} className={field.rows ? "sm:col-span-2" : undefined}>
                <Label htmlFor={`sheet-tech-${field.key}`}>{field.label}</Label>
                {field.rows ? (
                  <textarea
                    id={`sheet-tech-${field.key}`}
                    rows={field.rows}
                    value={detalheTecnico[field.key] ?? ""}
                    onChange={(e) =>
                      setDetalheTecnico((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className={cn(
                      "mt-1.5 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nulance-purple)]/35"
                    )}
                    placeholder={`Informe ${field.label.toLowerCase()}`}
                  />
                ) : (
                  <Input
                    id={`sheet-tech-${field.key}`}
                    value={detalheTecnico[field.key] ?? ""}
                    onChange={(e) =>
                      setDetalheTecnico((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="mt-1.5"
                    placeholder={`Informe ${field.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}

            {isVeiculo ? (
              <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" checked={blindado} onChange={(e) => setBlindado(e.target.checked)} className="h-4 w-4 rounded border-zinc-300" />
                Veículo blindado
              </label>
            ) : null}

            <div className="sm:col-span-2">
              <LabelObrigatoria htmlFor="sheet-midias-imagem">Mídias</LabelObrigatoria>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <input
                  ref={imageInputRef}
                  id="sheet-midias-imagem"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    onPickFiles(e.target.files, "image");
                    e.target.value = "";
                  }}
                />
                <input
                  ref={videoInputRef}
                  id="sheet-midias-video"
                  type="file"
                  accept="video/mp4,video/webm,video/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    onPickFiles(e.target.files, "video");
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <PhotoIcon className="h-4 w-4" aria-hidden />
                  Adicionar imagens
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <VideoCameraIcon className="h-4 w-4" aria-hidden />
                  Adicionar vídeos
                </Button>
              </div>
              {midiaFiles.length > 0 ? (
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {midiaFiles.map((file, idx) => (
                    <li
                      key={`${file.name}-${idx}`}
                      className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100"
                    >
                      {file.type.startsWith("video/") ? (
                        <video
                          src={midiaPreviewUrls[idx]}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                          controls
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- preview local com blob URL
                        <img
                          src={midiaPreviewUrls[idx]}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setMidiaFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-xs font-semibold text-white shadow-md transition hover:bg-black/70"
                        aria-label={`Remover mídia ${idx + 1}`}
                      >
                        ×
                      </button>
                      <span className="pointer-events-none absolute bottom-1 left-1 max-w-[calc(100%-0.5rem)] truncate rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {idx + 1}. {file.name}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          {uploadStatus ? (
            <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200">
              {uploadStatus}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" className="rounded-full" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-full" loading={loading} disabled={!canSubmit || loading}>
              Criar anúncio
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
