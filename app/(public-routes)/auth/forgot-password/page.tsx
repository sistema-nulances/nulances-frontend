"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  LockPasswordIcon,
  ViewIcon,
  ViewOffSlashIcon,
  ArrowLeft01Icon,
  SecurityPasswordIcon,
} from "@hugeicons/core-free-icons";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import * as authRepo from "@/lib/repositories/auth-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";

export default function ForgotPasswordPage() {
  // steps: 1 = email, 2 = code, 3 = new password
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const handleStep1SendCode = async () => {
    const e = email.trim();
    if (!e) {
      toast({
        type: "error",
        title: "E-mail obrigatório",
        description: "Preencha seu e-mail para continuar.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await authRepo.forgotPassword({ email: e });
      toast({
        type: "info",
        title: "Código enviado",
        description: "Enviamos o código de recuperação para o seu e-mail.",
      });
      setStep(2);
    } catch (err) {
      toast({
        type: "error",
        title: "Falha ao enviar código",
        description: err instanceof ApiError ? err.message : "Não foi possível enviar o código.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2VerifyCode = async () => {
    const e = email.trim();
    const c = code.trim();
    if (c.length < 6) {
      toast({
        type: "error",
        title: "Código inválido",
        description: "O código de verificação deve ter 6 dígitos.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await authRepo.verificarCodigoRecuperacao({ email: e, codigo: c });
      setStep(3);
      toast({
        type: "success",
        title: "Código validado",
        description: "Agora informe sua nova senha.",
      });
    } catch (err) {
      toast({
        type: "error",
        title: "Código inválido",
        description: err instanceof ApiError ? err.message : "Não foi possível validar o código.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep3ResetPassword = async () => {
    const e = email.trim();
    const c = code.trim();
    if (!newPassword || !confirmPassword) {
      toast({
        type: "error",
        title: "Senha obrigatória",
        description: "Preencha nova senha e confirmação.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        type: "error",
        title: "Senhas diferentes",
        description: "A confirmação deve ser igual à nova senha.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await authRepo.resetPassword({
        email: e,
        codigo: c,
        novaSenha: newPassword,
        confirmarNovaSenha: confirmPassword,
      });
      toast({
        type: "success",
        title: "Senha redefinida!",
        description: "Você já pode acessar sua conta com a nova senha.",
      });
      router.replace("/auth");
    } catch (err) {
      toast({
        type: "error",
        title: "Falha ao redefinir senha",
        description: err instanceof ApiError ? err.message : "Não foi possível redefinir sua senha.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    const e = email.trim();
    if (!e) return;
    setIsSubmitting(true);
    try {
      await authRepo.forgotPassword({ email: e });
      toast({
        type: "info",
        title: "Código reenviado",
        description: "Um novo código foi enviado para o seu e-mail.",
      });
    } catch (err) {
      toast({
        type: "error",
        title: "Falha ao reenviar código",
        description: err instanceof ApiError ? err.message : "Não foi possível reenviar o código.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-110 rounded-2xl bg-white p-8  ring-1 ring-zinc-200/50 sm:p-10">
          
          {step > 1 && (
            <div className="mb-6">
              <button
                onClick={handlePrevStep}
                className="flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} className="mr-1.5" />
                Voltar
              </button>
            </div>
          )}

          <div className="mb-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
              <HugeiconsIcon icon={SecurityPasswordIcon} size={28} className="text-zinc-700" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-950">
              {step === 1 && "Esqueceu a senha?"}
              {step === 2 && "Verifique seu e-mail"}
              {step === 3 && "Nova senha"}
            </h2>
            <p className="mt-2 text-[15px] text-zinc-500">
              {step === 1 && "Digite seu e-mail para receber um código de recuperação."}
              {step === 2 && `Enviamos um código de 6 dígitos para o e-mail: ${email || "seu e-mail"}`}
              {step === 3 && "Crie uma nova senha forte e segura para a sua conta."}
            </p>
          </div>

          <div className="space-y-5">
            {/* ETAPA 1: EMAIL */}
            {step === 1 && (
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="h-auto py-3 text-[15px]"
                  leftIcon={<HugeiconsIcon icon={Mail01Icon} size={20} />}
                />
              </div>
            )}

            {/* ETAPA 2: CÓDIGO DE VERIFICAÇÃO */}
            {step === 2 && (
              <div>
                <Label htmlFor="code">Código de verificação</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  disabled={isSubmitting}
                  className="h-auto py-3 text-center text-[18px] tracking-widest"
                />
                <div className="mt-3 text-center">
                  <p className="text-[13px] text-zinc-500">
                    Não recebeu o código?{" "}
                    <button 
                      type="button"
                      className="font-semibold text-nulance-purple hover:underline"
                      onClick={handleResendCode}
                      disabled={isSubmitting}
                    >
                      Reenviar
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* ETAPA 3: NOVA SENHA E CONFIRMAR */}
            {step === 3 && (
              <>
                <div>
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Insira sua nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="h-auto py-3 text-[15px]"
                    leftIcon={<HugeiconsIcon icon={LockPasswordIcon} size={20} />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="flex h-full items-center justify-center text-zinc-400 hover:text-zinc-600 focus:outline-none"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        <HugeiconsIcon
                          icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                          size={20}
                        />
                      </button>
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="h-auto py-3 text-[15px]"
                    leftIcon={<HugeiconsIcon icon={LockPasswordIcon} size={20} />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="flex h-full items-center justify-center text-zinc-400 hover:text-zinc-600 focus:outline-none"
                        aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        <HugeiconsIcon
                          icon={showConfirmPassword ? ViewOffSlashIcon : ViewIcon}
                          size={20}
                        />
                      </button>
                    }
                  />
                </div>
              </>
            )}

            <Button
              onClick={
                step === 1
                  ? handleStep1SendCode
                  : step === 2
                    ? handleStep2VerifyCode
                    : handleStep3ResetPassword
              }
              variant="default"
              size="lg"
              className="mt-2 h-auto w-full py-3.5 text-base font-semibold "
              loading={isSubmitting}
            >
              {step === 1 && "Enviar código"}
              {step === 2 && "Verificar código"}
              {step === 3 && "Redefinir senha"}
            </Button>
          </div>

          {step === 1 && (
            <p className="mt-10 text-center text-[15px] text-zinc-500">
              Lembrou sua senha?{" "}
              <Link
                href="/auth"
                className="font-semibold text-nulance-purple transition-colors hover:text-(--nulance-purple)/80 hover:underline"
              >
                Voltar para o login
              </Link>
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
