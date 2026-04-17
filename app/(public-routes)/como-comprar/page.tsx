import Link from "next/link";

import { LegalPage } from "@/components/legal/legal-page";

export default function ComoComprarPage() {
  return (
    <LegalPage
      title="Como Comprar na NuLances"
      subtitle="Guia completo para comprar com segurança no marketplace da NuLances."
    >
      <section className="space-y-6 text-[15px] leading-relaxed text-zinc-700">
        <div>
          <p>
            A NuLances atua como plataforma de intermediação entre comprador e vendedor. Aqui você encontra anúncios,
            compara opções e negocia diretamente com o vendedor responsável pelo veículo.
          </p>
          <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 ring-1 ring-amber-200">
            Importante: a NuLances não recebe, processa ou intermedeia pagamentos entre as partes.
          </p>
        </div>

        <section className="space-y-3 border-t border-zinc-100 pt-6">
          <h2 className="text-xl font-semibold text-zinc-900">1) Encontre o anúncio ideal</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Use os filtros por categoria, preço, localização, marca e condição.</li>
            <li>Abra os detalhes do anúncio e avalie ficha técnica, fotos, quilometragem e descrição.</li>
            <li>Compare mais de uma opção antes de iniciar a negociação.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-zinc-100 pt-6">
          <h2 className="text-xl font-semibold text-zinc-900">2) Valide as informações do veículo</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Confira dados essenciais: marca, modelo, ano, câmbio, combustível, chassi final e placa parcial.</li>
            <li>Peça informações complementares ao vendedor quando houver campos genéricos ou pendentes.</li>
            <li>Solicite vídeos recentes, comprovantes de manutenção e fotos adicionais, se necessário.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-zinc-100 pt-6">
          <h2 className="text-xl font-semibold text-zinc-900">3) Negocie diretamente com o vendedor</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Combine preço, condições e forma de entrega diretamente com a parte anunciante.</li>
            <li>Defina por escrito os termos acordados (valores, prazo, documentação e responsabilidades).</li>
            <li>Evite decisões com pressa e desconfie de propostas muito abaixo do mercado.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-zinc-100 pt-6">
          <h2 className="text-xl font-semibold text-zinc-900">4) Faça vistoria e checagem documental</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Agende vistoria presencial e, quando possível, inspeção independente.</li>
            <li>Valide situação do veículo: débitos, multas, restrições, gravames e histórico.</li>
            <li>Confira se os documentos apresentados batem com os dados do anúncio.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-zinc-100 pt-6">
          <h2 className="text-xl font-semibold text-zinc-900">5) Conclua a transação com segurança</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Use meios rastreáveis para formalização do negócio e guarde comprovantes.</li>
            <li>Registre recibo/contrato e defina claramente o momento da entrega do veículo.</li>
            <li>Só finalize quando houver confirmação de documentação e transferência.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-zinc-100 pt-6">
          <h2 className="text-xl font-semibold text-zinc-900">Boas práticas para evitar problemas</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Prefira encontros em locais seguros e durante o dia.</li>
            <li>Nunca envie valores sem validar veículo, vendedor e documentação.</li>
            <li>Desconfie de urgência extrema, pedidos fora do fluxo combinado ou inconsistências de dados.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-zinc-100 pt-6">
          <h2 className="text-xl font-semibold text-zinc-900">Resumo da responsabilidade da plataforma</h2>
          <p>
            A NuLances disponibiliza o ambiente para publicação e descoberta de anúncios, mas não participa do
            recebimento de valores, não administra contas de pagamento e não executa a transferência do bem entre as
            partes. A negociação e a conclusão da compra são de responsabilidade de comprador e vendedor.
          </p>
          <p>
            Em caso de dúvidas, acesse a <Link href="/central-de-ajuda" className="font-semibold text-nulance-purple">Central de Ajuda</Link> ou entre em contato em{" "}
            <Link href="/fale-conosco" className="font-semibold text-nulance-purple">Fale Conosco</Link>.
          </p>
        </section>
      </section>
    </LegalPage>
  );
}

