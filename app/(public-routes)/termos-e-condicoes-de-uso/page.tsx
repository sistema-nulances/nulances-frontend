import React from "react";
import { LegalPage } from "@/components/legal/legal-page";

export default function TermosECondicoesDeUsoPage() {
  return (
    <LegalPage
      title="Termos e Condições de Uso"
      subtitle="Regras para utilização da plataforma, participação e responsabilidades."
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900">1. Aceite</h2>
        <p className="text-[15px] leading-relaxed text-zinc-700">
          Ao utilizar a NuLances, você concorda com estes Termos e com a Política de Privacidade.
        </p>

        <h2 className="text-xl font-bold text-zinc-900">2. Conta e segurança</h2>
        <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-zinc-700">
          <li>Mantenha suas informações atualizadas.</li>
          <li>Use senhas seguras e não compartilhe credenciais.</li>
          <li>Você é responsável pelas atividades realizadas em sua conta.</li>
        </ul>

        <h2 className="text-xl font-bold text-zinc-900">3. Participação em leilões</h2>
        <p className="text-[15px] leading-relaxed text-zinc-700">
          Você deve observar as regras de cada leilão, valores mínimos, prazos e condições informadas na
          plataforma.
        </p>

        <h2 className="text-xl font-bold text-zinc-900">4. Conteúdo e integridade</h2>
        <p className="text-[15px] leading-relaxed text-zinc-700">
          Não é permitido fornecer informações falsas ou infringir direitos de terceiros. Reservamo-nos o
          direito de suspender contas em casos de violação.
        </p>

        <h2 className="text-xl font-bold text-zinc-900">5. Contato</h2>
        <p className="text-[15px] leading-relaxed text-zinc-700">
          Dúvidas sobre estes Termos podem ser enviadas via{" "}
          <span className="font-semibold text-nulance-purple">Fale Conosco</span> ou via{" "}
          <span className="font-semibold text-nulance-purple">Central de Ajuda (FAQ)</span>.
        </p>
      </section>
    </LegalPage>
  );
}

