"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import * as authRepo from "@/lib/repositories/auth-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { toast } = useToast();
  const [senhaAtual, setSenhaAtual] = React.useState("");
  const [novaSenha, setNovaSenha] = React.useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = React.useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = React.useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNovaSenha("");
      setMostrarSenhaAtual(false);
      setMostrarNovaSenha(false);
      setMostrarConfirmar(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senhaAtual.trim()) {
      toast({ type: "error", title: "Senha atual", description: "Informe sua senha atual." });
      return;
    }
    if (!novaSenha.trim()) {
      toast({ type: "error", title: "Nova senha", description: "Informe a nova senha." });
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      toast({ type: "error", title: "Confirmação", description: "A nova senha e a confirmação não coincidem." });
      return;
    }
    if (novaSenha === senhaAtual) {
      toast({
        type: "error",
        title: "Nova senha",
        description: "A nova senha deve ser diferente da senha atual.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await authRepo.atualizarSenha(
        {
          senhaAtual: senhaAtual.trim(),
          novaSenha: novaSenha.trim(),
          confirmarNovaSenha: confirmarNovaSenha.trim(),
        },
        null
      );
      toast({
        type: "success",
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      onOpenChange(false);
    } catch (err) {
      const msg =
        err instanceof ApiError ? String(err.message) : err instanceof Error ? err.message : "Tente novamente.";
      toast({ type: "error", title: "Não foi possível alterar a senha", description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e escolha uma nova senha. Use uma combinação segura de letras, números e símbolos.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="change-pw-current">Senha atual</Label>
              <Input
                id="change-pw-current"
                name="senhaAtual"
                type={mostrarSenhaAtual ? "text" : "password"}
                autoComplete="current-password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="mt-1.5 h-12"
                disabled={submitting}
                rightIcon={
                  <button
                    type="button"
                    tabIndex={-1}
                    className="flex h-full items-center justify-center text-zinc-400 hover:text-zinc-600 focus:outline-none"
                    onClick={() => setMostrarSenhaAtual((v) => !v)}
                    aria-label={mostrarSenhaAtual ? "Ocultar senha" : "Mostrar senha"}
                  >
                    <HugeiconsIcon icon={mostrarSenhaAtual ? ViewOffSlashIcon : ViewIcon} size={20} />
                  </button>
                }
              />
            </div>
            <div>
              <Label htmlFor="change-pw-new">Nova senha</Label>
              <Input
                id="change-pw-new"
                name="novaSenha"
                type={mostrarNovaSenha ? "text" : "password"}
                autoComplete="new-password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="mt-1.5 h-12"
                disabled={submitting}
                rightIcon={
                  <button
                    type="button"
                    tabIndex={-1}
                    className="flex h-full items-center justify-center text-zinc-400 hover:text-zinc-600 focus:outline-none"
                    onClick={() => setMostrarNovaSenha((v) => !v)}
                    aria-label={mostrarNovaSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    <HugeiconsIcon icon={mostrarNovaSenha ? ViewOffSlashIcon : ViewIcon} size={20} />
                  </button>
                }
              />
            </div>
            <div>
              <Label htmlFor="change-pw-confirm">Confirmar nova senha</Label>
              <Input
                id="change-pw-confirm"
                name="confirmarNovaSenha"
                type={mostrarConfirmar ? "text" : "password"}
                autoComplete="new-password"
                value={confirmarNovaSenha}
                onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                className="mt-1.5 h-12"
                disabled={submitting}
                rightIcon={
                  <button
                    type="button"
                    tabIndex={-1}
                    className="flex h-full items-center justify-center text-zinc-400 hover:text-zinc-600 focus:outline-none"
                    onClick={() => setMostrarConfirmar((v) => !v)}
                    aria-label={mostrarConfirmar ? "Ocultar senha" : "Mostrar senha"}
                  >
                    <HugeiconsIcon icon={mostrarConfirmar ? ViewOffSlashIcon : ViewIcon} size={20} />
                  </button>
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="secondary"
              className="w-full rounded-full sm:w-auto"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full rounded-full bg-nulance-purple sm:w-auto"
              loading={submitting}
              disabled={submitting}
            >
              Salvar nova senha
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
