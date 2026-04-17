"use client";

import * as React from "react";

import { API_ERROR_EMAIL_NAO_VERIFICADO } from "@/lib/auth-constants";
import { getApiErrorCode } from "@/lib/api/error-body";
import { clearAllAuthCookies, getAuthTokenFromDocument } from "@/lib/auth-cookies";
import { applyAuthSessionFromLoginResponse, ensureFreshAccessToken } from "@/lib/auth-session";
import * as authRepo from "@/lib/repositories/auth-repository";
import type { MeResponse } from "@/lib/repositories/types/auth.types";
import { ApiError } from "@/lib/repositories/types/auth.types";
import { kycDocumentosNaoTotalmenteAprovados } from "@/lib/documentos-validacao-kyc";
import { primeiroNome } from "@/lib/string-utils";

/** Lançado quando o login retorna token mas `/auth/me` recusa (ex.: e-mail ainda não confirmado). */
export class ConfirmarEmailPendenteError extends Error {
  constructor() {
    super("CONFIRMAR_EMAIL_PENDENTE");
    this.name = "ConfirmarEmailPendenteError";
  }
}

export type AuthStatus = "idle" | "loading" | "ready";

type AuthContextValue = {
  status: AuthStatus;
  user: MeResponse | null;
  primeiroNome: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVendedor: boolean;
  /**
   * E-mail não verificado ou documentos de validação ainda não todos APROVADO
   * (lista vazia, PENDENTE ou REJEITADO em `/auth/me`).
   */
  precisaAtencaoCadastro: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  register: (body: Parameters<typeof authRepo.register>[0]) => Promise<void>;
  confirmarEmail: (body: Parameters<typeof authRepo.confirmarEmail>[0]) => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

function normalizeRole(role: string | undefined | null): string {
  const r = String(role ?? "").trim();
  return r.replace(/^ROLE_/i, "");
}

function roleEquals(role: string | undefined | null, expected: "ADMIN" | "VENDEDOR"): boolean {
  return normalizeRole(role).toUpperCase() === expected;
}

function normalizeMe(raw: MeResponse): MeResponse {
  return {
    ...raw,
    role: normalizeRole(raw.role as string) as MeResponse["role"],
    documentosValidacao: Array.isArray(raw.documentosValidacao) ? raw.documentosValidacao : [],
    documentosVendedor: Array.isArray(raw.documentosVendedor) ? raw.documentosVendedor : [],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AuthStatus>("idle");
  const [user, setUser] = React.useState<MeResponse | null>(null);

  const refreshUser = React.useCallback(async (tokenOverride?: string | null) => {
    const token = tokenOverride ?? getAuthTokenFromDocument();
    if (!token) {
      setUser(null);
      return;
    }
    const me = await authRepo.fetchMe(token);
    setUser(normalizeMe(me));
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getAuthTokenFromDocument();
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setStatus("ready");
        }
        return;
      }
      setStatus("loading");
      try {
        await refreshUser(token);
      } catch {
        clearAllAuthCookies();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setStatus("ready");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  /**
   * Heartbeat leve: cada chamada autenticada já roda `ensureFreshAccessToken` via `apiFetch`.
   * Evitamos disparar em toda mudança de rota (causava sensação de “refresh o tempo todo”).
   */
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (status !== "ready") return;
    if (!getAuthTokenFromDocument()) return;
    void ensureFreshAccessToken().catch(() => {});
  }, [status]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (status !== "ready") return;
    const id = window.setInterval(() => {
      if (!getAuthTokenFromDocument()) return;
      void ensureFreshAccessToken().catch(() => {});
    }, 4 * 60_000);
    return () => window.clearInterval(id);
  }, [status]);

  const login = React.useCallback(async (email: string, senha: string) => {
    const { token, raw } = await authRepo.login({ email, senha });
    applyAuthSessionFromLoginResponse(raw, token);
    setStatus("loading");
    try {
      await refreshUser(token);
    } catch (e) {
      clearAllAuthCookies();
      setUser(null);
      if (isEmailNaoVerificadoError(e)) {
        throw new ConfirmarEmailPendenteError();
      }
      throw e;
    } finally {
      setStatus("ready");
    }
  }, [refreshUser]);

  const logout = React.useCallback(() => {
    clearAllAuthCookies();
    setUser(null);
    setStatus("ready");
  }, []);

  const register = React.useCallback(async (body: Parameters<typeof authRepo.register>[0]) => {
    await authRepo.register(body);
  }, []);

  const confirmarEmail = React.useCallback(async (body: Parameters<typeof authRepo.confirmarEmail>[0]) => {
    await authRepo.confirmarEmail(body);
  }, []);

  const value = React.useMemo<AuthContextValue>(() => {
    const nome = primeiroNome(user?.nomeCompleto);
    const role = user?.role;
    return {
      status,
      user,
      primeiroNome: nome,
      isAuthenticated: Boolean(user),
      isAdmin: roleEquals(role, "ADMIN"),
      isVendedor: roleEquals(role, "VENDEDOR"),
      precisaAtencaoCadastro: Boolean(
        user && (!user.emailVerificado || kycDocumentosNaoTotalmenteAprovados(user))
      ),
      login,
      logout,
      refreshUser: () => refreshUser(),
      register,
      confirmarEmail,
    };
  }, [status, user, login, logout, refreshUser, register, confirmarEmail]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}

/** E-mail pendente de confirmação — usa apenas `code` do JSON (`GlobalExceptionHandler`). */
export function isEmailNaoVerificadoError(err: unknown): boolean {
  if (err instanceof ConfirmarEmailPendenteError) return true;
  if (!(err instanceof ApiError)) return false;
  const code = getApiErrorCode(err.body);
  return code === API_ERROR_EMAIL_NAO_VERIFICADO;
}
