import React from "react";
import { LegalPage } from "@/components/legal/legal-page";

export default function CentralDeAjudaPage() {
  return (
    <LegalPage
      title="Central de Ajuda (FAQ)"
      subtitle="Respostas rápidas para dúvidas comuns."
    >
      <section className="space-y-4">
        <div className="space-y-3">
          <details className="rounded-2xl border border-zinc-200 bg-white p-4" open={false}>
            <summary className="cursor-pointer text-[15px] font-semibold text-zinc-900">
              Como faço para dar um lance?
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-700">
              Acesse a página do leilão, verifique o status e clique no botão de dar lance. Se houver
              lances em andamento, o valor será atualizado conforme as regras do leilão.
            </p>
          </details>

          <details className="rounded-2xl border border-zinc-200 bg-white p-4" open={false}>
            <summary className="cursor-pointer text-[15px] font-semibold text-zinc-900">
              O que significa “Abre em breve”?
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-700">
              Indica que o leilão ainda não iniciou a fase de recebimento de lances. Quando o período iniciar, o
              status muda para “Leilão aberto”.
            </p>
          </details>

          <details className="rounded-2xl border border-zinc-200 bg-white p-4" open={false}>
            <summary className="cursor-pointer text-[15px] font-semibold text-zinc-900">
              Como acompanho meus leilões?
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-700">
              Você pode acompanhar seus leilões na seção <span className="font-semibold text-nulance-purple">Meus Lances</span> e ver
              detalhes do que foi arrematado em <span className="font-semibold text-nulance-purple">Leilões Ganhos</span>.
            </p>
          </details>

          <details className="rounded-2xl border border-zinc-200 bg-white p-4" open={false}>
            <summary className="cursor-pointer text-[15px] font-semibold text-zinc-900">
              O que fazer se houver problema no envio de documentos?
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-700">
              Verifique se os arquivos atendem ao formato e tamanho máximos. Se o problema persistir, envie
              sua solicitação em <span className="font-semibold text-nulance-purple">Fale Conosco</span>.
            </p>
          </details>
        </div>

        <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200">
          <h2 className="text-lg font-bold text-zinc-900">Ainda precisa de ajuda?</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-zinc-700">
            Caso sua dúvida não esteja aqui, fale com nossa equipe na página <span className="font-semibold text-nulance-purple">Fale Conosco</span>.
          </p>
        </div>
      </section>
    </LegalPage>
  );
}

