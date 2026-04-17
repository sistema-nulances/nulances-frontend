import type { LoteBemItem } from "@/data/lotes-admin";
import { inferMarcaModelo } from "@/data/bem-marcas";
import { labelTipoVeiculoApi } from "@/data/bem-veiculo-api";
import { marcaVeiculoLabel, normalizeMarcaVeiculoCode } from "@/lib/bem-marca-veiculo";
import {
  resolverUrlMidiaBem,
  isMidiaVideoTipo,
} from "@/lib/repositories/admin-bens-repository";
import type { BemMidiaResponse, BemResumoResponse, BemResponse, CriarBemRequest, EditarBemRequest } from "@/lib/repositories/types/bem.types";

export function extrairMarcaCodigo(marca: BemResumoResponse["marca"] | BemResponse["marca"]): string {
  if (marca == null) return "";
  if (typeof marca === "string") return normalizeMarcaVeiculoCode(marca);
  const n = marca.nome;
  return typeof n === "string" ? normalizeMarcaVeiculoCode(n) : "";
}

function midiasApiParaFotosEVideos(midias: BemMidiaResponse[]): {
  midiasDetalhe: NonNullable<LoteBemItem["midiasDetalhe"]>;
  fotoUrls: string[];
  videoUrls: string[];
} {
  const midiasDetalhe: NonNullable<LoteBemItem["midiasDetalhe"]> = [];
  const fotoUrls: string[] = [];
  const videoUrls: string[] = [];

  for (const m of midias) {
    const url = resolverUrlMidiaBem(m);
    const isVideo = isMidiaVideoTipo(m.tipo);
    const kind: "image" | "video" = isVideo ? "video" : "image";
    if (url) {
      midiasDetalhe.push({ id: m.id, url, kind });
      if (kind === "video") videoUrls.push(url);
      else fotoUrls.push(url);
    }
  }

  return { midiasDetalhe, fotoUrls, videoUrls };
}

export function bemResumoParaLoteItem(r: BemResumoResponse): LoteBemItem {
  const marcaCodigo = extrairMarcaCodigo(r.marca);
  const tipo = r.tipoVeiculo ?? "";
  const nome = [marcaVeiculoLabel(marcaCodigo), r.modelo].filter(Boolean).join(" ").trim() || r.modelo;
  const { midiasDetalhe, fotoUrls, videoUrls } = midiasApiParaFotosEVideos(r.midias ?? []);

  return {
    id: r.id,
    nome,
    modelo: r.modelo,
    marca: marcaCodigo || undefined,
    categoria: labelTipoVeiculoApi(tipo) || tipo,
    tipoVeiculo: tipo,
    condicao: r.condicao,
    ano: r.ano != null ? String(r.ano) : undefined,
    statusBem: r.status,
    fotoUrls: fotoUrls.length ? fotoUrls : undefined,
    videoUrls: videoUrls.length ? videoUrls : undefined,
    midiasDetalhe: midiasDetalhe.length ? midiasDetalhe : undefined,
  };
}

export function bemDetalheParaLoteItem(b: BemResponse): LoteBemItem {
  const marcaCodigo = extrairMarcaCodigo(b.marca);
  const tipo = b.tipoVeiculo ?? "";
  const nome = [marcaVeiculoLabel(marcaCodigo), b.modelo].filter(Boolean).join(" ").trim() || b.modelo;

  const { midiasDetalhe, fotoUrls, videoUrls } = midiasApiParaFotosEVideos(b.midias ?? []);

  return {
    id: b.id,
    nome,
    modelo: b.modelo,
    marca: marcaCodigo || undefined,
    categoria: labelTipoVeiculoApi(tipo) || tipo,
    tipoVeiculo: tipo,
    condicao: b.condicao,
    ano: b.ano != null ? String(b.ano) : undefined,
    quilometragem: b.quilometragem != null ? String(b.quilometragem) : undefined,
    combustivel: b.combustivel,
    cambio: b.cambio,
    placa: b.placaVeiculo ?? undefined,
    blindado: b.blindado,
    chassiFinal: b.finalChassi ?? undefined,
    cor: b.cor ?? undefined,
    descricao: b.descricao ?? undefined,
    fotoUrls: fotoUrls.length ? fotoUrls : undefined,
    videoUrls: videoUrls.length ? videoUrls : undefined,
    statusBem: b.status,
    midiasDetalhe: midiasDetalhe.length ? midiasDetalhe : undefined,
  };
}

