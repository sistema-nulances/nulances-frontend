"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { BemMarcaLogo } from "@/components/admin/bens/bem-marca-logo";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import {
  categoriaVeiculoDisplay,
  isCombustivelHibridoOuEletrico,
  parseAnoFabMod,
} from "@/lib/marketplace-anuncio-ficha-detalhe";
import type { MarketplaceAnuncioAdmin } from "@/lib/marketplace-anuncios-admin";
import { formatDashboardDateTime } from "@/lib/format-dashboard-datetime";
import { cn } from "@/lib/cn";

function SpecLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{children}</p>
  );
}

function SpecValue({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-zinc-900">{children}</p>;
}

function FichaField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <SpecLabel>{label}</SpecLabel>
      <div className="mt-1 text-[15px] leading-snug tracking-[-0.01em] text-zinc-900">{value}</div>
    </div>
  );
}

type Props = {
  anuncio: MarketplaceAnuncioAdmin;
};

export function MarketplaceAnuncioDetailFicha({ anuncio: a }: Props) {
  const { fab, mod } = parseAnoFabMod(a.ano);
  const categoria = categoriaVeiculoDisplay(a);
  const hibrido = isCombustivelHibridoOuEletrico(a.combustivel === "—" ? "" : a.combustivel);
  const cor = a.cor?.trim() && a.cor !== "—" ? a.cor : "—";
  const km = a.km?.trim() && a.km !== "—" ? a.km : "—";
  const cambio = a.cambio?.trim() && a.cambio !== "—" ? a.cambio : "—";
  const combustivel = a.combustivel?.trim() && a.combustivel !== "—" ? a.combustivel : "—";

  const motorizacao = hibrido
    ? "Motor a combustão + motor elétrico (sistema híbrido)"
    : "Motor a combustão (conforme projeto da versão anunciada)";

  const usoModoEletrico = hibrido
    ? "Autonomia varia conforme carga da bateria e percurso"
    : "Não aplicável ao perfil de motorização deste anúncio";
  const tech = a.techDetails;

  return (
    <div className="space-y-8">
      {/* Preço + atalho — uma única superfície dominante */}
      <div className="rounded-3xl bg-gradient-to-b from-zinc-50/95 to-white p-6 sm:p-7 ring-1 ring-zinc-200/45">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <SpecLabel>Preço</SpecLabel>
            <p className="mt-1.5 text-[26px] font-bold leading-[1.08] tracking-[-0.04em] text-zinc-900">{a.preco}</p>
          </div>
          <Link
            href="/marketplace"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex h-10 shrink-0 items-center justify-center rounded-full px-5 text-sm font-medium text-white transition-opacity hover:opacity-95",
              "bg-[var(--nulance-purple)]"
            )}
          >
            Ver outros anúncios
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-zinc-100/90 pt-7 lg:grid-cols-4">
          <div>
            <SpecLabel>Ano fab/mod</SpecLabel>
            <SpecValue>
              {fab !== "—" && mod !== "—" ? `${fab}/${mod}` : a.ano}
            </SpecValue>
          </div>
          <div>
            <SpecLabel>Km</SpecLabel>
            <SpecValue>{km}</SpecValue>
          </div>
          <div>
            <SpecLabel>Câmbio</SpecLabel>
            <SpecValue>{cambio}</SpecValue>
          </div>
          <div>
            <SpecLabel>Combustível</SpecLabel>
            <SpecValue>{combustivel}</SpecValue>
          </div>
          <div>
            <SpecLabel>Cor</SpecLabel>
            <SpecValue>{cor}</SpecValue>
          </div>
          <div>
            <SpecLabel>Blindado</SpecLabel>
            <SpecValue>{a.blindado ? "Sim" : "Não"}</SpecValue>
          </div>
        </div>
      </div>

      {/* Identificação — sem segunda “caixa”; separação por hierarquia e espaço */}
      <section className="border-t border-zinc-100 pt-8">
        <h3 className="text-[17px] font-bold tracking-[-0.02em] text-zinc-900">
          Identificação e dados do anúncio
        </h3>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FichaField label="ID do anúncio" value={`#${a.id}`} />
          <FichaField
            label="Postado em"
            value={
              <time dateTime={a.publicadoEm} className="font-medium">
                {formatDashboardDateTime(a.publicadoEm)}
              </time>
            }
          />
          <div className="flex items-start gap-3 sm:col-span-2">
            <BemMarcaLogo nome={a.titulo} marca={a.marca} className="[&_svg]:!h-10 [&_svg]:!w-10" />
            <div className="min-w-0">
              <SpecLabel>Marca</SpecLabel>
              <SpecValue>{a.marca}</SpecValue>
            </div>
          </div>
          <FichaField label="Modelo" value={a.modelo} />
          <FichaField label="Categoria" value={categoria} />
          <FichaField label="Ano fabricação" value={fab} />
          <FichaField label="Ano modelo" value={mod} />
          <FichaField label="Quilometragem declarada" value={km} />
          <FichaField label="Cor predominante" value={cor} />
          <FichaField label="Combustível" value={combustivel} />
          <FichaField label="Câmbio" value={cambio} />
          <FichaField label="Condição informada" value={a.condicao} />
          <FichaField label="Localização do anúncio" value={a.local} />
        </div>
      </section>

      <Accordion className="border-t border-zinc-100 pt-2">
        <AccordionItem variant="plain" title="Motor, performance e transmissão">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FichaField label="Motorização" value={tech?.motorizacao || motorizacao} />
            <FichaField
              label="Cilindros / cilindrada"
              value={tech?.cilindrosCilindrada || "4 cilindros em linha (conforme projeto da versão)"}
            />
            <FichaField
              label="Potência combinada (CV)"
              value={tech?.potenciaCombinada || "Conforme tabela do fabricante para a versão"}
            />
            <FichaField
              label="Torque combinado"
              value={tech?.torqueCombinado || "Conforme tabela do fabricante"}
            />
            <FichaField
              label="Transmissão"
              value={tech?.transmissao || "Automática / e-CVT (conforme versão)"}
            />
            <FichaField label="Tipo de câmbio" value={cambio} />
            <FichaField label="Tração" value={tech?.tracao || "Dianteira"} />
            <FichaField
              label="Modos de condução"
              value={tech?.modosConducao || "Conforme equipamento de série (Eco, Sport, individual etc.)"}
            />
          </div>
        </AccordionItem>

        <AccordionItem variant="plain" title="Dimensões, capacidades e carroceria">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FichaField
              label="Carroceria"
              value={tech?.carroceria || "Sedã / hatch / SUV / picape / utilitário (conforme anúncio)"}
            />
            <FichaField
              label="Comprimento / largura / altura"
              value={tech?.comprimentoLarguraAltura || "Valores oficiais do fabricante para a geração"}
            />
            <FichaField label="Entre-eixos" value={tech?.entreEixos || "Conforme manual técnico"} />
            <FichaField
              label="Porta-malas"
              value={tech?.portaMalas || "Capacidade nominal do fabricante"}
            />
            <FichaField
              label="Tanque de combustível"
              value={tech?.tanqueCombustivel || "Conforme manual"}
            />
          </div>
        </AccordionItem>

        <AccordionItem variant="plain" title="Consumo, eficiência e emissões">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FichaField
              label="Ciclos urbano / rodoviário"
              value={tech?.ciclosUrbanoRodoviario || "Valores Inmetro quando publicados para a geração"}
            />
            <FichaField label="Uso em modo elétrico" value={tech?.usoModoEletrico || usoModoEletrico} />
            <FichaField
              label="Emissões / selo de eficiência"
              value={tech?.emissoesSeloEficiencia || "Verificar ficha do fabricante e Inmetro"}
            />
          </div>
        </AccordionItem>

        <AccordionItem variant="plain" title="Freios, suspensão e pneus">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FichaField
              label="Freios dianteiros"
              value={tech?.freiosDianteiros || "A disco ventilados (padrão típico — confirmar unidade)"}
            />
            <FichaField
              label="Freios traseiros"
              value={tech?.freiosTraseiros || "A disco ou tambor (conforme geração)"}
            />
            <FichaField label="Suspensão dianteira" value={tech?.suspensaoDianteira || "Independente"} />
            <FichaField
              label="Suspensão traseira"
              value={tech?.suspensaoTraseira || "Independente ou semi-independente (conforme projeto)"}
            />
            <FichaField
              label="Medida dos pneus"
              value={tech?.medidaPneus || "Conforme etiqueta da porta ou manual"}
            />
            <FichaField
              label="Estepe"
              value={tech?.estepe || "Temporário, run-flat ou ausente (conforme versão)"}
            />
          </div>
        </AccordionItem>

        <AccordionItem variant="plain" title="Segurança e assistência à condução">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FichaField
              label="Airbags"
              value={tech?.airbags || "Frontais; laterais e cortina conforme pacote"}
            />
            <FichaField
              label="ABS e distribuição eletrônica"
              value={tech?.absDistribuicao || "De série na maioria das versões recentes"}
            />
            <FichaField
              label="Controle de estabilidade e tração"
              value={tech?.controleEstabilidadeTracao || "Se equipado de fábrica para o ano/modelo"}
            />
            <FichaField
              label="Assistente de partida em rampa"
              value={tech?.assistentePartidaRampa || "Conforme opcionais da unidade"}
            />
            <FichaField
              label="Câmera / sensores de estacionamento"
              value={tech?.cameraSensores || "Conforme pacote multimídia"}
            />
          </div>
        </AccordionItem>

        <AccordionItem variant="plain" title="Conforto, acabamento e tecnologia">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FichaField
              label="Ar-condicionado / climatizador"
              value={tech?.arCondicionadoClimatizador || "Digital ou analógico (conforme versão)"}
            />
            <FichaField label="Direção" value={tech?.direcao || "Hidráulica ou elétrica"} />
            <FichaField
              label="Bancos e volante"
              value={tech?.bancosVolante || "Ajustes manuais ou elétricos; revestimento conforme acabamento"}
            />
            <FichaField
              label="Multimídia e conectividade"
              value={tech?.multimidiaConectividade || "Central, Bluetooth, espelhamento (se de série)"}
            />
            <FichaField
              label="Rodas e iluminação"
              value={tech?.rodasIluminacao || "Liga leve; faróis halógeno / LED / Full LED"}
            />
            <FichaField
              label="Vidros e travas"
              value={tech?.vidrosTravas || "Elétricos com one-touch nos dianteiros (quando aplicável)"}
            />
          </div>
        </AccordionItem>

        <AccordionItem variant="plain" title="Documentação e procedência">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FichaField
              label="Procedência NuLances"
              value={tech?.procedenciaNuLances || "Unidade vinculada ao ecossistema de leilão e marketplace"}
            />
            <FichaField
              label="Licenciamento e débitos"
              value={tech?.licenciamentoDebitos || "Checagem recomendada antes da transação"}
            />
            <FichaField
              label="Restrições / gravame"
              value={tech?.restricoesGravame || "Confirmar situação atual com o vendedor"}
            />
            <FichaField label="Chaves e manual" value={tech?.chavesManual || "Confirmar entrega na negociação"} />
            <FichaField
              label="Laudo cautelar / inspeção"
              value={tech?.laudoCautelarInspecao || "Solicite quando disponível"}
            />
          </div>
        </AccordionItem>
      </Accordion>

      {/* Descrição */}
      <section className="border-t border-zinc-100 pt-8">
        <h3 className="text-[17px] font-bold tracking-[-0.02em] text-zinc-900">Descrição</h3>
        <p className="mt-4 text-[15px] leading-relaxed text-zinc-700">
          {a.descricao ? <>{a.descricao} </> : null}
          Condição classificada como <strong className="font-semibold text-zinc-900">{a.condicao}</strong>.
        </p>
      </section>
    </div>
  );
}
