"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { useAuth } from "@/components/providers/auth-provider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  Mail01Icon,
  CallIcon,
  Home01Icon,
  Camera01Icon,
  Shield02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { digitsOnly, formatCpf, formatPhoneBr } from "@/lib/formatters";
import { fetchViaCep } from "@/lib/viacep";
import * as authRepo from "@/lib/repositories/auth-repository";
import { buscarMinhaSolicitacaoVendedorSafe } from "@/lib/repositories/solicitacao-vendedor-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type { StatusSolicitacaoVendedorApi } from "@/lib/repositories/types/solicitacao-vendedor.types";

const DISP_DEBOUNCE_MS = 450;
const ACCEPT_PROFILE_IMAGES = "image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
type SellerRequestStatus = "pendente" | "aprovado" | "recusado";

function toLocalSellerStatus(status?: string | null): SellerRequestStatus | null {
  if (!status) return null;
  const normalized = String(status).toUpperCase() as StatusSolicitacaoVendedorApi;
  if (normalized === "PENDENTE") return "pendente";
  if (normalized === "APROVADA") return "aprovado";
  if (normalized === "RECUSADA") return "recusado";
  return null;
}

function isAllowedImageFile(file: File): boolean {
  const t = (file.type || "").toLowerCase();
  if (t === "image/jpeg" || t === "image/jpg" || t === "image/png" || t === "image/webp") return true;
  const n = file.name.toLowerCase();
  return /\.(jpe?g|png|webp)$/i.test(n);
}

function isBlank(v: string | null | undefined): boolean {
  return v == null || String(v).trim() === "";
}

