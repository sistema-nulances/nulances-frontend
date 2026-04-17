import type { MarketplaceCategory, MarketplaceItem } from "@/data/marketplace-items";
import { getApiBaseUrl } from "@/lib/api/api-url";
import {
  labelCambioApi,
  labelCombustivelApi,
  labelCondicaoApi,
} from "@/data/bem-veiculo-api";
import { marcaVeiculoLabel, normalizeMarcaVeiculoCode } from "@/lib/bem-marca-veiculo";
import type {
  AnuncioPublicoDetalheResponse,
  AnuncioPublicoListResponse,
  AnuncioPublicoMidiaResponse,
} from "@/lib/repositories/types/marketplace-public.types";

function isRenderableMediaUrl(value: string | null | undefined): boolean {
  const v = String(value ?? "").trim();
  if (!v) return false;
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("blob:")) return true;
  return v.startsWith("/");
}

function absolutizeMediaUrl(value: string): string {
  const v = value.trim();
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("blob:")) return v;
  const base = getApiBaseUrl();
  if (v.startsWith("/")) return `${base}${v}`;
  return `${base}/${v}`;
}

export function mapAnuncioPublicoMidiasToUrls(midias: AnuncioPublicoMidiaResponse[] | null | undefined): string[] {
  const list = Array.isArray(midias) ? [...midias] : [];
  list.sort((a, b) => (a?.ordem ?? 0) - (b?.ordem ?? 0));
  const urls: string[] = [];
  for (const m of list) {
    const tipo = String(m?.tipo ?? "").toUpperCase();
    if (tipo === "VIDEO") continue;
    for (const c of [m?.url, m?.arquivo]) {
      if (isRenderableMediaUrl(c)) {
        urls.push(absolutizeMediaUrl(String(c).trim()));
        break;
      }
    }
  }
  return urls;
}

function pickCapaImagem(row: AnuncioPublicoListResponse): string | undefined {
  return mapAnuncioPublicoMidiasToUrls(row.imagens)[0];
}

function tipoVeiculoToCategoria(tipo: string | null | undefined): MarketplaceCategory {
  const t = String(tipo ?? "").toUpperCase();
  if (t === "MOTO" || t === "MOTOCICLETA") return "motos";
  // Picapes / SUVs e utilitários ficam em "carros" no marketplace público.
  if (
    t === "CAMINHONETE" ||
    t === "SUV" ||
    t === "CARRO" ||
    t === "HATCH" ||
    t === "SEDAN" ||
    t === "SW" ||
    t === "VAN" ||
    t === "UTILITARIO"
  ) {
    return "carros";
  }
  if (t === "CAMINHAO" || t === "ONIBUS") return "caminhoes";
  return "carros";
}

function formatKm(km: number | null | undefined): string {
  if (km == null || !Number.isFinite(km) || km < 0) return "—";
  return `${km.toLocaleString("pt-BR")} km`;
}

function formatPrecoBRL(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return "Sob consulta";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatAno(ano: number | null | undefined): string {
  if (ano == null || !Number.isFinite(ano)) return "—";
  return `${ano}/${ano}`;
}

export function mapAnuncioPublicoListToMarketplaceItem(row: AnuncioPublicoListResponse): MarketplaceItem {
  const marcaCode = normalizeMarcaVeiculoCode(String(row.marcaVeiculo ?? ""));
  const marca = marcaVeiculoLabel(marcaCode) || String(row.marcaVeiculo ?? "").trim() || "—";
  const modelo = String(row.modelo ?? "").trim() || "—";
  const titulo = [marca, modelo].filter((x) => x && x !== "—").join(" ").trim() || "Anúncio";
  const cidade = String(row.cidade ?? "").trim() || "—";
  const condicaoLabel = labelCondicaoApi(row.condicao) || "Conservado";

  return {
    id: String(row.id ?? ""),
    leilaoId: 0,
    categoria: tipoVeiculoToCategoria(row.tipoVeiculo),
    status: "ABERTO",
    titulo,
    condicao: condicaoLabel as MarketplaceItem["condicao"],
    marca,
    modelo,
    ano: formatAno(row.ano),
    km: formatKm(row.quilometragem),
    cambio: labelCambioApi(row.cambio) || "—",
    combustivel: labelCombustivelApi(row.combustivel) || "—",
    local: cidade,
    preco: formatPrecoBRL(row.preco == null ? undefined : Number(row.preco)),
    imagem: pickCapaImagem(row),
  };
}

export function mapAnuncioPublicoDetalheToMarketplaceItem(
  row: AnuncioPublicoDetalheResponse
): MarketplaceItem & { imagens?: string[] } {
  const marcaCode = normalizeMarcaVeiculoCode(String(row.marcaVeiculo ?? ""));
  const marca = marcaVeiculoLabel(marcaCode) || String(row.marcaVeiculo ?? "").trim() || "—";
  const modelo = String(row.modelo ?? "").trim() || "—";
  const titulo = [marca, modelo].filter((x) => x && x !== "—").join(" ").trim() || "Anúncio";
  const cidade = String(row.cidade ?? "").trim() || "—";
  const imagens = mapAnuncioPublicoMidiasToUrls(row.imagens);
  const condicaoLabel = labelCondicaoApi(row.condicao) || "Conservado";

  return {
    id: String(row.id ?? ""),
    leilaoId: 0,
    categoria: tipoVeiculoToCategoria(row.tipoVeiculo),
    status: "ABERTO",
    titulo,
    condicao: condicaoLabel as MarketplaceItem["condicao"],
    marca,
    modelo,
    ano: formatAno(row.ano),
    km: formatKm(row.quilometragem),
    cambio: labelCambioApi(row.cambio) || "—",
    combustivel: labelCombustivelApi(row.combustivel) || "—",
    local: cidade,
    preco: formatPrecoBRL(row.preco == null ? undefined : Number(row.preco)),
    imagem: imagens[0],
    imagens,
  };
}
