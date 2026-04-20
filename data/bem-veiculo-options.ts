/** Opções alinhadas aos filtros de leilão + pedidos de negócio (SUV, sinistrado, média monta). */

export const BEM_TIPOS_VEICULO = [
  "Carro",
  "Moto",
  "Caminhão",
  "SUV",
  "Caminhonete",
  "Ônibus",
  "Outro",
] as const;

export type BemTipoVeiculo = (typeof BEM_TIPOS_VEICULO)[number];

export const BEM_CONDICOES = [
  "Pequena monta",
  "Média monta",
  "Grande monta",
] as const;

export type BemCondicao = (typeof BEM_CONDICOES)[number];

export const BEM_COMBUSTIVEIS = [
  "Flex",
  "Diesel",
  "Gasolina",
  "Etanol",
  "Elétrico",
  "Híbrido",
] as const;

export const BEM_CAMBIOS = ["Automático", "Manual", "CVT", "Automatizado"] as const;
