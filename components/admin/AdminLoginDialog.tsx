"use client";

import { ShieldCheck } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useAppStore } from "@/lib/store";

type AdminLoginDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function AdminLoginDialog({
  isOpen,
  onClose,
  onSuccess,
}: AdminLoginDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const setIsAdmin = useAppStore((state) => state.setIsAdmin);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsPending(true);

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (!adminEmail) {
      setError("NEXT_PUBLIC_ADMIN_EMAIL non configurato");
      setIsPending(false);
      return;
    }

    try {
      const result = await authClient.signIn.email({
        email: adminEmail,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Password non corretta");
        return;
      }

      setIsAdmin(true);
      setPassword("");
      onSuccess?.();
      onClose();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-popover">
        <DrawerHeader className="flex-row items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background elevation-1">
            <ShieldCheck className="size-5" />
          </div>
          <div className="text-left">
            <DrawerTitle className="text-xl">Pannello admin</DrawerTitle>
            <DrawerDescription>Accesso riservato</DrawerDescription>
          </div>
        </DrawerHeader>

        <form onSubmit={handleLogin} className="flex flex-col gap-3 px-5 pb-8">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            className="h-12 rounded-md bg-card"
          />
          {error && (
            <p className="text-xs font-semibold text-destructive">{error}</p>
          )}
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Accesso..." : "Entra"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annulla
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
