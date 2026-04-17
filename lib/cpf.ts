/** CPF brasileiro: 11 dígitos, exibição `000.000.000-00`. */

export const CPF_MAX_DIGITS = 11;

/** Mantém apenas dígitos, no máximo 11. */
export function cpfOnlyDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, CPF_MAX_DIGITS);
}

/** Formata dígitos para máscara visual (máx. 14 caracteres). */
export function formatCpfMask(digitsOrRaw: string): string {
  const d = cpfOnlyDigits(digitsOrRaw);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

export function cpfEstaCompleto(valorMascaradoOuDigitos: string): boolean {
  return cpfOnlyDigits(valorMascaradoOuDigitos).length === CPF_MAX_DIGITS;
}
