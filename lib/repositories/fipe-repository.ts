type FipeVehicleType = "carros" | "motos" | "caminhoes";

type FipeMarca = { codigo: string; nome: string };
type FipeModelo = { codigo: string; nome: string };
type FipeAno = { codigo: string; nome: string };
type FipeModelosResponse = { modelos?: FipeModelo[] };
type FipePrecoResponse = { Valor?: string };

type ConsultarFipeParams = {
  marca: string;
  modelo: string;
  ano: number;
  tipoVeiculo?: FipeVehicleType;
};

const FIPE_BASE = "https://parallelum.com.br/fipe/api/v1";
const FIPE_CACHE = new Map<string, string | null>();

function norm(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function textMatch(a: string, b: string): boolean {
  const na = norm(a);
  const nb = norm(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

function modelTokens(input: string): string[] {
  return norm(input)
    .split(" ")
    .filter((t) => t.length >= 2);
}

function modelScore(candidate: string, wanted: string): number {
  const c = norm(candidate);
  const w = norm(wanted);
  if (!c || !w) return 0;
  if (c === w) return 1000;
  if (c.includes(w) || w.includes(c)) return 800;

  const ct = new Set(modelTokens(candidate));
  const wt = modelTokens(wanted);
  if (wt.length === 0) return 0;
  let hits = 0;
  for (const t of wt) {
    if (ct.has(t)) hits++;
  }
  const ratio = hits / wt.length;
  return Math.round(ratio * 100);
}

function pickBestModelo(modelos: FipeModelo[], modeloNome: string): FipeModelo | null {
  if (modelos.length === 0) return null;
  const exact = modelos.find((m) => textMatch(m.nome, modeloNome));
  if (exact) return exact;

  const ranked = modelos
    .map((m) => ({ m, score: modelScore(m.nome, modeloNome) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  // Evita falso positivo quando não há nenhuma semelhança real.
  return best && best.score >= 40 ? best.m : null;
}

async function jsonGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    throw new Error(`FIPE ${res.status} em ${url}`);
  }
  return (await res.json()) as T;
}

async function consultarFipeTipo(
  tipo: FipeVehicleType,
  marcaNome: string,
  modeloNome: string,
  ano: number,
): Promise<string | null> {
  const marcas = await jsonGet<FipeMarca[]>(`${FIPE_BASE}/${tipo}/marcas`);
  const marca = marcas.find((m) => textMatch(m.nome, marcaNome));
  if (!marca) return null;

  const modelosResp = await jsonGet<FipeModelosResponse>(
    `${FIPE_BASE}/${tipo}/marcas/${encodeURIComponent(marca.codigo)}/modelos`,
  );
  const modelos = Array.isArray(modelosResp.modelos) ? modelosResp.modelos : [];
  const modelo = pickBestModelo(modelos, modeloNome);
  if (!modelo) return null;

  const anos = await jsonGet<FipeAno[]>(
    `${FIPE_BASE}/${tipo}/marcas/${encodeURIComponent(marca.codigo)}/modelos/${encodeURIComponent(modelo.codigo)}/anos`,
  );
  const anoStr = String(ano);
  const anoMatch =
    anos.find((a) => String(a.nome ?? "").startsWith(anoStr)) ??
    anos.find((a) => String(a.codigo ?? "").startsWith(`${anoStr}-`));
  if (!anoMatch) return null;

  const preco = await jsonGet<FipePrecoResponse>(
    `${FIPE_BASE}/${tipo}/marcas/${encodeURIComponent(marca.codigo)}/modelos/${encodeURIComponent(modelo.codigo)}/anos/${encodeURIComponent(anoMatch.codigo)}`,
  );
  const valor = String(preco.Valor ?? "").trim();
  return valor || null;
}

export async function consultarFipePorMarcaModeloAno({
  marca,
  modelo,
  ano,
  tipoVeiculo,
}: ConsultarFipeParams): Promise<string | null> {
  const marcaSafe = String(marca ?? "").trim();
  const modeloSafe = String(modelo ?? "").trim();
  const anoSafe = Number(ano);
  if (!marcaSafe || !modeloSafe || !Number.isFinite(anoSafe) || anoSafe < 1900) return null;

  const key = `${tipoVeiculo ?? "auto"}|${norm(marcaSafe)}|${norm(modeloSafe)}|${anoSafe}`;
  if (FIPE_CACHE.has(key)) return FIPE_CACHE.get(key) ?? null;

  const allTypes: FipeVehicleType[] = ["carros", "motos", "caminhoes"];
  const types: FipeVehicleType[] = tipoVeiculo
    ? [tipoVeiculo, ...allTypes.filter((t) => t !== tipoVeiculo)]
    : allTypes;

  for (const t of types) {
    try {
      const valor = await consultarFipeTipo(t, marcaSafe, modeloSafe, anoSafe);
      if (valor) {
        FIPE_CACHE.set(key, valor);
        return valor;
      }
    } catch {
      // silencioso: tenta próximo tipo/fallback
    }
  }

  FIPE_CACHE.set(key, null);
  return null;
}
