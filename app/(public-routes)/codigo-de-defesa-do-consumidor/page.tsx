import React from "react";
import { LegalPage } from "@/components/legal/legal-page";

export default function CodigoDefesaDoConsumidorPage() {
  return (
    <LegalPage
      title="Código de Defesa do Consumidor"
      subtitle="Informações gerais sobre direitos do consumidor e canais de atendimento."
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900">1. Sobre este documento</h2>
        <p className="text-[15px] leading-relaxed text-zinc-700">
          Esta página apresenta informações gerais e um resumo do que você pode esperar ao usar a NuLances. Para
          detalhes legais completos, consulte a legislação aplicável.
        </p>

        <h2 className="text-xl font-bold text-zinc-900">2. Direitos do consumidor</h2>
        <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-zinc-700">
          <li>Transparência sobre condições de uso e regras de participação.</li>
          <li>Canal de atendimento para dúvidas e reclamações.</li>
          <li>Direito de obter informações claras e acessíveis.</li>
        </ul>

        <h2 className="text-xl font-bold text-zinc-900">3. Canais de atendimento</h2>
        <p className="text-[15px] leading-relaxed text-zinc-700">
          Se você precisar de ajuda, utilize a seção{" "}
          <span className="font-semibold text-nulance-purple">Fale Conosco</span> ou a{" "}
          <span className="font-semibold text-nulance-purple">Central de Ajuda (FAQ)</span>.
        </p>

        <h2 className="text-xl font-bold text-zinc-900">4. Atualizações</h2>
        <p className="text-[15px] leading-relaxed text-zinc-700">
          Este conteúdo pode ser atualizado para refletir melhorias no serviço e mudanças regulatórias.
        </p>
      </section>
    </LegalPage>
  );
}

