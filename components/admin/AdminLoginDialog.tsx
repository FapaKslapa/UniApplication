"use client";

import { Shield } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { useAppStore } from "@/lib/store";

interface AdminLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AdminLoginDialog({
  isOpen,
  onClose,
  onSuccess,
}: AdminLoginDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const setIsAdmin = useAppStore((state) => state.setIsAdmin);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsPending(true);

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (!adminEmail) {
      setError("NEXT_PUBLIC_ADMIN_EMAIL non configurato");
      setIsPending(false);
      return;
    }

    const result = await authClient.signIn.email({
      email: adminEmail,
      password,
    });

    setIsPending(false);

    if (result.error) {
      console.error("[AdminLogin] error:", result.error);
      setError(result.error.message ?? "Password non corretta");
      return;
    }

    setIsAdmin(true);
    setPassword("");
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm rounded-[2.5rem] p-8 border-none bg-white dark:bg-zinc-900 shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center mb-6 shadow-lg">
            <Shield className="h-8 w-8" />
          </div>
          <DialogHeader className="text-center p-0 mb-8">
            <DialogTitle className="text-2xl font-bold text-zinc-900 dark:text-white font-serif">
              Pannello Admin
            </DialogTitle>
            <DialogDescription className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mt-2">
              Accesso Riservato
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="relative group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:outline-none transition-all text-sm font-mono"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
            >
              {isPending ? "Accesso..." : "Entra"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Annulla
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
