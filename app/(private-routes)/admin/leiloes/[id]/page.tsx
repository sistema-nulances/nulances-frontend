"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { LeilaoLivePanel } from "@/components/admin/leiloes/leilao-live-panel";
import { mapPainelApiToAdminPanel } from "@/lib/admin-leilao-panel";
import { getApiOrigin } from "@/lib/api/api-url";
import { buscarPainelLeilaoAdminPorId } from "@/lib/repositories/admin-leiloes-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type { LeilaoPainelResponse as LeilaoPainelApiResponse } from "@/lib/repositories/types/leilao.types";

function asPainelPayload(raw: unknown): LeilaoPainelApiResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (obj.leilaoId && obj.itens) {
    return obj as unknown as LeilaoPainelApiResponse;
  }
  const nested = obj.painel;
  if (nested && typeof nested === "object") {
    const n = nested as Record<string, unknown>;
    if (n.leilaoId && n.itens) {
      return nested as LeilaoPainelApiResponse;
    }
  }
  return null;
}

export default function AdminLeilaoPainelPage() {
  const params = useParams();
  const raw = params?.id;
  const id = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  const [state, setState] = React.useState<{
    loading: boolean;
    error: string | null;
    leilao: ReturnType<typeof mapPainelApiToAdminPanel>["leilao"] | null;
    lotes: ReturnType<typeof mapPainelApiToAdminPanel>["lotes"];
  }>({
    loading: true,
    error: null,
    leilao: null,
    lotes: [],
  });

  React.useEffect(() => {
    if (!id) return;
    let active = true;

    const loadInitial = async () => {
      try {
        const painel = await buscarPainelLeilaoAdminPorId(id);
        if (!active) return;
        const mapped = mapPainelApiToAdminPanel(painel);
        setState({ loading: false, error: null, leilao: mapped.leilao, lotes: mapped.lotes });
      } catch (err) {
        if (!active) return;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Não foi possível carregar o painel.";
        setState({ loading: false, error: message, leilao: null, lotes: [] });
      }
    };

    void loadInitial();
    return () => {
      active = false;
    };
  }, [id]);

  React.useEffect(() => {
    if (!id) return;

    const wsBase = process.env.NEXT_PUBLIC_WS_URL?.trim() || `${getApiOrigin()}/ws`;
    const client = new Client({
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS(wsBase),
    });

    client.onConnect = () => {
      client.subscribe(`/topic/leiloes/${id}/painel`, (frame) => {
        try {
          const raw = JSON.parse(frame.body);
          const payload = asPainelPayload(raw);
          if (!payload) return;
          const mapped = mapPainelApiToAdminPanel(payload);
          setState((s) => ({
            ...s,
            error: null,
            leilao: mapped.leilao,
            lotes: mapped.lotes,
          }));
        } catch {
          // ignore payload inválido para não quebrar a tela
        }
      });
    };

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [id]);

  if (!id) {
    return (
      <p className="text-sm text-zinc-500">
        <Link href="/admin/leiloes" className="font-semibold text-[var(--nulance-purple)] hover:underline">
          Voltar aos leilões
        </Link>
      </p>
    );
  }

  if (state.loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center">
        <p className="text-sm text-zinc-600">Carregando painel do leilão...</p>
      </div>
    );
  }

  if (state.error || !state.leilao) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-6">
          <p className="text-sm font-semibold text-red-700">Falha ao carregar painel</p>
          <p className="mt-1 text-sm text-red-600">{state.error ?? "Leilão não encontrado."}</p>
        </div>
      </div>
    );
  }

  return <LeilaoLivePanel leilao={state.leilao} lotes={state.lotes} />;
}
