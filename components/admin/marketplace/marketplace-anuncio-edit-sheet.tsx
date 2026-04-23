"use client";

import * as React from "react";

import {
  BemMidiaPicker,
  normalizeAnoInput,
  normalizeChassiFinalInput,
  normalizeCorInput,
  normalizeKmInput,
  normalizePlacaInput,
  type MidiaDraftItem,
} from "@/components/admin/bens/bem-admin-sheet";
import { BemMarcaLogo } from "@/components/admin/bens/bem-marca-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LicensePlate } from "@/components/ui/license-plate";
import { Select, type SelectOption } from "@/components/ui/select";
import { SelectSearch } from "@/components/ui/select-search";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BEM_MARCA_OPTIONS, inferMarcaModelo } from "@/data/bem-marcas";
import {
  BEM_CAMBIOS,
  BEM_COMBUSTIVEIS,
  BEM_CONDICOES,
  BEM_TIPOS_VEICULO,
} from "@/data/bem-veiculo-options";
import type { MarketplaceItem } from "@/data/marketplace-items";
import { VendedorAdminLink } from "@/components/admin/marketplace/vendedor-admin-link";
import { cn } from "@/lib/cn";
import { formatCurrencyBRL } from "@/lib/formatters";
import {
  defaultMarketplaceAnuncioTechDetails,
  type MarketplaceAnuncioAdmin,
  type MarketplaceAnuncioTechDetails,
} from "@/lib/marketplace-anuncios-admin";

const opt = (values: readonly string[]): SelectOption[] =>
  values.map((v) => ({ value: v, label: v }));

const OPT_TIPO: SelectOption[] = [{ value: "", label: "Selecione o tipo" }, ...opt(BEM_TIPOS_VEICULO)];
const OPT_COND: SelectOption[] = [{ value: "", label: "Selecione a condição" }, ...opt(BEM_CONDICOES)];
const OPT_COMB: SelectOption[] = [{ value: "", label: "Selecione" }, ...opt(BEM_COMBUSTIVEIS)];
const OPT_CAMB: SelectOption[] = [{ value: "", label: "Selecione" }, ...opt(BEM_CAMBIOS)];
const OPT_MARCA: SelectOption[] = [{ value: "", label: "Selecione a marca" }, ...BEM_MARCA_OPTIONS];

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function deriveModelo(anuncio: MarketplaceAnuncioAdmin): string {
  const inf = inferMarcaModelo(anuncio.titulo);
  const m = (anuncio.marca ?? inf.marca).trim();
  if (!m) return anuncio.titulo.trim();
  const stripped = anuncio.titulo.replace(new RegExp(`^${escapeRegExp(m)}\\s*`, "i"), "").trim();
  return stripped || anuncio.modelo || inf.modelo || anuncio.titulo.trim();
}

function midiaFromAnuncio(a: MarketplaceAnuncioAdmin): MidiaDraftItem[] {
  const imgs = (a.fotos ?? []).map((url, i) => ({
    id: `persist-f-${i}-${url.slice(-24)}`,
    url,
    kind: "image" as const,
  }));
  const vids = (a.videoUrls ?? []).map((url, i) => ({
    id: `persist-v-${i}-${url.slice(-24)}`,
    url,
    kind: "video" as const,
  }));
  return [...imgs, ...vids];
}

function kmDigitsFromDisplay(km: string): string {
  return km.replace(/\D/g, "").slice(0, 7);
}

function formatKmDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (!d) return "—";
  const n = Number(d);
  if (Number.isNaN(n)) return "—";
  return `${n.toLocaleString("pt-BR")} km`;
}

function currencyDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 12);
}

type Props = {
  open: boolean;
  anuncio: MarketplaceAnuncioAdmin | null;
  onClose: () => void;
  onSave: (
    next: MarketplaceAnuncioAdmin,
    meta: { novasMidias: Array<{ file: File; kind: "image" | "video" }> }
  ) => void | Promise<boolean | void>;
};

