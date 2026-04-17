import React from "react";
import { LegalPage } from "@/components/legal/legal-page";

export default function FaleConoscoPage() {
  return (
    <LegalPage
      title="Fale Conosco"
      subtitle="Envie sua mensagem. Retornaremos o quanto antes."
      withCard={false}
      fullWidthContent
    >
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Formulário</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-zinc-700">
            Este é um formulário de demonstração. Em produção, ele deve ser conectado a uma API ou serviço de suporte.
          </p>

          <form className="mt-5 grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-zinc-900" htmlFor="name">
                  Nome
                </label>
                <input
                  id="name"
                  name="name"
                  className="h-10 rounded-full border border-zinc-200 bg-white px-4 text-[15px] text-zinc-900 outline-none focus:border-[var(--nulance-purple)] focus:ring-4 focus:ring-[var(--ring)]"
                  placeholder="Seu nome"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-zinc-900" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="h-10 rounded-full border border-zinc-200 bg-white px-4 text-[15px] text-zinc-900 outline-none focus:border-[var(--nulance-purple)] focus:ring-4 focus:ring-[var(--ring)]"
                  placeholder="voce@exemplo.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-zinc-900" htmlFor="topic">
                Assunto
              </label>
              <input
                id="topic"
                name="topic"
                className="h-10 rounded-full border border-zinc-200 bg-white px-4 text-[15px] text-zinc-900 outline-none focus:border-[var(--nulance-purple)] focus:ring-4 focus:ring-[var(--ring)]"
                placeholder="Ex.: Dúvida sobre lances"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-zinc-900" htmlFor="message">
                Mensagem
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[15px] text-zinc-900 outline-none focus:border-[var(--nulance-purple)] focus:ring-4 focus:ring-[var(--ring)]"
                placeholder="Escreva aqui..."
              />
            </div>

            <button
              type="submit"
              className="h-12 rounded-full bg-[var(--nulance-purple)] px-7 text-[16px] font-semibold text-white transition hover:opacity-90"
            >
              Enviar mensagem
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200">
          <h2 className="text-xl font-bold text-zinc-900">Contato rápido</h2>
          <div className="mt-4 space-y-3 text-[15px] text-zinc-700">
            <p>
              E-mail: <span className="font-semibold text-zinc-900">suporte@nulances.com</span> (exemplo)
            </p>
            <p>
              Central de Ajuda (FAQ):{" "}
              <a
                className="font-semibold text-nulance-purple hover:underline"
                href="/central-de-ajuda"
              >
                ver perguntas frequentes
              </a>
            </p>
          </div>
        </div>
      </section>
    </LegalPage>
  );
}

