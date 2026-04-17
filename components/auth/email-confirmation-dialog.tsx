"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/cn";

const OTP_LEN = 6;

function emptyOtp(): string[] {
  return Array.from({ length: OTP_LEN }, () => "");
}

type OtpInputRowProps = {
  cells: string[];
  onCellsChange: (next: string[]) => void;
};

function OtpInputRow({ cells, onCellsChange }: OtpInputRowProps) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setCell = (index: number, digit: string) => {
    const d = digit.replace(/\D/g, "").slice(-1);
    const next = [...cells];
    next[index] = d;
    onCellsChange(next);
    if (d && index < OTP_LEN - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (cells[index]) {
        const next = [...cells];
        next[index] = "";
        onCellsChange(next);
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        const next = [...cells];
        next[index - 1] = "";
        onCellsChange(next);
      }
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === "ArrowRight" && index < OTP_LEN - 1) {
      refs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (!raw) return;
    const next = emptyOtp();
    for (let i = 0; i < raw.length; i++) next[i] = raw[i]!;
    onCellsChange(next);
    const focusAt = Math.min(raw.length, OTP_LEN - 1);
    refs.current[focusAt]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {cells.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          name={index === 0 ? "one-time-code" : undefined}
          maxLength={1}
          value={digit}
          onChange={(e) => setCell(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={cn(
            "h-12 w-10 rounded-xl border border-zinc-200 bg-white text-center text-lg font-semibold text-zinc-900",
            "outline-none transition focus:border-[var(--nulance-purple)] focus:ring-2 focus:ring-[var(--ring)] sm:h-14 sm:w-11 sm:text-xl"
          )}
          aria-label={`Dígito ${index + 1} do código`}
        />
      ))}
    </div>
  );
}

export type EmailConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** E-mail exibido na mensagem (pode ser vazio). */
  email: string;
  /** Chamado com o código de 6 dígitos quando o usuário confirma. */
  onConfirm: (code: string) => void | Promise<void>;
  /** Opcional: reenvio do código (ex.: chamar API). */
  onResend?: () => void;
  /** Enquanto a API de confirmação está em andamento. */
  isSubmitting?: boolean;
};

export function EmailConfirmationDialog({
  open,
  onOpenChange,
  email,
  onConfirm,
  onResend,
  isSubmitting = false,
}: EmailConfirmationDialogProps) {
  const { toast } = useToast();
  const [otpCells, setOtpCells] = React.useState(emptyOtp);

  React.useEffect(() => {
    if (open) {
      setOtpCells(emptyOtp());
    }
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setOtpCells(emptyOtp());
  };

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;
      const code = otpCells.join("");
      if (code.length !== OTP_LEN || !/^\d{6}$/.test(code)) {
        toast({
          type: "error",
          title: "Código incompleto",
          description: "Informe os 6 dígitos enviados por e-mail.",
        });
        return;
      }
      await Promise.resolve(onConfirm(code));
    },
    [onConfirm, otpCells, toast, isSubmitting]
  );

  const handleResend = React.useCallback(() => {
    setOtpCells(emptyOtp());
    onResend?.();
  }, [onResend]);

  const displayEmail = email.trim() || "seu e-mail";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Confirme seu e-mail</DialogTitle>
          <DialogDescription>
            Digite o código de <strong className="font-medium text-zinc-800">6 dígitos</strong> que enviamos para{" "}
            <strong className="font-medium text-zinc-800">{displayEmail}</strong> para concluir o acesso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-2">
            <Label className="sr-only">Código de verificação</Label>
            <OtpInputRow cells={otpCells} onCellsChange={setOtpCells} />
            <p className="mt-4 text-center text-[13px] text-zinc-500">
              Não recebeu?{" "}
              <button
                type="button"
                className="font-semibold text-[var(--nulance-purple)] hover:underline"
                onClick={handleResend}
              >
                Reenviar código
              </button>
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              type="button"
              variant="secondary"
              className="rounded-full"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="rounded-full" disabled={isSubmitting} loading={isSubmitting}>
              Confirmar e entrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
