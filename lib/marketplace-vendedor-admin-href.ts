/** Rota admin do vendedor: `/admin/marketplace/vendedores` com `?vendedor=` para identificar o perfil (mock). */
export function marketplaceVendedorAdminHref(vendedorNome: string): string {
  const v = vendedorNome.trim();
  if (!v) return "/admin/marketplace/vendedores";
  return `/admin/marketplace/vendedores}`;
}