function anoFabricacaoParaApi(anoUi: string | undefined): number {
  const digits = (anoUi ?? "").replace(/\D/g, "");
  const y = parseInt(digits.slice(0, 4), 10);
  if (!Number.isFinite(y) || y < 1900) {
    throw new Error("Informe um ano de fabricação válido (4 dígitos).");
  }
  return y;
}

function kmParaApi(kmUi: string | undefined): number {
  const digits = (kmUi ?? "").replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10);
}

/** Monta payload de criação a partir do estado do formulário (códigos de enum no backend). */
export function loteItemParaCriarBemRequest(fields: BemFormFieldsApi): CriarBemRequest {
  const marca = normalizeMarcaVeiculoCode(fields.marcaCodigo);
  if (!marca) throw new Error("Selecione a marca.");

  return {
    marca,
    modelo: fields.modelo.trim(),
    tipoVeiculo: fields.tipoVeiculo,
    condicao: fields.condicao,
    ano: anoFabricacaoParaApi(fields.ano),
    quilometragem: kmParaApi(fields.quilometragem),
    finalChassi: fields.chassiFinal.trim() || null,
    combustivel: fields.combustivel,
    cambio: fields.cambio,
    blindado: fields.blindado,
    cor: fields.cor.trim() || null,
    placaVeiculo: fields.placa.trim() || null,
    descricao: fields.descricao.trim() || null,
  };
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function deriveModeloParaItem(bem: LoteBemItem): string {
  const saved = (bem.modelo ?? "").trim();
  if (saved) return saved;
  const inf = inferMarcaModelo(bem.nome);
  const marcaLegado = marcaVeiculoLabel(bem.marca) || inf.marca;
  const m = marcaLegado.trim();
  if (!m) return bem.nome.trim();
  const stripped = bem.nome.replace(new RegExp(`^${escapeRegExp(m)}\\s*`, "i"), "").trim();
  return stripped || inf.modelo || bem.nome.trim();
}

export type BemFormFieldsApi = {
  marcaCodigo: string;
  modelo: string;
  tipoVeiculo: string;
  condicao: string;
  combustivel: string;
  cambio: string;
  ano: string;
  quilometragem: string;
  placa: string;
  blindado: boolean;
  chassiFinal: string;
  cor: string;
  descricao: string;
};

export function loteBemItemParaCamposApi(bem: LoteBemItem): BemFormFieldsApi {
  return {
    marcaCodigo: normalizeMarcaVeiculoCode(bem.marca ?? ""),
    modelo: deriveModeloParaItem(bem),
    tipoVeiculo: (bem.tipoVeiculo ?? "").trim(),
    condicao: (bem.condicao ?? "").trim(),
    combustivel: (bem.combustivel ?? "").trim(),
    cambio: (bem.cambio ?? "").trim(),
    ano: bem.ano ?? "",
    quilometragem: bem.quilometragem ?? "",
    placa: bem.placa ?? "",
    blindado: bem.blindado ?? false,
    chassiFinal: bem.chassiFinal ?? "",
    cor: bem.cor ?? "",
    descricao: bem.descricao ?? "",
  };
}

export function loteItemParaCriarBemRequestFromItem(bem: LoteBemItem): CriarBemRequest {
  return loteItemParaCriarBemRequest(loteBemItemParaCamposApi(bem));
}

export function loteItemParaEditarBemRequestFromItem(bem: LoteBemItem): EditarBemRequest {
  return loteItemParaEditarBemRequest(loteBemItemParaCamposApi(bem));
}

export function loteItemParaEditarBemRequest(
  fields: BemFormFieldsApi
): EditarBemRequest {
  return {
    marca: normalizeMarcaVeiculoCode(fields.marcaCodigo),
    modelo: fields.modelo.trim(),
    tipoVeiculo: fields.tipoVeiculo,
    condicao: fields.condicao,
    ano: anoFabricacaoParaApi(fields.ano),
    quilometragem: kmParaApi(fields.quilometragem),
    finalChassi: fields.chassiFinal.trim() || null,
    combustivel: fields.combustivel,
    cambio: fields.cambio,
    blindado: fields.blindado,
    cor: fields.cor.trim() || null,
    placaVeiculo: fields.placa.trim() || null,
    descricao: fields.descricao.trim() || null,
  };
}
