import { apiFetch } from "@/lib/api/api-fetch";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type { AdminDashboardLeiloesResponse } from "@/lib/repositories/types/admin-dashboard.types";

export async function buscarResumoDashboardLeiloesAdmin(limit = 20): Promise<AdminDashboardLeiloesResponse> {
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 100);
  try {
    return await apiFetch<AdminDashboardLeiloesResponse>(`/admin/dashboard?limit=${safeLimit}`, {
      method: "GET",
    });
  } catch (e) {
    // Compatibilidade com backend que expõe o recurso em /admin/dashboard/leiloes
    if (e instanceof ApiError && e.status !== 404) throw e;
    return apiFetch<AdminDashboardLeiloesResponse>(`/admin/dashboard/leiloes?limit=${safeLimit}`, {
      method: "GET",
    });
  }
}
