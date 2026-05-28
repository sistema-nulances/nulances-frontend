"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select, type SelectOption } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { BEM_MARCA_VEICULO_OPTIONS } from "@/lib/bem-marca-veiculo";
import { getApiErrorMessage } from "@/lib/api/error-body";
import { cn } from "@/lib/cn";
import {
  criarAnuncioVendedor,
  gerarUploadMidiaAnuncio,
} from "@/lib/repositories/seller-anuncios-repository";
import { buscarPainelPlanosVendedor } from "@/lib/repositories/vendedor-planos-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type {
  AnuncioDetalheTecnicoRequest,
  CambioVeiculoApi,
  CategoriaAnuncioApi,
  CombustivelVeiculoApi,
  CondicaoAnuncioVeiculoApi,
  CriarAnuncioRequest,
  TipoMidiaAnuncioApi,
  TipoVeiculoAnuncioApi,
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

export default function SellerCriarAnuncioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, status } = useAuth();
  const warnedNoPlanRef = React.useRef(false);

  const [categoria, setCategoria] = React.useState<CategoriaAnuncioApi | "">("");
  const [marca, setMarca] = React.useState("");
  const [modelo, setModelo] = React.useState("");
  const [preco, setPreco] = React.useState("");
  const [cidade, setCidade] = React.useState("");
  const [tipo, setTipo] = React.useState("");
  const [condicao, setCondicao] = React.useState("");
  const [ano, setAno] = React.useState("");
  const [quilometragem, setQuilometragem] = React.useState("");
  const [combustivel, setCombustivel] = React.useState("");
  const [cambio, setCambio] = React.useState("");
  const [finalChassi, setFinalChassi] = React.useState("");
  const [cor, setCor] = React.useState("");
  const [blindado, setBlindado] = React.useState(false);
  const [placaVeiculo, setPlacaVeiculo] = React.useState("");
  const [descricao, setDescricao] = React.useState("");
  const [midiaFiles, setMidiaFiles] = React.useState<File[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<string | null>(null);

  const isVeiculo = categoria === "VEICULOS";

  React.useEffect(() => {
    if (status !== "ready") return;
    if (!user?.id?.trim()) return;
    let cancelled = false;
    void (async () => {
      try {
        const painel = await buscarPainelPlanosVendedor();
        if (cancelled) return;
        const statusAssinatura = String(painel.assinaturaAtual?.status ?? "").toUpperCase();
        const disponiveis = Number(painel.assinaturaAtual?.anunciosDisponiveis ?? 0);
        const ilimitado = Boolean(painel.assinaturaAtual?.plano?.ilimitado);
        if (statusAssinatura === "ATIVA" && (ilimitado || disponiveis > 0)) return;
      } catch {
        if (cancelled) return;
      }
      if (!warnedNoPlanRef.current) {
        warnedNoPlanRef.current = true;
        toast({
          type: "warning",
          title: "Plano necessário",
          description: "Escolha um plano antes de criar anúncios.",
        });
      }
      router.replace("/painel-vendedor/planos");
    })();
    return () => {
      cancelled = true;
    };
  }, [router, status, toast, user?.id]);

  const canSubmit = React.useMemo(() => {
    const baseOk =
      categoria &&
      modelo.trim() &&
      preco.trim() &&
      cidade.trim() &&
      descricao.trim() &&
      midiaFiles.length > 0;

    if (!baseOk) return false;

    if (isVeiculo) {
      return Boolean(marca && tipo && condicao && ano.trim() && combustivel && cambio);
    }

    return true;
  }, [
    ano,
    cambio,
    categoria,
    cidade,
    combustivel,
    condicao,
    descricao,
    isVeiculo,
    marca,
    midiaFiles.length,
    modelo,
    preco,
    tipo,
  ]);

  const onPickFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const accepted = Array.from(files).filter(
      (f) => f.type.startsWith("image/") || f.type === "video/mp4" || f.type === "video/webm"
    );
    if (accepted.length === 0) {
      toast({
        type: "warning",
        title: "Formato inválido",
        description: "Envie imagens (jpg/png/webp) ou vídeos (mp4/webm).",
      });
      return;
    }
    setMidiaFiles((prev) => [...prev, ...accepted]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !categoria) {
      toast({
        type: "warning",
        title: "Preencha os campos obrigatórios",
        description: "Inclua também ao menos uma mídia para o anúncio.",
      });
      return;
    }

    const precoNumber = Number(preco.replace(",", "."));
    if (!Number.isFinite(precoNumber) || precoNumber <= 0) {
      toast({ type: "warning", title: "Preço inválido", description: "Informe um preço maior que zero." });
      return;
    }

    let anoNumber: number | undefined;
    if (isVeiculo) {
      anoNumber = Number(ano);
      if (!Number.isFinite(anoNumber) || anoNumber <= 1900) {
        toast({ type: "warning", title: "Ano inválido", description: "Informe um ano válido." });
        return;
      }
    }

    const quilometragemNumber = isVeiculo && quilometragem.trim() ? Number(quilometragem) : undefined;
    if (quilometragemNumber !== undefined && (!Number.isFinite(quilometragemNumber) || quilometragemNumber < 0)) {
      toast({ type: "warning", title: "Quilometragem inválida", description: "Informe um valor válido." });
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
        if (!putRes.ok) {
          throw new Error(`Falha no upload da mídia ${index + 1}.`);
        }

        midias.push({
          tipo: tipoMidia,
          arquivo: upload.objectKey,
          ordem: index,
        });
      }

      setUploadStatus("Salvando anúncio...");
      const payload: CriarAnuncioRequest = {
        categoria,
        modelo: modelo.trim(),
        preco: precoNumber,
        cidade: cidade.trim(),
        descricao: descricao.trim(),
        condicao: (condicao as CondicaoAnuncioVeiculoApi) || undefined,
        midias,
      };

      if (isVeiculo) {
        if (marca) payload.marca = marca.trim();
        payload.tipo = tipo as TipoVeiculoAnuncioApi;
        payload.ano = anoNumber;
        payload.quilometragem = quilometragemNumber;
        payload.combustivel = combustivel as CombustivelVeiculoApi;
        payload.cambio = cambio as CambioVeiculoApi;
        payload.finalChassi = finalChassi.trim() || undefined;
        payload.cor = cor.trim() || undefined;
        payload.blindado = blindado;
        payload.placaVeiculo = placaVeiculo.trim() || undefined;
        payload.detalheTecnico = EMPTY_DETALHE_TECNICO;
      }

      await criarAnuncioVendedor(payload);

      toast({
        type: "success",
        title: "Anúncio enviado",
        description: "Seu anúncio foi criado e enviado para análise.",
      });
      router.push("/painel-vendedor/meus-anuncios");
      router.refresh();
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
    <div>
      <PageHeader
        title="Criar Anúncio"
        subtitle="Escolha a categoria, preencha os dados do anúncio, envie as mídias e publique para análise."
      />

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="categoria">Categoria do anúncio</Label>
            <Select
              id="categoria"
              value={categoria}
              onValueChange={(v) => setCategoria(v as CategoriaAnuncioApi)}
              options={CATEGORIA_OPTIONS}
              placeholder="Selecione a categoria"
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-zinc-500">
              {isVeiculo
                ? "Categoria veicular: preencha marca, modelo, ano e demais dados técnicos."
                : categoria
                ? "Preencha título, preço, localização e uma descrição com detalhes do item/serviço."
                : "Selecione uma categoria para continuar."}
            </p>
          </div>

          {isVeiculo ? (
            <div className="sm:col-span-2">
              <Label htmlFor="marca">Marca do veículo</Label>
              <Select
                id="marca"
                value={marca}
                onValueChange={setMarca}
                options={BEM_MARCA_VEICULO_OPTIONS}
                placeholder="Selecione"
                className="mt-1.5"
              />
            </div>
          ) : null}

          <div>
            <Label htmlFor="modelo">{isVeiculo ? "Modelo" : "Título do anúncio"}</Label>
            <Input
              id="modelo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder={isVeiculo ? "Ex.: Civic Touring" : "Ex.: iPhone 15 Pro 256GB"}
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="preco">Preço</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              min="0.01"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="Ex.: 89990.00"
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex.: São Paulo"
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="condicao">Condição</Label>
            <Select
              id="condicao"
              value={condicao}
              onValueChange={setCondicao}
              options={CONDICAO_OPTIONS}
              placeholder="Selecione a condição"
              className="mt-1.5"
            />
          </div>

          {isVeiculo ? (
            <>
              <div>
                <Label htmlFor="ano">Ano</Label>
                <Input
                  id="ano"
                  type="number"
                  min="1900"
                  max="2100"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  placeholder="Ex.: 2022"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  id="tipo"
                  value={tipo}
                  onValueChange={setTipo}
                  options={TIPO_OPTIONS}
                  placeholder="Selecione"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="combustivel">Combustível</Label>
                <Select
                  id="combustivel"
                  value={combustivel}
                  onValueChange={setCombustivel}
                  options={COMBUSTIVEL_OPTIONS}
                  placeholder="Selecione"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="cambio">Câmbio</Label>
                <Select
                  id="cambio"
                  value={cambio}
                  onValueChange={setCambio}
                  options={CAMBIO_OPTIONS}
                  placeholder="Selecione"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="quilometragem">Quilometragem (opcional)</Label>
                <Input
                  id="quilometragem"
                  type="number"
                  min="0"
                  value={quilometragem}
                  onChange={(e) => setQuilometragem(e.target.value)}
                  placeholder="Ex.: 45000"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="placa">Placa (opcional)</Label>
                <Input
                  id="placa"
                  value={placaVeiculo}
                  onChange={(e) => setPlacaVeiculo(e.target.value)}
                  placeholder="Ex.: ABC1D23"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="chassi">Final do chassi (opcional)</Label>
                <Input
                  id="chassi"
                  value={finalChassi}
                  onChange={(e) => setFinalChassi(e.target.value)}
                  placeholder="Ex.: 1234"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="cor">Cor (opcional)</Label>
                <Input
                  id="cor"
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  placeholder="Ex.: Branco"
                  className="mt-1.5"
                />
              </div>

              <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={blindado}
                  onChange={(e) => setBlindado(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                Veículo blindado
              </label>
            </>
          ) : null}

          <div className="sm:col-span-2">
            <Label htmlFor="descricao">Descrição</Label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className={cn(
                "mt-1.5 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nulance-purple)]/35"
              )}
              placeholder={
                isVeiculo
                  ? "Descreva o veículo, estado geral e diferenciais."
                  : "Descreva o item ou serviço, incluindo características, condição e diferenciais."
              }
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="midias">Mídias (imagens e vídeos)</Label>
            <input
              id="midias"
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              multiple
              onChange={(e) => {
                onPickFiles(e.target.files);
                e.target.value = "";
              }}
              className="mt-1.5 block w-full text-sm text-zinc-700 file:mr-3 file:rounded-full file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-800 hover:file:bg-zinc-200"
            />
            <p className="mt-1 text-xs text-zinc-500">Obrigatório enviar ao menos uma mídia.</p>
            {midiaFiles.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                {midiaFiles.map((file, idx) => (
                  <li key={`${file.name}-${idx}`} className="flex items-center justify-between gap-3">
                    <span className="truncate">
                      {idx + 1}. {file.name}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="rounded-full"
                      onClick={() => setMidiaFiles((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      Remover
                    </Button>
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
          <Button
            type="button"
            variant="secondary"
            className="rounded-full"
            onClick={() => router.push("/painel-vendedor/meus-anuncios")}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" className="rounded-full" loading={loading} disabled={!canSubmit || loading}>
            Criar anúncio
          </Button>
        </div>
      </form>
    </div>
  );
}
