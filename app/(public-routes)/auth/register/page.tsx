"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  LockPasswordIcon,
  ViewIcon,
  ViewOffSlashIcon,
  UserIcon,
  IdCardLanyardIcon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";

import { useAuth } from "@/components/providers/auth-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cpfEstaCompleto, cpfOnlyDigits, formatCpfMask } from "@/lib/cpf";
import { verificarDisponibilidadeCadastro } from "@/lib/repositories/auth-repository";

const NOME_MAX_LEN = 120;
const SENHA_MAX_LEN = 128;
const SENHA_MIN_LEN = 8;
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DISP_DEBOUNCE_MS = 450;

function isoParaDataBr(iso: string): string {
  const part = iso.split("T")[0] ?? "";
  const [y, m, d] = part.split("-");
  if (!y || !m || !d) return iso;
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAuth();

  const [showPassword, setShowPassword] = React.useState(false);
  const [nomeCompleto, setNomeCompleto] = React.useState("");
  const [cpf, setCpf] = React.useState("");
  const [dataNascimentoIso, setDataNascimentoIso] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [registerSubmitting, setRegisterSubmitting] = React.useState(false);
  const [aceitoTermos, setAceitoTermos] = React.useState(false);
  const [disp, setDisp] = React.useState<{
    email: boolean | null;
    cpf: boolean | null;
    mensagemEmail: string | null;
    mensagemCpf: string | null;
    loading: boolean;
  }>({
    email: null,
    cpf: null,
    mensagemEmail: null,
    mensagemCpf: null,
    loading: false,
  });

  const emailTrim = email.trim();
  const emailValido = EMAIL_OK.test(emailTrim);
  const cpfCompleto = cpfEstaCompleto(cpf);

  React.useEffect(() => {
    const emailOk = EMAIL_OK.test(email.trim());
    const digits = cpfOnlyDigits(cpf);
    const cpfOk = digits.length === 11;

    const h = window.setTimeout(() => {
      void (async () => {
        if (!emailOk && !cpfOk) {
          setDisp({
            email: null,
            cpf: null,
            mensagemEmail: null,
            mensagemCpf: null,
            loading: false,
          });
          return;
        }

        setDisp((d) => ({ ...d, loading: true }));
        try {
          const res = await verificarDisponibilidadeCadastro({
            email: emailOk ? email.trim() : undefined,
            cpfSomenteDigitos: cpfOk ? digits : undefined,
          });
          setDisp({
            loading: false,
            email: emailOk ? res.emailDisponivel : null,
            cpf: cpfOk ? res.cpfDisponivel : null,
            mensagemEmail: emailOk ? res.mensagemEmail ?? null : null,
            mensagemCpf: cpfOk ? res.mensagemCpf ?? null : null,
          });
        } catch {
          setDisp({
            loading: false,
            email: emailOk ? false : null,
            cpf: cpfOk ? false : null,
            mensagemEmail: emailOk ? "Não foi possível verificar o e-mail. Tente de novo." : null,
            mensagemCpf: cpfOk ? "Não foi possível verificar o CPF. Tente de novo." : null,
          });
        }
      })();
    }, DISP_DEBOUNCE_MS);

    return () => window.clearTimeout(h);
  }, [email, cpf]);

  const emailIndisponivel = emailValido && disp.email === false;
  const cpfIndisponivel = cpfCompleto && disp.cpf === false;
  const disponibilidadeOk =
    (!emailValido || (disp.email === true && !disp.loading)) &&
    (!cpfCompleto || (disp.cpf === true && !disp.loading));
  const formularioBasicoOk =
    Boolean(nomeCompleto.trim()) &&
    emailValido &&
    cpfCompleto &&
    Boolean(dataNascimentoIso) &&
    senha.length >= SENHA_MIN_LEN;
  const podeEnviar =
    aceitoTermos && formularioBasicoOk && disponibilidadeOk && !disp.loading && !registerSubmitting;

  const handleCpfChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCpfMask(e.target.value));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCompleto.trim() || !cpfEstaCompleto(cpf) || !dataNascimentoIso || !email.trim() || !senha) {
      toast({
        type: "error",
        title: "Preencha todos os campos",
        description: !cpfEstaCompleto(cpf)
          ? "Informe os 11 dígitos do CPF."
          : "Nome, CPF, data de nascimento, e-mail e senha são obrigatórios.",
      });
      return;
    }
    setRegisterSubmitting(true);
    try {
      await register({
        nomeCompleto: nomeCompleto.trim(),
        cpf: cpf.trim(),
        dataNascimento: isoParaDataBr(dataNascimentoIso),
        email: email.trim(),
        senha,
      });
      toast({
        type: "success",
        title: "Conta criada",
        description:
          "Enviamos um e-mail com o código de confirmação. Faça login na plataforma para informar o código quando receber.",
      });
      router.push("/auth");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível cadastrar.";
      toast({
        type: "error",
        title: "Cadastro",
        description: msg,
      });
    } finally {
      setRegisterSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-[480px] rounded-2xl bg-white p-8 ring-1 ring-zinc-200/50 sm:p-10">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-950">Crie sua conta</h2>
            <p className="mt-2 text-[15px] text-zinc-500">
              Preencha seus dados para acessar a plataforma
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ex: João da Silva"
                className="h-auto py-3 text-[15px]"
                leftIcon={<HugeiconsIcon icon={UserIcon} size={20} />}
                value={nomeCompleto}
                maxLength={NOME_MAX_LEN}
                onChange={(e) => setNomeCompleto(e.target.value.slice(0, NOME_MAX_LEN))}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="h-auto py-3 text-[15px]"
                  leftIcon={<HugeiconsIcon icon={IdCardLanyardIcon} size={20} />}
                  value={cpf}
                  error={cpfIndisponivel}
                  onChange={handleCpfChange}
                  onPaste={(e) => {
                    e.preventDefault();
                    const t = e.clipboardData.getData("text");
                    setCpf(formatCpfMask(t));
                  }}
                />
                {cpfIndisponivel && disp.mensagemCpf ? (
                  <p className="mt-1.5 text-[12px] font-medium text-red-600">{disp.mensagemCpf}</p>
                ) : (
                  <p className="mt-1.5 text-[12px] text-zinc-500">Apenas números, 11 dígitos.</p>
                )}
              </div>

              <div>
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  className="h-auto py-3 text-[15px]"
                  leftIcon={<HugeiconsIcon icon={Calendar01Icon} size={20} />}
                  value={dataNascimentoIso}
                  onChange={(e) => setDataNascimentoIso(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                className="h-auto py-3 text-[15px]"
                leftIcon={<HugeiconsIcon icon={Mail01Icon} size={20} />}
                value={email}
                maxLength={254}
                error={emailIndisponivel}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailIndisponivel && disp.mensagemEmail ? (
                <p className="mt-1.5 text-[12px] font-medium text-red-600">{disp.mensagemEmail}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Crie uma senha forte"
                className="h-auto py-3 text-[15px]"
                leftIcon={<HugeiconsIcon icon={LockPasswordIcon} size={20} />}
                value={senha}
                maxLength={SENHA_MAX_LEN}
                onChange={(e) => setSenha(e.target.value.slice(0, SENHA_MAX_LEN))}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex h-full items-center justify-center text-zinc-400 hover:text-zinc-600 focus:outline-none"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    <HugeiconsIcon icon={showPassword ? ViewOffSlashIcon : ViewIcon} size={20} />
                  </button>
                }
              />
              <p className="mt-2 text-[13px] text-zinc-500">A senha deve conter no mínimo 8 caracteres.</p>
            </div>

            <div className="flex items-start gap-3 pb-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={aceitoTermos}
                onChange={(e) => setAceitoTermos(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 text-nulance-purple focus:ring-nulance-purple"
              />
              <label htmlFor="terms" className="cursor-pointer text-[13px] leading-relaxed text-zinc-600">
                Ao criar uma conta, você concorda com nossos{" "}
                <Link href="/termos-e-condicoes-de-uso" className="font-semibold text-nulance-purple hover:underline">
                  Termos de Uso
                </Link>{" "}
                e{" "}
                <Link href="/politica-de-privacidade" className="font-semibold text-nulance-purple hover:underline">
                  Política de Privacidade
                </Link>
                .
              </label>
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              className="h-auto w-full py-3.5 text-base font-semibold"
              loading={registerSubmitting}
              disabled={!podeEnviar}
            >
              Cadastrar
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-[13px] font-medium uppercase tracking-[0.06em]">
              <span className="bg-white px-4 text-zinc-400">Ou cadastre-se com</span>
            </div>
          </div>

          <p className="mt-10 text-center text-[15px] text-zinc-500">
            Já tem uma conta?{" "}
            <Link
              href="/auth"
              className="font-semibold text-nulance-purple transition-colors hover:text-nulance-purple/80 hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
