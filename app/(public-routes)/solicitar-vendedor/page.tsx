"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, type SelectOption } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/providers/auth-provider";
import { CIDADES_BRASIL_OPTIONS } from "@/data/cidades-brasil";
import { ESTADO_BRASIL_OPTIONS } from "@/data/estado-brasil-options";
import {
  formatCnpj,
  formatCpf,
  formatPhoneBr,
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  normalizeEmail,
  parseUfFromMunicipioLabel,
} from "@/lib/formatters";
import {
  buscarMinhaSolicitacaoVendedorSafe,
  enviarArquivoDocumentoSolicitacaoVendedor,
  solicitarAcessoVendedor,
} from "@/lib/repositories/solicitacao-vendedor-repository";
import { getApiErrorMessage } from "@/lib/api/error-body";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type {
  SolicitacaoVendedorResponse,
  StatusSolicitacaoVendedorApi,
  TipoDocumentoSolicitacaoVendedorApi,
  TipoPessoaVendedorApi,
} from "@/lib/repositories/types/solicitacao-vendedor.types";

type SellerAccountType = "pessoa_fisica" | "pessoa_juridica";
type SellerRequestStatus = "pendente" | "aprovado" | "recusado";

type SellerRequestDocs = {
  rgFrente?: string;
  rgVerso?: string;
  cpfFrente?: string;
  cpfVerso?: string;
  selfieDocumento?: string;
  contratoSocial?: string;
};

type SellerDocFieldKey = keyof SellerRequestDocs;

const STATUS_LABEL: Record<SellerRequestStatus, string> = {
  pendente: "Em análise",
  aprovado: "Aprovado",
  recusado: "Necessita ajuste",
};

const STATUS_CLASS: Record<SellerRequestStatus, string> = {
  pendente: "bg-amber-50 text-amber-800 ring-amber-200",
  aprovado: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  recusado: "bg-rose-50 text-rose-800 ring-rose-200",
};

const EMPTY_DOCS: SellerRequestDocs = {};

const FORM_KEY_TO_DOC_TYPE: Record<SellerDocFieldKey, TipoDocumentoSolicitacaoVendedorApi> = {
  rgFrente: "RG_FRENTE",
  rgVerso: "RG_VERSO",
  cpfFrente: "CPF_FRENTE",
  cpfVerso: "CPF_VERSO",
  selfieDocumento: "SELFIE_COM_DOCUMENTO",
  contratoSocial: "CONTRATO_SOCIAL",
};

const DOC_TYPE_TO_FORM_KEY: Partial<Record<TipoDocumentoSolicitacaoVendedorApi, SellerDocFieldKey>> = {
  RG_FRENTE: "rgFrente",
  RG_VERSO: "rgVerso",
  CPF_FRENTE: "cpfFrente",
  CPF_VERSO: "cpfVerso",
  SELFIE_COM_DOCUMENTO: "selfieDocumento",
  CONTRATO_SOCIAL: "contratoSocial",
};

function toLocalStatus(status?: string | null): SellerRequestStatus | null {
  if (!status) return null;
  const normalized = String(status).toUpperCase() as StatusSolicitacaoVendedorApi;
  if (normalized === "PENDENTE") return "pendente";
  if (normalized === "APROVADA") return "aprovado";
  if (normalized === "RECUSADA") return "recusado";
  return null;
}

function toApiTipoPessoa(tipo: SellerAccountType): TipoPessoaVendedorApi {
  return tipo === "pessoa_juridica" ? "PESSOA_JURIDICA" : "PESSOA_FISICA";
}

function toLocalAccountType(tipo?: string | null): SellerAccountType {
  return String(tipo).toUpperCase() === "PESSOA_JURIDICA" ? "pessoa_juridica" : "pessoa_fisica";
}

function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function extractFileName(pathOrName: string): string {
  const raw = pathOrName.trim();
  if (!raw) return "";
  const chunks = raw.split("/");
  return chunks[chunks.length - 1] ?? raw;
}