function formatCepDisplay(raw: string): string {
  const d = digitsOnly(raw).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, status, refreshUser, isVendedor } = useAuth();

  const [senhaModalOpen, setSenhaModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sellerRequestStatus, setSellerRequestStatus] = useState<SellerRequestStatus | null>(null);
  const [sellerStatusLoading, setSellerStatusLoading] = useState(false);

  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cepBuscando, setCepBuscando] = useState(false);
  const viaCepRequestId = useRef(0);
  const fotoInputRef = useRef<HTMLInputElement | null>(null);
  const [dispTelefone, setDispTelefone] = useState<{
    disponivel: boolean | null;
    mensagem: string | null;
    loading: boolean;
  }>({ disponivel: null, mensagem: null, loading: false });
  const [fotoPerfilFile, setFotoPerfilFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (status !== "ready") return;
    if (!user) {
      router.replace("/auth?returnUrl=/profile");
    }
  }, [status, user, router]);

  useEffect(() => {
    if (!user || isEditing) return;
    setTelefone(user.telefone?.trim() ?? "");
    setCep(user.cep?.trim() ?? "");
    setLogradouro(user.logradouro?.trim() ?? "");
    setCidade(user.cidade?.trim() ?? "");
    setEstado(user.estado?.trim() ?? "");
  }, [user, isEditing]);

  useEffect(() => {
    if (!fotoPerfilFile) {
      setFotoPreview(null);
      return;
    }
    const next = URL.createObjectURL(fotoPerfilFile);
    setFotoPreview(next);
    return () => URL.revokeObjectURL(next);
  }, [fotoPerfilFile]);

  useEffect(() => {
    if (!isEditing || !user) {
      setDispTelefone({ disponivel: null, mensagem: null, loading: false });
      return;
    }

    const atualDigits = digitsOnly(telefone);
    const originalDigits = digitsOnly(user.telefone ?? "");
    const telefoneCompleto = atualDigits.length >= 10;

    const t = window.setTimeout(() => {
      void (async () => {
        if (!telefoneCompleto) {
          setDispTelefone({ disponivel: null, mensagem: null, loading: false });
          return;
        }
        if (atualDigits === originalDigits) {
          setDispTelefone({ disponivel: true, mensagem: null, loading: false });
          return;
        }

        setDispTelefone((prev) => ({ ...prev, loading: true }));
        try {
          const res = await authRepo.verificarDisponibilidadeCadastro({
            telefoneSomenteDigitos: atualDigits,
          });
          setDispTelefone({
            disponivel: res.telefoneDisponivel ?? true,
            mensagem: res.mensagemTelefone ?? null,
            loading: false,
          });
        } catch {
          setDispTelefone({
            disponivel: false,
            mensagem: "Não foi possível verificar o telefone. Tente novamente.",
            loading: false,
          });
        }
      })();
    }, DISP_DEBOUNCE_MS);

    return () => window.clearTimeout(t);
  }, [isEditing, telefone, user]);

  useEffect(() => {
    if (status !== "ready" || !user) return;
    let mounted = true;
    void (async () => {
      setSellerStatusLoading(true);
      try {
        const solicitacao = await buscarMinhaSolicitacaoVendedorSafe();
        if (!mounted) return;
        if (solicitacao?.status) {
          setSellerRequestStatus(toLocalSellerStatus(solicitacao.status) ?? null);
        } else {
          setSellerRequestStatus(isVendedor ? "aprovado" : null);
        }
      } catch {
        if (!mounted) return;
        setSellerRequestStatus(isVendedor ? "aprovado" : null);
      } finally {
        if (mounted) setSellerStatusLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [status, user, isVendedor]);

  const perfilIncompleto =
    user &&
    (isBlank(user.telefone) ||
      isBlank(user.cep) ||
      isBlank(user.logradouro) ||
      isBlank(user.cidade) ||
      isBlank(user.estado));

  const nomeExibicao = user?.nomeCompleto?.trim() || "Usuário";
  const emailExibicao = user?.email?.trim() || "";
  const cpfExibicao = user?.cpf ? formatCpf(user.cpf) : "—";
  const fotoSrc = user?.fotoPerfil?.trim() || undefined;
  const fotoSrcExibicao = fotoPreview || fotoSrc;
  const telefoneCompleto = digitsOnly(telefone).length >= 10;
  const telefoneIndisponivel = isEditing && telefoneCompleto && dispTelefone.disponivel === false;
  const podeSalvar = !isLoading && !isUploadingPhoto && !dispTelefone.loading && !telefoneIndisponivel;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (telefoneIndisponivel) {
      toast({
        type: "error",
        title: "Telefone indisponível",
        description: dispTelefone.mensagem || "Esse telefone já está em uso por outra conta.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const uf = estado.trim().toUpperCase().slice(0, 2);
      await authRepo.atualizarPerfil(
        {
          telefone: digitsOnly(telefone) || telefone.trim() || undefined,
          cep: digitsOnly(cep) || undefined,
          logradouro: logradouro.trim() || undefined,
          cidade: cidade.trim() || undefined,
          estado: uf || undefined,
        },
        null
      );
      await refreshUser();
      setIsEditing(false);
      setFotoPerfilFile(null);
      toast({
        type: "success",
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? String(err.message)
          : err instanceof Error
            ? err.message
            : "Não foi possível salvar.";
      toast({ type: "error", title: "Erro ao salvar", description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelecionarFotoPerfil = async (file: File) => {
    setFotoPerfilFile(file);
    setIsUploadingPhoto(true);
    try {
      const objectKey = await authRepo.enviarFotoPerfilAutenticado(file, null);
      await authRepo.atualizarPerfil({ fotoPerfil: objectKey }, null);
      await refreshUser();
      setFotoPerfilFile(null);
      toast({
        type: "success",
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (err) {
      setFotoPerfilFile(null);
      const msg =
        err instanceof ApiError
          ? String(err.message)
          : err instanceof Error
            ? err.message
            : "Não foi possível atualizar a foto.";
      toast({ type: "error", title: "Erro ao atualizar foto", description: msg });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = formatCepDisplay(e.target.value);
    setCep(next);
    const d = digitsOnly(next);
    if (d.length !== 8) {
      viaCepRequestId.current += 1;
      setCepBuscando(false);
      return;
    }
    if (!isEditing) return;

    const reqId = viaCepRequestId.current + 1;
    viaCepRequestId.current = reqId;
    setCepBuscando(true);

    void (async () => {
      const data = await fetchViaCep(d);
      if (viaCepRequestId.current !== reqId) return;
      setCepBuscando(false);
      if (!data) {
        toast({
          type: "error",
          title: "CEP não encontrado",
          description: "Confira os dígitos ou tente novamente em instantes.",
        });
        return;
      }
      setLogradouro(data.logradouro ?? "");
      setCidade(data.localidade ?? "");
      setEstado((data.uf ?? "").toUpperCase().slice(0, 2));
    })();
  };

  if (status === "loading" || (status === "ready" && !user)) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center py-24">
          <p className="text-sm text-zinc-500">Carregando perfil…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto w-full max-w-375 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">Meu Perfil</h1>
            <p className="mt-3 text-base text-zinc-500">
              Gerencie suas informações pessoais, endereços e configurações da conta.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <div className="flex flex-col items-center rounded-3xl bg-white p-6 text-center ring-1 ring-zinc-200">
                <div className="group relative mb-4">
                  <Avatar
                    src={fotoSrcExibicao}
                    alt={nomeExibicao}
                    className="h-28 w-28 border-4 border-white ring-1 ring-zinc-100"
                  />
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45">
                      <span className="text-[11px] font-semibold text-white">Enviando...</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-nulance-purple text-white transition-transform hover:opacity-95 active:scale-95"
                    title="Alterar foto de perfil"
                    aria-label="Alterar foto de perfil"
                    onClick={() => {
                      if (isUploadingPhoto) return;
                      fotoInputRef.current?.click();
                    }}
                    disabled={isUploadingPhoto}
                  >
                    <HugeiconsIcon icon={Camera01Icon} size={16} />
                  </button>
                  <input
                    ref={fotoInputRef}
                    type="file"
                    accept={ACCEPT_PROFILE_IMAGES}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        toast({
                          type: "error",
                          title: "Arquivo muito grande",
                          description: "A foto de perfil deve ter no máximo 5MB.",
                        });
                        return;
                      }
                      if (!isAllowedImageFile(file)) {
                        toast({
                          type: "error",
                          title: "Formato inválido",
                          description: "Use JPG, PNG ou WEBP para a foto de perfil.",
                        });
                        return;
                      }
                      void handleSelecionarFotoPerfil(file);
                    }}
                  />
                </div>
                {isUploadingPhoto && fotoPerfilFile ? (
                  <p className="mb-2 text-xs font-medium text-zinc-500">
                    Enviando nova foto: {fotoPerfilFile.name}
                  </p>
                ) : null}

                <div className="mb-1 flex items-center justify-center gap-1.5">
                  <h2 className="text-xl font-bold text-zinc-900">{nomeExibicao}</h2>
                  {user.emailVerificado && (
                    <HugeiconsIcon icon={Tick02Icon} size={18} className="text-blue-500" aria-hidden />
                  )}
                </div>
                <p className="text-sm text-zinc-500">{emailExibicao || "—"}</p>

                <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 ring-1 ring-emerald-200">
                  <HugeiconsIcon icon={Shield02Icon} size={18} className="text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">
                    {user.emailVerificado ? "E-mail verificado" : "E-mail pendente de verificação"}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200">
                <h3 className="mb-4 font-semibold text-zinc-900">Segurança</h3>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full justify-start border-zinc-200 text-zinc-700"
                  onClick={() => setSenhaModalOpen(true)}
                >
                  Alterar senha
                </Button>
              </div>

              <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200">
                <h3 className="mb-2 font-semibold text-zinc-900">Acesso de vendedor</h3>
                <p className="text-sm text-zinc-600">
                  {sellerStatusLoading
                    ? "Carregando status da solicitação..."
                    : sellerRequestStatus === "aprovado" || isVendedor
                      ? "Seu acesso vendedor está ativo."
                      : sellerRequestStatus === "pendente"
                        ? "Sua solicitação está em análise."
                        : sellerRequestStatus === "recusado"
                          ? "Sua solicitação foi recusada."
                          : "Você ainda não enviou solicitação."}
                </p>
                <Button
                  variant={sellerRequestStatus === "aprovado" || isVendedor ? "secondary" : "default"}
                  className="mt-4 h-11 w-full rounded-full"
                  disabled={sellerStatusLoading}
                  onClick={() =>
                    router.push(
                      sellerRequestStatus === "aprovado" || isVendedor
                        ? "/painel-vendedor/meus-anuncios"
                        : "/solicitar-vendedor"
                    )
                  }
                >
                  {sellerStatusLoading
                    ? "Carregando..."
                    : sellerRequestStatus === "aprovado" || isVendedor
                    ? "Abrir painel do vendedor"
                    : sellerRequestStatus === "pendente"
                      ? "Acompanhar solicitação"
                      : sellerRequestStatus === "recusado"
                        ? "Ver status da solicitação"
                        : "Solicitar acesso vendedor"}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8">
                <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4">
                  <h3 className="text-lg font-bold text-zinc-900">Informações pessoais</h3>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    type="button"
                    onClick={() => {
                      if (isEditing) {
                        setIsEditing(false);
                        setFotoPerfilFile(null);
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    className={isEditing ? "border-zinc-200 text-zinc-600" : "bg-nulance-purple"}
                  >
                    {isEditing ? "Cancelar" : "Editar dados"}
                  </Button>
                </div>

                {perfilIncompleto && (
                  <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <h4 className="text-md mb-2 font-semibold text-amber-950">Finalize seu cadastro</h4>
                    <p className="text-sm text-amber-950/90">
                      Preencha telefone, CEP, logradouro, cidade e estado para concluir seu perfil.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        name="name"
                        value={nomeExibicao}
                        readOnly
                        disabled
                        className="mt-1.5 h-12 bg-zinc-50 text-zinc-700"
                        leftIcon={<HugeiconsIcon icon={UserIcon} size={18} />}
                      />
                      <p className="mt-1 text-xs text-zinc-500">Não é possível alterar o nome pelo app.</p>
                    </div>
                    <div>
                      <Label htmlFor="document">CPF</Label>
                      <Input
                        id="document"
                        name="document"
                        value={cpfExibicao}
                        readOnly
                        disabled
                        className="mt-1.5 h-12 bg-zinc-50 text-zinc-500"
                        leftIcon={<HugeiconsIcon icon={UserIcon} size={18} />}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={emailExibicao}
                        readOnly
                        disabled
                        className="mt-1.5 h-12 bg-zinc-50 text-zinc-700"
                        leftIcon={<HugeiconsIcon icon={Mail01Icon} size={18} />}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone / celular</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formatPhoneBr(telefone)}
                        onChange={(e) => setTelefone(formatPhoneBr(e.target.value))}
                        disabled={!isEditing}
                        className="mt-1.5 h-12"
                        error={telefoneIndisponivel}
                        leftIcon={<HugeiconsIcon icon={CallIcon} size={18} />}
                      />
                      {isEditing && dispTelefone.loading ? (
                        <p className="mt-1 text-xs text-zinc-500">Verificando disponibilidade do telefone…</p>
                      ) : telefoneIndisponivel ? (
                        <p className="mt-1 text-xs font-medium text-red-600">
                          {dispTelefone.mensagem || "Telefone já cadastrado por outra conta."}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <h3 className="border-b border-zinc-100 pb-2 pt-6 text-lg font-bold text-zinc-900">Endereço</h3>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formatCepDisplay(cep)}
                        onChange={handleCepChange}
                        disabled={!isEditing || cepBuscando}
                        className="mt-1.5 h-12"
                        leftIcon={<HugeiconsIcon icon={Home01Icon} size={18} />}
                        aria-busy={cepBuscando}
                      />
                      {cepBuscando && (
                        <p className="mt-1 text-xs text-zinc-500">Buscando endereço…</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Logradouro</Label>
                      <Input
                        id="address"
                        name="address"
                        value={logradouro}
                        onChange={(e) => setLogradouro(e.target.value)}
                        disabled={!isEditing}
                        className="mt-1.5 h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        name="city"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        disabled={!isEditing}
                        className="mt-1.5 h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado (UF)</Label>
                      <Input
                        id="state"
                        name="state"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
                        disabled={!isEditing}
                        maxLength={2}
                        className="mt-1.5 h-12 uppercase"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end border-t border-zinc-100 pt-6">
                      <Button
                        type="submit"
                        size="lg"
                        className="h-12 bg-nulance-purple px-8 font-bold hover:bg-nulance-purple/90"
                        disabled={!podeSalvar}
                      >
                        {isLoading ? "Salvando…" : "Salvar alterações"}
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <ChangePasswordDialog open={senhaModalOpen} onOpenChange={setSenhaModalOpen} />
    </>
  );
}
