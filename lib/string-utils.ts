/** Primeira palavra do nome completo para saudação no header. */
export function primeiroNome(nomeCompleto: string | null | undefined): string {
  const n = (nomeCompleto ?? "").trim();
  if (!n) return "Usuário";
  return n.split(/\s+/)[0] ?? n;
}
