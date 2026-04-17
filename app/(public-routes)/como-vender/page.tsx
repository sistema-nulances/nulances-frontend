import Link from "next/link";

import { LegalPage } from "@/components/legal/legal-page";

export default function ComoVenderPage() {
  return (
    <LegalPage
      title="Como Vender na NuLances"
      subtitle="Processo completo para anunciar, negociar e concluir sua venda com clareza."
    >
      <section className="space-y-6 text-[15px] leading-relaxed text-zinc-700">
        <div>
          <p>
            Na NuLances, o vendedor é responsável pela gestão do anúncio e pela negociação direta com o comprador.
            Nossa plataforma conecta as partes e organiza as informações para facilitar uma venda transparente.
          </p>
          <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 ring-1 ring-amber-200">
            Importante: a NuLances não recebe pagamentos da venda e não intermedeia o repasse de valores.
          </p>
        </div>

        <section className="space-y-3 border-t border-zinc-100 pt-6">
          <h2 className="text-xl font-semibold text-zinc-900">1) Prepare seu anúncio com dados completos</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Preencha informações técnicas do veículo com precisão (ano, km, câmbio, combustível, cor etc.).</li>
            <li>Inclua fotos nítidas e atuais de exterior, interior, painel e pontos relevantes.</li>
            <li>Descreva histórico de uso, manutenções, itens de série e observações importantes.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-zinc-100 pt-6">
          <h2 className="text-xl font-semibold text-zinc-900">2) Defina preço e condições de negociação</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Informe valor coerente com o mercado para aumentar qualidade dos contatos recebidos.</li>
            <li>Se houver flexibilidade, deixe isso claro na conversa com compradores.</li>
            <li>Comunique de forma objetiva se aceita troca, financiamento externo ou apenas pagamento à vista.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-zinc-100 pt-6">
          <h2 className="text-xl font-semibold text-zinc-900">3) Atenda interessados com transparência</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Responda dúvidas com agilidade e compartilhe informações consistentes com o anúncio publicado.</li>
            <li>Quando necessário, envie fotos ou vídeos complementares para reduzir incertezas.</li>
            <li>Evite omitir avarias, pendências ou limitações do veículo.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-zinc-100 pt-6">
          <h2 className="text-xl font-semibold text-zinc-900">4) Negociação e fechamento são diretos entre as partes</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Vendedor e comprador definem os termos finais: valor, prazos, local de entrega e documentos.</li>
            <li>Use contrato/recibo e mantenha registro de tudo que foi acordado.</li>
            <li>Prefira meios verificáveis para comunicação e comprovação.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-zinc-100 pt-6">
          <h2 className="text-xl font-semibold text-zinc-900">5) Remova o anúncio quando o veículo for vendido</h2>
          <p>
            Após concluir a venda, o próprio vendedor deve retirar o anúncio do ar no painel para evitar novos contatos
            e manter a base de anúncios atualizada.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Se o negócio foi finalizado, suspenda ou exclua imediatamente o anúncio.</li>
            <li>Não mantenha anúncio ativo de veículo indisponível.</li>
            <li>Atualize status e informações sempre que houver mudança relevante.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-zinc-100 pt-6">
          <h2 className="text-xl font-semibold text-zinc-900">Boas práticas para vender melhor</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Título claro e ficha técnica bem preenchida aumentam conversão.</li>
            <li>Fotos de qualidade e descrição objetiva reduzem retrabalho na negociação.</li>
            <li>Preço realista e postura transparente melhoram confiança do comprador.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-zinc-100 pt-6">
          <h2 className="text-xl font-semibold text-zinc-900">Resumo da responsabilidade da plataforma</h2>
          <p>
            A NuLances fornece infraestrutura digital para anúncio e contato entre interessados. O fluxo financeiro da
            venda não passa pela NuLances. A conclusão do negócio, pagamentos, documentos e transferência são de
            responsabilidade de vendedor e comprador.
          </p>
          <p>
            Para suporte geral, consulte a{" "}
            <Link href="/central-de-ajuda" className="font-semibold text-nulance-purple">
              Central de Ajuda
            </Link>{" "}
            ou fale conosco em{" "}
            <Link href="/fale-conosco" className="font-semibold text-nulance-purple">
              Fale Conosco
            </Link>
            .
          </p>
        </section>
      </section>
    </LegalPage>
  );
}

