import { digitsOnly } from "@/lib/formatters";

export type ViaCepSuccess = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
};

function isErroPayload(data: unknown): data is { erro: true } {
  return typeof data === "object" && data !== null && "erro" in data && (data as { erro?: boolean }).erro === true;
}

/**
 * Consulta ViaCEP (https://viacep.com.br/). Retorna `null` se CEP inválido, não encontrado ou erro de rede.
 */
export async function fetchViaCep(cepRaw: string): Promise<ViaCepSuccess | null> {
  const d = digitsOnly(cepRaw).slice(0, 8);
  if (d.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (isErroPayload(data)) return null;
    if (typeof data !== "object" || data === null) return null;
    const o = data as Record<string, unknown>;
    if (typeof o.localidade !== "string" || typeof o.uf !== "string") return null;
    return data as ViaCepSuccess;
  } catch {
    return null;
  }
}
