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
import { api } from "@/lib/api";
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
  const setIsAdmin = useAppStore((state) => state.setIsAdmin);

  const loginMutation = api.admin.login.useMutation({
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("adminToken", data.token);
        setIsAdmin(true);
        setPassword("");
        setError("");
        onSuccess?.();
        onClose();
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ password });
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
              disabled={loginMutation.isPending}
              className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
            >
              {loginMutation.isPending ? "Accesso..." : "Entra"}
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
