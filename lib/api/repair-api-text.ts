/**
 * Normaliza textos vindos da API quando o backend/envio (ex.: Railway + proxy)
 * entrega UTF-8 interpretado como Latin-1 ("nÃ£o" em vez de "não") ou substitui acentos por "?".
 */

/** Sinais de UTF-8 lido como Latin-1 (ex.: byte C3 vira "Ã") ou caractere de substituição. */
const MOJIBAKE_HINT = /\u00c3|\u00c2|\uFFFD/;

/**
 * Reinterpreta code points U+0000–U+00FF como bytes e decodifica como UTF-8.
 * Só é seguro quando o texto é claramente mojibake (ex. contém "Ã").
 */
function repairUtf8MisreadAsLatin1(s: string): string {
  if (!s) return s;
  const buf = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c > 0xff) return s;
    buf[i] = c;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(buf);
}

/** Padrões comuns quando acentos viram "?" na origem (mensagens Spring em PT-BR). */
function repairCommonQuestionMarkCorruption(s: string): string {
  return s
    .replace(/\bn\?o\b/gi, "não")
    .replace(/\bc\?digo\b/gi, "código")
    .replace(/\bc\?digos\b/gi, "códigos")
    .replace(/\bv\?lido\b/gi, "válido")
    .replace(/\bv\?lida\b/gi, "válida")
    .replace(/\bv\?lidos\b/gi, "válidos")
    .replace(/\bv\?lidas\b/gi, "válidas")
    .replace(/\bser\?\b/gi, "será")
    .replace(/\best\?\b/gi, "está")
    .replace(/\best\?o\b/gi, "estão")
    .replace(/\bv\?o\b/gi, "vão")
    .replace(/\bd\?gito\b/gi, "dígito")
    .replace(/\bd\?gitos\b/gi, "dígitos")
    .replace(/\binv\?lido\b/gi, "inválido")
    .replace(/\binv\?lida\b/gi, "inválida");
}

function tryUrlDecodeOnce(s: string): string {
  if (!/%[0-9A-Fa-f]{2}/.test(s)) return s;
  try {
    const d = decodeURIComponent(s.replace(/\+/g, " "));
    return d.length > 0 && d !== s ? d : s;
  } catch {
    return s;
  }
}

function replacementCount(s: string): number {
  return (s.match(/\uFFFD/g) || []).length;
}

function mojibakeMarkerCount(s: string): number {
  return (s.match(/\u00c3|\u00c2|\uFFFD/g) || []).length;
}

/**
 * Ajusta encoding provável em mensagens de erro / texto da API.
 */
export function normalizeApiText(s: string): string {
  if (s.length === 0) return s;
  const trimmed = s.trim();
  if (!trimmed) return s;

  let base = tryUrlDecodeOnce(trimmed);
  base = repairCommonQuestionMarkCorruption(base);

  if (!MOJIBAKE_HINT.test(base) && mojibakeMarkerCount(base) === 0) {
    return base;
  }

  const fixed = repairUtf8MisreadAsLatin1(base);
  if (fixed === base) return base;

  const repOrig = replacementCount(base);
  const repFix = replacementCount(fixed);
  const mojiOrig = mojibakeMarkerCount(base);
  const mojiFix = mojibakeMarkerCount(fixed);

  if (repFix < repOrig) return fixed;
  if (mojiFix < mojiOrig) return fixed;
  if (repFix === 0 && mojiFix === 0 && /[ãáàâéêíóôõúç]/i.test(fixed)) return fixed;

  return base;
}
