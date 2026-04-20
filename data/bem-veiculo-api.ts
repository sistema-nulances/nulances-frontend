import type { SelectOption } from "@/components/ui/select";

/** Valores enviados ao backend (enum Java em STRING). */

export const BEM_TIPO_VEICULO_API: SelectOption[] = [
  { value: "", label: "Selecione o tipo" },
  { value: "CARRO", label: "Carro" },
  { value: "MOTO", label: "Moto" },
  { value: "CAMINHAO", label: "Caminhão" },
  { value: "SUV", label: "SUV" },
  { value: "CAMINHONETE", label: "Caminhonete" },
  { value: "ONIBUS", label: "Ônibus" },
];

export const BEM_CONDICAO_API: SelectOption[] = [
  { value: "", label: "Selecione a condição" },
  { value: "PEQUENA_MONTA", label: "Pequena monta" },
  { value: "MEDIA_MONTA", label: "Média monta" },
  { value: "GRANDE_MONTA", label: "Grande monta" },
];

export const BEM_COMBUSTIVEL_API: SelectOption[] = [
  { value: "", label: "Selecione" },
  { value: "FLEX", label: "Flex" },
  { value: "DIESEL", label: "Diesel" },
  { value: "GASOLINA", label: "Gasolina" },
  { value: "ETANOL", label: "Etanol" },
  { value: "ELETRICO", label: "Elétrico" },
  { value: "HIBRIDO", label: "Híbrido" },
];

export const BEM_CAMBIO_API: SelectOption[] = [
  { value: "", label: "Selecione" },
  { value: "AUTOMATICO", label: "Automático" },
  { value: "MANUAL", label: "Manual" },
  { value: "CVT", label: "CVT" },
  { value: "AUTOMATIZADO", label: "Automatizado" },
];

const TIPO_LABEL = new Map(BEM_TIPO_VEICULO_API.filter((o) => o.value).map((o) => [o.value, o.label]));
const COND_LABEL = new Map(BEM_CONDICAO_API.filter((o) => o.value).map((o) => [o.value, o.label]));
const COMB_LABEL = new Map(BEM_COMBUSTIVEL_API.filter((o) => o.value).map((o) => [o.value, o.label]));
const CAMB_LABEL = new Map(BEM_CAMBIO_API.filter((o) => o.value).map((o) => [o.value, o.label]));

export function labelTipoVeiculoApi(code: string | undefined | null): string {
  if (!code) return "";
  return TIPO_LABEL.get(code) ?? code;
}

export function labelCondicaoApi(code: string | undefined | null): string {
  if (!code) return "";
  return COND_LABEL.get(code) ?? code;
}

export function labelCombustivelApi(code: string | undefined | null): string {
  if (!code) return "";
  return COMB_LABEL.get(code) ?? code;
}

export function labelCambioApi(code: string | undefined | null): string {
  if (!code) return "";
  return CAMB_LABEL.get(code) ?? code;
}
