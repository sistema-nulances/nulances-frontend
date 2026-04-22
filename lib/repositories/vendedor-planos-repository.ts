import { apiFetch } from "@/lib/api/api-fetch";
import type {
  AssinarPlanoRequest,
  AssinarPlanoResponse,
  VendedorPlanosResponse,
} from "@/lib/repositories/types/marketplace-planos.types";

export async function buscarPainelPlanosVendedor(): Promise<VendedorPlanosResponse> {
  return apiFetch<VendedorPlanosResponse>("/vendedor/planos", { method: "GET" });
}

export async function assinarPlanoVendedor(body: AssinarPlanoRequest): Promise<AssinarPlanoResponse> {
  return apiFetch<AssinarPlanoResponse>("/vendedor/planos/assinar", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