export function MarketplaceAnuncioEditSheet({ open, anuncio, onClose, onSave }: Props) {
  const [marca, setMarca] = React.useState("");
  const [modelo, setModelo] = React.useState("");
  const [precoDigits, setPrecoDigits] = React.useState("");
  const [local, setLocal] = React.useState("");
  const [tipoVeiculo, setTipoVeiculo] = React.useState("");
  const [condicao, setCondicao] = React.useState("");
  const [ano, setAno] = React.useState("");
  const [quilometragem, setQuilometragem] = React.useState("");
  const [combustivel, setCombustivel] = React.useState("");
  const [cambio, setCambio] = React.useState("");
  const [placa, setPlaca] = React.useState("");
  const [blindado, setBlindado] = React.useState(false);
  const [chassiFinal, setChassiFinal] = React.useState("");
  const [cor, setCor] = React.useState("");
  const [descricao, setDescricao] = React.useState("");
  const [techDetails, setTechDetails] = React.useState<MarketplaceAnuncioTechDetails>(
    defaultMarketplaceAnuncioTechDetails()
  );
  const [midiaDraft, setMidiaDraft] = React.useState<MidiaDraftItem[]>([]);

  const revokeBlobDrafts = React.useCallback((items: MidiaDraftItem[]) => {
    for (const m of items) {
      if (m.url.startsWith("blob:")) URL.revokeObjectURL(m.url);
    }
  }, []);

  React.useEffect(() => {
    if (!open || !anuncio) return;
    setMarca((anuncio.marca || inferMarcaModelo(anuncio.titulo).marca).trim());
    setModelo(deriveModelo(anuncio));
    setPrecoDigits(currencyDigits(anuncio.preco ?? ""));
    setLocal(anuncio.local);
    setTipoVeiculo(anuncio.tipoVeiculo ?? "");
    setCondicao(anuncio.condicao ?? "");
    setAno(normalizeAnoInput(anuncio.ano === "—" ? "" : (anuncio.ano ?? "")));
    setQuilometragem(
      anuncio.km === "—" ? "" : kmDigitsFromDisplay(anuncio.km ?? "")
    );
    setCombustivel(anuncio.combustivel === "—" ? "" : (anuncio.combustivel ?? ""));
    setCambio(anuncio.cambio === "—" ? "" : (anuncio.cambio ?? ""));
    setPlaca(normalizePlacaInput(anuncio.placa ?? ""));
    setBlindado(anuncio.blindado ?? false);
    setChassiFinal(normalizeChassiFinalInput(anuncio.chassiFinal ?? ""));
    setCor(normalizeCorInput(anuncio.cor === "—" ? "" : (anuncio.cor ?? "")).trim());
    setDescricao(anuncio.descricao ?? "");
    setTechDetails(
      anuncio.techDetails ??
        defaultMarketplaceAnuncioTechDetails({
          combustivel: anuncio.combustivel === "—" ? "" : anuncio.combustivel,
          cambio: anuncio.cambio === "—" ? "" : anuncio.cambio,
        })
    );
    setMidiaDraft((prev) => {
      revokeBlobDrafts(prev);
      return midiaFromAnuncio(anuncio);
    });
  }, [open, anuncio, revokeBlobDrafts]);

  const nomeCompleto = React.useMemo(() => {
    const m = marca.trim();
    const mo = modelo.trim();
    return [m, mo].filter(Boolean).join(" ").trim();
  }, [marca, modelo]);

  const step1Valid =
    Boolean(marca.trim()) &&
    Boolean(modelo.trim()) &&
    Boolean(tipoVeiculo.trim()) &&
    Boolean(condicao.trim());

  const addMidiaFiles = React.useCallback((files: FileList | null, kind: "image" | "video") => {
    if (!files?.length) return;
    const next: MidiaDraftItem[] = [];
    for (const f of Array.from(files)) {
      if (kind === "image" && !f.type.startsWith("image/")) continue;
      if (kind === "video" && !f.type.startsWith("video/")) continue;
      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        url: URL.createObjectURL(f),
        kind,
        file: f,
      });
    }
    if (next.length) setMidiaDraft((p) => [...p, ...next]);
  }, []);

  const removeMidia = React.useCallback((id: string) => {
    setMidiaDraft((prev) => {
      const found = prev.find((x) => x.id === id);
      if (found?.url.startsWith("blob:")) URL.revokeObjectURL(found.url);
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  const discardAndClose = React.useCallback(() => {
    setMidiaDraft((prev) => {
      revokeBlobDrafts(prev);
      return [];
    });
    onClose();
  }, [onClose, revokeBlobDrafts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anuncio || !step1Valid) return;
    const fotos = midiaDraft.filter((m) => m.kind === "image").map((m) => m.url);
    const videoUrls = midiaDraft.filter((m) => m.kind === "video").map((m) => m.url);
    const titulo = nomeCompleto || anuncio.titulo;
    const kmDisplay = formatKmDisplay(quilometragem);
    const precoFormatado = precoDigits ? formatCurrencyBRL(precoDigits) : anuncio.preco;
    const normalizedTech: MarketplaceAnuncioTechDetails = Object.fromEntries(
      Object.entries(techDetails).map(([k, v]) => [k, v.trim()])
    ) as MarketplaceAnuncioTechDetails;

    const next: MarketplaceAnuncioAdmin = {
      ...anuncio,
      titulo,
      marca: marca.trim(),
      modelo: modelo.trim(),
      preco: precoFormatado,
      local: local.trim() || anuncio.local,
      condicao: condicao.trim() as MarketplaceItem["condicao"],
      ano: ano.trim() || anuncio.ano,
      km: kmDisplay,
      cambio: cambio.trim() || anuncio.cambio,
      combustivel: combustivel.trim() || anuncio.combustivel,
      fotos: fotos.length ? fotos : anuncio.fotos,
      imagem: fotos[0] ?? anuncio.imagem,
      descricao: descricao.trim() || undefined,
      tipoVeiculo: tipoVeiculo.trim() || undefined,
      placa: placa.trim() || undefined,
      blindado,
      chassiFinal: chassiFinal.trim() || undefined,
      cor: cor.trim() || undefined,
      videoUrls: videoUrls.length ? videoUrls : undefined,
      techDetails: normalizedTech,
    };

    const saved = await onSave(next, {
      novasMidias: midiaDraft
        .filter((m): m is MidiaDraftItem & { file: File } => Boolean(m.file))
        .map((m) => ({ file: m.file, kind: m.kind })),
    });
    if (saved === false) return;
    setMidiaDraft((prev) => {
      revokeBlobDrafts(prev);
      return [];
    });
    onClose();
  };

  return (
    <Sheet open={open} onClose={discardAndClose} side="right">
      <SheetContent
        className="max-w-[min(100vw-1rem,820px)] !w-full overflow-y-auto"
        onClose={discardAndClose}
      >
        <SheetHeader>
          <SheetTitle>Editar anúncio</SheetTitle>
          <SheetDescription className="text-left">
            Atualize marca, mídias, preço e dados do veículo. Novas mídias são anexadas ao anúncio via API.
          </SheetDescription>
        </SheetHeader>

        {anuncio ? (
          <form className="mt-6 flex flex-col gap-4 pb-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="an-preco">Preço</Label>
                <Input
                  id="an-preco"
                  value={precoDigits ? formatCurrencyBRL(precoDigits) : ""}
                  onChange={(e) => setPrecoDigits(currencyDigits(e.target.value))}
                  className="mt-1 rounded-2xl"
                  variant="flat"
                  autoComplete="off"
                  inputMode="numeric"
                  placeholder="Ex.: R$ 89.990,00"
                />
              </div>
              <div>
                <Label htmlFor="an-local">Local</Label>
                <Input
                  id="an-local"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  className="mt-1 rounded-2xl"
                  variant="flat"
                  autoComplete="off"
                  placeholder="Cidade - UF"
                />
              </div>
            </div>

            <p className="rounded-2xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-xs text-zinc-600">
              Vendedor: <VendedorAdminLink name={anuncio.vendedor} className="text-[13px]" /> (somente leitura neste
              formulário)
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <BemMarcaLogo nome={nomeCompleto || anuncio.titulo} marca={marca} className="sm:pt-1" />
              <div className="min-w-0 flex-1">
                <Label htmlFor="an-marca">Marca</Label>
                <SelectSearch
                  id="an-marca"
                  value={marca}
                  onValueChange={setMarca}
                  options={OPT_MARCA}
                  placeholder="Selecione a marca"
                  searchPlaceholder="Buscar marca…"
                  emptyMessage="Nenhuma marca encontrada."
                  aria-label="Marca do veículo"
                  variant="flat"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="an-modelo">Modelo / versão</Label>
              <Input
                id="an-modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                className="mt-1 rounded-2xl"
                variant="flat"
                required
                autoComplete="off"
                placeholder="Ex.: Onix Plus 1.0 LTZ"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Título do anúncio:{" "}
                <span className="font-medium text-zinc-700">{nomeCompleto || "—"}</span>
              </p>
            </div>

            <div>
              <Label htmlFor="an-tipo">Tipo de veículo</Label>
              <Select
                id="an-tipo"
                value={tipoVeiculo}
                onValueChange={setTipoVeiculo}
                options={OPT_TIPO}
                placeholder="Selecione o tipo"
                aria-label="Tipo de veículo"
                variant="flat"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="an-cond">Condição</Label>
              <Select
                id="an-cond"
                value={condicao}
                onValueChange={setCondicao}
                options={OPT_COND}
                placeholder="Selecione a condição"
                aria-label="Condição do veículo"
                variant="flat"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="an-ano">Ano</Label>
                <Input
                  id="an-ano"
                  value={ano}
                  onChange={(e) => setAno(normalizeAnoInput(e.target.value))}
                  className="mt-1 rounded-2xl"
                  variant="flat"
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="Ex.: 2022/2023"
                  aria-describedby="an-ano-hint"
                />
                <p id="an-ano-hint" className="mt-1 text-xs text-zinc-500">
                  Digite só números; a barra entre ano fab. e modelo é colocada automaticamente.
                </p>
              </div>
              <div>
                <Label htmlFor="an-km">Quilometragem</Label>
                <Input
                  id="an-km"
                  value={quilometragem}
                  onChange={(e) => setQuilometragem(normalizeKmInput(e.target.value))}
                  className="mt-1 rounded-2xl"
                  variant="flat"
                  autoComplete="off"
                  inputMode="numeric"
                  placeholder="Ex.: 48320"
                  aria-describedby="an-km-hint"
                />
                <p id="an-km-hint" className="mt-1 text-xs text-zinc-500">
                  Apenas números (km).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="an-comb">Combustível</Label>
                <Select
                  id="an-comb"
                  value={combustivel}
                  onValueChange={setCombustivel}
                  options={OPT_COMB}
                  placeholder="Selecione"
                  aria-label="Combustível"
                  variant="flat"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="an-camb">Câmbio</Label>
                <Select
                  id="an-camb"
                  value={cambio}
                  onValueChange={setCambio}
                  options={OPT_CAMB}
                  placeholder="Selecione"
                  aria-label="Câmbio"
                  variant="flat"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="an-chassi">Final do chassi</Label>
                <Input
                  id="an-chassi"
                  value={chassiFinal}
                  onChange={(e) => setChassiFinal(normalizeChassiFinalInput(e.target.value))}
                  className="mt-1 rounded-2xl font-mono uppercase tracking-wider"
                  variant="flat"
                  autoComplete="off"
                  inputMode="numeric"
                  placeholder="Ex.: 9283"
                  maxLength={8}
                  aria-describedby="an-chassi-hint"
                />
                <p id="an-chassi-hint" className="mt-1 text-xs text-zinc-500">
                  Somente números (até 8 dígitos).
                </p>
              </div>
              <div>
                <Label htmlFor="an-cor">Cor</Label>
                <Input
                  id="an-cor"
                  value={cor}
                  onChange={(e) => setCor(normalizeCorInput(e.target.value))}
                  className="mt-1 rounded-2xl"
                  variant="flat"
                  autoComplete="off"
                  placeholder="Ex.: Branca"
                  aria-describedby="an-cor-hint"
                />
                <p id="an-cor-hint" className="mt-1 text-xs text-zinc-500">
                  Apenas letras (acentos permitidos).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-3 py-3 shadow-none">
              <input
                id="an-blindado"
                type="checkbox"
                checked={blindado}
                onChange={(e) => setBlindado(e.target.checked)}
                className="h-4 w-4 shrink-0 rounded border-zinc-300 text-[var(--nulance-purple)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
              <Label htmlFor="an-blindado" className="mb-0 cursor-pointer text-sm font-medium text-zinc-800">
                Veículo blindado
              </Label>
            </div>

            <div>
              <Label htmlFor="an-placa">Placa do veículo</Label>
              <Input
                id="an-placa"
                value={placa}
                onChange={(e) => setPlaca(normalizePlacaInput(e.target.value))}
                className={cn("mt-1 rounded-2xl font-mono uppercase tracking-wider")}
                variant="flat"
                autoComplete="off"
                placeholder="ABC1D23 ou ABC1234"
                maxLength={7}
                aria-describedby="an-placa-hint"
              />
              <p id="an-placa-hint" className="mt-1 text-xs text-zinc-500">
                Mercosul (7 caracteres) ou formato antigo (3 letras + 4 números).
              </p>
              <div className="mt-3 flex justify-center sm:justify-start">
                <LicensePlate plate={placa} />
              </div>
            </div>

            <div>
              <Label htmlFor="an-desc">Descrição</Label>
              <textarea
                id="an-desc"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                className={cn(
                  "mt-1 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-none",
                  "placeholder:text-zinc-400 outline-none",
                  "focus:border-[var(--nulance-purple)] focus:ring-2 focus:ring-[var(--ring)]"
                )}
                placeholder="Observações adicionais (opcional)"
              />
            </div>

            <section className="border-t border-zinc-100 pt-4">
              <h3 className="text-sm font-semibold text-zinc-900">Ficha técnica detalhada (opcional)</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Campos vazios são enviados como nulos na API para limpar o dado. Preencha só o que quiser exibir em
                &quot;Ver detalhe&quot;.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="tech-motorizacao">Motorização</Label>
                  <textarea
                    id="tech-motorizacao"
                    rows={2}
                    value={techDetails.motorizacao}
                    onChange={(e) => setTechDetails((p) => ({ ...p, motorizacao: e.target.value }))}
                    className={cn(
                      "mt-1 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-none",
                      "placeholder:text-zinc-400 outline-none focus:border-[var(--nulance-purple)] focus:ring-2 focus:ring-[var(--ring)]"
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="tech-cilindros">Cilindros / cilindrada</Label>
                  <Input
                    id="tech-cilindros"
                    value={techDetails.cilindrosCilindrada}
                    onChange={(e) =>
                      setTechDetails((p) => ({ ...p, cilindrosCilindrada: e.target.value }))
                    }
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-potencia">Potência combinada (CV)</Label>
                  <Input
                    id="tech-potencia"
                    value={techDetails.potenciaCombinada}
                    onChange={(e) => setTechDetails((p) => ({ ...p, potenciaCombinada: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-torque">Torque combinado</Label>
                  <Input
                    id="tech-torque"
                    value={techDetails.torqueCombinado}
                    onChange={(e) => setTechDetails((p) => ({ ...p, torqueCombinado: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-transmissao">Transmissão</Label>
                  <Input
                    id="tech-transmissao"
                    value={techDetails.transmissao}
                    onChange={(e) => setTechDetails((p) => ({ ...p, transmissao: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-tracao">Tração</Label>
                  <Input
                    id="tech-tracao"
                    value={techDetails.tracao}
                    onChange={(e) => setTechDetails((p) => ({ ...p, tracao: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="tech-modos">Modos de condução</Label>
                  <Input
                    id="tech-modos"
                    value={techDetails.modosConducao}
                    onChange={(e) => setTechDetails((p) => ({ ...p, modosConducao: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-carroceria">Carroceria</Label>
                  <Input
                    id="tech-carroceria"
                    value={techDetails.carroceria}
                    onChange={(e) => setTechDetails((p) => ({ ...p, carroceria: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-dimensoes">Comprimento / largura / altura</Label>
                  <Input
                    id="tech-dimensoes"
                    value={techDetails.comprimentoLarguraAltura}
                    onChange={(e) =>
                      setTechDetails((p) => ({ ...p, comprimentoLarguraAltura: e.target.value }))
                    }
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-entre-eixos">Entre-eixos</Label>
                  <Input
                    id="tech-entre-eixos"
                    value={techDetails.entreEixos}
                    onChange={(e) => setTechDetails((p) => ({ ...p, entreEixos: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-porta-malas">Porta-malas</Label>
                  <Input
                    id="tech-porta-malas"
                    value={techDetails.portaMalas}
                    onChange={(e) => setTechDetails((p) => ({ ...p, portaMalas: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-tanque">Tanque de combustível</Label>
                  <Input
                    id="tech-tanque"
                    value={techDetails.tanqueCombustivel}
                    onChange={(e) => setTechDetails((p) => ({ ...p, tanqueCombustivel: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-ciclos">Ciclos urbano / rodoviário</Label>
                  <Input
                    id="tech-ciclos"
                    value={techDetails.ciclosUrbanoRodoviario}
                    onChange={(e) =>
                      setTechDetails((p) => ({ ...p, ciclosUrbanoRodoviario: e.target.value }))
                    }
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-eletrico">Uso em modo elétrico</Label>
                  <Input
                    id="tech-eletrico"
                    value={techDetails.usoModoEletrico}
                    onChange={(e) => setTechDetails((p) => ({ ...p, usoModoEletrico: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-emissoes">Emissões / selo de eficiência</Label>
                  <Input
                    id="tech-emissoes"
                    value={techDetails.emissoesSeloEficiencia}
                    onChange={(e) =>
                      setTechDetails((p) => ({ ...p, emissoesSeloEficiencia: e.target.value }))
                    }
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-freios-d">Freios dianteiros</Label>
                  <Input
                    id="tech-freios-d"
                    value={techDetails.freiosDianteiros}
                    onChange={(e) => setTechDetails((p) => ({ ...p, freiosDianteiros: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-freios-t">Freios traseiros</Label>
                  <Input
                    id="tech-freios-t"
                    value={techDetails.freiosTraseiros}
                    onChange={(e) => setTechDetails((p) => ({ ...p, freiosTraseiros: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-susp-d">Suspensão dianteira</Label>
                  <Input
                    id="tech-susp-d"
                    value={techDetails.suspensaoDianteira}
                    onChange={(e) => setTechDetails((p) => ({ ...p, suspensaoDianteira: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-susp-t">Suspensão traseira</Label>
                  <Input
                    id="tech-susp-t"
                    value={techDetails.suspensaoTraseira}
                    onChange={(e) => setTechDetails((p) => ({ ...p, suspensaoTraseira: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-pneus">Medida dos pneus</Label>
                  <Input
                    id="tech-pneus"
                    value={techDetails.medidaPneus}
                    onChange={(e) => setTechDetails((p) => ({ ...p, medidaPneus: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-estepe">Estepe</Label>
                  <Input
                    id="tech-estepe"
                    value={techDetails.estepe}
                    onChange={(e) => setTechDetails((p) => ({ ...p, estepe: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-airbags">Airbags</Label>
                  <Input
                    id="tech-airbags"
                    value={techDetails.airbags}
                    onChange={(e) => setTechDetails((p) => ({ ...p, airbags: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-abs">ABS e distribuição eletrônica</Label>
                  <Input
                    id="tech-abs"
                    value={techDetails.absDistribuicao}
                    onChange={(e) => setTechDetails((p) => ({ ...p, absDistribuicao: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-estab">Controle de estabilidade e tração</Label>
                  <Input
                    id="tech-estab"
                    value={techDetails.controleEstabilidadeTracao}
                    onChange={(e) =>
                      setTechDetails((p) => ({ ...p, controleEstabilidadeTracao: e.target.value }))
                    }
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-rampa">Assistente de partida em rampa</Label>
                  <Input
                    id="tech-rampa"
                    value={techDetails.assistentePartidaRampa}
                    onChange={(e) =>
                      setTechDetails((p) => ({ ...p, assistentePartidaRampa: e.target.value }))
                    }
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-camera">Câmera / sensores de estacionamento</Label>
                  <Input
                    id="tech-camera"
                    value={techDetails.cameraSensores}
                    onChange={(e) => setTechDetails((p) => ({ ...p, cameraSensores: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-ar">Ar-condicionado / climatizador</Label>
                  <Input
                    id="tech-ar"
                    value={techDetails.arCondicionadoClimatizador}
                    onChange={(e) =>
                      setTechDetails((p) => ({ ...p, arCondicionadoClimatizador: e.target.value }))
                    }
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-direcao">Direção</Label>
                  <Input
                    id="tech-direcao"
                    value={techDetails.direcao}
                    onChange={(e) => setTechDetails((p) => ({ ...p, direcao: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-bancos">Bancos e volante</Label>
                  <Input
                    id="tech-bancos"
                    value={techDetails.bancosVolante}
                    onChange={(e) => setTechDetails((p) => ({ ...p, bancosVolante: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-multimidia">Multimídia e conectividade</Label>
                  <Input
                    id="tech-multimidia"
                    value={techDetails.multimidiaConectividade}
                    onChange={(e) =>
                      setTechDetails((p) => ({ ...p, multimidiaConectividade: e.target.value }))
                    }
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-rodas">Rodas e iluminação</Label>
                  <Input
                    id="tech-rodas"
                    value={techDetails.rodasIluminacao}
                    onChange={(e) => setTechDetails((p) => ({ ...p, rodasIluminacao: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-vidros">Vidros e travas</Label>
                  <Input
                    id="tech-vidros"
                    value={techDetails.vidrosTravas}
                    onChange={(e) => setTechDetails((p) => ({ ...p, vidrosTravas: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-procedencia">Procedência NuLances</Label>
                  <Input
                    id="tech-procedencia"
                    value={techDetails.procedenciaNuLances}
                    onChange={(e) => setTechDetails((p) => ({ ...p, procedenciaNuLances: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-licenciamento">Licenciamento e débitos</Label>
                  <Input
                    id="tech-licenciamento"
                    value={techDetails.licenciamentoDebitos}
                    onChange={(e) =>
                      setTechDetails((p) => ({ ...p, licenciamentoDebitos: e.target.value }))
                    }
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-restricoes">Restrições / gravame</Label>
                  <Input
                    id="tech-restricoes"
                    value={techDetails.restricoesGravame}
                    onChange={(e) => setTechDetails((p) => ({ ...p, restricoesGravame: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-chaves">Chaves e manual</Label>
                  <Input
                    id="tech-chaves"
                    value={techDetails.chavesManual}
                    onChange={(e) => setTechDetails((p) => ({ ...p, chavesManual: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
                <div>
                  <Label htmlFor="tech-laudo">Laudo cautelar / inspeção</Label>
                  <Input
                    id="tech-laudo"
                    value={techDetails.laudoCautelarInspecao}
                    onChange={(e) =>
                      setTechDetails((p) => ({ ...p, laudoCautelarInspecao: e.target.value }))
                    }
                    className="mt-1 rounded-2xl"
                    variant="flat"
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-zinc-200 pt-4">
              <Label className="text-base">Fotos e vídeos</Label>
              <p className="mt-1 text-xs text-zinc-500">
                Formatos de imagem e vídeo comuns. Os arquivos ficam nesta sessão até integração com servidor.
              </p>
              <div className="mt-3">
                <BemMidiaPicker items={midiaDraft} onAddFiles={addMidiaFiles} onRemove={removeMidia} />
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" size="md" className="rounded-full" onClick={discardAndClose}>
                Cancelar
              </Button>
              <Button type="submit" size="md" className="rounded-full" disabled={!step1Valid}>
                Salvar
              </Button>
            </div>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
