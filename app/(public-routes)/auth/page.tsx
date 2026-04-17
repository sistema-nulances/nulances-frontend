"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  LockPasswordIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";

import { EmailConfirmationDialog } from "@/components/auth/email-confirmation-dialog";
import {
  ConfirmarEmailPendenteError,
  isEmailNaoVerificadoError,
  useAuth,
} from "@/components/providers/auth-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/repositories/types/auth.types";

function AuthLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { login, confirmarEmail, isAuthenticated, status } = useAuth();

  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [otpOpen, setOtpOpen] = React.useState(false);
  const [otpSubmitting, setOtpSubmitting] = React.useState(false);
  const [loginSubmitting, setLoginSubmitting] = React.useState(false);
  const passwordForOtpRef = React.useRef("");

  const returnUrl = searchParams.get("returnUrl")?.trim() || "";

  React.useEffect(() => {
    if (status !== "ready" || !isAuthenticated) return;
    const dest = returnUrl && returnUrl.startsWith("/") ? returnUrl : "/";
    router.replace(dest);
  }, [status, isAuthenticated, router, returnUrl]);

  const handleLoginSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !password) {
        toast({
          type: "error",
          title: "Campos obrigatórios",
          description: "Preencha e-mail e senha para continuar.",
        });
        return;
      }
      setLoginSubmitting(true);
      try {
        await login(email.trim(), password);
        const dest = returnUrl && returnUrl.startsWith("/") ? returnUrl : "/";
        router.replace(dest);
        toast({
          type: "success",
          title: "Login realizado",
          description: "Bem-vindo de volta à NuLances.",
        });
      } catch (err) {
        if (err instanceof ConfirmarEmailPendenteError || isEmailNaoVerificadoError(err)) {
          passwordForOtpRef.current = password;
          setOtpOpen(true);
          toast({
            type: "info",
            title: "Confirme seu e-mail",
            description: "Digite o código de 6 dígitos que enviamos para concluir o acesso.",
          });
        } else {
          const msg =
            err instanceof ApiError && (err.status === 401 || err.status === 403)
              ? "E-mail ou senha incorretos."
              : err instanceof Error
                ? err.message
                : "Não foi possível entrar.";
          toast({
            type: "error",
            title: "Falha no login",
            description: msg,
          });
        }
      } finally {
        setLoginSubmitting(false);
      }
    },
    [email, password, login, router, returnUrl, toast]
  );

  const handleOtpConfirm = React.useCallback(
    async (code: string) => {
      setOtpSubmitting(true);
      try {
        await confirmarEmail({ email: email.trim(), codigo: code });
        const senha = passwordForOtpRef.current || password;
        await login(email.trim(), senha);
        setOtpOpen(false);
        const dest = returnUrl && returnUrl.startsWith("/") ? returnUrl : "/";
        router.replace(dest);
        toast({
          type: "success",
          title: "E-mail confirmado",
          description: "Sua conta está ativa. Bem-vindo!",
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Código inválido ou expirado.";
        toast({
          type: "error",
          title: "Não foi possível confirmar",
          description: msg,
        });
      } finally {
        setOtpSubmitting(false);
      }
    },
    [confirmarEmail, email, login, password, router, returnUrl, toast]
  );

  const handleOtpResend = React.useCallback(() => {
    toast({
      type: "info",
      title: "Reenvio",
      description: `Se o backend expuser um endpoint de reenvio, conecte aqui. Por ora, verifique a caixa de entrada de ${email.trim() || "seu e-mail"}.`,
    });
  }, [email, toast]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-[440px] rounded-2xl bg-white p-8 ring-1 ring-zinc-200/50 sm:p-10">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-950">Acesse sua conta</h2>
            <p className="mt-2 text-[15px] text-zinc-500">
              Insira seu e-mail e senha para continuar
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-auto py-3 text-[15px]"
                leftIcon={<HugeiconsIcon icon={Mail01Icon} size={20} />}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="password" className="mb-0">
                  Senha
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[13px] font-semibold text-[var(--nulance-purple)] hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Insira sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-auto py-3 text-[15px]"
                leftIcon={<HugeiconsIcon icon={LockPasswordIcon} size={20} />}
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
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              className="h-auto w-full py-3.5 text-base font-semibold"
              loading={loginSubmitting}
              disabled={loginSubmitting}
            >
              Entrar na plataforma
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-[13px] font-medium uppercase tracking-[0.06em]">
              <span className="bg-white px-4 text-zinc-400">Ou continue com</span>
            </div>
          </div>

          <p className="mt-10 text-center text-[15px] text-zinc-500">
            Ainda não tem uma conta?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-nulance-purple transition-colors hover:text-(--nulance-purple)/80 hover:underline"
            >
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </main>

      <Footer />

      <EmailConfirmationDialog
        open={otpOpen}
        onOpenChange={setOtpOpen}
        email={email}
        onConfirm={handleOtpConfirm}
        onResend={handleOtpResend}
        isSubmitting={otpSubmitting}
      />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <AuthLoginInner />
    </Suspense>
  );
}