export default function SolicitarVendedorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    user: me,
    isAuthenticated,
    status: authStatus,
    isVendedor,
  } = useAuth();

  const accountTypeOptions: SelectOption[] = React.useMemo(
    () => [
      { value: "pessoa_fisica", label: "Pessoa física" },
      { value: "pessoa_juridica", label: "Pessoa jurídica" },
    ],
    []
  );

  const [tipoConta, setTipoConta] = React.useState<SellerAccountType>("pessoa_fisica");
  const [nome, setNome] = React.useState("");
  const [documento, setDocumento] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [telefone, setTelefone] = React.useState("");
  const [cidade, setCidade] = React.useState("");
  const [estado, setEstado] = React.useState("");
  const [descricao, setDescricao] = React.useState("");
  const [docs, setDocs] = React.useState<SellerRequestDocs>(EMPTY_DOCS);
  const [docFiles, setDocFiles] = React.useState<Partial<Record<SellerDocFieldKey, File>>>({});
  const [docObjectKeys, setDocObjectKeys] = React.useState<Partial<Record<SellerDocFieldKey, string>>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [requestStatus, setRequestStatus] = React.useState<SellerRequestStatus | null>(null);
  const fieldClass = "h-12 px-4 py-3";
  const selectFieldClass = "[&>button]:h-12 [&>button]:rounded-full [&>button]:px-4 [&>button]:py-3";

  const isPF = tipoConta === "pessoa_fisica";
  const isPJ = tipoConta === "pessoa_juridica";
  const hasExistingRequest = requestStatus !== null;

  const applySolicitacaoToForm = React.useCallback((solicitacao: SolicitacaoVendedorResponse) => {
    setRequestStatus(toLocalStatus(solicitacao.status ?? null));
    const localTipoConta = toLocalAccountType(solicitacao.tipoPessoa ?? null);
    setTipoConta(localTipoConta);
    setNome(localTipoConta === "pessoa_juridica" ? (solicitacao.razaoSocial ?? "") : (solicitacao.nomeCompleto ?? ""));
    setDocumento(
      localTipoConta === "pessoa_juridica"
        ? formatCnpj(solicitacao.cnpj ?? "")
        : formatCpf(solicitacao.cpf ?? "")
    );
    setEmail(normalizeEmail(solicitacao.email ?? ""));
    setTelefone(formatPhoneBr(solicitacao.telefone ?? ""));
    setCidade(solicitacao.cidade ?? "");
    setEstado((solicitacao.estado ?? "").toUpperCase());
    setDescricao(solicitacao.informacoesNegocio ?? "");

    const nextDocs: SellerRequestDocs = {};
    const nextDocKeys: Partial<Record<SellerDocFieldKey, string>> = {};
    const documentos = Array.isArray(solicitacao.documentos) ? solicitacao.documentos : [];
    for (const doc of documentos) {
      const tipo = typeof doc?.tipo === "string" ? doc.tipo : "";
      const fieldKey = DOC_TYPE_TO_FORM_KEY[tipo as TipoDocumentoSolicitacaoVendedorApi];
      const objectKey = typeof doc?.arquivo === "string" ? doc.arquivo.trim() : "";
      if (!fieldKey || !objectKey) continue;
      nextDocs[fieldKey] = extractFileName(objectKey);
      nextDocKeys[fieldKey] = objectKey;
    }
    setDocs((prev) => ({ ...prev, ...nextDocs }));
    setDocObjectKeys(nextDocKeys);
    setDocFiles({});
  }, []);

  React.useEffect(() => {
    if (authStatus !== "ready") return;

    if (!isAuthenticated) {
      setInitialLoading(false);
      toast({
        type: "warning",
        title: "Faça login para continuar",
        description: "Você precisa estar autenticado para solicitar acesso de vendedor.",
      });
      router.replace("/auth");
      return;
    }

    if (isVendedor) {
      setInitialLoading(false);
      toast({
        type: "info",
        title: "Você já é vendedor",
        description: "Seu perfil já possui acesso ao painel de vendedor.",
      });
      router.replace("/painel-vendedor/meus-anuncios");
      return;
    }

    let mounted = true;
    void (async () => {
      setInitialLoading(true);
      try {
        const solicitacao = await buscarMinhaSolicitacaoVendedorSafe();
        if (!mounted) return;
        if (solicitacao) {
          applySolicitacaoToForm(solicitacao);
        } else {
          setEmail(normalizeEmail(me?.email ?? ""));
          setTelefone(formatPhoneBr(me?.telefone ?? ""));
          setCidade(me?.cidade ?? "");
          setEstado((me?.estado ?? "").toUpperCase());
          setRequestStatus(null);
        }
      } catch (error) {
        if (!mounted) return;
        const message =
          error instanceof ApiError
            ? (getApiErrorMessage(error.body) ?? error.message)
            : "Não foi possível carregar o status da solicitação.";
        toast({
          type: "warning",
          title: "Falha ao carregar solicitação",
          description: message,
        });
      } finally {
        if (mounted) setInitialLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [
    authStatus,
    isAuthenticated,
    isVendedor,
    router,
    toast,
    applySolicitacaoToForm,
    me?.email,
    me?.telefone,
    me?.cidade,
    me?.estado,
  ]);

  function setDocFile(key: SellerDocFieldKey, file: File | undefined) {
    setDocFiles((prev) => {
      const next = { ...prev };
      if (file) next[key] = file;
      else delete next[key];
      return next;
    });
    setDocs((prev) => ({
      ...prev,
      [key]: file?.name ?? prev[key] ?? "",
    }));
    setDocObjectKeys((prev) => {
      const next = { ...prev };
      if (file) delete next[key];
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function hasDoc(key: SellerDocFieldKey): boolean {
    return Boolean(docFiles[key] || docObjectKeys[key]);
  }

  function renderDocField(
    key: SellerDocFieldKey,
    label: string,
    accept = "image/*,application/pdf"
  ) {
    const selectedFile = docFiles[key];
    const displayName = selectedFile?.name || docs[key] || "";
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={`doc-${key}`}>{label}</Label>
        <input
          id={`doc-${key}`}
          type="file"
          accept={accept}
          onChange={(e) => setDocFile(key, e.target.files?.[0])}
          className="sr-only"
        />
        <div
          className={`flex h-12 items-center gap-3 rounded-full border bg-white px-4 py-3 ${
            errors[key] ? "border-red-400" : "border-zinc-200"
          }`}
        >
          <Button
            type="button"
            variant="secondary"
            className="h-8 shrink-0 rounded-full px-3 text-xs"
            onClick={() => {
              if (hasExistingRequest || loading) return;
              document.getElementById(`doc-${key}`)?.click();
            }}
            disabled={hasExistingRequest || loading}
          >
            Escolher arquivo
          </Button>
          <span className="min-w-0 truncate text-sm text-zinc-600">
            {displayName.trim() ? displayName : "Nenhum arquivo escolhido"}
          </span>
        </div>
        {errors[key] ? <p className="text-xs text-red-600">{errors[key]}</p> : null}
      </div>
    );
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!nome.trim()) nextErrors.nome = "Informe o nome.";
    if (!documento.trim()) {
      nextErrors.documento = tipoConta === "pessoa_juridica" ? "Informe o CNPJ." : "Informe o CPF.";
    } else if (tipoConta === "pessoa_juridica" ? !isValidCnpj(documento) : !isValidCpf(documento)) {
      nextErrors.documento = tipoConta === "pessoa_juridica" ? "CNPJ inválido." : "CPF inválido.";
    }

    if (!email.trim()) nextErrors.email = "Informe o e-mail.";
    else if (!isValidEmail(email)) nextErrors.email = "E-mail inválido.";

    if (!telefone.trim()) nextErrors.telefone = "Informe o telefone.";
    if (!cidade.trim()) nextErrors.cidade = "Selecione a cidade.";
    if (!estado.trim() || estado.trim().length !== 2) nextErrors.estado = "Estado inválido.";
    if (!descricao.trim()) nextErrors.descricao = "Conte sobre seu negócio.";

    if (isPF) {
      if (!hasDoc("rgFrente")) nextErrors.rgFrente = "Anexe o RG (frente).";
      if (!hasDoc("rgVerso")) nextErrors.rgVerso = "Anexe o RG (verso).";
      if (!hasDoc("cpfFrente")) nextErrors.cpfFrente = "Anexe o CPF (frente).";
      if (!hasDoc("cpfVerso")) nextErrors.cpfVerso = "Anexe o CPF (verso).";
    }

    if (isPJ) {
      if (!hasDoc("selfieDocumento")) nextErrors.selfieDocumento = "Anexe a selfie com documento.";
      if (!hasDoc("contratoSocial")) nextErrors.contratoSocial = "Anexe o contrato social.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function resolveObjectKeyForDoc(field: SellerDocFieldKey): Promise<string> {
    const selectedFile = docFiles[field];
    if (!selectedFile) {
      const existingKey = docObjectKeys[field]?.trim();
      if (existingKey) return existingKey;
      throw new Error(`Documento obrigatório não informado: ${field}.`);
    }

    const tipoDocumento = FORM_KEY_TO_DOC_TYPE[field];
    const objectKey = await enviarArquivoDocumentoSolicitacaoVendedor(selectedFile, tipoDocumento);

    setDocObjectKeys((prev) => ({ ...prev, [field]: objectKey }));
    setDocs((prev) => ({ ...prev, [field]: extractFileName(objectKey) }));
    setDocFiles((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

    return objectKey;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        type: "warning",
        title: "Revise os campos",
        description: "Há campos inválidos ou incompletos na solicitação.",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        type: "warning",
        title: "Faça login para continuar",
        description: "Você precisa estar autenticado para enviar a solicitação.",
      });
      router.push("/auth");
      return;
    }

    if (hasExistingRequest) {
      toast({
        type: "info",
        title: "Solicitação já enviada",
        description: "Você já possui uma solicitação registrada e não pode enviar outra agora.",
      });
      return;
    }

    setLoading(true);
    try {
      const docsPayload: Partial<Record<SellerDocFieldKey, string>> = {};

      if (isPF) {
        docsPayload.rgFrente = await resolveObjectKeyForDoc("rgFrente");
        docsPayload.rgVerso = await resolveObjectKeyForDoc("rgVerso");
        docsPayload.cpfFrente = await resolveObjectKeyForDoc("cpfFrente");
        docsPayload.cpfVerso = await resolveObjectKeyForDoc("cpfVerso");
      } else {
        docsPayload.selfieDocumento = await resolveObjectKeyForDoc("selfieDocumento");
        docsPayload.contratoSocial = await resolveObjectKeyForDoc("contratoSocial");
      }

      const payload = {
        tipoPessoa: toApiTipoPessoa(tipoConta),
        cpf: isPF ? sanitizeDigits(documento) : null,
        cnpj: isPJ ? sanitizeDigits(documento) : null,
        nomeCompleto: isPF ? nome.trim() : null,
        razaoSocial: isPJ ? nome.trim() : null,
        email: normalizeEmail(email),
        telefone: telefone.trim(),
        cidade: cidade.trim(),
        estado: estado.trim().toUpperCase(),
        informacoesNegocio: descricao.trim(),
        rgFrenteKey: isPF ? docsPayload.rgFrente ?? null : null,
        rgVersoKey: isPF ? docsPayload.rgVerso ?? null : null,
        cpfFrenteKey: isPF ? docsPayload.cpfFrente ?? null : null,
        cpfVersoKey: isPF ? docsPayload.cpfVerso ?? null : null,
        selfieComDocumentoKey: isPJ ? docsPayload.selfieDocumento ?? null : null,
        contratoSocialKey: isPJ ? docsPayload.contratoSocial ?? null : null,
      };

      const response = await solicitarAcessoVendedor(payload);
      setRequestStatus(toLocalStatus(response.status ?? "PENDENTE") ?? "pendente");

      toast({
        type: "success",
        title: "Solicitação enviada",
        description: "Recebemos seu pedido de acesso vendedor. Você pode acompanhar no seu perfil.",
      });
    } catch (error) {
      const description =
        error instanceof ApiError
          ? (getApiErrorMessage(error.body) ?? error.message)
          : error instanceof Error
            ? error.message
            : "Não foi possível enviar a solicitação agora.";
      toast({
        type: "warning",
        title: "Falha ao enviar solicitação",
        description,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto w-full max-w-375 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              Solicitar acesso de vendedor
            </h1>
            <p className="mt-3 text-base leading-relaxed text-zinc-500">
              Envie seus dados para análise. Após aprovação, você poderá publicar anúncios no marketplace.
            </p>
          </div>

          {requestStatus ? (
            <div
              className={`mb-6 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ring-1 ${STATUS_CLASS[requestStatus]}`}
            >
              Status atual: {STATUS_LABEL[requestStatus]}
            </div>
          ) : null}

          <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8">
            {initialLoading ? (
              <p className="text-sm text-zinc-500">Carregando sua solicitação...</p>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                  <Label htmlFor="tipo">Tipo de conta</Label>
                    <Select
                      id="tipo"
                      value={tipoConta}
                    disabled={hasExistingRequest || loading}
                      onValueChange={(v) => {
                        setTipoConta(v as SellerAccountType);
                        setDocumento((current) =>
                          v === "pessoa_juridica" ? formatCnpj(current) : formatCpf(current)
                        );
                        setErrors((s) => ({ ...s, documento: "" }));
                      }}
                      options={accountTypeOptions}
                      className={selectFieldClass}
                      variant="flat"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="documento">{tipoConta === "pessoa_juridica" ? "CNPJ" : "CPF"}</Label>
                    <Input
                      id="documento"
                      value={documento}
                      disabled={hasExistingRequest || loading}
                      onChange={(e) =>
                        setDocumento(
                          tipoConta === "pessoa_juridica" ? formatCnpj(e.target.value) : formatCpf(e.target.value)
                        )
                      }
                      placeholder={tipoConta === "pessoa_juridica" ? "00.000.000/0001-00" : "000.000.000-00"}
                      className={fieldClass}
                      error={!!errors.documento}
                      variant="flat"
                    />
                    {errors.documento ? <p className="text-xs text-red-600">{errors.documento}</p> : null}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="nome">
                    {tipoConta === "pessoa_juridica" ? "Razão social / Nome fantasia" : "Nome completo"}
                  </Label>
                  <Input
                    id="nome"
                    value={nome}
                    disabled={hasExistingRequest || loading}
                    onChange={(e) => setNome(e.target.value)}
                    className={fieldClass}
                    error={!!errors.nome}
                    variant="flat"
                  />
                  {errors.nome ? <p className="text-xs text-red-600">{errors.nome}</p> : null}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled={hasExistingRequest || loading}
                      onChange={(e) => setEmail(normalizeEmail(e.target.value))}
                      className={fieldClass}
                      error={!!errors.email}
                      variant="flat"
                    />
                    {errors.email ? <p className="text-xs text-red-600">{errors.email}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={telefone}
                      disabled={hasExistingRequest || loading}
                      onChange={(e) => setTelefone(formatPhoneBr(e.target.value))}
                      className={fieldClass}
                      error={!!errors.telefone}
                      variant="flat"
                    />
                    {errors.telefone ? <p className="text-xs text-red-600">{errors.telefone}</p> : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Select
                      id="cidade"
                      value={cidade}
                      disabled={hasExistingRequest || loading}
                      onValueChange={(v) => {
                        setCidade(v);
                        const uf = parseUfFromMunicipioLabel(v);
                        if (uf) setEstado(uf);
                      }}
                      options={CIDADES_BRASIL_OPTIONS}
                      placeholder="Selecione a cidade"
                      searchable
                      searchPlaceholder="Buscar cidade..."
                      className={selectFieldClass}
                      error={!!errors.cidade}
                      variant="flat"
                    />
                    {errors.cidade ? <p className="text-xs text-red-600">{errors.cidade}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="estado">Estado (UF)</Label>
                    <Select
                      id="estado"
                      value={estado}
                      disabled={hasExistingRequest || loading}
                      onValueChange={(v) => setEstado(v)}
                      options={ESTADO_BRASIL_OPTIONS}
                      searchable
                      searchPlaceholder="Buscar estado..."
                      className={selectFieldClass}
                      error={!!errors.estado}
                      variant="flat"
                    />
                    {errors.estado ? <p className="text-xs text-red-600">{errors.estado}</p> : null}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="descricao">Sobre seu negócio</Label>
                  <textarea
                    id="descricao"
                    rows={5}
                    value={descricao}
                    readOnly={hasExistingRequest || loading}
                    onChange={(e) => setDescricao(e.target.value)}
                    className={`rounded-2xl border bg-white px-4 py-3 text-[15px] text-zinc-900 outline-none focus:ring-4 ${
                      errors.descricao
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : "border-zinc-200 focus:border-[var(--nulance-purple)] focus:ring-[var(--ring)]"
                    }`}
                    placeholder="Descreva seu negócio, experiência e tipo de veículos que pretende anunciar."
                  />
                  {errors.descricao ? <p className="text-xs text-red-600">{errors.descricao}</p> : null}
                </div>

                <div className="mt-2 rounded-2xl border border-zinc-200 p-4 sm:p-5">
                  <h2 className="text-sm font-semibold text-zinc-900">Documentos obrigatórios</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Envie arquivos legíveis em imagem ou PDF.
                  </p>

                  {isPF ? (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {renderDocField("rgFrente", "RG (frente)")}
                      {renderDocField("rgVerso", "RG (verso)")}
                      {renderDocField("cpfFrente", "CPF (frente)")}
                      {renderDocField("cpfVerso", "CPF (verso)")}
                    </div>
                  ) : null}

                  {isPJ ? (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {renderDocField("selfieDocumento", "Selfie com documento")}
                      {renderDocField("contratoSocial", "Contrato social")}
                    </div>
                  ) : null}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <Button
                    type="submit"
                    disabled={loading || hasExistingRequest}
                    className="h-12 rounded-full bg-[var(--nulance-purple)] px-7 text-[16px] font-semibold text-white hover:opacity-90"
                  >
                    {loading ? "Enviando..." : hasExistingRequest ? "Solicitação já enviada" : "Enviar solicitação"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-12 rounded-full px-6"
                    onClick={() => router.push("/profile")}
                  >
                    Ver meu perfil
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
