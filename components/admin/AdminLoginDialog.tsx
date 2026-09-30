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

    const result = await authClient.signIn.email({
      email: adminEmail,
      password,
    });
    setIsPending(false);

    if (result.error) {
      setError(result.error.message ?? "Password non corretta");
      return;
    }

    setIsAdmin(true);
    setPassword("");
    onSuccess?.();
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader className="items-center text-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-md bg-foreground text-background">
            <ShieldCheck className="size-7" />
          </div>
          <DrawerTitle>Pannello admin</DrawerTitle>
          <DrawerDescription>Accesso riservato</DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleLogin} className="flex flex-col gap-3 px-4 pb-8">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            className="h-12 rounded-md text-center"
          />
          {error && (
            <p className="text-center text-xs font-semibold text-destructive">
              {error}
            </p>
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
