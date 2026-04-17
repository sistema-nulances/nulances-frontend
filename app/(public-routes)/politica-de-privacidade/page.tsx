import React from "react";
import { LegalPage } from "@/components/legal/legal-page";

export default function PoliticaDePrivacidadePage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      subtitle="Como tratamos dados pessoais para operar a NuLances e melhorar sua experiência."
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900">1. Dados que coletamos</h2>
        <p className="text-[15px] leading-relaxed text-zinc-700">
          Podemos coletar dados fornecidos por você ao se cadastrar, enviar informações de perfil e participar de
          leilões. Também podemos registrar dados técnicos necessários para funcionamento do serviço.
        </p>

        <h2 className="text-xl font-bold text-zinc-900">2. Finalidades</h2>
        <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-zinc-700">
          <li>Gerenciar conta, autenticação e acesso.</li>
          <li>Viabilizar lances e acompanhamento de status.</li>
          <li>Segurança, prevenção de fraudes e auditoria.</li>
          <li>Atendimento ao usuário (dúvidas, suporte e solicitações).</li>
        </ul>

        <h2 className="text-xl font-bold text-zinc-900">3. Compartilhamento</h2>
        <p className="text-[15px] leading-relaxed text-zinc-700">
          Podemos compartilhar informações apenas quando necessário para operar o serviço e cumprir obrigações legais,
          respeitando princípios de minimização e segurança.
        </p>

        <h2 className="text-xl font-bold text-zinc-900">4. Seus direitos</h2>
        <p className="text-[15px] leading-relaxed text-zinc-700">
          Você pode solicitar acesso, correção, exclusão ou confirmação sobre o tratamento de seus dados, pelos
          canais disponíveis na página <span className="font-semibold text-nulance-purple">Fale Conosco</span>.
        </p>

        <h2 className="text-xl font-bold text-zinc-900">5. Contato</h2>
        <p className="text-[15px] leading-relaxed text-zinc-700">
          Em caso de dúvidas, entre em contato com nossa equipe por meio do formulário em <span className="font-semibold text-nulance-purple">Fale Conosco</span>.
        </p>
      </section>
    </LegalPage>
  );
}

