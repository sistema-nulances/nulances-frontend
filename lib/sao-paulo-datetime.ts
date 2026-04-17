import { formatInTimeZone, toDate } from "date-fns-tz";
import { ptBR } from "date-fns/locale/pt-BR";

/** IANA usado em todo o app admin para leilões (horário de Brasília). */
export const SAO_PAULO_IANA = "America/Sao_Paulo" as const;

/** Valor de `<input type="datetime-local" />` com componentes no fuso de São Paulo (não no fuso do navegador). */
export function formatDateTimeLocalSaoPaulo(d: Date): string {
  return formatInTimeZone(d, SAO_PAULO_IANA, "yyyy-MM-dd'T'HH:mm");
}

const DATETIME_LOCAL_RE = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})$/;

/**
 * Interpreta o valor do `datetime-local` como data/hora em São Paulo e devolve o instante UTC correto.
 * Evita `new Date("...T..")` que no JS usa o fuso local do navegador.
 */
export function parseDateTimeLocalSaoPaulo(s: string): Date {
  const t = s.trim();
  if (!t) return new Date(NaN);
  const normalized = DATETIME_LOCAL_RE.test(t) ? `${t}:00` : t;
  return toDate(normalized, { timeZone: SAO_PAULO_IANA });
}

/** Exibição em pt-BR para mensagens (sempre em São Paulo). */
export function formatDateTimePtBrSaoPaulo(d: Date): string {
  return formatInTimeZone(d, SAO_PAULO_IANA, "dd/MM/yyyy, HH:mm", { locale: ptBR });
}

/** Relógio HH:mm:ss em São Paulo (painel ao vivo, feed). */
export function formatRelogioHmsSaoPaulo(d: Date): string {
  return formatInTimeZone(d, SAO_PAULO_IANA, "HH:mm:ss");
}
