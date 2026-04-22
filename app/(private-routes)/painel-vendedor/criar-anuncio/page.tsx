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
  CombustivelVeiculoApi,
  CondicaoAnuncioVeiculoApi,
  CriarAnuncioRequest,
  TipoMidiaAnuncioApi,
  TipoVeiculoAnuncioApi,
} from "@/lib/repositories/types/seller-anuncio.types";

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
  { value: "PEQUENA_MONTA", label: "Pequena monta" },
  { value: "MEDIA_MONTA", label: "Média monta" },
  { value: "GRANDE_MONTA", label: "Grande monta" },
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
        if (statusAssinatura === "ATIVA" && disponiveis > 0) return;
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

  const canSubmit = React.useMemo(
    () =>
      marca.trim() &&
      modelo.trim() &&
      preco.trim() &&
      cidade.trim() &&
      tipo &&
      condicao &&
      ano.trim() &&
      combustivel &&
      cambio &&
      descricao.trim() &&
      midiaFiles.length > 0,
    [ano, cambio, cidade, combustivel, condicao, descricao, marca, midiaFiles.length, modelo, preco, tipo]
  );

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
    if (!canSubmit) {
      toast({
        type: "warning",
        title: "Preencha os campos obrigatórios",
        description: "Inclua também ao menos uma mídia para o anúncio.",
      });
      return;
    }

    const precoNumber = Number(preco.replace(",", "."));
    const anoNumber = Number(ano);
    const quilometragemNumber = quilometragem.trim() ? Number(quilometragem) : undefined;
    if (!Number.isFinite(precoNumber) || precoNumber <= 0) {
      toast({ type: "warning", title: "Preço inválido", description: "Informe um preço maior que zero." });
      return;
    }
    if (!Number.isFinite(anoNumber) || anoNumber <= 1900) {
      toast({ type: "warning", title: "Ano inválido", description: "Informe um ano válido." });
      return;
    }
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
      await criarAnuncioVendedor({
        marca: marca.trim(),
        modelo: modelo.trim(),
        preco: precoNumber,
        cidade: cidade.trim(),
        tipo: tipo as TipoVeiculoAnuncioApi,
        condicao: condicao as CondicaoAnuncioVeiculoApi,
        ano: anoNumber,
        quilometragem: quilometragemNumber,
        combustivel: combustivel as CombustivelVeiculoApi,
        cambio: cambio as CambioVeiculoApi,
        finalChassi: finalChassi.trim() || undefined,
        cor: cor.trim() || undefined,
        blindado,
        placaVeiculo: placaVeiculo.trim() || undefined,
        descricao: descricao.trim(),
        detalheTecnico: EMPTY_DETALHE_TECNICO,
        midias,
      });

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
        subtitle="Preencha os dados do veículo, envie as mídias e publique para análise."
      />

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div>
            <Label htmlFor="modelo">Modelo</Label>
            <Input
              id="modelo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Ex.: Civic Touring"
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
              required
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
            <Label htmlFor="condicao">Condição</Label>
            <Select
              id="condicao"
              value={condicao}
              onValueChange={setCondicao}
              options={CONDICAO_OPTIONS}
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
              placeholder="Descreva o veículo, estado geral e diferenciais."
              required
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
