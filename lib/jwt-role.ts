import type { JWTPayload } from "jose";
import { decodeJwt } from "jose";

import type { AppUserRole } from "@/lib/repositories/types/auth.types";

function stripRolePrefix(r: string): string {
  return r.replace(/^ROLE_/i, "");
}

/**
 * Extrai papéis comuns de JWTs Spring Security / custom.
 */
export function extractRolesFromJwtPayload(payload: JWTPayload): string[] {
  const out: string[] = [];

  const authorities = payload.authorities;
  if (typeof authorities === "string") {
    for (const part of authorities.split(/[,;\s]+/)) {
      const t = part.trim().replace(/^"(.*)"$/, "$1");
      if (t) out.push(stripRolePrefix(t));
    }
  } else if (Array.isArray(authorities)) {
    for (const a of authorities) {
      if (typeof a === "string") {
        out.push(stripRolePrefix(a));
      } else if (a && typeof a === "object" && "authority" in a) {
        const auth = (a as { authority?: string }).authority;
        if (typeof auth === "string") out.push(stripRolePrefix(auth));
      }
    }
  }

  const role = payload.role;
  if (typeof role === "string") out.push(stripRolePrefix(role));

  const roles = payload.roles;
  if (typeof roles === "string") {
    for (const part of roles.split(/[,;\s]+/)) {
      const t = part.trim();
      if (t) out.push(stripRolePrefix(t));
    }
  } else if (Array.isArray(roles)) {
    for (const r of roles) {
      if (typeof r === "string") out.push(stripRolePrefix(r));
    }
  }

  const scope = payload.scope;
  if (typeof scope === "string") {
    for (const s of scope.split(/\s+/)) {
      if (s) out.push(stripRolePrefix(s));
    }
  }

  return [...new Set(out.filter(Boolean))];
}

export function looksLikeJwt(token: string): boolean {
  return token.split(".").length === 3 && token.length > 20;
}

export function extractAppRolesFromToken(token: string): AppUserRole[] {
  const payload = decodeJwt(token);
  return extractRolesFromJwtPayload(payload) as AppUserRole[];
}

export function tokenHasRole(token: string, role: AppUserRole): boolean {
  try {
    return extractAppRolesFromToken(token).includes(role);
  } catch {
    return false;
  }
}
