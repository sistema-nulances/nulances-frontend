import { apiFetch } from "@/lib/api/api-fetch";
import type { LeiloesGanhosResponse } from "@/lib/repositories/types/ganhos.types";

export async function listarMeusLeiloesGanhos(
  page = 0,
  size = 20,
  token?: string | null
): Promise<LeiloesGanhosResponse> {
  const safePage = Math.max(0, Math.floor(page));
  const safeSize = Math.min(Math.max(1, Math.floor(size)), 100);

  return apiFetch<LeiloesGanhosResponse>(
    `/leiloes/ganhos/me?page=${safePage}&size=${safeSize}`,
    {
      method: "GET",
      token: token ?? undefined,
    }
  );
}
